// ==========================================================================
// Neon Snake — 60FPS Performance Engine & Arcade Arcade Overhaul
// ==========================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreVal = document.getElementById('scoreVal');
const highScoreVal = document.getElementById('highScoreVal');
const startBtn = document.getElementById('startBtn');
const overlayScreen = document.getElementById('overlayScreen');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const pauseToggleBtn = document.getElementById('pauseToggleBtn');

// Grid & Canvas Setup
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE; // 400 / 20 = 20 tiles

// Color Themes Configuration
const SNAKE_THEMES = {
    '#9d4edd': { head: '#e879f9', body: '#c084fc', glow: '#9d4edd', headGlow: '#d8b4fe' },
    '#39ff14': { head: '#a7f3d0', body: '#86efac', glow: '#39ff14', headGlow: '#c6f6d5' },
    '#ff007f': { head: '#fbcfe8', body: '#f472b6', glow: '#ff007f', headGlow: '#fce7f3' },
    '#ffdd44': { head: '#fef9c3', body: '#fef08a', glow: '#ffdd44', headGlow: '#fefcd0' },
    '#00f5ff': { head: '#a5f3fc', body: '#67e8f9', glow: '#00f5ff', headGlow: '#cffafe' }
};

const hexToRgba = (hex, alpha) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

let currentSnakeColor = localStorage.getItem('neonsnake_color') || '#9d4edd';
document.documentElement.style.setProperty('--active-theme-color', currentSnakeColor);
document.documentElement.style.setProperty('--active-theme-color-glow', hexToRgba(currentSnakeColor, 0.4));

// ── Web Audio API Retro Sound Engine ───────────────────────────────────────
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'turn') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'eat') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.10); // G5
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === 'bonus') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.setValueAtTime(880, now + 0.06);
            osc.frequency.setValueAtTime(1174.66, now + 0.12);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'crash') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {}
}

// ── Game Variables ─────────────────────────────────────────────────────────
let snake = [];
let food = { x: 0, y: 0, type: 'normal' }; // 'normal' or 'bonus'
let dx = GRID_SIZE;
let dy = 0;
let inputQueue = []; // Fluid queue to buffer quick turns without dropping inputs
let score = 0;
let highScore = 0;
let gameSpeed = 115; // Grid tick interval in milliseconds
let lastStepTime = 0;
let animationFrameId = null;
let isPaused = false;
let gameStarted = false;
let particles = [];
let screenShake = 0;
let foodAnimAngle = 0;
let foodEatenCount = 0;

// Load Highscore
if (localStorage.getItem('neonSnakeHighScore')) {
    highScore = parseInt(localStorage.getItem('neonSnakeHighScore'), 10) || 0;
    highScoreVal.textContent = formatScore(highScore);
}

// Init UI
resetGame();
initColorPicker();
drawInitialState();

function initColorPicker() {
    const btns = document.querySelectorAll('.color-btn');
    btns.forEach((btn) => {
        if (btn.getAttribute('data-color') === currentSnakeColor) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentSnakeColor = btn.getAttribute('data-color');
            localStorage.setItem('neonsnake_color', currentSnakeColor);
            document.documentElement.style.setProperty('--active-theme-color', currentSnakeColor);
            document.documentElement.style.setProperty('--active-theme-color-glow', hexToRgba(currentSnakeColor, 0.4));
            drawInitialState();
        });
    });
}

// ── 60FPS Game Loop ────────────────────────────────────────────────────────
function start() {
    if (gameStarted) return;
    
    getAudioContext();
    resetGame();
    overlayScreen.classList.remove('active');
    gameStarted = true;
    isPaused = false;
    lastStepTime = performance.now();

    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(loop);
}

function resetGame() {
    snake = [
        { x: GRID_SIZE * 10, y: GRID_SIZE * 10 },
        { x: GRID_SIZE * 9, y: GRID_SIZE * 10 },
        { x: GRID_SIZE * 8, y: GRID_SIZE * 10 }
    ];
    dx = GRID_SIZE;
    dy = 0;
    inputQueue = [];
    score = 0;
    foodEatenCount = 0;
    scoreVal.textContent = formatScore(score);
    gameSpeed = 115;
    particles = [];
    screenShake = 0;
    
    generateFood();
}

