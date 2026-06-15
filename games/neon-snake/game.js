// ==========================================================================
// Setup & Configuration
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

// Grid and Tile configuration
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE; // 400 / 20 = 20 tiles in each direction

// Game Variables
let snake = [];
let food = { x: 0, y: 0 };
let dx = GRID_SIZE; // movement velocity in X
let dy = 0;         // movement velocity in Y
let nextDx = dx;    // buffer next move to prevent immediate double-tap self-collision
let nextDy = dy;
let score = 0;
let highScore = 0;
let gameInterval = null;
let gameSpeed = 120; // Initial speed in milliseconds
let isPaused = false;
let gameStarted = false;

// Color Themes Configuration
const SNAKE_THEMES = {
    '#9d4edd': { // Purple
        head: '#e879f9',
        body: '#c084fc',
        glow: '#9d4edd',
        headGlow: '#d8b4fe'
    },
    '#39ff14': { // Green
        head: '#a7f3d0',
        body: '#86efac',
        glow: '#39ff14',
        headGlow: '#c6f6d5'
    },
    '#ff007f': { // Pink/Red
        head: '#fbcfe8',
        body: '#f472b6',
        glow: '#ff007f',
        headGlow: '#fce7f3'
    },
    '#ffdd44': { // Yellow
        head: '#fef9c3',
        body: '#fef08a',
        glow: '#ffdd44',
        headGlow: '#fefcd0'
    },
    '#00f5ff': { // Cyan
        head: '#a5f3fc',
        body: '#67e8f9',
        glow: '#00f5ff',
        headGlow: '#cffafe'
    }
};

let currentSnakeColor = localStorage.getItem('neonsnake_color') || '#9d4edd';

// ==========================================================================
// Initial Boot
// ==========================================================================
// Load highscore
if (localStorage.getItem('neonSnakeHighScore')) {
    highScore = parseInt(localStorage.getItem('neonSnakeHighScore'));
    highScoreVal.textContent = formatScore(highScore);
}

// Reset Game State & Init Color Picker
resetGame();
initColorPicker();
drawInitialState();

// Initialize color selection
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
            drawInitialState();
        });
    });
}

// ==========================================================================
// Game Engine Loops
// ==========================================================================
function start() {
    if (gameStarted) return;
    
    resetGame();
    overlayScreen.classList.remove('active');
    gameStarted = true;
    isPaused = false;
    
    // Start interval loop
    gameInterval = setInterval(gameStep, gameSpeed);
}

function resetGame() {
    // Initial snake position in the middle, heading right
    snake = [
        { x: GRID_SIZE * 10, y: GRID_SIZE * 10 },
        { x: GRID_SIZE * 9, y: GRID_SIZE * 10 },
        { x: GRID_SIZE * 8, y: GRID_SIZE * 10 }
    ];
    dx = GRID_SIZE;
    dy = 0;
    nextDx = dx;
    nextDy = dy;
    score = 0;
    scoreVal.textContent = formatScore(score);
    gameSpeed = 120;
    
    generateFood();
    
    if (gameInterval) {
        clearInterval(gameInterval);
    }
}

function gameStep() {
    if (isPaused) return;

    // Apply buffered direction change
    dx = nextDx;
    dy = nextDy;

    // 1. Move Snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check Border Collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }
    
    // Check Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // Insert new head
    snake.unshift(head);
    
    // 2. Check Food eating
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreVal.textContent = formatScore(score);
        
        // Save and display High Score
        if (score > highScore) {
            highScore = score;
            highScoreVal.textContent = formatScore(highScore);
            localStorage.setItem('neonSnakeHighScore', highScore);
        }
        
        // Speed up game gradually
        if (gameSpeed > 60) {
            gameSpeed -= 2.5;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameStep, gameSpeed);
        }
        
        generateFood();
    } else {
        // Remove tail
        snake.pop();
    }
    
    // 3. Redraw frame
    draw();
}

