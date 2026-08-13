// ==========================================================================
// Firebase — Auth & Sync Imports
// ==========================================================================
import { onAuthChange, signInWithEmail, signUpWithEmail, signOutUser, getFriendlyError, updateProfile, updateUserEmail } from './firebase-auth.js';
import { pullAllSaves, pullGameSave, pushGameSave, pushAllLocalSaves, saveUserProfile, updatePresence, getOnlinePlayers, GAME_SAVE_KEYS } from './firebase-sync.js';

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
    },
    {
        id: 'splatoon',
        title: 'Splat Wars',
        category: 'action',
        description: 'A Splatoon-inspired ink battle arena! Cover the map with your team\'s color ink, swim through your own ink to recharge and hide, and splat enemies. 2v2 with bots or 2-player co-op. Most ink at the end wins!',
        folder: 'games/splatoon',
        cover: 'games/splatoon/cover.png',
        controls: 'P1: WASD move, Mouse aim, Click/J shoot, Shift/Space swim. P2: Arrow keys, L/↵ shoot, Enter swim.',
        addedDate: '2026-06-24',
        updatedDate: '2026-06-27'
    },
    {
        id: 'pokemon-collector',
        title: 'Pokemon Collector',
        category: 'arcade',
        description: 'Explore a map of 88 fields to find hidden Pokeballs. Sell duplicate Pokemon for PokeCoins, purchase exclusive creatures in the 30-minute rotation trade shop, and type the ESID cheat code once per hour to complete your collection. But beware of the Braivery guard!',
        folder: 'games/pokemon-collector',
        cover: 'games/pokemon-collector/cover.png',
        controls: 'Click on tiles to search. Click the hidden Pokeball before 30 seconds run out. Open Pokeballs to collect Pokemon. Manage your collection and trades.',
        addedDate: '2026-07-02',
        updatedDate: '2026-07-05'
    },
    {
        id: 'spelling_app',
        title: 'DinoScript Lab',
        category: 'puzzle',
        description: 'An interactive German-English dinosaur lab spelling game. Earn DNA coins, spell words, and build hybrid dinosaurs!',
        folder: 'games/spelling_app',
        cover: 'games/spelling_app/cover.png',
        controls: 'Choose or type the correct spelling for words to earn DNA coins.',
        addedDate: '2026-07-04',
        updatedDate: '2026-08-12',
        hidden: true
    },
    {
        id: 'pokegotchi',
        title: 'Pokegotchi',
        category: 'arcade',
        description: 'Raise your own pocket monsters in a Tamagotchi-style game. Play with, feed, and water your Pokemon to gain XP and level them up. Evolve at level 100 or raise a growing family of active pets!',
        folder: 'games/pokegotchi',
        cover: 'games/pokegotchi/cover.png',
        controls: 'Click on request action buttons (Feed, Drink, Play) to care for your Pokemon. Enter cheat code: helper to get an assistant, or level to boost a random Pokemon by 10 levels.',
        addedDate: '2026-07-06',
        updatedDate: '2026-07-06'
    },
    {
        id: 'pokemon-steal-brainrot',
        title: 'Pokémon: Steal a Brainrot',
        category: 'arcade',
        description: 'A heist-style Pokémon idle game! Deploy your Pokémon to steal viral Brainrot items from other bases to earn coins and passive income. Buy base defense locks and traps to fend off incoming AI thief raids!',
        folder: 'games/pokemon-steal-brainrot',
        cover: 'games/pokemon-steal-brainrot/cover.png',
        controls: 'Buy and deploy Pokémon to raid zones. Buy defenses to lower AI raid success rate. Bail out jailed Pokémon using coins.',
        addedDate: '2026-07-06',
        updatedDate: '2026-07-06'
    },
    {
        id: 'doggy-run',
        title: 'Doggy Run',
        category: 'arcade',
        description: 'A 2D side-scrolling endless runner! Guide your dog through obstacles and jump to collect floating coins. Use your coins in the shop to purchase and equip premium dog skins like Husky, Robo-Dog, or Cosmic Shiba!',
        folder: 'games/doggy-run',
        cover: 'games/doggy-run/cover.png',
        controls: 'Space / Up Arrow or click/tap the screen to jump. Equip skins from the shop panel.',
        addedDate: '2026-07-06',
        updatedDate: '2026-07-06'
    },
    {
        id: 'dino-dna',
        title: 'Dino DNA',
        category: 'arcade',
        description: 'An idle card-collecting game! Run the DNA factory to stack DNA packages over time. Collect them to spawn face-down cards and flip them to discover 67 unique dinosaurs across 6 rarity tiers!',
        folder: 'games/dino-dna',
        cover: 'games/dino-dna/cover.png',
        controls: 'Run the factory to generate DNA. Click the Collect button to get cards, then click on cards to flip them. Discover all 67 dinos!',
        addedDate: '2026-07-07',
        updatedDate: '2026-07-07'
    },
    {
        id: 'stickman-ski',
        title: 'Stickman Ski',
        category: 'arcade',
        description: 'Draw your own ski slope then watch your stickman shred it! Choose skis or a snowboard, hit massive jumps, pull off tricks mid-air, and score big based on air time and height!',
        folder: 'games/stickman-ski',
        cover: 'games/stickman-ski/cover.png',
        controls: 'Draw a slope on the canvas, then click Ride! Space / ↑ Arrow to jump. T to spin trick. Esc to stop.',
        addedDate: '2026-07-29',
        updatedDate: '2026-07-29'
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
        // Skip hidden games from standard library list
        if (game.hidden) return false;

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
// Track which game is currently open (for sync on close)
let _activeGameId = null;

async function launchGame(gameId) {
    const game = GAMES_REGISTRY.find(g => g.id === gameId);
    if (!game) return;

    // Ensure identity keys are set in localStorage before game iframe loads
    const user = window._arcadeUser;
    if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        localStorage.setItem('arcade_username', displayName);
        localStorage.setItem('arcade_uid', user.uid);
    }

    // Pull latest cloud save into localStorage before launching (if logged in)
    const uid = user?.uid;
    if (uid && GAME_SAVE_KEYS[gameId]) {
        await pullGameSave(uid, gameId);
    }

    _activeGameId = gameId;

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

async function closeGame() {
    // Push latest localStorage save to Firestore before closing (if logged in)
    const uid = window._arcadeUser?.uid;
    if (uid && _activeGameId) {
        await pushGameSave(uid, _activeGameId);
    }
    _activeGameId = null;

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
function initApp() {
    renderGames();
    initConsoleGraphic();

    // Wire secret easter egg triggers to launch the hidden DinoScript Lab app
    const secretTriggers = [
        document.querySelector('.logo-icon'),
        document.querySelector('.status-dot'),
        document.getElementById('consoleGlitchText'),
        document.querySelector('footer .pulse')
    ];
    
    secretTriggers.forEach(el => {
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                launchGame('spelling_app');
            });
        }
    });

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

    // ── Live Online Players Widget ───────────────────────────────────────────
    async function renderOnlinePlayersWidget() {
        const onlineCountBadge  = document.getElementById('onlineCountBadge');
        const onlinePlayersList = document.getElementById('onlinePlayersList');
        if (!onlinePlayersList) return;

        // Heartbeat our presence first
        await updatePresence(window._arcadeUser);

        // Fetch players active in last 5 minutes
        const online = await getOnlinePlayers();
        if (onlineCountBadge) onlineCountBadge.textContent = online.length;

        if (online.length === 0) {
            onlinePlayersList.innerHTML = `<div class="online-loading">No active players right now</div>`;
            return;
        }

        onlinePlayersList.innerHTML = online.map(p => {
            const initial = (p.displayName || 'P').charAt(0).toUpperCase();
            const avatarHtml = p.photoURL
                ? `<div class="online-chip-avatar"><img src="${p.photoURL}" class="online-chip-avatar-img" alt="Avatar"><span class="online-chip-dot"></span></div>`
                : `<div class="online-chip-avatar">${initial}<span class="online-chip-dot"></span></div>`;
            const guestTag = p.isGuest ? ' <span style="font-size:0.7rem;color:var(--text-muted);">(Guest)</span>' : '';

            return `<div class="online-player-chip" title="Active within last 5 minutes">
                ${avatarHtml}
                <span>${p.displayName}${guestTag}</span>
            </div>`;
        }).join('');
    }

    window.renderOnlinePlayersWidget = renderOnlinePlayersWidget;

    setInterval(() => updatePresence(window._arcadeUser), 40000);
    setInterval(() => renderOnlinePlayersWidget(), 15000);

    initAuthModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ES modules don't expose to window scope — expose manually for inline onclick handlers