function loop(timestamp) {
    if (!gameStarted) return;

    animationFrameId = requestAnimationFrame(loop);

    if (isPaused) {
        draw();
        return;
    }

    // 1. Grid Logic Step at fixed time interval
    const delta = timestamp - lastStepTime;
    if (delta >= gameSpeed) {
        lastStepTime = timestamp - (delta % gameSpeed);
        gameStep();
    }

    // 2. Update 60FPS Visual FX (Particles & Screen Shake)
    updateFX();

    // 3. Render Frame
    draw();
}

function gameStep() {
    // Process next direction from input queue
    if (inputQueue.length > 0) {
        const nextDir = inputQueue.shift();
        // Prevent 180-degree instant suicide turns
        if (nextDir.dx !== -dx || nextDir.dy !== -dy) {
            dx = nextDir.dx;
            dy = nextDir.dy;
        }
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check Wall Collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        spawnExplosion(snake[0].x + GRID_SIZE/2, snake[0].y + GRID_SIZE/2, '#ff007f', 40);
        playSound('crash');
        screenShake = 12;
        gameOver();
        return;
    }

    // Check Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            spawnExplosion(head.x + GRID_SIZE/2, head.y + GRID_SIZE/2, '#ff007f', 40);
            playSound('crash');
            screenShake = 12;
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check Food Collision
    if (head.x === food.x && head.y === food.y) {
        const points = food.type === 'bonus' ? 30 : 10;
        score += points;
        scoreVal.textContent = formatScore(score);
        foodEatenCount++;

        screenShake = food.type === 'bonus' ? 7 : 4;
        const theme = SNAKE_THEMES[currentSnakeColor] || SNAKE_THEMES['#9d4edd'];
        const burstColor = food.type === 'bonus' ? '#ffdd44' : (theme.glow || '#00f5ff');
        
        spawnExplosion(food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, burstColor, 22);
        playSound(food.type === 'bonus' ? 'bonus' : 'eat');

        // Check HighScore
        if (score > highScore) {
            highScore = score;
            highScoreVal.textContent = formatScore(highScore);
            localStorage.setItem('neonSnakeHighScore', highScore);
        }

        // Gradually speed up grid steps down to 55ms
        if (gameSpeed > 55) {
            gameSpeed -= 2.0;
        }

        generateFood();
    } else {
        snake.pop();
    }
}

// ── Particle FX & Shake ───────────────────────────────────────────────────
function spawnExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 1.5 + Math.random() * 2.5,
            color: color,
            alpha: 1.0,
            decay: 0.02 + Math.random() * 0.03
        });
    }
}

