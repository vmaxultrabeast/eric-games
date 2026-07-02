#!/usr/bin/env node
// web-pack: turn a built Board web app (e.g. Vite `dist/`) into an installable bundle
// (a flat <appId>.webapp.zip) for Board devices.
//
// It runs the SAME hard checks the device's install gate enforces, so an invalid
// bundle fails here on the developer's machine instead of after an upload. The manifest it
// writes conforms to the harness-config v1 manifest format:
//   1. harness-config.json present (we generate/merge it)
//   2. schemaVersion === 1
//   3. packageId is a reverse-domain key (supplied, NOT derived from the filesystem path)
//   4. appId is a random canonical UUID, persisted in board.config.json (NOT derived from
//      packageId, so a public packageId can never be used to compute another app's save key)
//   5. name is present (1-64 chars)
//   6. sdkVersion is semver (read from the @board.fun/web-sdk package)
//   7. the entry file exists in the bundle and is .html/.htm
//   8. model is present: a bundle-relative file path that exists, whose sha256 is recorded.
//      Every Board web app bundles a touch model (web-pack rejects a bundle with none).
//   9. some .js/.html references a Board SDK global (window.BoardSDK / Harness / __board /
//      boardTouch)
//
// The zip is produced by a pure-JS deterministic writer (no system `zip` binary required, so
// it works on stock Windows): flat root, deterministic entry ordering, fixed timestamp.

import { createHash, randomUUID } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const TOOL = "web-pack";
const HARNESS_CONFIG_FILE = "harness-config.json";
const SCHEMA_VERSION = 1;
const SDK_MARKERS = [
  "window.BoardSDK",
  "window.Harness",
  "window.__board",
  "window.boardTouch",
];
const MAX_SCAN_BYTES = 8 * 1024 * 1024;
const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
// reverse-domain: lower-case segments, >=2 segments, <=128 chars (the v1 packageId format).
const PACKAGE_ID_RE = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
// Full SemVer: MAJOR.MINOR.PATCH with optional `-prerelease` and `+build`
// metadata (e.g. 1.0.0, 1.0.0-beta.1, 1.0.0-rc.2+build.5). The SDK ships
// pre-release builds, so the stamped sdkVersion must accept them.
const SEMVER_RE =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

const USAGE = `${TOOL} — package a Board web app for Board Connect

Usage:
  ${TOOL} <dist-dir> --package-id <reverse.domain.id> [options]

Options:
  --package-id <id> Reverse-domain app identity (e.g. fun.board.snakeworms). REQUIRED unless
                    present in an existing harness-config.json or board.config.json.
  --app-id <uuid>   Canonical UUID app id. Optional: if omitted, a persisted appId from
                    board.config.json (or harness-config.json) is reused, else a fresh random
                    UUID is minted and written back to board.config.json so the app's on-device
                    saves survive a re-pack.
  --name <name>     Display label for app lists (1-64 chars).
  --sdk-version <v> Override the stamped sdkVersion (semver). Default: the installed
                    @board.fun/web-sdk version.
  --entry <file>    Entry HTML, relative to <dist-dir> (default: index.html).
  --model <file>    Touch model filename, relative to <dist-dir> (default: model.tflite if
                    present). REQUIRED — every Board web app bundles a touch model. Obtain
                    the one for your Piece Set from the developer portal at dev.board.fun;
                    web-pack never fetches or vendors it.
  --icon <file>     Bundle-relative icon path.
  -o, --out <file>  Output zip path (default: ./<appId>.webapp.zip).
  -h, --help        Show this help.

Produces a flat zip rooted at <dist-dir>, containing a generated harness-config.json.
Install the bundle with:
  board-connect install <appId>.webapp.zip --launch
and watch its output with:
  board-connect logs <appId>
(board-connect targets your paired Board by default; use -b <ip> to pick another.)`;

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        console.log(USAGE);
        process.exit(0);
        break;
      case "--package-id":
        opts.packageId = argv[++i];
        break;
      case "--app-id":
        opts.appId = argv[++i];
        break;
      case "--sdk-version":
        opts.sdkVersion = argv[++i];
        break;
      case "--name":
        opts.name = argv[++i];
        break;
      case "--entry":
        opts.entry = argv[++i];
        break;
      case "--model":
        opts.model = argv[++i];
        break;
      case "--icon":
        opts.icon = argv[++i];
        break;
      case "-o":
      case "--out":
        opts.out = argv[++i];
        break;
      default:
        if (a.startsWith("-")) fail(`unknown option: ${a}`);
        positional.push(a);
    }
  }
  if (positional.length !== 1)
    fail("expected exactly one <dist-dir>\n\n" + USAGE);
  opts.dist = positional[0];
  return opts;
}

