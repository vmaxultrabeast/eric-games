// ==========================================================================
// Pokemon Registry (Metadata & API IDs)
// ==========================================================================
const POKEMON_DATABASE = {
    legendary: [
        { id: 150, name: "Mewtwo" },
        { id: 151, name: "Mew" },
        { id: 249, name: "Lugia" },
        { id: 250, name: "Ho-Oh" },
        { id: 382, name: "Kyogre" },
        { id: 383, name: "Groudon" },
        { id: 384, name: "Rayquaza" },
        { id: 483, name: "Dialga" },
        { id: 484, name: "Palkia" },
        { id: 487, name: "Giratina" },
        { id: 491, name: "Darkrai" },
        { id: 493, name: "Arceus" },
        { id: 793, name: "Nihilego" },
        { id: 794, name: "Buzzwole" },
        { id: 795, name: "Pheromosa" },
        { id: 796, name: "Xurkitree" },
        { id: 888, name: "Zacian" },
        { id: 889, name: "Zamazenta" },
        { id: 1007, name: "Koraidon" },
        { id: 1008, name: "Miraidon" }
    ],
    "no-evolve": [
        { id: 127, name: "Pinsir" },
        { id: 128, name: "Tauros" },
        { id: 131, name: "Lapras" },
        { id: 142, name: "Aerodactyl" },
        { id: 214, name: "Heracross" },
        { id: 227, name: "Skarmory" },
        { id: 241, name: "Miltank" },
        { id: 302, name: "Sableye" },
        { id: 303, name: "Mawile" },
        { id: 324, name: "Torkoal" },
        { id: 335, name: "Zangoose" },
        { id: 336, name: "Seviper" },
        { id: 369, name: "Relicanth" },
        { id: 479, name: "Rotom" },
        { id: 561, name: "Sigilyph" },
        { id: 587, name: "Emolga" },
        { id: 621, name: "Druddigon" },
        { id: 701, name: "Hawlucha" },
        { id: 707, name: "Klefki" },
        { id: 778, name: "Mimikyu" },
        { id: 870, name: "Falinks" },
        { id: 884, name: "Duraludon" }
    ],
    evolution3: [
        { id: 3, name: "Venusaur" },
        { id: 6, name: "Charizard" },
        { id: 9, name: "Blastoise" },
        { id: 12, name: "Butterfree" },
        { id: 15, name: "Beedrill" },
        { id: 18, name: "Pidgeot" },
        { id: 31, name: "Nidoqueen" },
        { id: 34, name: "Nidoking" },
        { id: 45, name: "Vileplume" },
        { id: 65, name: "Alakazam" },
        { id: 68, name: "Machamp" },
        { id: 76, name: "Golem" },
        { id: 94, name: "Gengar" },
        { id: 149, name: "Dragonite" },
        { id: 154, name: "Meganium" },
        { id: 157, name: "Typhlosion" },
        { id: 160, name: "Feraligatr" },
        { id: 169, name: "Crobat" },
        { id: 181, name: "Ampharos" },
        { id: 248, name: "Tyranitar" },
        { id: 254, name: "Sceptile" },
        { id: 257, name: "Blaziken" },
        { id: 260, name: "Swampert" },
        { id: 282, name: "Gardevoir" },
        { id: 306, name: "Aggron" },
        { id: 330, name: "Flygon" },
        { id: 373, name: "Salamence" },
        { id: 376, name: "Metagross" },
        { id: 445, name: "Garchomp" },
        { id: 468, name: "Togekiss" },
        { id: 635, name: "Hydreigon" },
        { id: 658, name: "Greninja" },
        { id: 663, name: "Talonflame" },
        { id: 706, name: "Goodra" },
        { id: 724, name: "Decidueye" },
        { id: 727, name: "Incineroar" },
        { id: 730, name: "Primarina" },
        { id: 887, name: "Dragapult" }
    ],
    evolution2: [
        { id: 2, name: "Ivysaur" },
        { id: 5, name: "Charmeleon" },
        { id: 8, name: "Wartortle" },
        { id: 11, name: "Metapod" },
        { id: 14, name: "Kakuna" },
        { id: 17, name: "Pidgeotto" },
        { id: 20, name: "Raticate" },
        { id: 22, name: "Fearow" },
        { id: 24, name: "Arbok" },
        { id: 26, name: "Raichu" },
        { id: 28, name: "Sandslash" },
        { id: 30, name: "Nidorina" },
        { id: 33, name: "Nidorino" },
        { id: 36, name: "Clefable" },
        { id: 40, name: "Wigglytuff" },
        { id: 42, name: "Golbat" },
        { id: 44, name: "Gloom" },
        { id: 47, name: "Parasect" },
        { id: 49, name: "Venomoth" },
        { id: 51, name: "Dugtrio" },
        { id: 53, name: "Persian" },
        { id: 55, name: "Golduck" },
        { id: 57, name: "Primeape" },
        { id: 59, name: "Arcanine" },
        { id: 61, name: "Poliwhirl" },
        { id: 64, name: "Kadabra" },
        { id: 67, name: "Machoke" },
        { id: 70, name: "Weepinbell" },
        { id: 73, name: "Tentacruel" },
        { id: 75, name: "Graveler" },
        { id: 78, name: "Rapidash" },
        { id: 80, name: "Slowbro" },
        { id: 82, name: "Magneton" },
        { id: 85, name: "Dodrio" },
        { id: 87, name: "Dewgong" },
        { id: 89, name: "Muk" },
        { id: 91, name: "Cloyster" },
        { id: 93, name: "Haunter" },
        { id: 97, name: "Hypno" },
        { id: 99, name: "Kingler" },
        { id: 101, name: "Electrode" },
        { id: 105, name: "Marowak" },
        { id: 110, name: "Weezing" },
        { id: 117, name: "Seadra" },
        { id: 119, name: "Seaking" },
        { id: 121, name: "Starmie" },
        { id: 130, name: "Gyarados" }
    ],
    basic: [
        { id: 1, name: "Bulbasaur" },
        { id: 4, name: "Charmander" },
        { id: 7, name: "Squirtle" },
        { id: 10, name: "Caterpie" },
        { id: 13, name: "Weedle" },
        { id: 16, name: "Pidgey" },
        { id: 19, name: "Rattata" },
        { id: 21, name: "Spearow" },
        { id: 23, name: "Ekans" },
        { id: 25, name: "Pikachu" },
        { id: 27, name: "Sandshrew" },
        { id: 29, name: "Nidoran F" },
        { id: 32, name: "Nidoran M" },
        { id: 35, name: "Clefairy" },
        { id: 37, name: "Vulpix" },
        { id: 39, name: "Jigglypuff" },
        { id: 41, name: "Zubat" },
        { id: 43, name: "Oddish" },
        { id: 46, name: "Paras" },
        { id: 48, name: "Venonat" },
        { id: 50, name: "Diglett" },
        { id: 52, name: "Meowth" },
        { id: 54, name: "Psyduck" },
        { id: 56, name: "Mankey" },
        { id: 58, name: "Growlithe" },
        { id: 60, name: "Poliwag" },
        { id: 63, name: "Abra" },
        { id: 66, name: "Machop" },
        { id: 69, name: "Bellsprout" },
        { id: 72, name: "Tentacool" },
        { id: 74, name: "Geodude" },
        { id: 77, name: "Ponyta" },
        { id: 79, name: "Slowpoke" },
        { id: 81, name: "Magnemite" },
        { id: 84, name: "Doduo" },
        { id: 86, name: "Seel" },
        { id: 88, name: "Grimer" },
        { id: 90, name: "Shellder" },
        { id: 92, name: "Gastly" },
        { id: 95, name: "Onix" },
        { id: 96, name: "Drowzee" },
        { id: 98, name: "Krabby" },
        { id: 100, name: "Voltorb" },
        { id: 102, name: "Exeggcute" },
        { id: 104, name: "Cubone" },
        { id: 109, name: "Koffing" },
        { id: 111, name: "Rhyhorn" },
        { id: 116, name: "Horsea" },
        { id: 118, name: "Goldeen" },
        { id: 120, name: "Staryu" },
        { id: 133, name: "Eevee" },
        { id: 147, name: "Dratini" }
    ]
};