function updateFX() {
    foodAnimAngle += 0.05;

    // Decay Screen Shake
    if (screenShake > 0) {
        screenShake *= 0.85;
        if (screenShake < 0.2) screenShake = 0;
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// ── 60FPS Visual Renderer ──────────────────────────────────────────────────
function draw() {
    ctx.save();

    // Apply Screen Shake
    if (screenShake > 0) {
        const rx = (Math.random() - 0.5) * screenShake * 2;
        const ry = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(rx, ry);
    }

    // Background
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid Lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.18)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
        const pos = i * GRID_SIZE;
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
    }
    ctx.stroke();

    // 2. Draw Animated Food Item
    ctx.save();
    const foodCx = food.x + GRID_SIZE / 2;
    const foodCy = food.y + GRID_SIZE / 2;
    const foodColor = food.type === 'bonus' ? '#ffdd44' : '#00f5ff';

    // Pulsing outer aura
    const pulseScale = 1 + Math.sin(foodAnimAngle * 3) * 0.15;
    const radius = (GRID_SIZE / 2 - 3) * pulseScale;

    ctx.shadowBlur = 18;
    ctx.shadowColor = foodColor;
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc(foodCx, foodCy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(foodCx, foodCy, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting energy speck for Bonus Food
    if (food.type === 'bonus') {
        const ox = foodCx + Math.cos(foodAnimAngle * 5) * 12;
        const oy = foodCy + Math.sin(foodAnimAngle * 5) * 12;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 3. Draw Snake Body & Head
    const theme = SNAKE_THEMES[currentSnakeColor] || SNAKE_THEMES['#9d4edd'];
    const padding = 1.5;
    const size = GRID_SIZE - padding * 2;

    // Body Segments
    if (snake.length > 1) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = theme.glow;
        ctx.fillStyle = theme.body;
        ctx.beginPath();
        for (let i = 1; i < snake.length; i++) {
            const part = snake[i];
            ctx.roundRect(part.x + padding, part.y + padding, size, size, 5);
        }
        ctx.fill();
    }

    // Snake Head with Eyes
    if (snake.length > 0) {
        const head = snake[0];
        ctx.shadowBlur = 18;
        ctx.shadowColor = theme.headGlow;
        ctx.fillStyle = theme.head;
        ctx.beginPath();
        ctx.roundRect(head.x + padding, head.y + padding, size, size, 6);
        ctx.fill();

        // Render Snake Eyes facing movement direction
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#111625';
        const eyeSize = 3;
        const hCx = head.x + GRID_SIZE / 2;
        const hCy = head.y + GRID_SIZE / 2;

        let e1x = hCx - 4, e1y = hCy - 4;
        let e2x = hCx + 4, e2y = hCy - 4;

        if (dx > 0) { // Right
            e1x = hCx + 4; e1y = hCy - 4;
            e2x = hCx + 4; e2y = hCy + 4;
        } else if (dx < 0) { // Left
            e1x = hCx - 4; e1y = hCy - 4;
            e2x = hCx - 4; e2y = hCy + 4;
        } else if (dy > 0) { // Down
            e1x = hCx - 4; e1y = hCy + 4;
            e2x = hCx + 4; e2y = hCy + 4;
        }

        ctx.beginPath();
        ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
        ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Draw Particles
    for (let p of particles) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = hexToRgba(p.color, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawInitialState() {
    ctx.fillStyle = '#05060b';
    ctx.shadowBlur = 0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const theme = SNAKE_THEMES[currentSnakeColor] || SNAKE_THEMES['#9d4edd'];
    ctx.shadowBlur = 14;
    ctx.shadowColor = theme.glow;
    ctx.fillStyle = theme.body;
    ctx.beginPath();
    ctx.roundRect(GRID_SIZE * 10 + 1, GRID_SIZE * 10 + 1, GRID_SIZE - 2, GRID_SIZE - 2, 5);
    ctx.fill();
}

function generateFood() {
    let newX, newY;
    let foodOnSnake = true;

    while (foodOnSnake) {
        newX = Math.floor(Math.random() * TILE_COUNT) * GRID_SIZE;
        newY = Math.floor(Math.random() * TILE_COUNT) * GRID_SIZE;
        foodOnSnake = snake.some(part => part.x === newX && part.y === newY);
    }

    food.x = newX;
    food.y = newY;

    // Every 5th food item has 35% chance to be a Special Bonus Food
    if (foodEatenCount > 0 && foodEatenCount % 4 === 0 && Math.random() < 0.5) {
        food.type = 'bonus';
    } else {
        food.type = 'normal';
    }
}

function gameOver() {
    gameStarted = false;
    cancelAnimationFrame(animationFrameId);

    overlayTitle.textContent = "GAME OVER";
    overlayMessage.textContent = `You scored ${score} points!`;
    startBtn.textContent = "PLAY AGAIN";
    overlayScreen.classList.add('active');

    if (score > 0) {
        submitScoreToLeaderboard(score);
    }
}

function togglePause() {
    if (!gameStarted) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        overlayTitle.textContent = "PAUSED";
        overlayMessage.textContent = "Press P or Resume to continue";
        startBtn.textContent = "RESUME";
        overlayScreen.classList.add('active');
        pauseToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume (P)';
    } else {
        overlayScreen.classList.remove('active');
        pauseToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause (P)';
    }
}

function formatScore(num) {
    return num.toString().padStart(3, '0');
}

// ── Fluid Input Queue Direction Handler ────────────────────────────────────
function queueDirection(newDx, newDy) {
    getAudioContext();

    // Check against last queued direction or current direction
    const lastDir = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : { dx, dy };
    if (newDx === -lastDir.dx || newDy === -lastDir.dy) return; // Ignore 180-degree turn
    if (newDx === lastDir.dx && newDy === lastDir.dy) return; // Ignore duplicate move

    if (inputQueue.length < 2) {
        inputQueue.push({ dx: newDx, dy: newDy });
        playSound('turn');
    }
}

// Keyboard Listeners
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (!gameStarted && (e.key === ' ' || e.key === 'Enter')) {
        start();
        return;
    }
    
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }
    
    if (isPaused && (e.key === ' ' || e.key === 'Enter')) {
        togglePause();
        return;
    }

    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
            queueDirection(0, -GRID_SIZE);
            break;
        case 'ArrowDown': case 's': case 'S':
            queueDirection(0, GRID_SIZE);
            break;
        case 'ArrowLeft': case 'a': case 'A':
            queueDirection(-GRID_SIZE, 0);
            break;
        case 'ArrowRight': case 'd': case 'D':
            queueDirection(GRID_SIZE, 0);
            break;
    }
});