// appId is a RANDOM, persisted UUID -- NOT derived from packageId. The Board Browser host reads
// appId from the manifest and namespaces the web app's on-device save dir by it
// (<filesDir>/webapps/<appId>/); deriving it from the public packageId would let anyone compute
// (and overwrite) another app's save key. We mint it once and persist it to board.config.json so
// every re-pack reuses it and the app's saves survive a rebuild.
//
// Precedence: an explicit --app-id, then a persisted appId in board.config.json / harness-config.json,
// else mint a fresh random UUID and write it back to board.config.json.
function resolveAppId({ supplied, boardConfigPath, board, packageId }) {
  if (supplied) {
    if (!UUID_RE.test(supplied))
      fail(`appId "${supplied}" is not a canonical UUID`);
    return supplied.toLowerCase();
  }
  const minted = randomUUID();
  persistAppId(minted, boardConfigPath, board, packageId);
  return minted;
}

// Merge the appId into board.config.json (preserving any existing keys) so it persists across
// re-packs. Also records packageId there if it was not already present.
function persistAppId(appId, boardConfigPath, board, packageId) {
  const merged = { ...(board || {}) };
  merged.appId = appId;
  if (!merged.packageId) merged.packageId = packageId;
  fs.writeFileSync(boardConfigPath, JSON.stringify(merged, null, 2) + "\n");
  const where =
    path.relative(process.cwd(), boardConfigPath) || boardConfigPath;
  console.error(`${TOOL}: minted appId ${appId} -> persisted to ${where}`);
}

function readJsonIfPresent(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

// Resolve the installed @board.fun/web-sdk version (the sdkVersion stamp), preferring the SDK
// shipped alongside this tool in the repo, then a normal node_modules resolution.
function resolveSdkVersion() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../../sdk/package.json"), // repo layout: tools/web-pack -> sdk
    path.resolve(here, "../../node_modules/@board.fun/web-sdk/package.json"),
    path.resolve(process.cwd(), "node_modules/@board.fun/web-sdk/package.json"),
  ];
  for (const c of candidates) {
    const pkg = readJsonIfPresent(c);
    if (pkg?.name === "@board.fun/web-sdk" && typeof pkg.version === "string")
      return pkg.version;
  }
  return null;
}

function* walkFiles(dir) {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(full);
    else if (entry.isFile()) yield full;
  }
}

function referencesBoardSdk(dir) {
  for (const file of walkFiles(dir)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".js" && ext !== ".html" && ext !== ".htm") continue;
    if (fs.statSync(file).size > MAX_SCAN_BYTES) continue;
    const text = fs.readFileSync(file, "utf8");
    if (SDK_MARKERS.some((m) => text.includes(m))) return true;
  }
  return false;
}

// Normalize a developer-authored bundle-relative path and confine it to the bundle root.
// Rejects absolute paths and `..` escapes (the device enforces the same -> UNSAFE_PATH).
function safeBundlePath(field, value, distAbs) {
  if (path.isAbsolute(value))
    fail(`${field} "${value}" must be a bundle-relative path, not absolute`);
  const normalized = value.split(/[\\/]/).join("/");
  const resolved = path.resolve(distAbs, normalized);
  const root = path.resolve(distAbs);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    fail(`${field} "${value}" escapes the bundle root`);
  }
  return normalized;
}

// ---------------------------------------------------------------------------
// Pure-JS deterministic zip writer.
//
// Produces a flat-root zip (no leading directory), deterministic entry ordering (callers pass
// pre-sorted entries) and a fixed DOS timestamp, so the same input bytes always yield the same
// archive. Stores incompressible/tiny entries, deflates the rest. No system `zip` required.
// ---------------------------------------------------------------------------

// Fixed timestamp: 1980-01-01 00:00:00 (the zero point of the DOS date/time format).
const DOS_TIME = 0;
const DOS_DATE = 0b0000000_0001_00001; // year 1980, month 1, day 1