window.launchGame = launchGame;

// ==========================================================================
// Auth Modal — Login / Sign Up UI
// ==========================================================================
function initAuthModal() {
    const authModal     = document.getElementById('authModal');
    const authModalClose = document.getElementById('authModalClose');
    const tabSignIn     = document.getElementById('tabSignIn');
    const tabSignUp     = document.getElementById('tabSignUp');
    const formSignIn    = document.getElementById('formSignIn');
    const formSignUp    = document.getElementById('formSignUp');
    const siError       = document.getElementById('siError');
    const suError       = document.getElementById('suError');
    const navLoginBtn   = document.getElementById('navLoginBtn');
    const navUserChip   = document.getElementById('navUserChip');
    const navUserAvatar = document.getElementById('navUserAvatar');
    const navUserName   = document.getElementById('navUserName');
    const navUserDropdown = document.getElementById('navUserDropdown');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const dropdownSignOutBtn = document.getElementById('dropdownSignOutBtn');

    // ── Modal Open / Close ────────────────────────────────────────────────
    window.openAuthModal = function(tab = 'signin') {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchTab(tab);
    };

    function closeAuthModal() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        clearErrors();
    }

    authModalClose.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', e => {
        if (e.target === authModal) closeAuthModal();
    });

    // ── Tab Switching ──────────────────────────────────────────────────────
    function switchTab(tab) {
        const isSignIn = (tab === 'signin');
        tabSignIn.classList.toggle('active', isSignIn);
        tabSignUp.classList.toggle('active', !isSignIn);
        formSignIn.style.display = isSignIn ? '' : 'none';
        formSignUp.style.display = isSignIn ? 'none' : '';
        clearErrors();
    }

    tabSignIn.addEventListener('click', () => switchTab('signin'));
    tabSignUp.addEventListener('click', () => switchTab('signup'));

    // "Create an account" / "Sign in" switch links inside forms
    document.querySelectorAll('.auth-switch-link').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.switch));
    });

    // ── Helper: set button loading state ──────────────────────────────────
    function setLoading(btn, loading) {
        btn.querySelector('.btn-text').style.display   = loading ? 'none' : '';
        btn.querySelector('.btn-spinner').style.display = loading ? '' : 'none';
        btn.disabled = loading;
    }

    function clearErrors() {
        siError.textContent = '';
        suError.textContent = '';
    }

    // ── Sign In Form ────────────────────────────────────────────────────────
    formSignIn.addEventListener('submit', async (e) => {
        e.preventDefault();
        siError.textContent = '';
        const btn = document.getElementById('siBtnSubmit');
        setLoading(btn, true);
        try {
            const email    = document.getElementById('siEmail').value.trim();
            const password = document.getElementById('siPassword').value;
            await signInWithEmail(email, password);
            closeAuthModal();
        } catch (err) {
            siError.textContent = getFriendlyError(err.code);
        } finally {
            setLoading(btn, false);
        }
    });

    // ── Sign Up Form ────────────────────────────────────────────────────────
    formSignUp.addEventListener('submit', async (e) => {
        e.preventDefault();
        suError.textContent = '';
        const btn = document.getElementById('suBtnSubmit');
        setLoading(btn, true);
        try {
            const name     = document.getElementById('suName').value.trim();
            const email    = document.getElementById('suEmail').value.trim();
            const password = document.getElementById('suPassword').value;
            const user = await signUpWithEmail(email, password, name);
            // Upload all existing local game saves to the new account
            await pushAllLocalSaves(user.uid);
            closeAuthModal();
        } catch (err) {
            suError.textContent = getFriendlyError(err.code);
        } finally {
            setLoading(btn, false);
        }
    });

    // ── User Chip Dropdown ────────────────────────────────────────────────
    navUserChip.addEventListener('click', (e) => {
        e.stopPropagation();
        navUserDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => {
        navUserDropdown.classList.remove('open');
    });

    // ── Sign Out ──────────────────────────────────────────────────────────
    dropdownSignOutBtn.addEventListener('click', async () => {
        navUserDropdown.classList.remove('open');
        await signOutUser();
    });

    // ── Auth State Observer ───────────────────────────────────────────────
    onAuthChange(async (user) => {
        window._arcadeUser = user;

        if (user) {
            // Logged in — update nav
            const displayName = user.displayName || user.email.split('@')[0];
            navLoginBtn.style.display = 'none';
            navUserChip.style.display = 'flex';
            navUserAvatar.textContent = displayName.charAt(0).toUpperCase();
            navUserName.textContent = displayName;
            dropdownEmail.textContent = user.email;

            // Store identity for iframed games (e.g. DinoScript community tab)
            localStorage.setItem('arcade_username', displayName);
            localStorage.setItem('arcade_uid', user.uid);

            // Sync user profile to Firestore
            await saveUserProfile(user);

            // Pull all saves into localStorage
            await pullAllSaves(user.uid);

            // Update avatar display
            const photoUrl = user.photoURL || localStorage.getItem('arcade_avatar');
            updateAvatarUI(photoUrl, displayName);
        } else {
            // Logged out — reset nav and wipe local game saves
            window._arcadeUser = null;
            navLoginBtn.style.display = '';
            navUserChip.style.display = 'none';

            // Clear identity keys used by iframed games
            localStorage.removeItem('arcade_username');
            localStorage.removeItem('arcade_uid');
            localStorage.removeItem('arcade_avatar');
            updateAvatarUI(null, 'P');

            // Clear all game saves from localStorage so the next user starts clean
            Object.values(GAME_SAVE_KEYS).flat().forEach(key => localStorage.removeItem(key));
        }

        // Render online players lounge only AFTER Firebase Auth has fully resolved
        if (typeof window.renderOnlinePlayersWidget === 'function') {
            await window.renderOnlinePlayersWidget();
        }
    });

    // ── Custom Avatar & Settings Handler ──────────────────────────────────
    const avatarFileInput         = document.getElementById('avatarFileInput');
    const avatarChipWrapper       = document.getElementById('avatarChipWrapper');
    const dropdownAvatarContainer = document.getElementById('dropdownAvatarContainer');
    const uploadAvatarBtn         = document.getElementById('uploadAvatarBtn');
    const navUserAvatarImg        = document.getElementById('navUserAvatarImg');
    const dropdownAvatarLarge     = document.getElementById('dropdownAvatarLarge');
    const dropdownAvatarImgLarge  = document.getElementById('dropdownAvatarImgLarge');
    const dropdownSettingsBtn     = document.getElementById('dropdownSettingsBtn');

    // Settings Modal elements
    const settingsModal           = document.getElementById('settingsModal');
    const settingsModalClose      = document.getElementById('settingsModalClose');
    const settingsAvatarPreviewBtn= document.getElementById('settingsAvatarPreviewBtn');
    const settingsChangeAvatarBtn = document.getElementById('settingsChangeAvatarBtn');
    const settingsAvatarInitial   = document.getElementById('settingsAvatarInitial');
    const settingsAvatarImg       = document.getElementById('settingsAvatarImg');
    const settingsEmailForm       = document.getElementById('settingsEmailForm');
    const settingsEmailInput      = document.getElementById('settingsEmailInput');
    const settingsError           = document.getElementById('settingsError');
    const settingsSuccess         = document.getElementById('settingsSuccess');
    const settingsEmailSubmitBtn  = document.getElementById('settingsEmailSubmitBtn');

    // ── Open Settings Modal ──────────────────────────────────────────────
    function openSettingsModal() {
        if (!settingsModal) return;
        navUserDropdown.classList.remove('open');
        const user = window._arcadeUser;
        if (user) {
            settingsEmailInput.value = user.email || '';
            const photoUrl = user.photoURL || localStorage.getItem('arcade_avatar');
            const displayName = user.displayName || user.email.split('@')[0];
            updateAvatarUI(photoUrl, displayName);
        }
        if (settingsError) settingsError.style.display = 'none';
        if (settingsSuccess) settingsSuccess.style.display = 'none';
        settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.openSettingsModal = openSettingsModal;

    function closeSettingsModal() {
        if (!settingsModal) return;
        settingsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (dropdownSettingsBtn) dropdownSettingsBtn.addEventListener('click', openSettingsModal);
    if (settingsModalClose) settingsModalClose.addEventListener('click', closeSettingsModal);
    if (settingsModal) {
        settingsModal.addEventListener('click', e => {
            if (e.target === settingsModal) closeSettingsModal();
        });
    }

    // ── Avatar trigger buttons ───────────────────────────────────────────
    function triggerAvatarSelect(e) {
        if (e) e.stopPropagation();
        if (avatarFileInput) avatarFileInput.click();
    }

    if (avatarChipWrapper) avatarChipWrapper.addEventListener('click', triggerAvatarSelect);
    if (dropdownAvatarContainer) dropdownAvatarContainer.addEventListener('click', triggerAvatarSelect);
    if (uploadAvatarBtn) uploadAvatarBtn.addEventListener('click', triggerAvatarSelect);
    if (settingsAvatarPreviewBtn) settingsAvatarPreviewBtn.addEventListener('click', triggerAvatarSelect);
    if (settingsChangeAvatarBtn) settingsChangeAvatarBtn.addEventListener('click', triggerAvatarSelect);

    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 128;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                    localStorage.setItem('arcade_avatar', dataUrl);

                    const user = window._arcadeUser;
                    if (user) {
                        try {
                            await updateProfile(user, { photoURL: dataUrl });
                            await saveUserProfile(user);
                        } catch (err) {
                            console.warn('[Avatar Upload] Profile update error:', err.message);
                        }
                    }

                    const displayName = user ? (user.displayName || user.email.split('@')[0]) : 'Player';
                    updateAvatarUI(dataUrl, displayName);
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ── Email Update Submit Handler ──────────────────────────────────────
    if (settingsEmailForm) {
        settingsEmailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newEmail = settingsEmailInput.value.trim();
            if (!newEmail) return;

            const user = window._arcadeUser;
            if (!user) return;
            if (newEmail === user.email) {
                if (settingsSuccess) {
                    settingsSuccess.textContent = 'ℹ️ Email is unchanged.';
                    settingsSuccess.style.display = 'block';
                }
                return;
            }

            const btnText = settingsEmailSubmitBtn.querySelector('.btn-text');
            const btnSpinner = settingsEmailSubmitBtn.querySelector('.btn-spinner');

            if (settingsError) settingsError.style.display = 'none';
            if (settingsSuccess) settingsSuccess.style.display = 'none';
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';
            settingsEmailSubmitBtn.disabled = true;

            try {
                await updateUserEmail(newEmail);
                if (dropdownEmail) dropdownEmail.textContent = newEmail;
                await saveUserProfile(window._arcadeUser);

                if (settingsSuccess) {
                    settingsSuccess.textContent = '✅ Email address updated successfully!';
                    settingsSuccess.style.display = 'block';
                }
            } catch (err) {
                let msg = err.message;
                if (err.code === 'auth/requires-recent-login') {
                    msg = '🔒 For security, please sign out and sign in again before changing your email address.';
                } else if (err.code === 'auth/email-already-in-use') {
                    msg = '❌ That email address is already in use by another account.';
                } else if (err.code === 'auth/invalid-email') {
                    msg = '❌ Invalid email format.';
                }
                if (settingsError) {
                    settingsError.textContent = msg;
                    settingsError.style.display = 'block';
                }
            } finally {
                if (btnText) btnText.style.display = 'inline-block';
                if (btnSpinner) btnSpinner.style.display = 'none';
                settingsEmailSubmitBtn.disabled = false;
            }
        });
    }

    function updateAvatarUI(photoUrl, displayName) {
        const initial = (displayName || 'P').charAt(0).toUpperCase();
        if (photoUrl) {
            if (navUserAvatarImg) {
                navUserAvatarImg.src = photoUrl;
                navUserAvatarImg.style.display = 'block';
            }
            if (navUserAvatar) navUserAvatar.style.display = 'none';

            if (dropdownAvatarImgLarge) {
                dropdownAvatarImgLarge.src = photoUrl;
                dropdownAvatarImgLarge.style.display = 'block';
            }
            if (dropdownAvatarLarge) dropdownAvatarLarge.style.display = 'none';

            if (settingsAvatarImg) {
                settingsAvatarImg.src = photoUrl;
                settingsAvatarImg.style.display = 'block';
            }
            if (settingsAvatarInitial) settingsAvatarInitial.style.display = 'none';
        } else {
            if (navUserAvatarImg) navUserAvatarImg.style.display = 'none';
            if (navUserAvatar) {
                navUserAvatar.textContent = initial;
                navUserAvatar.style.display = 'flex';
            }

            if (dropdownAvatarImgLarge) dropdownAvatarImgLarge.style.display = 'none';
            if (dropdownAvatarLarge) {
                dropdownAvatarLarge.textContent = initial;
                dropdownAvatarLarge.style.display = 'flex';
            }

            if (settingsAvatarImg) settingsAvatarImg.style.display = 'none';
            if (settingsAvatarInitial) {
                settingsAvatarInitial.textContent = initial;
                settingsAvatarInitial.style.display = 'flex';
            }
        }
    }
}