startBtn.addEventListener('click', () => {
    if (!gameStarted) {
        start();
    } else if (isPaused) {
        togglePause();
    }
});

pauseToggleBtn.addEventListener('click', togglePause);

// Virtual Control Bindings
function bindDirectionBtn(id, targetDx, targetDy) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const trigger = (e) => {
        e.preventDefault();
        if (gameStarted && !isPaused) {
            queueDirection(targetDx, targetDy);
        }
    };

    btn.addEventListener('click', trigger);
    btn.addEventListener('touchstart', trigger, { passive: false });
}

bindDirectionBtn('btnUp', 0, -GRID_SIZE);
bindDirectionBtn('btnDown', 0, GRID_SIZE);
bindDirectionBtn('btnLeft', -GRID_SIZE, 0);
bindDirectionBtn('btnRight', GRID_SIZE, 0);

bindDirectionBtn('sideBtnUp', 0, -GRID_SIZE);
bindDirectionBtn('sideBtnDown', 0, GRID_SIZE);
bindDirectionBtn('sideBtnLeft', -GRID_SIZE, 0);
bindDirectionBtn('sideBtnRight', GRID_SIZE, 0);

function updateTouchControlsLayout() {
    const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const sideLeft = document.querySelector('.side-controls-left');
    const sideRight = document.querySelector('.side-controls-right');
    const touchCtrl = document.querySelector('.touch-controls');

    if (isTouch) {
        if (window.innerWidth >= 768 || window.innerWidth > window.innerHeight) {
            if (sideLeft) sideLeft.style.display = 'flex';
            if (sideRight) sideRight.style.display = 'flex';
            if (touchCtrl) touchCtrl.style.display = 'none';
        } else {
            if (sideLeft) sideLeft.style.display = 'none';
            if (sideRight) sideRight.style.display = 'none';
            if (touchCtrl) touchCtrl.style.display = 'flex';
        }
    } else {
        if (sideLeft) sideLeft.style.display = 'none';
        if (sideRight) sideRight.style.display = 'none';
        if (touchCtrl) touchCtrl.style.display = 'none';
    }
}

window.addEventListener('resize', updateTouchControlsLayout);
updateTouchControlsLayout();

// Swipe Controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    if (gameStarted && !isPaused) {
        e.preventDefault();
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!gameStarted || isPaused) return;

    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    const minSwipeDistance = 25;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            queueDirection(diffX > 0 ? GRID_SIZE : -GRID_SIZE, 0);
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            queueDirection(0, diffY > 0 ? GRID_SIZE : -GRID_SIZE);
        }
    }
}, { passive: true });

// ── Leaderboard & User Identity ───────────────────────────────────────────
const leaderboardScreen = document.getElementById('leaderboardScreen');
const leaderboardToggleBtn = document.getElementById('leaderboardToggleBtn');
const overlayLeaderboardBtn = document.getElementById('overlayLeaderboardBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

const openLeaderboard = () => {
    if (leaderboardScreen) {
        leaderboardScreen.classList.add('active');
        loadSnakeLeaderboard();
    }
};

window.openLeaderboardModal = openLeaderboard;
window.loadSnakeLeaderboard = loadSnakeLeaderboard;

if (leaderboardToggleBtn) leaderboardToggleBtn.addEventListener('click', openLeaderboard);
if (overlayLeaderboardBtn) overlayLeaderboardBtn.addEventListener('click', openLeaderboard);

if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener('click', () => {
        if (leaderboardScreen) {
            leaderboardScreen.classList.remove('active');
        }
    });
}

function getArcadeUser() {
    let uid = localStorage.getItem('arcade_uid');
    let username = localStorage.getItem('arcade_username');
    if (username === 'Trainer') username = null;

    try {
        if (window.parent) {
            if (window.parent._arcadeUser) {
                const pUser = window.parent._arcadeUser;
                uid = pUser.uid || uid;
                const pName = pUser.displayName || (pUser.email ? pUser.email.split('@')[0] : null);
                if (pName) username = pName;
            }
            if (!username && window.parent.localStorage) {
                const pName = window.parent.localStorage.getItem('arcade_username');
                if (pName && pName !== 'Trainer') username = pName;
                uid = uid || window.parent.localStorage.getItem('arcade_uid');
            }
        }
    } catch (e) {}

    if ((!username) && typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const fUser = firebase.auth().currentUser;
        uid = uid || fUser.uid;
        const fName = fUser.displayName || (fUser.email ? fUser.email.split('@')[0] : null);
        if (fName) username = fName;
    }

    if (uid) localStorage.setItem('arcade_uid', uid);
    if (username && username !== 'Trainer') localStorage.setItem('arcade_username', username);

    return { uid: uid || null, username: (username && username !== 'Trainer') ? username : 'Guest Pilot' };
}

