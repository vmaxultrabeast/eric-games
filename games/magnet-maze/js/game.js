import { Board, BoardContactType, BoardContactPhase } from "@board.fun/web-sdk";

// ==========================================================================
//  GAME CONFIGURATION & CONSTANTS
// ==========================================================================
const WIDTH = 1920;
const HEIGHT = 1080;
const MARBLE_RADIUS = 20;
const MAGNET_MAX_FORCE = 0.85;
const MAGNET_RANGE = 450;
const FRICTION = 0.985;
const BOUNCE_RESTITUTION = 0.55;

// Web Audio API context for sound synthesis
let audioCtx = null;

// Screen shake state
let shakeIntensity = 0;
const maxShakeIntensity = 15;

// Particles
let particles = [];
let trailParticles = [];

// Portal Cooldowns
let portalCooldown = 0;

// Timer and state
let levelStartTime = 0;
let keysCollected = 0;

// Game State
let currentState = "START"; // START | PLAYING | FAILURE | COMPLETE | VICTORY
let currentLevelIndex = 0;
let fragmentsCollected = 0;
let activeLevel = null;
let currentScore = 0;

// Attractors (physical + simulated)
let activeAttractors = [];
let simulatedAttractors = new Map(); // simulated via mouse clicks

// Canvas and Rendering context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==========================================================================
//  LEVEL DEFINITIONS
// ==========================================================================
const levels = [
  {
    name: "GRID ENTRANCE",
    start: { x: 150, y: 540 },
    goal: { x: 1750, y: 540 },
    fragments: [
      { x: 500, y: 250, collected: false },
      { x: 960, y: 800, collected: false },
      { x: 1420, y: 250, collected: false }
    ],
    walls: [
      // Perimeter
      { x: 0, y: 0, w: WIDTH, h: 40 },
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 0, y: 0, w: 40, h: HEIGHT },
      { x: WIDTH - 40, y: 0, w: 40, h: HEIGHT },
      // Maze obstacles
      { x: 380, y: 40, w: 40, h: 620 },
      { x: 780, y: 420, w: 40, h: 620 },
      { x: 1180, y: 40, w: 40, h: 620 },
      { x: 1500, y: 420, w: 40, h: 620 }
    ],
    hazards: [],
    keys: [],
    gates: [],
    portals: [],
    lasers: []
  },
  {
    name: "PLASMA CHAMBER",
    start: { x: 150, y: 150 },
    goal: { x: 1750, y: 900 },
    fragments: [
      { x: 960, y: 150, collected: false },
      { x: 600, y: 900, collected: false },
      { x: 1350, y: 540, collected: false }
    ],
    walls: [
      // Perimeter
      { x: 0, y: 0, w: WIDTH, h: 40 },
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 0, y: 0, w: 40, h: HEIGHT },
      { x: WIDTH - 40, y: 0, w: 40, h: HEIGHT },
      // Center box obstacles
      { x: 400, y: 40, w: 40, h: 700 },
      { x: 800, y: 340, w: 40, h: 700 },
      { x: 1200, y: 40, w: 40, h: 700 }
    ],
    // Static deadly red zones
    hazards: [
      { x: 440, y: 640, w: 360, h: 100 },
      { x: 840, y: 340, w: 360, h: 100 }
    ],
    keys: [
      { x: 600, y: 150, collected: false } // key to unlock the gate
    ],
    gates: [
      { x: 1240, y: 500, w: 40, h: 240, open: false, color: "#ff00a0" } // gate blocking access
    ],
    portals: [],
    lasers: []
  },
  {
    name: "WORMHOLE COMPLEX",
    start: { x: 150, y: 880 },
    goal: { x: 1750, y: 180 },
    fragments: [
      { x: 1700, y: 880, collected: false },
      { x: 960, y: 540, collected: false },
      { x: 200, y: 180, collected: false }
    ],
    walls: [
      // Perimeter
      { x: 0, y: 0, w: WIDTH, h: 40 },
      { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
      { x: 0, y: 0, w: 40, h: HEIGHT },
      { x: WIDTH - 40, y: 0, w: 40, h: HEIGHT },
      // Dividers
      { x: 400, y: 40, w: 40, h: 800 },
      { x: 1480, y: 240, w: 40, h: 800 },
      { x: 800, y: 300, w: 360, h: 40 }
    ],
    hazards: [],
    keys: [],
    gates: [],
    // Portal networks (teleporting portals)
    portals: [
      { id: "p1", x: 220, y: 300, r: 40, tx: 1100, ty: 800, color: "#9b59b6" },
      { id: "p2", x: 1100, y: 800, r: 40, tx: 220, ty: 300, color: "#9b59b6" },
      { id: "p3", x: 800, y: 800, r: 40, tx: 1680, ty: 500, color: "#3498db" },
      { id: "p4", x: 1680, y: 500, r: 40, tx: 800, ty: 800, color: "#3498db" }
    ],
    // Periodic pulsing lasers
    lasers: [
      { x1: 440, y1: 540, x2: 760, y2: 540, timer: 0, duration: 180, active: true },
      { x1: 1200, y1: 540, x2: 1440, y2: 540, timer: 90, duration: 180, active: true }
    ],
    keys: []
  }
];