// Flattened list for random lookups
const ALL_POKEMON_FLAT = [];
Object.keys(POKEMON_DATABASE).forEach(rarity => {
    POKEMON_DATABASE[rarity].forEach(p => {
        ALL_POKEMON_FLAT.push({ ...p, rarity });
    });
});

// Chart Weights and Value Configurations
const RARITY_PROBABILITIES = {
    legendary: 0.05,
    "no-evolve": 0.10,
    evolution3: 0.20,
    evolution2: 0.27,
    basic: 0.38
};

const RARITY_WORTH = {
    legendary: 1000,
    "no-evolve": 200,
    evolution3: 300,
    evolution2: 100,
    basic: 10
};

// Rarity Labels for Display
const RARITY_LABELS = {
    legendary: "Legendary / Ultra Beast / Mythical",
    "no-evolve": "Does Not Evolve",
    evolution3: "Evolution 3",
    evolution2: "Evolution 2",
    basic: "Basic"
};

// ==========================================================================
// Application State
// ==========================================================================
let gameState = {
    coins: 0,
    inventory: {}, // pokemonName -> count
    lockedTiles: {}, // tileIndex -> lockedUntilTimestamp
    tileCooldowns: {}, // tileIndex -> cooldownUntilTimestamp
    tradeOffer: null, // { pokemon: { id, name, rarity }, cost: number, completed: bool, expiresAt: timestamp }
    lastCheatUsed: 0 // timestamp
};