// CRC-32 (IEEE 802.3) with a lazily-built lookup table.
let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// entries: [{ name: 'a/b.js', data: Buffer }], already in the desired (deterministic) order.
function buildZip(entries) {
  const localParts = [];
  const central = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const deflated = deflateRawSync(data, { level: 9 });
    // Store if deflate doesn't help (e.g. already-compressed or tiny payloads).
    const stored = deflated.length >= data.length;
    const method = stored ? 0 : 8; // 0 = store, 8 = deflate
    const body = stored ? data : deflated;

    // Local file header.
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); // local file header signature
    lh.writeUInt16LE(20, 4); // version needed to extract (2.0)
    lh.writeUInt16LE(0x0800, 6); // general purpose bit flag: bit 11 = UTF-8 names
    lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(DOS_TIME, 10);
    lh.writeUInt16LE(DOS_DATE, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18); // compressed size
    lh.writeUInt32LE(data.length, 22); // uncompressed size
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28); // extra field length
    localParts.push(lh, nameBuf, body);

    // Central directory header.
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); // central directory header signature
    ch.writeUInt16LE(20, 4); // version made by
    ch.writeUInt16LE(20, 6); // version needed to extract
    ch.writeUInt16LE(0x0800, 8); // general purpose bit flag (UTF-8)
    ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(DOS_TIME, 12);
    ch.writeUInt16LE(DOS_DATE, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(body.length, 20); // compressed size
    ch.writeUInt32LE(data.length, 24); // uncompressed size
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30); // extra field length
    ch.writeUInt16LE(0, 32); // comment length
    ch.writeUInt16LE(0, 34); // disk number start
    ch.writeUInt16LE(0, 36); // internal attributes
    ch.writeUInt32LE(0, 38); // external attributes
    ch.writeUInt32LE(offset, 42); // relative offset of local header
    central.push(ch, nameBuf);

    offset += lh.length + nameBuf.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const localBuf = Buffer.concat(localParts);

  // End of central directory record.
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // number of this disk
  eocd.writeUInt16LE(0, 6); // disk with central directory
  eocd.writeUInt16LE(entries.length, 8); // entries on this disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralBuf.length, 12); // central directory size
  eocd.writeUInt32LE(localBuf.length, 16); // central directory offset
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([localBuf, centralBuf, eocd]);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const distAbs = path.resolve(opts.dist);
  if (!fs.existsSync(distAbs) || !fs.statSync(distAbs).isDirectory()) {
    fail(
      `${opts.dist} is not a directory (build your web app first, e.g. \`vite build\`)`,
    );
  }

  const configPath = path.join(distAbs, HARNESS_CONFIG_FILE);
  const existing = readJsonIfPresent(configPath);
  const boardConfigPath = path.resolve("board.config.json");
  const board = readJsonIfPresent(boardConfigPath);

  // packageId precedence: --package-id > existing harness-config.json > board.config.json.
  // NEVER derived from the dist path (that loses saves on a different checkout). REQUIRED.
  const packageId = opts.packageId || existing?.packageId || board?.packageId;
  if (!packageId) {
    fail(
      "missing packageId. Pass --package-id <reverse.domain.id> (e.g. fun.board.snakeworms), " +
        'or set "packageId" in board.config.json / harness-config.json.',
    );
  }
  if (!PACKAGE_ID_RE.test(packageId) || packageId.length > 128) {
    fail(
      `packageId "${packageId}" is not a valid reverse-domain id (e.g. fun.board.snakeworms)`,
    );
  }

  // appId: a random, persisted UUID (never derived from packageId). Reuses a persisted id from
  // board.config.json / harness-config.json when present, else mints + persists a fresh one.
  const appId = resolveAppId({
    supplied: opts.appId || board?.appId || existing?.appId,
    boardConfigPath,
    board,
    packageId,
  });

  // name (required). 1-64 chars after trimming + stripping control chars.
  const rawName = opts.name || existing?.name || board?.name;
  // eslint-disable-next-line no-control-regex
  const name = rawName
    ? String(rawName)
        .replace(/[\x00-\x1f]/g, "")
        .trim()
    : "";
  if (!name) fail('missing name. Pass --name "<display name>" (1-64 chars).');
  if (name.length > 64) fail(`name is too long (${name.length} chars; max 64)`);

  // sdkVersion (required, semver). Stamped from the installed @board.fun/web-sdk unless overridden.
  const sdkVersion =
    opts.sdkVersion || existing?.sdkVersion || resolveSdkVersion();
  if (!sdkVersion) {
    fail(
      "could not determine sdkVersion. Pass --sdk-version <x.y.z> or run from a project with " +
        "@board.fun/web-sdk installed.",
    );
  }
  if (!SEMVER_RE.test(sdkVersion))
    fail(`sdkVersion "${sdkVersion}" is not valid semver`);

  // entry (required). Defaults to index.html; must exist and be .html/.htm.
  const entryRaw = opts.entry || existing?.entry || "index.html";
  const entry = safeBundlePath("entry", entryRaw, distAbs);
  const entryAbs = path.join(distAbs, entry);
  if (!fs.existsSync(entryAbs) || fs.statSync(entryAbs).isDirectory()) {
    fail(`entry "${entry}" not found in ${opts.dist}`);
  }
  const entryExt = path.extname(entry).toLowerCase();
  if (entryExt !== ".html" && entryExt !== ".htm")
    fail(`entry "${entry}" must be an .html/.htm file`);

  // Reject root-absolute asset URLs in the entry HTML. The device serves the
  // bundle from a path prefix, not a site root, so src="/assets/x.js" (every
  // bundler's default base) resolves outside the bundle and the app white-screens
  // with no console output. By build time this is plain HTML, so the check is
  // bundler-agnostic. "//" (protocol-relative) is a different (also broken,
  // off-device) reference and still matches; data:/blob:/http(s): do not.
  const absoluteRefs = [
    ...fs
      .readFileSync(entryAbs, "utf8")
      .matchAll(/\b(?:src|href)\s*=\s*["'](\/[^"']*)["']/gi),
  ].map((m) => m[1]);
  if (absoluteRefs.length > 0) {
    const sample = absoluteRefs.slice(0, 5).join(", ");
    fail(
      `entry "${entry}" references root-absolute URLs (${sample}). The device serves ` +
        "your app from a folder, not a site root, so these will not load (white screen). " +
        "Configure your bundler to emit relative URLs and rebuild: Vite -> base: './' in " +
        "vite.config; webpack -> output.publicPath: './'; then re-run web-pack.",
    );
  }

  // model (REQUIRED). An explicit --model, a persisted model in harness-config.json, else the
  // conventional model.tflite if present. Every Board web app bundles a touch model, so a bundle
  // with none is rejected here on the developer's machine.
  let modelRel = opts.model || existing?.model;
  if (!modelRel && fs.existsSync(path.join(distAbs, "model.tflite"))) {
    modelRel = "model.tflite";
  }
  if (!modelRel) {
    fail(
      `no touch model found in ${opts.dist}. Every Board web app bundles a touch model: place ` +
        "model.tflite in your build output (e.g. in your project's public/ so the bundler copies " +
        "it in), or pass --model <file>. Download the model for your Piece Set from the developer " +
        "portal at dev.board.fun; web-pack never fetches or vendors it.",
    );
  }
  modelRel = safeBundlePath("model", modelRel, distAbs);
  const modelAbs = path.join(distAbs, modelRel);
  if (!fs.existsSync(modelAbs) || fs.statSync(modelAbs).isDirectory()) {
    fail(`model "${modelRel}" not found in ${opts.dist}`);
  }
  const modelSha256 = createHash("sha256")
    .update(fs.readFileSync(modelAbs))
    .digest("hex");

  // icon (optional). If present, must resolve inside the bundle and exist.
  let icon;
  const iconRaw = opts.icon || existing?.icon;
  if (iconRaw) {
    icon = safeBundlePath("icon", iconRaw, distAbs);
    const iconAbs = path.join(distAbs, icon);
    if (!fs.existsSync(iconAbs) || fs.statSync(iconAbs).isDirectory()) {
      fail(`icon "${icon}" not found in ${opts.dist}`);
    }
  }

  // Build the v1 manifest. Field order is fixed for readability.
  const config = {
    schemaVersion: SCHEMA_VERSION,
    packageId,
    appId,
    name,
    sdkVersion,
    entry,
    model: modelRel, // a bundle-relative path; always present
    modelSha256,
  };
  if (icon) config.icon = icon;

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

  if (!referencesBoardSdk(distAbs)) {
    fail(
      "no Board SDK reference found in any .js/.html; the bundle must be built with " +
        "@board.fun/web-sdk (the device rejects bundles with no SDK marker)",
    );
  }

  const outAbs = path.resolve(opts.out || `${appId}.webapp.zip`);
  if (path.dirname(outAbs) === distAbs) {
    fail(
      "output zip must not live inside <dist-dir> (it would pack itself); use -o <path> outside it",
    );
  }
  fs.rmSync(outAbs, { force: true });

  // Collect entries with bundle-relative, forward-slash names, deterministically ordered.
  const entries = [];
  for (const file of walkFiles(distAbs)) {
    const rel = path.relative(distAbs, file).split(path.sep).join("/");
    entries.push({ name: rel, data: fs.readFileSync(file) });
  }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  fs.writeFileSync(outAbs, buildZip(entries));

  const outRel = path.relative(process.cwd(), outAbs) || outAbs;
  console.log(
    `Packed ${name} (packageId ${packageId}, appId ${appId}, ${entries.length} files) -> ${outRel}`,
  );
  console.log("Install it onto a device with Board Connect:");
  console.log(`  board-connect install ${outRel} --launch`);
  console.log("Watch its output with:");
  console.log(`  board-connect logs ${appId}`);
}

main();