// ==========================================================================
//  PHYSICAL MARBLE OBJECT
// ==========================================================================
class Marble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.color = "#ffffff";
    this.trailTimer = 0;
  }

  update() {
    // 1. Calculate magnetic pull from active and simulated attractors
    let ax = 0;
    let ay = 0;
    const allAttractors = [...activeAttractors, ...Array.from(simulatedAttractors.values())];

    for (const attr of allAttractors) {
      const dx = attr.x - this.x;
      const dy = attr.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < MAGNET_RANGE) {
        // Force drops off with distance
        const forceFactor = (1 - dist / MAGNET_RANGE); // linear falloff
        let force = forceFactor * MAGNET_MAX_FORCE;
        
        // PieceSense check: glyphId 2 acts as a repeller
        const isRepeller = (attr.glyphId === 2);
        if (isRepeller) {
          force = -force * 1.2; // Push away with slightly stronger force
        }
        
        ax += (dx / dist) * force;
        ay += (dy / dist) * force;

        // Spawn magnetic stream particles
        if (Math.random() < 0.28) {
          particles.push({
            x: this.x,
            y: this.y,
            vx: (dx / dist) * (isRepeller ? -8 : 8) + (Math.random() - 0.5) * 2,
            vy: (dy / dist) * (isRepeller ? -8 : 8) + (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            color: isRepeller ? "rgba(255, 51, 68, 0.6)" : "rgba(0, 245, 255, 0.6)",
            alpha: 1.0,
            decay: Math.random() * 0.03 + 0.015,
            type: "field"
          });
        }
      }
    }

    // 2. Apply acceleration and physics
    this.vx += ax;
    this.vy += ay;
    this.vx *= FRICTION;
    this.vy *= FRICTION;
    this.x += this.vx;
    this.y += this.vy;

    // 3. Spawn tail trail particles
    this.trailTimer++;
    if (this.trailTimer >= 2) {
      this.trailTimer = 0;
      trailParticles.push({
        x: this.x,
        y: this.y,
        size: MARBLE_RADIUS * 0.85,
        alpha: 0.55
      });
    }

    // 4. Resolve static wall collisions
    for (const wall of activeLevel.walls) {
      this.resolveWallCollision(wall);
    }

    // 5. Resolve active gate collisions
    for (const gate of activeLevel.gates) {
      if (!gate.open) {
        this.resolveWallCollision(gate);
      }
    }

    // 6. Check hazards (vaporization)
    for (const hazard of activeLevel.hazards) {
      if (this.checkBoxOverlap(hazard)) {
        triggerDeath();
        return;
      }
    }

    // 7. Check keys
    for (const key of activeLevel.keys) {
      if (!key.collected) {
        const dx = this.x - key.x;
        const dy = this.y - key.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MARBLE_RADIUS + 25) {
          key.collected = true;
          keysCollected++;
          playSynthSound(587.33, "triangle", 0.3); // D5 chime
          setTimeout(() => playSynthSound(880, "triangle", 0.4), 100); // A5 chime
          
          // Open gates matching key collection
          activeLevel.gates.forEach(gate => {
            gate.open = true;
            // Spawn gates dissolving particles
            spawnDissolveParticles(gate);
          });
        }
      }
    }

    // 8. Check wormhole portals (teleportation)
    if (portalCooldown > 0) {
      portalCooldown--;
    } else {
      for (const portal of activeLevel.portals) {
        const dx = this.x - portal.x;
        const dy = this.y - portal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MARBLE_RADIUS + portal.r * 0.5) {
          // Play sound
          playPortalSound();
          // Teleport marble
          this.x = portal.tx;
          this.y = portal.ty;
          portalCooldown = 60; // cooldown of 1 second (at 60fps)
          
          // Spawn flash particles at entrance and exit
          spawnFlashParticles(portal.x, portal.y, portal.color);
          spawnFlashParticles(portal.tx, portal.ty, portal.color);
          break; // only teleport once per frame
        }
      }
    }

    // 9. Check periodic lasers
    for (const laser of activeLevel.lasers) {
      laser.timer++;
      if (laser.timer >= laser.duration) {
        laser.timer = 0;
        laser.active = !laser.active;
      }
      
      if (laser.active && this.checkLineOverlap(laser.x1, laser.y1, laser.x2, laser.y2)) {
        triggerDeath();
        return;
      }
    }

    // 10. Check fragments (collectibles)
    let allCollected = true;
    for (const frag of activeLevel.fragments) {
      if (!frag.collected) {
        const dx = this.x - frag.x;
        const dy = this.y - frag.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < MARBLE_RADIUS + 28) {
          frag.collected = true;
          fragmentsCollected++;
          updateHUD();
          playSynthSound(523.25 + fragmentsCollected * 130.81, "sine", 0.25); // ascending scale chime
          spawnFlashParticles(frag.x, frag.y, "rgba(57, 255, 20, 0.8)");
        }
        allCollected = false;
      }
    }

    // 11. Check wormhole goal (victory)
    const goalDx = this.x - activeLevel.goal.x;
    const goalDy = this.y - activeLevel.goal.y;
    const goalDist = Math.sqrt(goalDx * goalDx + goalDy * goalDy);

    if (goalDist < MARBLE_RADIUS + 50) {
      if (allCollected) {
        triggerComplete();
      } else {
        // Slow down ball slightly near the lock if not all collected, acting as a bounce
        if (goalDist < MARBLE_RADIUS + 30) {
          const nx = goalDx / goalDist;
          const ny = goalDy / goalDist;
          this.x = activeLevel.goal.x + nx * (MARBLE_RADIUS + 30);
          this.vx = -this.vx * 0.4;
          this.vy = -this.vy * 0.4;
          triggerShake(3);
        }
      }
    }
  }

  resolveWallCollision(box) {
    // Find closest point on the AABB wall to the circle center
    const closestX = Math.max(box.x, Math.min(this.x, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(this.y, box.y + box.h));

    // Distance vector
    const dx = this.x - closestX;
    const dy = this.y - closestY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MARBLE_RADIUS) {
      // Collision detected! Resolve overlap
      const overlap = MARBLE_RADIUS - dist;
      let nx = 0;
      let ny = 0;

      if (dist > 0) {
        nx = dx / dist;
        ny = dy / dist;
      } else {
        // Rare case: circle center is inside the box
        // Resolve along axis of minimum penetration
        const leftOverlap = this.x - box.x;
        const rightOverlap = box.x + box.w - this.x;
        const topOverlap = this.y - box.y;
        const bottomOverlap = box.y + box.h - this.y;
        
        const minOverlap = Math.min(leftOverlap, rightOverlap, topOverlap, bottomOverlap);
        if (minOverlap === leftOverlap) { nx = -1; }
        else if (minOverlap === rightOverlap) { nx = 1; }
        else if (minOverlap === topOverlap) { ny = -1; }
        else { ny = 1; }
      }

      // Move circle out of wall
      this.x += nx * overlap;
      this.y += ny * overlap;

      // Bounce velocity: reflect along wall normal
      const dot = this.vx * nx + this.vy * ny;
      if (dot < 0) {
        this.vx = this.vx - (1 + BOUNCE_RESTITUTION) * dot * nx;
        this.vy = this.vy - (1 + BOUNCE_RESTITUTION) * dot * ny;

        // Collision sound & shake
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2.0) {
          triggerShake(Math.min(speed * 0.75, 8));
          playWallBounceSound(speed);
        }
      }
    }
  }

  checkBoxOverlap(box) {
    const closestX = Math.max(box.x, Math.min(this.x, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(this.y, box.y + box.h));
    const dx = this.x - closestX;
    const dy = this.y - closestY;
    return (dx * dx + dy * dy) < (MARBLE_RADIUS * MARBLE_RADIUS);
  }

  checkLineOverlap(x1, y1, x2, y2) {
    const A = this.x - x1;
    const B = this.y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = this.x - xx;
    const dy = this.y - yy;
    const distSq = dx * dx + dy * dy;

    return distSq < (MARBLE_RADIUS * MARBLE_RADIUS);
  }

  draw() {
    ctx.save();
    
    // Outer glow ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, MARBLE_RADIUS + 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 245, 255, 0.22)";
    ctx.fill();
    
    // Core white circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, MARBLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Inner glowing ring
    ctx.beginPath();
    ctx.arc(this.x, this.y, MARBLE_RADIUS * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = varColor("--neon-cyan");
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
  }
}

// Active ball reference
let ball = null;

// ==========================================================================
//  SOUND SYNTHESIS (WEB AUDIO API)
// ==========================================================================
function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return;
  }
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    console.error("Web Audio API not supported or failed to initialize:", e);
    audioCtx = null;
  }
}