// Constants for mechanics
const TILES_COUNT = 88;
const INSPECTION_DURATION = 30000; // 30 seconds
const LOCK_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const TILE_COOLDOWN = 5 * 60 * 1000; // 5 minutes in ms
const TRADE_DURATION = 30 * 60 * 1000; // 30 minutes in ms
const CHEAT_COOLDOWN = 1 * 60 * 60 * 1000; // 1 hour in ms

// Active inspection timers
let activeTimer = null;
let inspectionStartTime = null;
let currentTileIndex = null;
let collectionFilter = "all";

// ==========================================================================
// Local Storage Helper Functions
// ==========================================================================
function saveState() {
    localStorage.setItem("pokemon_collector_state", JSON.stringify(gameState));
}

function loadState() {
    const saved = localStorage.getItem("pokemon_collector_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState = {
                coins: parsed.coins || 0,
                inventory: parsed.inventory || {},
                lockedTiles: parsed.lockedTiles || {},
                tileCooldowns: parsed.tileCooldowns || {},
                tradeOffer: parsed.tradeOffer || null,
                lastCheatUsed: parsed.lastCheatUsed || 0
            };
        } catch (e) {
            console.error("Failed to parse saved game state", e);
        }
    }
}

// ==========================================================================
// Initialization & Startup
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    setupTabs();
    setupCheatForm();
    initMapGrid();
    initCollection();
    checkTradeOffer();
    updateStatsBar();

    // Start background ticking interval for timers
    setInterval(updateRunningTimers, 1000);

    // Set up click handlers for overlays
    document.getElementById("braiveryCloseBtn").addEventListener("click", closeBraiveryOverlay);
    document.getElementById("revealCloseBtn").addEventListener("click", closeRevealOverlay);

    // Setup interactive pokeball clicking
    document.getElementById("interactivePokeball").addEventListener("click", triggerPokeballOpening);
});

// ==========================================================================
// Stats Dashboard Bar
// ==========================================================================
function updateStatsBar() {
    document.getElementById("coinCount").textContent = `${gameState.coins} p`;
    
    // Count unique caught Pokemon
    const uniqueCaught = Object.values(gameState.inventory).filter(count => count > 0).length;
    const totalCount = ALL_POKEMON_FLAT.length;
    document.getElementById("caughtCount").textContent = `${uniqueCaught} / ${totalCount}`;
}

// ==========================================================================
// Tab Switching System
// ==========================================================================
function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");

            // Update active states
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(`tab-${tabName}`).classList.add("active");

            // Refresh specific tab contents on switch
            if (tabName === "map") {
                initMapGrid();
            } else if (tabName === "collection") {
                initCollection();
            } else if (tabName === "trade") {
                checkTradeOffer();
                renderTradeOffer();
            }
        });
    });
}

