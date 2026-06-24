// ==========================================================================
// Games Registry (Metadata)
// ==========================================================================
const GAMES_REGISTRY = [
    {
        id: 'neon-snake',
        title: 'Neon Snake',
        category: 'arcade',
        description: 'A polished, grid-based retro arcade snake game with glowing neon graphics, progressive difficulty, and touch controls support.',
        folder: 'games/neon-snake',
        cover: 'games/neon-snake/cover.png',
        controls: 'WASD / Arrow Keys to change direction. P to pause.',
        addedDate: '2026-06-08',
        updatedDate: '2026-06-08'
    },
    {
        id: 'pokemon-battle',
        title: 'Pokémon Battle Arena',
        category: 'action',
        description: 'A high-energy Pokémon battle arena game. Fight solo, in PvP, or Co-op mode against AI or friends. Features special attacks, ultimates, and touch controls.',
        folder: 'games/pokemon-battle',
        cover: 'games/pokemon-battle/icon-512.png',
        controls: 'P1: WASD to move, J/K/L/U to attack, Space to dodge. P2: Arrow keys to move, 7/8/9/0 to attack, Enter to dodge.',
        addedDate: '2026-06-09',
        updatedDate: '2026-06-09'
    },
    {
        id: 'pixel-studio',
        title: 'Pixel Studio',
        category: 'art',
        description: 'A comprehensive, frame-by-frame pixel art and animation creator. Draw designs, manage frames, customize palettes, and export animations.',
        folder: 'games/pixel-studio',
        cover: 'games/pixel-studio/cover.png',
        controls: 'Left Click to draw and use tools. Hotkeys: B (Pencil), E (Eraser), G (Fill), I (Eyedropper), L (Line).',
        addedDate: '2026-06-09',
        updatedDate: '2026-06-23'
    },
    {
        id: 'ghostfighter3000',
        title: 'GhostFight3000',
        category: 'action',
        description: 'A 4-player 3D ghost battle arena. Fight bots solo or go online with friends. Use stealth abilities — hide, force-hide, and jump — to outmaneuver opponents.',
        folder: 'games/ghostfighter3000',
        cover: 'games/ghostfighter3000/cover.png',
        controls: 'WASD / Arrow Keys to move. K: Hide, L: Force Hide, H: Unhide, J: Jump. Space: Attack.',
        addedDate: '2026-06-09',
        updatedDate: '2026-06-14'
    },
    {
        id: 'mariokart',
        title: 'Mario Kart',
        category: 'racing',
        description: 'A top-down Mario Kart racer — now with online multiplayer! Race solo against AI or create/join a room and race with up to 4 friends in real-time. Collect Mushrooms and Banana peels, dodge hazards, and fight for the Mushroom Cup!',
        folder: 'games/mario-kart',
        cover: 'games/mario-kart/cover.png',
        controls: 'Arrow Keys / WASD to drive. Space to use item. Multiplayer: click 🌐 Multiplayer, enter a name & room code.',
        addedDate: '2026-06-09',
        updatedDate: '2026-06-15'
    },
    {
        id: 'bomberman',
        title: 'Bomberman',
        category: 'arcade',
        description: 'Drop bombs, blast through walls, collect powerups, and eliminate opponents! Play solo against 3 bots (Easy / Medium / Hard) or go online with up to 4 friends in real-time multiplayer. Last bomber standing wins!',
        folder: 'games/bomberman',
        cover: 'games/bomberman/cover.png',
        controls: 'Arrow Keys / WASD to move. Space to drop bomb. Multiplayer: click 🌐 Multiplayer, enter a name & room code.',
        addedDate: '2026-06-15',
        updatedDate: '2026-06-23'
    }
    // New games can be easily appended here in the future
];

// ==========================================================================
// DOM Elements
// ==========================================================================
const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const filterTabs = document.querySelectorAll('.filter-tab');
const filterContainer = document.getElementById('filterTabs');

// Modal Elements
const gameModal = document.getElementById('gameModal');
const gameIframe = document.getElementById('gameIframe');
const modalGameTitle = document.getElementById('modalGameTitle');
const modalGameTag = document.getElementById('modalGameTag');
const modalGameControls = document.getElementById('modalGameControls');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalReloadBtn = document.getElementById('modalReloadBtn');
const modalFullscreenBtn = document.getElementById('modalFullscreenBtn');
const modalContent = document.querySelector('.modal-content');