function playSynthSound(freq, type, duration, vol = 0.15) {
  if (!audioCtx) return;
  
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);

    // Garbage collection cleanup on end
    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  } catch (e) {
    console.warn("Audio failure:", e);
  }
}

function playWallBounceSound(speed) {
  const vol = Math.min(speed / 15, 0.35);
  const freq = 120 + Math.random() * 40;
  playSynthSound(freq, "triangle", 0.12, vol);
}

function playPortalSound() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);

    // Garbage collection cleanup on end
    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  } catch (e) {}
}

function playExplosionSound() {
  if (!audioCtx) return;
  try {
    // Noise buffer generator
    const bufferSize = audioCtx.sampleRate * 0.6; // 0.6 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make it deeper explosion
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();

    // Garbage collection cleanup on end
    noiseNode.onended = () => {
      noiseNode.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };
  } catch (e) {
    // Fallback simple tone if noise fails
    playSynthSound(80, "sawtooth", 0.5, 0.4);
  }
}

// ==========================================================================
//  PARTICLE EFFECT FUNCTIONS
// ==========================================================================
function spawnFlashParticles(x, y, color) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 1.5,
      color: color,
      alpha: 1.0,
      decay: Math.random() * 0.04 + 0.02,
      type: "flare"
    });
  }
}