// ==========================================================================
// Map Grid Explorer Screen (88 Tiles)
// ==========================================================================
function initMapGrid() {
    const grid = document.getElementById("mapGrid");
    grid.innerHTML = "";
    const now = Date.now();

    for (let i = 1; i <= TILES_COUNT; i++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.setAttribute("data-index", i);

        // Coordinates styling (Row A-H, Col 1-11)
        const rowChar = String.fromCharCode(65 + Math.floor((i - 1) / 11)); // A-H
        const colNum = ((i - 1) % 11) + 1; // 1-11
        const coordString = `${rowChar}${colNum}`;

        tile.innerHTML = `<span class="tile-coord">${coordString}</span>`;

        // Check if locked by Braivery
        const lockedUntil = gameState.lockedTiles[i];
        const isLocked = lockedUntil && now < lockedUntil;

        // Check if on standard cooldown
        const cooldownUntil = gameState.tileCooldowns[i];
        const isOnCooldown = cooldownUntil && now < cooldownUntil;

        if (isLocked) {
            tile.classList.add("locked");
            const overlay = document.createElement("div");
            overlay.className = "tile-overlay-info";
            overlay.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span class="tile-timer" data-type="lock" data-index="${i}">LOCKED</span>
            `;
            tile.appendChild(overlay);
        } else if (isOnCooldown) {
            tile.classList.add("cooldown");
            const overlay = document.createElement("div");
            overlay.className = "tile-overlay-info";
            overlay.innerHTML = `
                <i class="fa-solid fa-hourglass-half"></i>
                <span class="tile-timer" data-type="cooldown" data-index="${i}">COOLDOWN</span>
            `;
            tile.appendChild(overlay);
        } else {
            tile.classList.add("available");
            tile.addEventListener("click", () => startTileInspection(i));
        }

        grid.appendChild(tile);
    }
}

// Update the countdowns for locked or cooldown tiles on the active map
function updateRunningTimers() {
    const now = Date.now();
    const timers = document.querySelectorAll(".tile-timer");

    timers.forEach(timer => {
        const type = timer.getAttribute("data-type");
        const idx = timer.getAttribute("data-index");

        if (type === "lock") {
            const lockedUntil = gameState.lockedTiles[idx];
            if (lockedUntil && now < lockedUntil) {
                const diff = lockedUntil - now;
                timer.textContent = formatRemainingTime(diff);
            } else {
                // Lock expired, refresh map
                initMapGrid();
            }
        } else if (type === "cooldown") {
            const cooldownUntil = gameState.tileCooldowns[idx];
            if (cooldownUntil && now < cooldownUntil) {
                const diff = cooldownUntil - now;
                timer.textContent = formatCooldownTime(diff);
            } else {
                // Cooldown expired, refresh map
                initMapGrid();
            }
        }
    });

    // Update trade timer if on Trade screen
    const tradeTimerVal = document.getElementById("tradeTimerVal");
    if (tradeTimerVal && gameState.tradeOffer) {
        const diff = gameState.tradeOffer.expiresAt - now;
        if (diff > 0) {
            tradeTimerVal.textContent = formatCooldownTime(diff);
        } else {
            checkTradeOffer();
            renderTradeOffer();
        }
    }
}

function formatRemainingTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
}

function formatCooldownTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / (1000 * 60));
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// ==========================================================================
// Tile Inspection & Pokeball Search (30s Countdown)
// ==========================================================================
function startTileInspection(tileIndex) {
    currentTileIndex = tileIndex;
    
    // Set tile display number
    const rowChar = String.fromCharCode(65 + Math.floor((tileIndex - 1) / 11)); // A-H
    const colNum = ((tileIndex - 1) % 11) + 1; // 1-11
    document.getElementById("activeTileNum").textContent = `${rowChar}${colNum}`;

    const overlay = document.getElementById("inspectionOverlay");
    overlay.classList.add("active");

    const fieldView = document.getElementById("fieldView");

    // Remove any previously placed pokeball and decor
    const oldBall = document.getElementById("targetPokeball");
    if (oldBall) oldBall.remove();
    document.querySelectorAll(".shrub-block, .rock-block, .grass-blade, .tall-grass-patch, .field-flower, .field-rock").forEach(el => el.remove());

    // Wait one frame so the overlay is visible and clientWidth/clientHeight are accurate
    requestAnimationFrame(() => {
        const fieldWidth = fieldView.clientWidth || 640;
        const fieldHeight = fieldView.clientHeight || 360;

        // Generate Hidden Pokeball at random position (tiny size: 18px)
        const ballSize = 18;
        const posX = Math.random() * Math.max(10, fieldWidth - ballSize - 40) + 20;
        const posY = Math.random() * Math.max(10, fieldHeight - ballSize - 40) + 20;

        const pokeball = document.createElement("div");
        pokeball.className = "hidden-pokeball shake-pulse";
        pokeball.id = "targetPokeball";
        pokeball.style.left = `${posX}px`;
        pokeball.style.top = `${posY}px`;
        pokeball.style.width = `${ballSize}px`;
        pokeball.style.height = `${ballSize}px`;
        pokeball.style.zIndex = "6";

        // Click handler for Pokeball capture
        pokeball.addEventListener("click", (e) => {
            e.stopPropagation();
            successfullyFoundPokeball();
        });

        // 1. Add background details: Scattered flowers (zIndex 3)
        const flowerColors = ["#ffd54f", "#e91e63", "#f48fb1", "#ba68c8", "#ff8a65"];
        for (let j = 0; j < 20; j++) {
            const flower = document.createElement("div");
            flower.className = "field-flower";
            flower.style.left = `${Math.random() * (fieldWidth - 10)}px`;
            flower.style.top = `${Math.random() * (fieldHeight - 10)}px`;
            flower.style.background = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            fieldView.appendChild(flower);
        }

        // 2. Add background details: Scattered small grey rocks (zIndex 3)
        for (let j = 0; j < 8; j++) {
            const rock = document.createElement("div");
            rock.className = "field-rock";
            const rSize = Math.random() * 12 + 8;
            rock.style.width = `${rSize}px`;
            rock.style.height = `${rSize * 0.8}px`;
            rock.style.left = `${Math.random() * (fieldWidth - rSize)}px`;
            rock.style.top = `${Math.random() * (fieldHeight - rSize)}px`;
            fieldView.appendChild(rock);
        }

        // 3. Add base layer grass: 120 small swaying grass blades (zIndex 4)
        for (let j = 0; j < 120; j++) {
            const blade = document.createElement("div");
            blade.className = "grass-blade";
            const bladeHeight = Math.random() * 14 + 10;
            const bladeWidth = Math.random() * 3 + 2;
            blade.style.height = `${bladeHeight}px`;
            blade.style.width = `${bladeWidth}px`;
            blade.style.left = `${Math.random() * (fieldWidth - 5)}px`;
            blade.style.top = `${Math.random() * (fieldHeight - bladeHeight)}px`;
            
            // Random green shades
            const g = Math.floor(Math.random() * 40 + 130);
            blade.style.background = `linear-gradient(to top, #2e5c30, rgb(46, ${g}, 48))`;
            blade.style.borderRadius = `${bladeWidth}px ${bladeWidth}px 0 0`;
            blade.style.animationDelay = `${Math.random() * 2}s`;
            fieldView.appendChild(blade);
        }

        // Add the Pokeball to the field view
        fieldView.appendChild(pokeball);

        // 4. Add tall grass patches (zIndex 8) to hide the Pokeball
        // We will place 12 tall grass patches, and force one to sit exactly over the Pokeball
        const patchCount = 12;
        for (let p = 0; p < patchCount; p++) {
            const patch = document.createElement("div");
            patch.className = "tall-grass-patch";

            // The first patch is placed exactly over the Pokeball coordinates to cover it
            let patchX, patchY;
            if (p === 0) {
                patchX = posX - 10;
                patchY = posY - 8;
            } else {
                patchX = Math.random() * (fieldWidth - 50);
                patchY = Math.random() * (fieldHeight - 40);
            }

            patch.style.left = `${patchX}px`;
            patch.style.top = `${patchY}px`;
            patch.style.width = "45px";
            patch.style.height = "35px";

            // Generate 12-18 overlapping blades inside this patch
            const bladesInPatch = Math.floor(Math.random() * 7) + 12;
            for (let b = 0; b < bladesInPatch; b++) {
                const tallBlade = document.createElement("div");
                tallBlade.className = "tall-grass-blade";
                const bHeight = Math.random() * 12 + 22; // Tall grass height
                const bWidth = Math.random() * 2 + 3;
                tallBlade.style.height = `${bHeight}px`;
                tallBlade.style.width = `${bWidth}px`;
                tallBlade.style.left = `${Math.random() * 35}px`;
                tallBlade.style.bottom = `${Math.random() * 6}px`;

                // Lush forest green gradient
                const g = Math.floor(Math.random() * 30 + 100);
                tallBlade.style.background = `linear-gradient(to top, #1e3f20, rgb(30, ${g}, 32))`;
                tallBlade.style.borderRadius = `${bWidth}px ${bWidth}px 0 0`;
                tallBlade.style.animation = `sway ${Math.random() * 1.5 + 1.5}s ease-in-out infinite alternate`;
                tallBlade.style.animationDelay = `${Math.random() * 2}s`;
                tallBlade.style.transformOrigin = "bottom center";
                tallBlade.style.pointerEvents = "none";

                patch.appendChild(tallBlade);
            }

            fieldView.appendChild(patch);
        }
    });

    // Start 30s countdown timer
    inspectionStartTime = Date.now();
    updateInspectionCountdown();
    activeTimer = setInterval(updateInspectionCountdown, 25);
}