// ==========================================================================
// Application State
// ==========================================================================
let currentFilter = 'all';
let currentSearchQuery = '';

// ==========================================================================
// Render Games Grid
// ==========================================================================
function renderGames() {
    // Clear current grid
    gamesGrid.innerHTML = '';

    // Filter games
    const filteredGames = GAMES_REGISTRY.filter(game => {
        const matchesCategory = currentFilter === 'all' || game.category === currentFilter;
        const matchesSearch = game.title.toLowerCase().includes(currentSearchQuery) ||
            game.description.toLowerCase().includes(currentSearchQuery) ||
            game.category.toLowerCase().includes(currentSearchQuery);
        return matchesCategory && matchesSearch;
    });

    // Check if empty
    if (filteredGames.length === 0) {
        gamesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-gamepad"></i>
                <p>No games found matching your criteria.</p>
            </div>
        `;
        return;
    }

    // Generate cards
    filteredGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-id', game.id);

        // Date formatting
        const formattedDate = new Date(game.addedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const formattedUpdateDate = new Date(game.updatedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="game-cover-wrap">
                <span class="game-tag-badge">${game.category}</span>
                <img class="game-cover" src="${game.cover}" alt="${game.title}" onerror="handleImageError(this, '${game.title}')">
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description}</p>
                <div class="game-actions">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span class="game-metadata">Added: ${formattedDate}</span>
                        <span class="game-metadata">Updated: ${formattedUpdateDate}</span>
                    </div>
                    <button class="play-card-btn" onclick="launchGame('${game.id}')">Play Now</button>
                </div>
            </div>
        `;

        gamesGrid.appendChild(card);
    });
}

// Fallback for missing/broken cover images
function handleImageError(imgElement, gameTitle) {
    const parent = imgElement.parentElement;
    parent.innerHTML = `
        <span class="game-tag-badge">${imgElement.previousElementSibling.textContent}</span>
        <div class="game-cover-fallback">
            <i class="fa-solid fa-gamepad"></i>
        </div>
    `;
}

// ==========================================================================
// Search & Filter Interactions
// ==========================================================================
searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase().trim();

    // Toggle clear button
    if (currentSearchQuery.length > 0) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }

    renderGames();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    renderGames();
});

filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-tab')) {
        // Toggle active tabs style
        filterTabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');

        currentFilter = e.target.getAttribute('data-filter');
        renderGames();
    }
});

// ==========================================================================
// Modal Iframe Player Logic
// ==========================================================================
function launchGame(gameId) {
    const game = GAMES_REGISTRY.find(g => g.id === gameId);
    if (!game) return;

    // Set modal content details
    modalGameTitle.textContent = game.title;
    modalGameTag.textContent = game.category;
    modalGameControls.textContent = game.controls;

    // Point iframe to game entry point with cache-busting parameter
    gameIframe.src = `${game.folder}/index.html?v=${Date.now()}`;

    // Open Modal
    gameModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeGame() {
    gameModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling

    // Safely unload iframe to stop game audio, animations, loops
    gameIframe.src = '';

    // Reset full screen view if active
    modalContent.classList.remove('fullscreen');
    modalFullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
}

// Event Listeners for Modal controls
modalCloseBtn.addEventListener('click', closeGame);

// Close on clicking the backdrop overlay outside the modal content box
gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) {
        closeGame();
    }
});

// Restart Game with fresh cache-busting timestamp
modalReloadBtn.addEventListener('click', () => {
    const currentSrc = gameIframe.src;
    if (!currentSrc) return;
    const baseUrl = currentSrc.split('?')[0];
    gameIframe.src = '';
    // Quick delay to trigger reload
    setTimeout(() => {
        gameIframe.src = `${baseUrl}?v=${Date.now()}`;
    }, 50);
});

// Toggle Fullscreen (Virtual UI Fullscreen or native browser full screen)
modalFullscreenBtn.addEventListener('click', () => {
    const isFullscreen = modalContent.classList.toggle('fullscreen');

    if (isFullscreen) {
        modalFullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';

        // Propose native browser fullscreen request on the modal body
        if (gameModal.requestFullscreen) {
            gameModal.requestFullscreen();
        } else if (gameModal.webkitRequestFullscreen) {
            gameModal.webkitRequestFullscreen();
        }
    } else {
        modalFullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';

        // Exit native browser fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});

// Listen to native exit fullscreen to toggle virtual UI state sync
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        modalContent.classList.remove('fullscreen');
        modalFullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }
});

