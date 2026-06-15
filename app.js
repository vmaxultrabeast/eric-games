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
        addedDate: '2026-06-08'
    },
    {
        id: 'pokemon-battle',
        title: 'Pokémon Battle Arena',
        category: 'action',
        description: 'A high-energy Pokémon battle arena game. Fight solo, in PvP, or Co-op mode against AI or friends. Features special attacks, ultimates, and touch controls.',
        folder: 'games/pokemon-battle',
        cover: 'games/pokemon-battle/icon-512.png',
        controls: 'P1: WASD to move, J/K/L/U to attack, Space to dodge. P2: Arrow keys to move, 7/8/9/0 to attack, Enter to dodge.',
        addedDate: '2026-06-09'
    },
    {
        id: 'pixel-studio',
        title: 'Pixel Studio',
        category: 'art',
        description: 'A comprehensive, frame-by-frame pixel art and animation creator. Draw designs, manage frames, customize palettes, and export animations.',
        folder: 'games/pixel-studio',
        cover: 'games/pixel-studio/cover.png',
        controls: 'Left Click to draw and use tools. Hotkeys: B (Pencil), E (Eraser), G (Fill), I (Eyedropper), L (Line).',
        addedDate: '2026-06-09'
    },
    {
        id: 'ghostfighter3000',
        title: 'GhostFight3000',
        category: 'action',
        description: 'A 4-player 3D ghost battle arena. Fight bots solo or go online with friends. Use stealth abilities — hide, force-hide, and jump — to outmaneuver opponents.',
        folder: 'games/ghostfighter3000',
        cover: 'games/ghostfighter3000/cover.png',
        controls: 'WASD / Arrow Keys to move. K: Hide, L: Force Hide, H: Unhide, J: Jump. Space: Attack.',
        addedDate: '2026-06-09'
    },
    {
        id: 'mariokart',
        title: 'Mario Kart',
        category: 'racing',
        description: 'A classic top-down Mario Kart racer. Speed around the track, collect item boxes to get Mushrooms or Banana peels, dodge hazards, and compete against smart AI opponents to win the Mushroom Cup!',
        folder: 'games/mario-kart',
        cover: 'games/mario-kart/cover.png',
        controls: 'Arrow Keys / WASD to drive. Space to use item.',
        addedDate: '2026-06-09'
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

        card.innerHTML = `
            <div class="game-cover-wrap">
                <span class="game-tag-badge">${game.category}</span>
                <img class="game-cover" src="${game.cover}" alt="${game.title}" onerror="handleImageError(this, '${game.title}')">
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description}</p>
                <div class="game-actions">
                    <span class="game-metadata">Added: ${formattedDate}</span>
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

    // Point iframe to game entry point
    gameIframe.src = `${game.folder}/index.html`;

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

// Restart Game
modalReloadBtn.addEventListener('click', () => {
    const currentSrc = gameIframe.src;
    gameIframe.src = '';
    // Quick delay to trigger reload
    setTimeout(() => {
        gameIframe.src = currentSrc;
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
// Initialization
// ==========================================================================
// Render game grid on start
document.addEventListener('DOMContentLoaded', () => {
    renderGames();

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