function spawnDissolveParticles(box) {
  const stepsX = Math.ceil(box.w / 20);
  const stepsY = Math.ceil(box.h / 20);
  
  for (let x = 0; x < stepsX; x++) {
    for (let y = 0; y < stepsY; y++) {
      particles.push({
        x: box.x + x * 20 + Math.random() * 10,
        y: box.y + y * 20 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.3) * -4 - 1, // rise slightly
        size: Math.random() * 4 + 2,
        color: box.color,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.01,
        type: "dissolve"
      });
    }
  }
}

function spawnDeathExplosion(x, y) {
  for (let i = 0; i < 45; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 6 + 2,
      color: varColor("--neon-red"),
      alpha: 1.0,
      decay: Math.random() * 0.03 + 0.015,
      type: "explosion"
    });
  }
}

// ==========================================================================
//  SCREEN SHAKE & UTILS
// ==========================================================================
function triggerShake(amt) {
  shakeIntensity = Math.min(shakeIntensity + amt, maxShakeIntensity);
}

function varColor(cssVarName) {
  return getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
}

function updateHUD() {
  document.getElementById("current-level-val").textContent = currentLevelIndex + 1;
  document.getElementById("level-name-val").textContent = activeLevel.name;
  
  const total = activeLevel.fragments.length;
  document.getElementById("score-val").textContent = `${fragmentsCollected} / ${total}`;
}