function updateInspectionCountdown() {
    const elapsed = Date.now() - inspectionStartTime;
    const remaining = Math.max(0, INSPECTION_DURATION - elapsed);

    const seconds = (remaining / 1000).toFixed(2);
    document.getElementById("timerText").textContent = `${seconds}s`;

    // Red warning flash when time is low
    if (remaining < 5000) {
        document.getElementById("timerText").style.color = "var(--color-red)";
    } else {
        document.getElementById("timerText").style.color = "var(--color-pink)";
    }

    if (remaining <= 0) {
        clearInterval(activeTimer);
        activeTimer = null;
        triggerBraiveryAttack();
    }
}

// Braviary Attack (Time runs out)
function triggerBraiveryAttack() {
    // Hide search overlay
    document.getElementById("inspectionOverlay").classList.remove("active");

    // Start screen shaking
    document.body.classList.add("screen-shake");
    setTimeout(() => {
        document.body.classList.remove("screen-shake");
    }, 1200);

    // Save Locked status for 7 days
    const lockedUntil = Date.now() + LOCK_DURATION;
    gameState.lockedTiles[currentTileIndex] = lockedUntil;
    saveState();

    // Show Braviary Overlay
    const braiveryOverlay = document.getElementById("braiveryOverlay");
    braiveryOverlay.classList.add("active");
}

function closeBraiveryOverlay() {
    document.getElementById("braiveryOverlay").classList.remove("active");
    initMapGrid();
}