// ==========================================================================
// Drawing Functions
// ==========================================================================
function draw() {
    // Clear canvas
    ctx.fillStyle = '#05060b';
    ctx.shadowBlur = 0; // reset glow for background fill
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle grid line details
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw Food with bright Neon Cyan glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f5ff';
    ctx.fillStyle = '#00f5ff';
    ctx.beginPath();
    const foodRadius = GRID_SIZE / 2 - 2;
    ctx.arc(food.x + GRID_SIZE / 2, food.y + GRID_SIZE / 2, foodRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw Snake with selected color theme
    const theme = SNAKE_THEMES[currentSnakeColor] || SNAKE_THEMES['#9d4edd'];
    snake.forEach((part, index) => {
        // Head is slightly brighter
        if (index === 0) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = theme.headGlow;
            ctx.fillStyle = theme.head;
        } else {
            ctx.shadowBlur = 12;
            ctx.shadowColor = theme.glow;
            ctx.fillStyle = theme.body;
        }
        
        // Rounded card styles for grid tiles
        const padding = 1.5;
        const size = GRID_SIZE - padding * 2;
        
        ctx.beginPath();
        ctx.roundRect(part.x + padding, part.y + padding, size, size, 4);
        ctx.fill();
    });
}

function drawInitialState() {
    ctx.fillStyle = '#05060b';
    ctx.shadowBlur = 0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw static decorative elements
    const theme = SNAKE_THEMES[currentSnakeColor] || SNAKE_THEMES['#9d4edd'];
    ctx.shadowBlur = 12;
    ctx.shadowColor = theme.glow;
    ctx.fillStyle = theme.body;
    ctx.beginPath();
    ctx.roundRect(GRID_SIZE * 10 + 1, GRID_SIZE * 10 + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
    ctx.fill();
}

// ==========================================================================
// Helper Functions
// ==========================================================================
function generateFood() {
    // Generate random coordinate
    let newX, newY;
    let foodOnSnake = true;
    
    while (foodOnSnake) {
        newX = Math.floor(Math.random() * TILE_COUNT) * GRID_SIZE;
        newY = Math.floor(Math.random() * TILE_COUNT) * GRID_SIZE;
        
        // Check if overlaps snake
        foodOnSnake = snake.some(part => part.x === newX && part.y === newY);
    }
    
    food.x = newX;
    food.y = newY;
}

function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    
    overlayTitle.textContent = "GAME OVER";
    overlayMessage.textContent = `You scored ${score} points!`;
    startBtn.textContent = "PLAY AGAIN";
    overlayScreen.classList.add('active');
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

// ==========================================================================
// Inputs & Key Bindings
// ==========================================================================
function changeDirection(newDx, newDy) {
    // Prevent 180 degree instant self-collisions
    if (newDx === -dx || newDy === -dy) return;
    
    nextDx = newDx;
    nextDy = newDy;
}

// Keyboard
document.addEventListener('keydown', (e) => {
    // Block arrow keys from scrolling the webpage
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
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection(0, -GRID_SIZE);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection(0, GRID_SIZE);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection(-GRID_SIZE, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection(GRID_SIZE, 0);
            break;
    }
});

// Start button clicks
startBtn.addEventListener('click', () => {
    if (!gameStarted) {
        start();
    } else if (isPaused) {
        togglePause();
    }
});

pauseToggleBtn.addEventListener('click', togglePause);

// Virtual D-Pad Click Bindings
document.getElementById('btnUp').addEventListener('click', () => {
    if (gameStarted && !isPaused) changeDirection(0, -GRID_SIZE);
});
document.getElementById('btnDown').addEventListener('click', () => {
    if (gameStarted && !isPaused) changeDirection(0, GRID_SIZE);
});
document.getElementById('btnLeft').addEventListener('click', () => {
    if (gameStarted && !isPaused) changeDirection(-GRID_SIZE, 0);
});
document.getElementById('btnRight').addEventListener('click', () => {
    if (gameStarted && !isPaused) changeDirection(GRID_SIZE, 0);
});

// Force D-Pad visibility for touchscreens
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    const touchCtrl = document.querySelector('.touch-controls');
    if (touchCtrl) touchCtrl.style.display = 'flex';
}

// Swipe Controls for Mobile/Touch
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    if (gameStarted && !isPaused) {
        // Prevent scrolling while playing
        e.preventDefault();
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!gameStarted || isPaused) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    const minSwipeDistance = 30; // pixels

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                changeDirection(GRID_SIZE, 0); // Right
            } else {
                changeDirection(-GRID_SIZE, 0); // Left
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                changeDirection(0, GRID_SIZE); // Down
            } else {
                changeDirection(0, -GRID_SIZE); // Up
            }
        }
    }
}, { passive: true });