// ==========================================================================
//  SDK CONTACT MANAGEMENT
// ==========================================================================
function handleDeviceContacts(contactsSnapshot) {
  // Clear active attractors, load current frame placements
  activeAttractors = [];
  
  for (const contact of contactsSnapshot) {
    if (contact.phase !== BoardContactPhase.Ended && contact.phase !== BoardContactPhase.Canceled) {
      activeAttractors.push({
        id: contact.contactId,
        x: contact.x,
        y: contact.y,
        type: contact.type,
        glyphId: contact.glyphId
      });
    }
  }
}

// Setup custom fallback simulator on standard browser
function setupSimulator() {
  const getMousePos = (e) => {
    if (!e) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (WIDTH / rect.width),
      y: (e.clientY - rect.top) * (HEIGHT / rect.height)
    };
  };

  const handleMouseDown = (e) => {
    initAudio();
    if (Board.isOnDevice) return; // ignore simulator inputs on device
    
    const pos = getMousePos(e);
    simulatedAttractors.set("mouse_magnet", {
      id: "mouse_magnet",
      x: pos.x,
      y: pos.y,
      type: "simulated",
      glyphId: e.shiftKey ? 2 : 1
    });
  };

  const handleMouseMove = (e) => {
    if (Board.isOnDevice || !simulatedAttractors.has("mouse_magnet")) return;
    
    const pos = getMousePos(e);
    simulatedAttractors.set("mouse_magnet", {
      id: "mouse_magnet",
      x: pos.x,
      y: pos.y,
      type: "simulated",
      glyphId: e.shiftKey ? 2 : 1
    });
  };

  const handleMouseUp = () => {
    simulatedAttractors.delete("mouse_magnet");
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseUp);

  // Touch Support for Mobile Browsers Simulator
  canvas.addEventListener("touchstart", (e) => {
    if (Board.isOnDevice) return;
    e.preventDefault();
    initAudio();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const pos = getMousePos(touch);
      simulatedAttractors.set("touch_magnet", {
        id: "touch_magnet",
        x: pos.x,
        y: pos.y,
        type: "simulated"
      });
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    if (Board.isOnDevice || !simulatedAttractors.has("touch_magnet")) return;
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const pos = getMousePos(touch);
      simulatedAttractors.set("touch_magnet", {
        id: "touch_magnet",
        x: pos.x,
        y: pos.y,
        type: "simulated"
      });
    }
  }, { passive: false });

  canvas.addEventListener("touchend", () => {
    simulatedAttractors.delete("touch_magnet");
  });
  canvas.addEventListener("touchcancel", () => {
    simulatedAttractors.delete("touch_magnet");
  });
}

// ==========================================================================
//  GAME CYCLE TRIGGER FUNCTIONS
// ==========================================================================
function loadLevel(index) {
  currentLevelIndex = index;
  activeLevel = JSON.parse(JSON.stringify(levels[index])); // deep clone
  fragmentsCollected = 0;
  keysCollected = 0;
  portalCooldown = 0;
  
  ball = new Marble(activeLevel.start.x, activeLevel.start.y);
  particles = [];
  trailParticles = [];
  
  updateHUD();
}

function triggerDeath() {
  triggerShake(12);
  playExplosionSound();
  spawnDeathExplosion(ball.x, ball.y);
  ball = null;
  currentState = "FAILURE";
  document.getElementById("fail-overlay").classList.add("active");
}

function triggerComplete() {
  playSynthSound(261.63, "sine", 0.25, 0.2); // C4
  setTimeout(() => playSynthSound(329.63, "sine", 0.25, 0.2), 100); // E4
  setTimeout(() => playSynthSound(392.00, "sine", 0.25, 0.2), 200); // G4
  setTimeout(() => playSynthSound(523.25, "sine", 0.4, 0.35), 300); // C5
  
  currentState = "COMPLETE";
  document.getElementById("complete-overlay").classList.add("active");
}

function startLevel() {
  document.querySelectorAll(".overlay").forEach(el => el.classList.remove("active"));
  currentState = "PLAYING";
  levelStartTime = Date.now();
}

function setupUIListeners() {
  document.getElementById("start-btn").addEventListener("click", () => {
    initAudio();
    loadLevel(0);
    startLevel();
  });

  document.getElementById("retry-btn").addEventListener("click", () => {
    initAudio();
    loadLevel(currentLevelIndex);
    startLevel();
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    initAudio();
    if (currentLevelIndex < levels.length - 1) {
      loadLevel(currentLevelIndex + 1);
      startLevel();
    } else {
      currentState = "VICTORY";
      document.getElementById("victory-overlay").classList.add("active");
    }
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    initAudio();
    loadLevel(0);
    startLevel();
  });
}

