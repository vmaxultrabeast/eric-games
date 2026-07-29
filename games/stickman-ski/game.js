/* ============================================
   STICKMAN SKI — game.js
   Full game engine: draw slope → ride it → JUMP!
   ============================================ */

"use strict";

// ── Canvas setup ──────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); if (!riding) redrawCanvas(); });

// ── Constants ─────────────────────────────────
const GRAVITY_SLOPE  = 420;   // slope physics accel (px/s²)
const GRAVITY_AIR    = 900;   // real gravity while airborne (px/s²)
const FRICTION       = 0.25;
const MAX_SPEED      = 900;
const JUMP_FORCE     = 520;   // upward launch velocity (px/s)
const LAND_SNAP_DIST = 40;    // px — how close to slope before landing

// ── State ─────────────────────────────────────
let gear          = 'ski';
// Player colours
let colorBody     = '#ffffff';
let colorHelmet   = '#ffd700';
let colorGear     = 'auto';   // 'auto' = original gradient, else hex

// ── High score (persisted) ────────────────────
const HS_KEY  = 'stickman-ski-hiscore';
let highScore = parseInt(localStorage.getItem(HS_KEY) || '0', 10);

function updateHiDisplay() {
  document.getElementById('val-hi').textContent = Math.round(highScore);
}
let slopePts      = [];       // raw drawn points
let smoothPts     = [];       // smoothed & even-sampled
let slopeArcLen   = [];       // cumulative arc lengths for smoothPts

let riding        = false;
let rideT         = 0;        // arc-length position along slope
let curIdx        = 0;        // current slope segment index
let speed         = 0;
let camX = 0, camY = 0;
let score         = 0;
let topSpeed      = 0;
let distance      = 0;

// ── Jump state ────────────────────────────────
let airborne      = false;
let airX = 0, airY = 0;      // world-space position while in air
let airVX = 0, airVY = 0;    // world-space velocity
let airTime       = 0;        // seconds spent airborne
let airSpin       = 0;        // degrees spun so far (for display)
let airSpinSpeed  = 0;        // deg/s
let jumpCooldown  = 0;        // prevent instant re-jump on landing
let peakAirY      = 0;        // highest point reached (smaller Y = higher)
let airLandIdx    = 0;        // slope idx we'll land near

// ── Trick / trick-only spin (while on slope) ──
let trickCooldown = 0;
let trickAnim     = 0;

let frameId  = null;
let lastTime = null;

// ── Snowflakes ─────────────────────────────────
(function spawnSnowflakes() {
  const container = document.getElementById('snowflakes');
  for (let i = 0; i < 60; i++) {
    const f = document.createElement('div');
    f.className = 'flake';
    f.textContent = ['❄','✦','·','❅'][Math.floor(Math.random()*4)];
    f.style.left = Math.random() * 100 + 'vw';
    f.style.animationDuration = (4 + Math.random()*8) + 's';
    f.style.animationDelay    = (-Math.random()*12) + 's';
    f.style.fontSize = (0.4 + Math.random()*0.8) + 'rem';
    container.appendChild(f);
  }
})();

// ── Gear selection ────────────────────────────
function selectGear(g) {
  gear = g;
  document.getElementById('btn-ski').classList.toggle('active', g === 'ski');
  document.getElementById('btn-board').classList.toggle('active', g === 'board');
}

// ── Colour customisation ──────────────────────
function setColor(type, value, btn) {
  if (type === 'body')   colorBody   = value;
  if (type === 'helmet') colorHelmet = value;
  if (type === 'gear')   colorGear   = value;

  // Update swatch active state
  const row = document.getElementById('swatches-' + type);
  if (row) row.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function setColorCustom(type, value) {
  if (type === 'body')   colorBody   = value;
  if (type === 'helmet') colorHelmet = value;
  if (type === 'gear')   colorGear   = value;
  // Deselect preset swatches so the custom picker is visually 'active'
  const row = document.getElementById('swatches-' + type);
  if (row) row.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
}

// ── Drawing ───────────────────────────────────
let drawing = false;

canvas.addEventListener('mousedown', onPtrDown);
canvas.addEventListener('mousemove', onPtrMove);
canvas.addEventListener('mouseup',   onPtrUp);
canvas.addEventListener('touchstart', e => { e.preventDefault(); onPtrDown(e.touches[0]); }, { passive: false });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); onPtrMove(e.touches[0]); }, { passive: false });
canvas.addEventListener('touchend',   e => { e.preventDefault(); onPtrUp(); }, { passive: false });

function getPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onPtrDown(e) {
  if (riding) return;
  drawing = true;
  const p = getPos(e);
  slopePts = [p];
  redrawCanvas();
}

function onPtrMove(e) {
  if (!drawing || riding) return;
  const p = getPos(e);
  const last = slopePts[slopePts.length - 1];
  const dx = p.x - last.x, dy = p.y - last.y;
  if (dx*dx + dy*dy > 16) { slopePts.push(p); redrawCanvas(); }
}

function onPtrUp() {
  drawing = false;
  if (slopePts.length > 4) smoothPts = buildSmoothedPath(slopePts);
}

// ── Path math ────────────────────────────────
function buildSmoothedPath(pts) {
  const raw = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i-1)];
    const p1 = pts[i];
    const p2 = pts[i+1];
    const p3 = pts[Math.min(pts.length-1, i+2)];
    for (let t = 0; t < 1; t += 0.05) raw.push(catmull(p0, p1, p2, p3, t));
  }
  raw.push(pts[pts.length-1]);
  const seg = 8;
  const out = [raw[0]];
  let acc = 0;
  for (let i = 1; i < raw.length; i++) {
    const dx = raw[i].x - raw[i-1].x;
    const dy = raw[i].y - raw[i-1].y;
    acc += Math.sqrt(dx*dx + dy*dy);
    if (acc >= seg) { out.push(raw[i]); acc = 0; }
  }
  out.push(raw[raw.length-1]);
  return out;
}