// Successfully Clicked the Pokeball
function successfullyFoundPokeball() {
    // Clear inspection intervals
    clearInterval(activeTimer);
    activeTimer = null;

    // Put tile on 5 minute cooldown
    const cooldownUntil = Date.now() + TILE_COOLDOWN;
    gameState.tileCooldowns[currentTileIndex] = cooldownUntil;
    saveState();

    // Transition from search overlay to opening overlay
    document.getElementById("inspectionOverlay").classList.remove("active");
    
    const openingOverlay = document.getElementById("openingOverlay");
    openingOverlay.classList.add("active");
    
    // Set opening screen back to Stage 1 (interactive pokeball click)
    document.getElementById("pokeballStage").classList.add("active");
    document.getElementById("revealStage").classList.remove("active");
    document.getElementById("interactivePokeball").classList.remove("shake");
}

// ==========================================================================
// Pokeball Opening & Rarity Rolls
// ==========================================================================
function triggerPokeballOpening() {
    const ball = document.getElementById("interactivePokeball");
    if (ball.classList.contains("shake")) return; // Prevent double clicks

    // Trigger shake animation
    ball.classList.add("shake");

    // Wait for shake animation to finish (1.5 seconds) then reveal
    setTimeout(() => {
        ball.classList.remove("shake");
        document.getElementById("pokeballStage").classList.remove("active");
        
        // Roll Pokemon and display reveal card
        rollAndRevealPokemon();
    }, 1500);
}

function rollAndRevealPokemon() {
    // 1. Roll for rarity tier based on percentage chart
    const rand = Math.random();
    let selectedRarity = "basic"; // fallback

    let cumulativeProbability = 0;
    const rarities = ["legendary", "no-evolve", "evolution3", "evolution2", "basic"];
    
    for (const rarity of rarities) {
        cumulativeProbability += RARITY_PROBABILITIES[rarity];
        if (rand <= cumulativeProbability) {
            selectedRarity = rarity;
            break;
        }
    }

    // 2. Select random Pokemon from chosen rarity database
    const tierList = POKEMON_DATABASE[selectedRarity];
    const pokemon = tierList[Math.floor(Math.random() * tierList.length)];

    // 3. Add to inventory in gameState
    if (!gameState.inventory[pokemon.name]) {
        gameState.inventory[pokemon.name] = 0;
    }
    gameState.inventory[pokemon.name]++;
    saveState();
    updateStatsBar();

    // 4. Update reveal UI contents
    const revealRarity = document.getElementById("revealRarity");
    revealRarity.textContent = RARITY_LABELS[selectedRarity].toUpperCase();
    revealRarity.className = `reveal-rarity-badge`; // Reset class list

    // Set styling classes
    const revealCard = document.getElementById("pokemonRevealCard");
    revealCard.className = `pokemon-reveal-card reveal-${selectedRarity}`;

    // Load PokeAPI artwork URL
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    revealCard.innerHTML = `
        <div class="glow-spot"></div>
        <div class="reveal-image-wrap">
            <img src="${artworkUrl}" alt="${pokemon.name}" onerror="handleArtworkError(this, '${pokemon.name}')">
        </div>
        <div class="reveal-name">${pokemon.name}</div>
        <div class="reveal-worth-badge">
            <i class="fa-solid fa-coins"></i>
            <span>WORTH: ${RARITY_WORTH[selectedRarity]}p</span>
        </div>
    `;

    document.getElementById("revealStage").classList.add("active");
}

function handleArtworkError(imgElement, name) {
    // If PokeAPI is offline or fails, draw a clean fallback logo/box
    imgElement.parentElement.innerHTML = `
        <div style="font-family:var(--font-display); font-size:2rem; color:var(--text-muted); opacity:0.5; text-align:center;">
            <i class="fa-solid fa-circle-nodes" style="font-size:3rem; margin-bottom:0.5rem; display:block;"></i>
            ${name}
        </div>
    `;
}
// Expose globally for inline onerror handlers in dynamically generated HTML
window.handleArtworkError = handleArtworkError;

function closeRevealOverlay() {
    document.getElementById("openingOverlay").classList.remove("active");
    initMapGrid();
}

// ==========================================================================
// Pokemon Collection Directory (caught listing / duplicate selling)
// ==========================================================================
function initCollection() {
    const grid = document.getElementById("collectionGrid");
    grid.innerHTML = "";

    // Set up filter buttons
    const filters = document.querySelectorAll(".rarity-filter");
    filters.forEach(btn => {
        btn.onclick = () => {
            filters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            collectionFilter = btn.getAttribute("data-rarity");
            renderCollectionList();
        };
    });

    renderCollectionList();
}