function submitScoreToLeaderboard(finalScore) {
    if (!window._snakeFirestore || finalScore <= 0) return;
    const user = getArcadeUser();
    const db = window._snakeFirestore;

    const record = {
        username: user.username,
        userId: user.uid || 'guest',
        score: finalScore,
        color: currentSnakeColor,
        date: new Date().toISOString()
    };

    if (user.uid) {
        const ref = db.collection('neonsnake_leaderboard').doc(user.uid);
        ref.get().then(doc => {
            if (!doc.exists || (doc.data().score || 0) < finalScore) {
                ref.set(record, { merge: true });
                console.log('[NeonSnake] 🏆 High score submitted to leaderboard:', finalScore);
            }
        }).catch(() => {
            ref.set(record, { merge: true });
        });
    } else {
        db.collection('neonsnake_leaderboard').add(record);
    }
}

async function loadSnakeLeaderboard() {
    const loadingEl = document.getElementById('leaderboardLoading');
    const listEl = document.getElementById('leaderboardList');
    if (!loadingEl || !listEl) return;

    if (!window._snakeFirestore) {
        loadingEl.style.display = 'block';
        loadingEl.innerHTML = '<span style="color:#f87171;">⚠️ Leaderboard service unavailable</span>';
        listEl.innerHTML = '';
        return;
    }

    loadingEl.style.display = 'block';
    loadingEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Loading rankings...';
    listEl.innerHTML = '';

    try {
        const snap = await window._snakeFirestore
            .collection('neonsnake_leaderboard')
            .orderBy('score', 'desc')
            .limit(20)
            .get();

        loadingEl.style.display = 'none';

        if (snap.empty) {
            listEl.innerHTML = '<div style="color:#94a3b8;padding:1rem;">No high scores registered yet! Play a game to set the first score.</div>';
            return;
        }

        const docs = snap.docs.map(d => d.data());
        const user = getArcadeUser();

        if (user.uid && user.username && user.username !== 'Guest Pilot') {
            docs.forEach(d => {
                if (d.userId === user.uid && (d.username === 'Trainer' || d.username === 'Guest Pilot')) {
                    d.username = user.username;
                    window._snakeFirestore.collection('neonsnake_leaderboard').doc(user.uid).update({ username: user.username }).catch(()=>{});
                }
            });
        }

        listEl.innerHTML = `
            <table class="lb-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Pilot</th>
                        <th style="text-align:right;">Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${docs.map((d, i) => {
                        const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                        const dotColor = d.color || '#9d4edd';
                        const name = (d.username && d.username !== 'Trainer') ? d.username : 'Guest Pilot';
                        return `
                            <tr>
                                <td class="lb-rank">${rank}</td>
                                <td>
                                    <div class="lb-user-cell">
                                        <span class="lb-color-dot" style="background:${dotColor};box-shadow:0 0 6px ${dotColor};"></span>
                                        <span class="lb-username">${name}</span>
                                    </div>
                                </td>
                                <td class="lb-score">${d.score || 0}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        loadingEl.style.display = 'block';
        loadingEl.innerHTML = `<span style="color:#f87171;">⚠️ Could not load leaderboard: ${e.message}</span>`;
    }
}

function setupSnakeFirebase() {
    const cfg = {
        apiKey:            'AIzaSyDnZOwSu_5hqAuzAqgd3gNimWcQg1IuyIc',
        authDomain:        'eric-arcade.firebaseapp.com',
        projectId:         'eric-arcade',
        storageBucket:     'eric-arcade.firebasestorage.app',
        messagingSenderId: '933974427341',
        appId:             '1:933974427341:web:12c8a56664acf9e9c60b84'
    };
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        else firebase.app();
        window._snakeFirestore = firebase.firestore();

        if (firebase.auth) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Player');
                    localStorage.setItem('arcade_uid', user.uid);
                    localStorage.setItem('arcade_username', name);

                    const localHS = parseInt(localStorage.getItem('neonSnakeHighScore') || '0', 10);
                    if (localHS > 0) {
                        submitScoreToLeaderboard(localHS);
                    }
                }
            });
        }
        console.log('[NeonSnake] 🔥 Firebase ready');
    }
}
setupSnakeFirebase();