function buildArcLengths(pts) {
  const arc = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x;
    const dy = pts[i].y - pts[i-1].y;
    arc.push(arc[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  return arc;
}

function catmull(p0,p1,p2,p3,t) {
  const t2 = t*t, t3 = t2*t;
  return {
    x: 0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
    y: 0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)
  };
}

/** Returns angle of slope at idx (radians, 0 = flat right, positive = downhill) */
function getAngle(idx) {
  const pts = smoothPts;
  const a = pts[Math.max(0, idx-1)];
  const b = pts[Math.min(pts.length-1, idx+1)];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** Find the closest smoothPts index to world point (wx, wy), searching from startIdx */
function findClosestIdx(wx, wy, startIdx, searchRange) {
  let best = startIdx, bestD = Infinity;
  const lo = Math.max(0, startIdx - searchRange);
  const hi = Math.min(smoothPts.length - 1, startIdx + searchRange);
  for (let i = lo; i <= hi; i++) {
    const dx = smoothPts[i].x - wx;
    const dy = smoothPts[i].y - wy;
    const d  = dx*dx + dy*dy;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

// ── Canvas Rendering (draw mode) ──────────────
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (riding) return;
  drawSlopePreview();
}

function drawSlopePreview() {
  if (slopePts.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(slopePts[0].x, slopePts[0].y);
  for (let i = 1; i < slopePts.length; i++) ctx.lineTo(slopePts[i].x, slopePts[i].y);
  ctx.strokeStyle = 'rgba(200,230,255,0.12)';
  ctx.lineWidth = 28; ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(slopePts[0].x, slopePts[0].y);
  for (let i = 1; i < slopePts.length; i++) ctx.lineTo(slopePts[i].x, slopePts[i].y);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 4; ctx.stroke();

  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(slopePts[0].x, slopePts[0].y);
  for (let i = 1; i < slopePts.length; i++) ctx.lineTo(slopePts[i].x, slopePts[i].y);
  ctx.strokeStyle = 'rgba(0,212,255,0.7)';
  ctx.lineWidth = 2.5; ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(slopePts[0].x, slopePts[0].y, 8, 0, Math.PI*2);
  ctx.fillStyle = '#00ff99'; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

  ctx.restore();
}

// ── GAME CONTROL ──────────────────────────────
function clearSlope() { slopePts = []; smoothPts = []; redrawCanvas(); }

function startRide() {
  if (slopePts.length < 6) { flashHint(); return; }
  if (smoothPts.length < 4) smoothPts = buildSmoothedPath(slopePts);
  beginRide();
}

function replayRide() {
  document.getElementById('panel-gameover').classList.add('hidden');
  beginRide();
}

function resetGame() {
  document.getElementById('panel-gameover').classList.add('hidden');
  document.getElementById('panel-mode').classList.remove('hidden');
  stopLoop();
  riding = false;
}

function beginRide() {
  slopeArcLen = buildArcLengths(smoothPts);

  riding = true;
  airborne = false;
  rideT = 0; curIdx = 0;
  speed = 60; score = 0; topSpeed = 0; distance = 0;
  trickCooldown = 0; trickAnim = 0;
  airTime = 0; airSpin = 0; jumpCooldown = 0;
  trail.length = 0;

  camX = smoothPts[0].x - canvas.width  * 0.25;
  camY = smoothPts[0].y - canvas.height * 0.4;

  document.getElementById('panel-mode').classList.add('hidden');
  document.getElementById('panel-gameover').classList.add('hidden');
  document.getElementById('ride-controls').classList.remove('hidden');

  canvas.style.cursor = 'none';
  lastTime = null;
  if (frameId) cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(loop);
}

function stopRide() { if (!riding) return; showGameOver(false); }

function stopLoop() {
  if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
  canvas.style.cursor = 'crosshair';
  document.getElementById('ride-controls').classList.add('hidden');
}

// ── SLOPE PHYSICS (on snow) ───────────────────
function updateSlopePhysics(dt, idx) {
  const angle = getAngle(idx);
  const sinA  = Math.sin(angle);
  const accel = GRAVITY_SLOPE * sinA;
  const fric  = FRICTION * Math.cos(angle) * GRAVITY_SLOPE;
  const drag  = speed * speed * 0.00005;
  speed += (accel - Math.sign(speed) * fric - drag) * dt;
  speed  = Math.max(20, Math.min(MAX_SPEED, speed));
}

// ── JUMP ─────────────────────────────────────
function doJump() {
  if (!riding || airborne || jumpCooldown > 0) return;

  const pos   = smoothPts[curIdx];
  const angle = getAngle(curIdx);

  // Decompose current speed into world-space velocity
  airVX = speed * Math.cos(angle);
  airVY = speed * Math.sin(angle);

  // Add upward impulse perpendicular to slope (normal = angle - 90°)
  const normalAngle = angle - Math.PI / 2;
  airVX += JUMP_FORCE * Math.cos(normalAngle);
  airVY += JUMP_FORCE * Math.sin(normalAngle);

  airX = pos.x;
  airY = pos.y;
  peakAirY = airY;

  // Spin speed: faster jump = more spin
  airSpinSpeed = gear === 'board' ? 360 : 280;
  airSpin  = 0;
  airTime  = 0;

  airborne = true;

  showTrickFlash('✈ AIRBORNE!');
}

function updateAirborne(dt) {
  airVY  += GRAVITY_AIR * dt;    // gravity pulls down
  airX   += airVX * dt;
  airY   += airVY * dt;
  airTime += dt;
  airSpin += airSpinSpeed * dt;

  // Track peak height
  if (airY < peakAirY) peakAirY = airY;

  // Find closest slope point ahead of us
  const searchIdx = Math.min(smoothPts.length - 1, curIdx + 5);
  const closeIdx  = findClosestIdx(airX, airY, searchIdx, 80);

  if (closeIdx >= 0) {
    const slope = smoothPts[closeIdx];
    const dx = airX - slope.x;
    const dy = airY - slope.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // Land when we're close enough AND have been airborne a bit AND moving downward
    if (dist < LAND_SNAP_DIST && airTime > 0.18 && airVY > 0) {
      land(closeIdx);
    }
  }

  // If we fly totally off screen / off slope, wipeout
  if (airTime > 6) {
    showGameOver(false);
  }
}

function land(idx) {
  airborne = false;
  curIdx   = Math.min(idx, smoothPts.length - 2);
  rideT    = slopeArcLen[curIdx];

  // Convert world-space velocity back to along-slope speed
  const angle = getAngle(curIdx);
  speed = airVX * Math.cos(angle) + airVY * Math.sin(angle);
  speed = Math.max(60, Math.min(MAX_SPEED, speed));

  jumpCooldown = 0.4; // brief cooldown so they don't re-jump instantly

  // Score bonus based on air time + height
  const heightBonus = Math.max(0, smoothPts[curIdx].y - peakAirY);
  const bonus = Math.round(airTime * 120 + heightBonus * 0.5);
  score += bonus;

  const label = bonus > 300 ? '🔥 MEGA AIR! +' + bonus
              : bonus > 150 ? '💨 BIG AIR! +'  + bonus
              :                '🌨 LANDED! +'   + bonus;
  showTrickFlash(label);

  // Explosion of snow particles on landing
  for (let i = 0; i < 30; i++) {
    trail.push({
      x: airX, y: airY,
      vx: (Math.random() - 0.5) * 200,
      vy: -Math.random() * 180 - 40,
      life: 1.0 + Math.random() * 0.5,
      r: 3 + Math.random() * 5,
      isLand: true
    });
  }
}

// ── MAIN LOOP ────────────────────────────────
function loop(ts) {
  if (!riding) return;
  const dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.05) : 0.016;
  lastTime = ts;

  if (jumpCooldown > 0) jumpCooldown -= dt;

  if (airborne) {
    // ── AIRBORNE FRAME ──
    updateAirborne(dt);
    topSpeed = Math.max(topSpeed, Math.sqrt(airVX*airVX + airVY*airVY));

    // Camera follows air position
    const destX = airX - canvas.width  * 0.3;
    const destY = airY - canvas.height * 0.45;
    camX += (destX - camX) * 0.04;
    camY += (destY - camY) * 0.04;

    // HUD
    const airSpd = Math.round(Math.sqrt(airVX*airVX + airVY*airVY) * 0.036);
    document.getElementById('val-speed').textContent = airSpd;
    document.getElementById('val-score').textContent = Math.round(score);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camX, -camY);
    drawSlopeFull();
    drawJumpShadow();
    updateTrail(dt);
    drawStickman({ x: airX, y: airY }, 0, airSpin);
    ctx.restore();

  } else {
    // ── ON SLOPE FRAME ──
    const step = speed * dt;
    rideT += step;
    distance += step / 100;
    score    += step * 0.01 * (speed / 200);
    topSpeed  = Math.max(topSpeed, speed);

    // Advance curIdx by arc length
    while (curIdx < smoothPts.length - 1 && slopeArcLen[curIdx + 1] < rideT) curIdx++;

    if (curIdx >= smoothPts.length - 2) { showGameOver(true); return; }

    updateSlopePhysics(dt, curIdx);
    if (trickAnim > 0) { trickAnim = Math.max(0, trickAnim - 600 * dt); score += 15 * dt; }
    if (trickCooldown > 0) trickCooldown -= dt;

    const target = smoothPts[curIdx];
    const destX  = target.x - canvas.width  * 0.3;
    const destY  = target.y - canvas.height * 0.45;
    camX += (destX - camX) * 0.06;
    camY += (destY - camY) * 0.06;

    const kmh = Math.round(speed * 0.036);
    document.getElementById('val-speed').textContent = kmh;
    document.getElementById('val-score').textContent = Math.round(score);
    document.getElementById('val-dist').textContent  = Math.round(distance);
    document.getElementById('stat-speed').classList.toggle('boosting', kmh > 80);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camX, -camY);
    drawSlopeFull();
    updateTrail(dt);
    spawnSnowSpray(curIdx);
    drawStickman(smoothPts[curIdx], getAngle(curIdx), trickAnim);
    ctx.restore();
  }

  // ── Jump button active state ──
  const jumpBtn = document.getElementById('btn-jump');
  if (jumpBtn) {
    jumpBtn.disabled = airborne || jumpCooldown > 0;
    jumpBtn.classList.toggle('hud-btn-disabled', airborne || jumpCooldown > 0);
  }

  frameId = requestAnimationFrame(loop);
}

// ── SLOPE RENDERING ───────────────────────────
function drawSlopeFull() {
  if (smoothPts.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(smoothPts[0].x, smoothPts[0].y);
  for (let i = 1; i < smoothPts.length; i++) ctx.lineTo(smoothPts[i].x, smoothPts[i].y);
  ctx.strokeStyle = 'rgba(200,235,255,0.18)';
  ctx.lineWidth = 30; ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(smoothPts[0].x, smoothPts[0].y);
  for (let i = 1; i < smoothPts.length; i++) ctx.lineTo(smoothPts[i].x, smoothPts[i].y);
  ctx.strokeStyle = 'rgba(255,255,255,0.72)';
  ctx.lineWidth = 5; ctx.stroke();

  ctx.restore();
}

/** Soft shadow blob on slope below airborne stickman */
function drawJumpShadow() {
  // Project airX down onto slope
  const closeIdx = findClosestIdx(airX, airY + 999, curIdx, 80);
  if (closeIdx < 0 || !smoothPts[closeIdx]) return;
  const sp = smoothPts[closeIdx];
  const dist = Math.abs(airY - sp.y);
  const alpha = Math.max(0, 0.45 - dist / 500);
  const scale = Math.max(0.2, 1 - dist / 400);

  ctx.save();
  ctx.translate(sp.x, sp.y);
  ctx.rotate(getAngle(closeIdx));
  ctx.beginPath();
  ctx.ellipse(0, 0, 22 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fill();
  ctx.restore();
}

// ── SNOW TRAIL PARTICLES ──────────────────────
const trail = [];

function spawnSnowSpray(idx) {
  if (!smoothPts[idx]) return;
  for (let i = 0; i < 3; i++) {
    trail.push({
      x: smoothPts[idx].x + (Math.random()-0.5)*10,
      y: smoothPts[idx].y + (Math.random()-0.5)*10,
      vx: (Math.random()-0.5)*40 - speed*0.04,
      vy: -Math.random()*30 - 10,
      life: 1.0,
      r: 2 + Math.random()*3
    });
  }
}

function updateTrail(dt) {
  ctx.save();
  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i];
    p.x   += p.vx * dt;
    p.y   += p.vy * dt;
    p.vy  += (p.isLand ? 400 : 60) * dt;
    p.life -= p.isLand ? 0.04 : 0.025;
    if (p.life <= 0) { trail.splice(i, 1); continue; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI*2);
    ctx.fillStyle = `rgba(200,235,255,${p.life * (p.isLand ? 0.9 : 0.7)})`;
    ctx.fill();
  }
  ctx.restore();
  if (trail.length > 300) trail.splice(0, trail.length - 300);
}

// ── STICKMAN ─────────────────────────────────
function drawStickman(pos, slopeAngle, spinDeg) {
  if (!pos) return;
  ctx.save();
  ctx.translate(pos.x, pos.y);

  const tiltAngle = airborne ? 0 : slopeAngle;
  ctx.rotate(tiltAngle + (spinDeg * Math.PI / 180));

  const t   = Date.now() / 1000;
  const bob = airborne ? Math.sin(t * 6) * 6 - 4 : Math.sin(t * 8) * 2;

  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // Helper: resolve gear colour (solid or gradient)
  function gearStroke(x1, x2, y, fallback1, fallback2) {
    if (colorGear !== 'auto') return colorGear;
    const g = ctx.createLinearGradient(x1, y, x2, y);
    g.addColorStop(0, fallback1); g.addColorStop(1, fallback2);
    return g;
  }

  // ── HEAD / HELMET ──
  const headY = -55;
  ctx.beginPath();
  ctx.arc(0, headY, 10, 0, Math.PI*2);
  ctx.fillStyle = colorHelmet;
  ctx.fill();
  ctx.strokeStyle = colorBody; ctx.lineWidth = 2; ctx.stroke();

  // visor dark stripe
  ctx.beginPath();
  ctx.arc(0, headY + 2, 10, Math.PI*0.1, Math.PI*0.9);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.stroke();

  // ── BODY ──
  ctx.strokeStyle = colorBody; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, headY + 10); ctx.lineTo(0, -22); ctx.stroke();

  // ── ARMS ──
  const armSwing = airborne ? Math.sin(t * 4) * 25 : Math.sin(t * 8) * 12;

  if (gear === 'ski') {
    const poleY = airborne ? -48 : -42;
    ctx.beginPath(); ctx.moveTo(0, poleY); ctx.lineTo(-20 + armSwing, -28);
    if (!airborne) ctx.lineTo(-22 + armSwing, -10);
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(0, poleY); ctx.lineTo(20 - armSwing, -28);
    if (!airborne) ctx.lineTo(22 - armSwing, -10);
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath(); ctx.arc(-20 + armSwing, -28, 3, 0, Math.PI*2);
    ctx.fillStyle = colorBody; ctx.fill();
    ctx.beginPath(); ctx.arc(20 - armSwing, -28, 3, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.strokeStyle = colorBody; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(-28 + armSwing, -32 + armSwing*0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(28 - armSwing, -32 - armSwing*0.3); ctx.stroke();
  }

  // ── LEGS ──
  ctx.strokeStyle = colorBody; ctx.lineWidth = 3;
  if (gear === 'ski') {
    const legBend = airborne ? 14 : 8;
    ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(-legBend,-8+bob); ctx.lineTo(-10,0+bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(legBend,-8-bob);  ctx.lineTo(10,0-bob);  ctx.stroke();
  } else {
    const legBend = airborne ? 18 : 14;
    ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(-legBend,-6+bob); ctx.lineTo(-16,0+bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(legBend,-6-bob);  ctx.lineTo(16,0-bob);  ctx.stroke();
  }

  // ── GEAR ──
  if (gear === 'ski') {
    const skiTip = airborne ? -12 : 2;
    // Ski 1
    ctx.beginPath(); ctx.moveTo(-28, skiTip+bob); ctx.lineTo(18, skiTip+bob);
    ctx.strokeStyle = gearStroke(-30, 20, 0, '#00d4ff', colorBody);
    ctx.lineWidth = 4; ctx.stroke();
    // Ski 2
    ctx.beginPath(); ctx.moveTo(-28, skiTip-bob); ctx.lineTo(18, skiTip-bob);
    ctx.strokeStyle = gearStroke(-30, 20, 0, colorGear === 'auto' ? '#ff4466' : colorGear, colorBody);
    ctx.lineWidth = 4; ctx.stroke();
    // Tips
    const tip1 = colorGear === 'auto' ? '#00d4ff' : colorGear;
    const tip2 = colorGear === 'auto' ? '#ff4466' : colorGear;
    ctx.beginPath(); ctx.moveTo(14,skiTip+bob); ctx.quadraticCurveTo(22,skiTip-5+bob,20,skiTip+bob);
    ctx.strokeStyle = tip1; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14,skiTip-bob); ctx.quadraticCurveTo(22,skiTip-5-bob,20,skiTip-bob);
    ctx.strokeStyle = tip2; ctx.lineWidth = 3; ctx.stroke();
  } else {
    const boardY = airborne ? -8 : 1;
    // Board body
    let boardPaint;
    if (colorGear === 'auto') {
      boardPaint = ctx.createLinearGradient(-26, 0, 26, 0);
      boardPaint.addColorStop(0,   '#ff4466');
      boardPaint.addColorStop(0.3, '#ff8800');
      boardPaint.addColorStop(0.7, '#ffd700');
      boardPaint.addColorStop(1,   '#00ff99');
    } else {
      boardPaint = colorGear;
    }
    ctx.beginPath(); ctx.moveTo(-26, boardY); ctx.lineTo(26, boardY);
    ctx.strokeStyle = boardPaint; ctx.lineWidth = 7; ctx.stroke();
    // Tips — slightly lighter shade of chosen colour
    const tipC = colorGear === 'auto' ? '#ffd700' : colorGear;
    ctx.beginPath(); ctx.moveTo(22,boardY); ctx.quadraticCurveTo(30,boardY-6,27,boardY);
    ctx.strokeStyle = tipC; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22,boardY); ctx.quadraticCurveTo(-30,boardY-6,-27,boardY);
    ctx.strokeStyle = tipC; ctx.lineWidth = 4; ctx.stroke();
    // Bindings
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-18, boardY-3, 6, 3);
    ctx.fillRect(12, boardY-3, 6, 3);
  }

  // ── AIRBORNE AURA ──
  if (airborne) {
    const auraC = colorBody === '#ffffff' ? '0,212,255' : hexToRgb(colorBody);
    const glow = ctx.createRadialGradient(0,-28,5,0,-28,55);
    glow.addColorStop(0,   `rgba(${auraC},0.20)`);
    glow.addColorStop(0.5, `rgba(${auraC},0.07)`);
    glow.addColorStop(1,   `rgba(${auraC},0)`);
    ctx.beginPath(); ctx.arc(0,-28,55,0,Math.PI*2);
    ctx.fillStyle = glow; ctx.fill();
  }

  ctx.restore();
}

/** Convert #rrggbb to "r,g,b" string for rgba() usage */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ── TRICKS (on-slope spin) ────────────────────
const TRICK_NAMES = ['SHRED!','GNARLY!','SICK!','RADICAL!','PHAT!','SEND IT!','BUTTER!','360!'];

function doTrick() {
  if (!riding || airborne || trickCooldown > 0) return;
  trickAnim = 360;
  trickCooldown = 1.8;
  const name = TRICK_NAMES[Math.floor(Math.random() * TRICK_NAMES.length)];
  showTrickFlash(name);
}

function showTrickFlash(text) {
  const el = document.createElement('div');
  el.className = 'trick-flash';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ── GAME OVER ────────────────────────────────
function showGameOver(finished) {
  stopLoop();
  riding = false; airborne = false;

  const finalScore = Math.round(score);
  const isNewBest  = finalScore > highScore;

  // Save new high score
  if (isNewBest) {
    highScore = finalScore;
    localStorage.setItem(HS_KEY, highScore);
    updateHiDisplay();
    // Flash the HUD chip gold
    const chip = document.getElementById('stat-hi');
    chip.classList.remove('new-best');
    void chip.offsetWidth; // reflow to restart animation
    chip.classList.add('new-best');
    setTimeout(() => chip.classList.remove('new-best'), 1600);
  }

  document.getElementById('panel-gameover').classList.remove('hidden');
  document.getElementById('ride-controls').classList.add('hidden');
  document.getElementById('go-title').textContent     = finished ? '🏆 Great Run!' : '💥 Wipeout!';
  document.getElementById('go-dist').textContent      = Math.round(distance)         + ' m';
  document.getElementById('go-spd').textContent       = Math.round(topSpeed * 0.036) + ' km/h';
  document.getElementById('go-score').textContent     = finalScore;
  document.getElementById('go-hi').textContent        = Math.round(highScore);

  // NEW RECORD banner
  const rec = document.getElementById('new-record');
  rec.classList.toggle('hidden', !isNewBest);
}

// ── HINT FLASH ────────────────────────────────
function flashHint() {
  const hint = document.querySelector('.hint-text');
  hint.style.color = '#ff4466';
  hint.textContent = '✏️ Draw a slope first!';
  setTimeout(() => {
    hint.style.color = '';
    hint.innerHTML = '<i class="fa-solid fa-pen"></i> Draw your slope on the canvas, then hit <strong>Ride!</strong>';
  }, 1800);
}

// ── KEYBOARD shortcuts ─────────────────────────
window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    if (airborne) return;
    doJump();
  }
  if (e.code === 'KeyT') doTrick();
  if (e.code === 'Escape') { if (riding) stopRide(); }
  if (e.code === 'KeyC' && !riding) clearSlope();
});

// ── Initial draw ──────────────────────────────
updateHiDisplay();
redrawCanvas();