function renderCollectionList() {
    const grid = document.getElementById("collectionGrid");
    grid.innerHTML = "";

    // Gather and sort all Pokemon by Pokedex ID
    const sortedDatabase = [...ALL_POKEMON_FLAT].sort((a, b) => a.id - b.id);
    
    // Filter according to selection
    const filtered = sortedDatabase.filter(pokemon => {
        if (collectionFilter === "all") return true;
        
        // Handle mapped key discrepancies if any
        let mappedFilter = collectionFilter;
        return pokemon.rarity === mappedFilter;
    });

    let renderedCount = 0;

    filtered.forEach(pokemon => {
        const ownedCount = gameState.inventory[pokemon.name] || 0;
        const hasOwned = ownedCount > 0;

        const card = document.createElement("div");
        card.className = `pokemon-card tier-${pokemon.rarity}`;
        if (!hasOwned) {
            card.classList.add("silhouette");
        }

        const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        const tierName = RARITY_LABELS[pokemon.rarity];
        const worthValue = RARITY_WORTH[pokemon.rarity];

        let imageHTML = `<img src="${artworkUrl}" alt="${pokemon.name}" onerror="handleArtworkError(this, '${pokemon.name}')">`;
        if (!hasOwned) {
            // Silhouette styling using CSS filter
            imageHTML = `<img src="${artworkUrl}" alt="${pokemon.name}" style="filter: brightness(0) opacity(0.2);" onerror="handleArtworkError(this, '${pokemon.name}')">`;
        }

        card.innerHTML = `
            <div class="glow-spot"></div>
            ${hasOwned ? `<div class="card-count">x${ownedCount}</div>` : ''}
            <div class="card-image-wrap">
                ${imageHTML}
            </div>
            <div class="card-name">${hasOwned ? pokemon.name : "???"}</div>
            <div class="card-tier-tag">${tierName}</div>
            <div class="card-action">
                ${hasOwned && ownedCount > 1 ? `
                    <button class="sell-btn" onclick="sellDuplicate('${pokemon.name}')">
                        <i class="fa-solid fa-coins"></i> SELL DUPLICATE (+${worthValue}p)
                    </button>
                ` : ''}
            </div>
        `;

        grid.appendChild(card);
        renderedCount++;
    });

    if (renderedCount === 0) {
        grid.innerHTML = `
            <div class="no-pokemon-prompt">
                <i class="fa-solid fa-box-open"></i>
                <p>No Pokemon found in this category.</p>
            </div>
        `;
    }
}

// Global scope accessor for inline HTML clicks
window.sellDuplicate = function(pokemonName) {
    const ownedCount = gameState.inventory[pokemonName] || 0;
    if (ownedCount <= 1) return; // Cannot sell sole copy

    // Find pokemon data to check worth value
    const pokemon = ALL_POKEMON_FLAT.find(p => p.name === pokemonName);
    if (!pokemon) return;

    // Sell details
    const worth = RARITY_WORTH[pokemon.rarity];
    gameState.inventory[pokemonName]--;
    gameState.coins += worth;
    
    saveState();
    updateStatsBar();
    renderCollectionList();
};

// ==========================================================================
// Trade Center Tab (Refreshing NPC offers)
// ==========================================================================
function checkTradeOffer() {
    const now = Date.now();
    
    // Check if we need to generate a new offer
    if (!gameState.tradeOffer || now >= gameState.tradeOffer.expiresAt) {
        // Roll a random Pokemon from the complete database
        const randomPokemon = ALL_POKEMON_FLAT[Math.floor(Math.random() * ALL_POKEMON_FLAT.length)];
        
        // Cost equals worth
        const cost = RARITY_WORTH[randomPokemon.rarity];
        const expiresAt = now + TRADE_DURATION;

        gameState.tradeOffer = {
            pokemon: {
                id: randomPokemon.id,
                name: randomPokemon.name,
                rarity: randomPokemon.rarity
            },
            cost: cost,
            completed: false,
            expiresAt: expiresAt
        };

        saveState();
    }
}