// ESC Key closes modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameModal.classList.contains('active')) {
        closeGame();
    }
});

// ==========================================================================
// Hero Console Visuals & Graphic Logic
// ==========================================================================
function initConsoleGraphic() {
    const canvas = document.getElementById('consoleCanvas');
    const logsContainer = document.getElementById('consoleLogs');
    const glitchText = document.getElementById('consoleGlitchText');

    if (!canvas || !logsContainer || !glitchText) return;

    const ctx = canvas.getContext('2d');
    
    // Resize Canvas to fit screen bounds
    function fitCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    // Floating particles
    const particles = [];
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: Math.random() * 400,
            y: Math.random() * 300,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.4 + 0.15,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    // Animation loop
    function animate() {
        if (!canvas.width || !canvas.height) {
            requestAnimationFrame(animate);
            return;
        }

        ctx.fillStyle = '#05060b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Coordinate Grid Lines
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 25;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw Floating Particles
        ctx.fillStyle = '#00f5ff';
        particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Draw Oscilloscope Glowing Sine Wave
        const time = Date.now() * 0.0012;
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x++) {
            const freq = 0.008 + Math.sin(time * 0.4) * 0.003;
            const ampMod = 20 + Math.sin(time * 1.1) * 10;
            // Taper amplitude at screen boundaries so the wave fades out at the edges
            const taper = Math.sin((x / canvas.width) * Math.PI);
            const y = (canvas.height * 0.6) + Math.sin(x * freq - time * 4.2) * ampMod * taper;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow glow

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Logging Simulation
    const LOG_TEMPLATES = [
        'SYSTEM: BOOT OK. VER. 2.0.26',
        'NETWORK: LOCALHOST DETECTED',
        'PEERJS: STABLE CONNECTION ACTIVE',
        'SYNCING LOCAL HIGH SCORES...',
        'NEON SNAKE: GRAPHICS SHADER READY',
        'MARIO KART: BOTS INITIALIZED',
        'BOMBERMAN: BATTLE RADAR LIVE',
        'GHOST FIGHTER: CO-OP SYNCHRONIZED',
        'HOST: RUNNING APP.JS DEV DAEMON',
        'CPU LOAD: 4.88% STABLE',
        'AUDIO: SYNTH ENGINE ONLINE',
        'IFRAME SHIELD: ACTIVE & SECURE',
        'SYSTEM: CACHE FLUSH SUCCESSFUL',
        'READY PLAYER ONE: PRESS START'
    ];

    function addLogLine(text) {
        const line = document.createElement('div');
        line.className = 'console-log-line';
        
        // Generate pseudo timestamp
        const now = new Date();
        const stamp = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
        line.textContent = `${stamp} ${text}`;

        logsContainer.appendChild(line);

        // Keep maximum 4 lines to avoid overflow
        while (logsContainer.children.length > 4) {
            logsContainer.removeChild(logsContainer.firstChild);
        }

        // Auto-scroll
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    // Initial Logs
    addLogLine('SYSTEM: INIT BOOT ROUTINE');
    setTimeout(() => addLogLine('IFRAME CONTROLLER: READY'), 400);
    setTimeout(() => addLogLine('LOCAL STORAGE BINDER: OK'), 800);
    setTimeout(() => addLogLine('PORTAL LOADED: WAITING PLAYER'), 1200);

    // Set interval to post periodic logs
    setInterval(() => {
        const text = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
        addLogLine(text);
    }, 2200);

    // Cycling Glitch Titles
    const TITLES = [
        'READY PLAYER ONE',
        'PLAY NEON SNAKE',
        'MARIO KART ONLINE',
        'BOMBERMAN MULTIPLAYER',
        'PIXEL STUDIO ANIMATOR',
        'GHOSTFIGHTER 3000',
        'CHALLENGE THE BOTS'
    ];
    let titleIdx = 0;
    
    setInterval(() => {
        titleIdx = (titleIdx + 1) % TITLES.length;
        const nextTitle = TITLES[titleIdx];
        glitchText.textContent = nextTitle;
        glitchText.setAttribute('data-text', nextTitle);
    }, 4500);
}

// ==========================================================================
// Initialization
// ==========================================================================
// Render game grid on start
document.addEventListener('DOMContentLoaded', () => {
    renderGames();
    initConsoleGraphic();

    // Smooth scrolling updates for nav links
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
});

