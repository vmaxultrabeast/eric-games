# @board.fun/web-pack

Packages a built Board web app into an installable bundle: a flat `<appId>.webapp.zip`
that you install onto a Board with the `board-connect` CLI or with the Board Connect
web UI in your browser. Download the CLI from the developer portal at
https://dev.board.fun, or use the web UI directly: the Board's address and pairing
screen are on the device under Settings > System.

`web-pack` runs the checks the device's install gate enforces, so a bad bundle fails
on your machine instead of after an upload. The zip is produced by a pure-JS,
deterministic writer with zero npm dependencies. No system `zip` binary is required,
so it works on macOS, Linux, and stock Windows.

## Usage

```bash
# from your web-app project, after building (e.g. `vite build` -> dist/)
npx @board.fun/web-pack dist --package-id fun.board.example --name "Example App" --model arcade_v1.3.7.tflite

# or, installed as a dev dependency:
web-pack dist --package-id fun.board.example --name "Example App" --model arcade_v1.3.7.tflite
```

Run `web-pack -h` for all options.

## Requirements

- Node 18+

## Documentation

The full packaging and deploy walkthrough (the touch model, app identity and
`board.config.json`, what gets validated, installing and watching logs) lives in the
developer docs at https://docs.dev.board.fun/. The developer portal at
https://dev.board.fun/ has the downloads (e.g. Piece Set Models, the `board-connect`
CLI).

## License

Proprietary, governed by the Developer Terms of Use, published at
https://docs.dev.board.fun/more/license.