function renderTradeOffer() {
    const container = document.getElementById("tradeCard");
    if (!container) return;

    const offer = gameState.tradeOffer;
    if (!offer) return;

    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${offer.pokemon.id}.png`;
    const isCompleted = offer.completed;
    const canAfford = gameState.coins >= offer.cost;
    const timerValueHTML = formatCooldownTime(Math.max(0, offer.expiresAt - Date.now()));

    container.innerHTML = `
        <div class="trade-timer-badge">
            <i class="fa-solid fa-clock"></i>
            <span>REFRESH IN:</span>
            <span class="timer-value" id="tradeTimerVal">${timerValueHTML}</span>
        </div>

        <div class="trade-graphic-box">
            <img src="${artworkUrl}" alt="${offer.pokemon.name}" onerror="handleArtworkError(this, '${offer.pokemon.name}')">
        </div>

        <div class="trade-pokemon-name">${offer.pokemon.name}</div>
        <div class="trade-rarity-badge tier-${offer.pokemon.rarity}">${RARITY_LABELS[offer.pokemon.rarity]}</div>

        <div class="trade-pricing">
            <span class="trade-price-label">TRADE VALUE</span>
            <span class="trade-price-val">${offer.cost} p</span>
        </div>

        <div class="trade-action-box" style="width:100%;">
            ${isCompleted ? `
                <div class="trade-completed">
                    <i class="fa-solid fa-check"></i>
                    <span>TRADE COMPLETED</span>
                </div>
            ` : `
                <button class="trade-buy-btn" id="buyTradeBtn" ${!canAfford ? 'disabled' : ''}>
                    ACCEPT TRADE
                </button>
            `}
        </div>
    `;

    // Hook up trade execution button
    const buyBtn = document.getElementById("buyTradeBtn");
    if (buyBtn) {
        buyBtn.addEventListener("click", executeTradePurchase);
    }
}

function executeTradePurchase() {
    const offer = gameState.tradeOffer;
    if (!offer || offer.completed) return;

    if (gameState.coins < offer.cost) {
        return; // Double check affordability
    }

    // Deduct coins and add pokemon
    gameState.coins -= offer.cost;
    
    const pName = offer.pokemon.name;
    if (!gameState.inventory[pName]) {
        gameState.inventory[pName] = 0;
    }
    gameState.inventory[pName]++;
    offer.completed = true;

    saveState();
    updateStatsBar();
    renderTradeOffer();
}

// ==========================================================================
// Cheat Code Handlers (hourly ESID code)
// ==========================================================================
function setupCheatForm() {
    const input = document.getElementById("cheatInput");
    const btn = document.getElementById("cheatBtn");

    btn.addEventListener("click", applyCheatCode);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyCheatCode();
        }
    });
}

function applyCheatCode() {
    const input = document.getElementById("cheatInput");
    const feedback = document.getElementById("cheatFeedback");
    
    const code = input.value.trim().toUpperCase();
    input.value = ""; // Clear input
    feedback.textContent = "";

    if (code !== "ESID") {
        feedback.textContent = "INVALID CHEAT CODE";
        feedback.style.color = "var(--color-red)";
        return;
    }

    const now = Date.now();
    const timeDiff = now - gameState.lastCheatUsed;

    // Check hourly limit (1 time per hour = 3600000ms)
    if (timeDiff < CHEAT_COOLDOWN) {
        const remainingMs = CHEAT_COOLDOWN - timeDiff;
        const minutes = Math.floor(remainingMs / (1000 * 60));
        const seconds = Math.floor((remainingMs / 1000) % 60);
        feedback.textContent = `COOLDOWN: TRY AGAIN IN ${minutes}m ${seconds}s`;
        feedback.style.color = "var(--color-pink)";
        return;
    }

    // Find all Pokemon that the player does not have in their inventory yet
    const unowned = ALL_POKEMON_FLAT.filter(pokemon => {
        return !gameState.inventory[pokemon.name] || gameState.inventory[pokemon.name] === 0;
    });

    if (unowned.length === 0) {
        feedback.textContent = "YOU ALREADY HAVE ALL POKEMON!";
        feedback.style.color = "var(--color-cyan)";
        return;
    }

    // Choose a random missing Pokemon
    const newPokemon = unowned[Math.floor(Math.random() * unowned.length)];

    // Add to collection
    if (!gameState.inventory[newPokemon.name]) {
        gameState.inventory[newPokemon.name] = 0;
    }
    gameState.inventory[newPokemon.name]++;
    
    // Set cheat timestamp
    gameState.lastCheatUsed = now;
    saveState();
    updateStatsBar();

    feedback.textContent = "CHEAT CODE APPLIED!";
    feedback.style.color = "#4ade80";

    // Open reveal overlay directly with a special alert title
    const openingOverlay = document.getElementById("openingOverlay");
    openingOverlay.classList.add("active");
    document.getElementById("pokeballStage").classList.remove("active");

    const revealRarity = document.getElementById("revealRarity");
    revealRarity.textContent = `CHEAT: ${RARITY_LABELS[newPokemon.rarity].toUpperCase()}`;
    revealRarity.className = `reveal-rarity-badge`; // reset

    const revealCard = document.getElementById("pokemonRevealCard");
    revealCard.className = `pokemon-reveal-card reveal-${newPokemon.rarity}`;

    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${newPokemon.id}.png`;

    revealCard.innerHTML = `
        <div class="glow-spot"></div>
        <div class="reveal-image-wrap">
            <img src="${artworkUrl}" alt="${newPokemon.name}" onerror="handleArtworkError(this, '${newPokemon.name}')">
        </div>
        <div class="reveal-name">${newPokemon.name}</div>
        <div class="reveal-worth-badge">
            <i class="fa-solid fa-coins"></i>
            <span>WORTH: ${RARITY_WORTH[newPokemon.rarity]}p</span>
        </div>
    `;

    document.getElementById("revealStage").classList.add("active");
}