// ==========================================================================
//  CORE RENDER LOOP
// ==========================================================================
function render() {
  // Screen Shake calculation
  let offsetX = 0;
  let offsetY = 0;
  if (shakeIntensity > 0.05) {
    offsetX = (Math.random() - 0.5) * shakeIntensity;
    offsetY = (Math.random() - 0.5) * shakeIntensity;
    shakeIntensity *= 0.92; // decay shake
  }

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // 1. Clear background
  ctx.fillStyle = "#030308";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Draw Warped Background Grid
  drawWarpedGrid();

  // 3. Draw Maze static elements
  if (activeLevel) {
    // Draw Goal Wormhole
    drawGoalWormhole();
    
    // Draw Portals
    for (const portal of activeLevel.portals) {
      drawPortal(portal);
    }

    // Draw Static Walls
    ctx.shadowBlur = 0;
    ctx.fillStyle = varColor("--panel-bg");
    ctx.strokeStyle = varColor("--neon-magenta");
    ctx.lineWidth = 2;
    for (const wall of activeLevel.walls) {
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    }

    // Draw Keys
    for (const key of activeLevel.keys) {
      if (!key.collected) {
        drawKey(key);
      }
    }

    // Draw Gates
    for (const gate of activeLevel.gates) {
      if (!gate.open) {
        ctx.fillStyle = "rgba(255, 0, 160, 0.15)";
        ctx.strokeStyle = gate.color;
        ctx.lineWidth = 3;
        ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
        ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
        
        // Draw electric lock icon inside gate
        ctx.fillStyle = gate.color;
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔒", gate.x + gate.w/2, gate.y + gate.h/2);
      }
    }

    // Draw Hazards
    ctx.fillStyle = "rgba(255, 51, 68, 0.2)";
    ctx.strokeStyle = varColor("--neon-red");
    ctx.lineWidth = 2.5;
    for (const haz of activeLevel.hazards) {
      ctx.fillRect(haz.x, haz.y, haz.w, haz.h);
      ctx.strokeRect(haz.x, haz.y, haz.w, haz.h);
      
      // Draw grid lines inside plasma hazard to make it look radioactive
      ctx.save();
      ctx.beginPath();
      ctx.rect(haz.x, haz.y, haz.w, haz.h);
      ctx.clip();
      ctx.strokeStyle = "rgba(255, 51, 68, 0.4)";
      ctx.lineWidth = 1;
      for (let offset = 0; offset < Math.max(haz.w, haz.h); offset += 15) {
        ctx.beginPath();
        ctx.moveTo(haz.x + offset, haz.y);
        ctx.lineTo(haz.x, haz.y + offset);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw Periodic Lasers
    for (const laser of activeLevel.lasers) {
      if (laser.active) {
        // Draw thick outer glow pass
        ctx.strokeStyle = "rgba(255, 51, 68, 0.28)";
        ctx.lineWidth = 12 + Math.sin(Date.now() * 0.05) * 2;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        // Draw thin white core pass
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        
        // Emitter endpoints
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(laser.x1, laser.y1, 6, 0, Math.PI * 2);
        ctx.arc(laser.x2, laser.y2, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw thin dotted line guide
        ctx.strokeStyle = "rgba(255, 51, 68, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw Collectible Fragments
    for (const frag of activeLevel.fragments) {
      if (!frag.collected) {
        drawFragment(frag);
      }
    }
  }

  // 4. Update and Draw active marble
  if (currentState === "PLAYING" && ball) {
    ball.update();
  }
  
  // Draw tail particles (fading tail behind marble)
  ctx.save();
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const tp = trailParticles[i];
    ctx.beginPath();
    ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 255, ${tp.alpha})`;
    ctx.fill();
    
    tp.alpha -= 0.025;
    tp.size *= 0.94;
    if (tp.alpha <= 0.01) {
      trailParticles.splice(i, 1);
    }
  }
  ctx.restore();

  if (ball) {
    ball.draw();
  }

  // 5. Update and Draw particles (explosions, flashes, dissolving walls)
  drawParticles();

  // 6. Draw active Magnetic Attractor Fields
  drawAttractorFields();

  ctx.restore();
}

// Loop tick
function tick() {
  render();
  requestAnimationFrame(tick);
}

// ==========================================================================
//  DRAWING HELPER FUNCTIONS
// ==========================================================================
function drawWarpedGrid() {
  const step = 80;
  const allAttractors = [...activeAttractors, ...Array.from(simulatedAttractors.values())];

  ctx.strokeStyle = "rgba(0, 245, 255, 0.035)";
  ctx.lineWidth = 1;

  if (allAttractors.length === 0) {
    // Render straight grid lines - extremely cheap and fast!
    for (let y = 0; y <= HEIGHT; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }
    for (let x = 0; x <= WIDTH; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    return;
  }

  // Under active magnetic force, use a wider step for performance
  const warpStep = 120;
  const pointStep = 60;

  // Horizontal grid lines
  for (let y = 0; y <= HEIGHT; y += warpStep) {
    ctx.beginPath();
    for (let x = 0; x <= WIDTH; x += pointStep) {
      const p = warpPoint(x, y, allAttractors);
      if (x === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    const pEnd = warpPoint(WIDTH, y, allAttractors);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();
  }

  // Vertical grid lines
  for (let x = 0; x <= WIDTH; x += warpStep) {
    ctx.beginPath();
    for (let y = 0; y <= HEIGHT; y += pointStep) {
      const p = warpPoint(x, y, allAttractors);
      if (y === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    const pEnd = warpPoint(x, HEIGHT, allAttractors);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();
  }
}

// Bend coordinates slightly toward attractors to simulate magnetic space warping
function warpPoint(x, y, attractors) {
  let wx = x;
  let wy = y;
  
  for (const attr of attractors) {
    const dx = attr.x - x;
    const dy = attr.y - y;
    const d = Math.sqrt(dx * dx + dy * dy);
    
    const warpRadius = 380;
    if (d > 0 && d < warpRadius) {
      const isRepeller = (attr.glyphId === 2);
      const forceFactor = isRepeller ? -1.0 : 1.0;
      const pct = (1 - d / warpRadius);
      const force = pct * pct * 55 * forceFactor; // quadratic falloff is much faster than Math.pow
      wx += (dx / d) * force;
      wy += (dy / d) * force;
    }
  }
  
  return { x: wx, y: wy };
}

function drawAttractorFields() {
  const allAttractors = [...activeAttractors, ...Array.from(simulatedAttractors.values())];
  
  ctx.save();
  for (const attr of allAttractors) {
    const timeFactor = (Date.now() * 0.005) % 1.0;
    const isRepeller = (attr.glyphId === 2);
    const neonColorVar = isRepeller ? "--neon-red" : "--neon-cyan";
    const rippleColor = isRepeller ? "rgba(255, 51, 68, " : "rgba(0, 245, 255, ";
    
    // Draw outer glow backing circle (cheap glow)
    ctx.fillStyle = isRepeller ? "rgba(255, 51, 68, 0.22)" : "rgba(0, 245, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(attr.x, attr.y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Draw center core
    ctx.fillStyle = varColor(neonColorVar);
    ctx.beginPath();
    ctx.arc(attr.x, attr.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw concentric ripples representing magnetic pulses
    for (let r = 1; r <= 3; r++) {
      const radius = ((r - 1 + timeFactor) / 3) * 120;
      const alpha = 1.0 - (radius / 120);
      
      ctx.strokeStyle = `${rippleColor}${alpha * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(attr.x, attr.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawGoalWormhole() {
  ctx.save();
  const goal = activeLevel.goal;
  const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.08;
  const rot = Date.now() * 0.0015;

  ctx.translate(goal.x, goal.y);
  ctx.scale(pulse, pulse);
  ctx.rotate(rot);

  // Outer lock ring or glow depending on collection state
  const total = activeLevel.fragments.length;
  const isUnlocked = fragmentsCollected === total;
  
  // Draw outer glow backing circle (cheap glow)
  ctx.fillStyle = isUnlocked ? "rgba(57, 255, 20, 0.22)" : "rgba(255, 0, 160, 0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw spiraling black hole texture
  const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 50);
  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(0.4, isUnlocked ? "#0f3a05" : "#2f051e");
  gradient.addColorStop(1.0, isUnlocked ? varColor("--neon-green") : varColor("--neon-magenta"));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI * 2);
  ctx.fill();

  // Spiral arms
  ctx.strokeStyle = isUnlocked ? "rgba(57, 255, 20, 0.4)" : "rgba(255, 0, 160, 0.4)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.quadraticCurveTo(25, 25, 45, 0);
    ctx.stroke();
  }

  // Draw Lock icon if locked
  if (!isUnlocked) {
    ctx.rotate(-rot); // unrotate to draw static lock icon
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔒", 0, 0);
  } else {
    ctx.rotate(-rot);
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌀", 0, 0);
  }

  ctx.restore();
}

function drawPortal(portal) {
  ctx.save();
  ctx.translate(portal.x, portal.y);
  ctx.rotate(Date.now() * -0.002);

  // Draw thick outer glow backing circle (cheap glow)
  ctx.fillStyle = portal.color;
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(0, 0, portal.r + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Outer portal boundary
  ctx.strokeStyle = portal.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, portal.r, 0, Math.PI * 2);
  ctx.stroke();

  // Pulsing spiral center
  const pulse = Math.abs(Math.sin(Date.now() * 0.004));
  ctx.fillStyle = portal.color;
  ctx.globalAlpha = 0.15 + pulse * 0.15;
  ctx.beginPath();
  ctx.arc(0, 0, portal.r * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.quadraticCurveTo(0, -15, 15, 0);
  ctx.quadraticCurveTo(0, 15, -15, 0);
  ctx.stroke();

  ctx.restore();
}

function drawFragment(frag) {
  ctx.save();
  const time = Date.now() * 0.005;
  const bob = Math.sin(time) * 6;
  const rotation = time * 0.6;

  ctx.translate(frag.x, frag.y + bob);
  ctx.rotate(rotation);
  
  // Neon Green diamond glow backing (cheap glow)
  ctx.fillStyle = "rgba(57, 255, 20, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(16, 0);
  ctx.lineTo(0, 20);
  ctx.lineTo(-16, 0);
  ctx.closePath();
  ctx.fill();

  // Neon Green diamond/star fragment
  ctx.fillStyle = varColor("--neon-green");
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();

  // Core white center
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(5, 0);
  ctx.lineTo(0, 7);
  ctx.lineTo(-5, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function drawKey(key) {
  ctx.save();
  const time = Date.now() * 0.006;
  const bob = Math.sin(time) * 5;
  
  ctx.translate(key.x, key.y + bob);
  
  // Gold glow backing (cheap glow)
  ctx.fillStyle = "rgba(255, 215, 0, 0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd700";
  ctx.font = "26px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔑", 0, 0);
  
  ctx.restore();
}

function drawParticles() {
  ctx.save();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;

    if (p.alpha <= 0.01) {
      particles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ==========================================================================
//  INITIALIZATION
// ==========================================================================
function init() {
  // 1. Simulator check
  if (Board.isOnDevice) {
    document.getElementById("mode-text").textContent = "CONSOLE ACTIVE";
    document.getElementById("simulator-badge").classList.add("device-active");
    
    // Subscribe to physical contacts
    Board.input.subscribe((contactsSnapshot) => {
      handleDeviceContacts(contactsSnapshot);
    });

    // Initialize Pause Context so the top-right console menu is touchable
    Board.pause.setContext({
      gameName: "Neon Magnet Maze",
      offerSaveOption: false
    });

    // Handle pause menu outcomes
    Board.pause.onResult((result) => {
      if (result.action === "quit" || result.action === "save_and_quit") {
        Board.application.quit();
      }
    });
  } else {
    document.getElementById("mode-text").textContent = "SIMULATOR ACTIVE";
    setupSimulator();
  }

  // 2. Adjust Canvas layout bounds on screen scale
  function resize() {
    // Canvas coordinate space remains fixed 1920x1080
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
  }
  resize();
  window.addEventListener("resize", resize);

  // 3. Setup HUD state and triggers
  setupUIListeners();

  // 4. Run loop
  tick();
}

// Run initializer on document load
document.addEventListener("DOMContentLoaded", init);
