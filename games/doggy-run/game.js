// ==========================================================================
// Dog Skins Data
// ==========================================================================
const SKINS_DATABASE = {
    default: {
        id: "default",
        name: "Golden Retriever",
        cost: 150,
        color: "#ffb03a",
        subColor: "#ffe5b4",
        accentColor: "#ff4500",
        description: "Your faithful starting golden companion.",
        iconClass: "fa-dog",
        iconColor: "#ffb03a"
    },
    husky: {
        id: "husky",
        name: "Sleek Husky",
        cost: 100,
        color: "#8a95a5",
        subColor: "#ffffff",
        accentColor: "#00f0ff",
        description: "Unlocks glowing cyan eyes and cool gray coat.",
        iconClass: "fa-dog",
        iconColor: "#8a95a5"
    },
    robodog: {
        id: "robodog",
        name: "Robo-Dog",
        cost: 250,
        color: "#505562",
        subColor: "#8e94a2",
        accentColor: "#ff073a",
        description: "Unlocks cybernetic plating and red laser visors.",
        iconClass: "fa-robot",
        iconColor: "#505562"
    },
    supercorgi: {
        id: "supercorgi",
        name: "Super Corgi",
        cost: 500,
        color: "#c68a4c",
        subColor: "#ffffff",
        accentColor: "#bd00ff",
        description: "Unlocks a flapping purple superhero cape.",
        iconClass: "fa-shield-dog",
        iconColor: "#c68a4c"
    },
    cosmicshiba: {
        id: "cosmicshiba",
        name: "Cosmic Shiba",
        cost: 1000,
        color: "#e1a15c",
        subColor: "#f4f4f6",
        accentColor: "#39ff14",
        description: "Unlocks space-suit helmet and star particle trail.",
        iconClass: "fa-user-astronaut",
        iconColor: "#e1a15c"
    },
    goldendoodle: {
        id: "goldendoodle",
        name: "Golden Doodle",
        cost: 0,
        color: "#ffd37a",
        subColor: "#ffffff",
        accentColor: "#ffaa00",
        description: "Fluffy golden doodle companion (Quincy super code).",
        iconClass: "fa-dog",
        iconColor: "#ffd37a"
    },
    bulldog: {
        id: "bulldog",
        name: "English Bulldog",
        cost: 80,
        color: "#d2b48c",
        subColor: "#f5f5dc",
        accentColor: "#8b4513",
        description: "A sturdy English Bulldog with a leather collar.",
        iconClass: "fa-dog",
        iconColor: "#d2b48c"
    },
    poodle: {
        id: "poodle",
        name: "Fancy Poodle",
        cost: 120,
        color: "#f5f5f5",
        subColor: "#ffffff",
        accentColor: "#ff69b4",
        description: "Elegant white poodle with a pink designer collar.",
        iconClass: "fa-dog",
        iconColor: "#f5f5f5"
    },
    pug: {
        id: "pug",
        name: "Chubby Pug",
        cost: 90,
        color: "#e6c280",
        subColor: "#fdf5e6",
        accentColor: "#1a1a1a",
        description: "An adorable, wrinkly pug with a dark face mask.",
        iconClass: "fa-dog",
        iconColor: "#e6c280"
    },
    dalmatian: {
        id: "dalmatian",
        name: "Dalmatian",
        cost: 130,
        color: "#ffffff",
        subColor: "#e6e6e6",
        accentColor: "#ff3333",
        description: "Classic spotted coat with a bright red collar.",
        iconClass: "fa-dog",
        iconColor: "#ffffff"
    },
    german_shepherd: {
        id: "german_shepherd",
        name: "German Shepherd",
        cost: 160,
        color: "#a0522d",
        subColor: "#2f1f17",
        accentColor: "#008000",
        description: "Alert guardian with tan and black markings.",
        iconClass: "fa-shield-dog",
        iconColor: "#a0522d"
    },
    beagle: {
        id: "beagle",
        name: "Friendly Beagle",
        cost: 95,
        color: "#cd853f",
        subColor: "#ffffff",
        accentColor: "#4b5320",
        description: "Merry tri-color hound with active tracking senses.",
        iconClass: "fa-dog",
        iconColor: "#cd853f"
    },
    boxer: {
        id: "boxer",
        name: "Energetic Boxer",
        cost: 110,
        color: "#d2691e",
        subColor: "#faf0e6",
        accentColor: "#ff4500",
        description: "Playful boxer with a strong, athletic frame.",
        iconClass: "fa-dog",
        iconColor: "#d2691e"
    },
    chihuahua: {
        id: "chihuahua",
        name: "Tiny Chihuahua",
        cost: 70,
        color: "#f5f5dc",
        subColor: "#ffffff",
        accentColor: "#ff00ff",
        description: "Feisty little companion with giant alert ears.",
        iconClass: "fa-dog",
        iconColor: "#f5f5dc"
    },
    great_dane: {
        id: "great_dane",
        name: "Great Dane",
        cost: 200,
        color: "#708090",
        subColor: "#cfd8dc",
        accentColor: "#3a3d40",
        description: "A gentle giant with a majestic slate-gray coat.",
        iconClass: "fa-dog",
        iconColor: "#708090"
    },
    rottweiler: {
        id: "rottweiler",
        name: "Guard Rottweiler",
        cost: 180,
        color: "#2a2b2e",
        subColor: "#8b5a2b",
        accentColor: "#ff5722",
        description: "Robust guardian breed with tan accent points.",
        iconClass: "fa-shield-dog",
        iconColor: "#2a2b2e"
    },
    doberman: {
        id: "doberman",
        name: "Sleek Doberman",
        cost: 190,
        color: "#1c1c1e",
        subColor: "#b07d62",
        accentColor: "#d50000",
        description: "Sleek, elegant, and fast runner with a red collar.",
        iconClass: "fa-dog",
        iconColor: "#1c1c1e"
    },
    shiba: {
        id: "shiba",
        name: "Classic Shiba",
        cost: 140,
        color: "#f4a460",
        subColor: "#fff8dc",
        accentColor: "#ff7f50",
        description: "The viral internet legend with curved curly tail.",
        iconClass: "fa-dog",
        iconColor: "#f4a460"
    },
    pitbull: {
        id: "pitbull",
        name: "Strong Pitbull",
        cost: 150,
        color: "#a9a9a9",
        subColor: "#e8e8e8",
        accentColor: "#8b0000",
        description: "Loyal runner with a muscular solid silver coat.",
        iconClass: "fa-dog",
        iconColor: "#a9a9a9"
    },
    border_collie: {
        id: "border_collie",
        name: "Border Collie",
        cost: 175,
        color: "#3e3e42",
        subColor: "#ffffff",
        accentColor: "#008080",
        description: "Ultra-intelligent helper with a sleek tuxedo coat.",
        iconClass: "fa-dog",
        iconColor: "#3e3e42"
    },
    cocker_spaniel: {
        id: "cocker_spaniel",
        name: "Cocker Spaniel",
        cost: 115,
        color: "#e3a857",
        subColor: "#fff3e0",
        accentColor: "#ff9800",
        description: "Beautiful silky coat and floppy long ears.",
        iconClass: "fa-dog",
        iconColor: "#e3a857"
    },
    dachshund: {
        id: "dachshund",
        name: "Dachshund",
        cost: 85,
        color: "#8b5a2b",
        subColor: "#c68a4c",
        accentColor: "#4caf50",
        description: "A long sausage dog built close to the ground.",
        iconClass: "fa-dog",
        iconColor: "#8b5a2b"
    },
    st_bernard: {
        id: "st_bernard",
        name: "Saint Bernard",
        cost: 220,
        color: "#cd853f",
        subColor: "#ffffff",
        accentColor: "#2196f3",
        description: "Alpine rescue legend with a thick winter coat.",
        iconClass: "fa-shield-dog",
        iconColor: "#cd853f"
    },
    chow_chow: {
        id: "chow_chow",
        name: "Fluffy Chow Chow",
        cost: 210,
        color: "#d2691e",
        subColor: "#f4a460",
        accentColor: "#3f51b5",
        description: "Fluffy lion-like dog with a blue collar.",
        iconClass: "fa-dog",
        iconColor: "#d2691e"
    },
    pomeranian: {
        id: "pomeranian",
        name: "Pomeranian",
        cost: 135,
        color: "#ffa500",
        subColor: "#ffcc80",
        accentColor: "#e91e63",
        description: "A tiny ball of pure orange energy fluff.",
        iconClass: "fa-dog",
        iconColor: "#ffa500"
    },
    akita: {
        id: "akita",
        name: "Regal Akita",
        cost: 230,
        color: "#ffebcd",
        subColor: "#ffffff",
        accentColor: "#ff5722",
        description: "Regal and powerful breed from northern Japan.",
        iconClass: "fa-dog",
        iconColor: "#ffebcd"
    },
    maltese: {
        id: "maltese",
        name: "Snowy Maltese",
        cost: 145,
        color: "#fafafa",
        subColor: "#ffffff",
        accentColor: "#ff80ab",
        description: "Silky pure-white coat with a pink ribbon collar.",
        iconClass: "fa-dog",
        iconColor: "#fafafa"
    },
    samoyed: {
        id: "samoyed",
        name: "Fluffy Samoyed",
        cost: 260,
        color: "#ffffff",
        subColor: "#eceff1",
        accentColor: "#00e5ff",
        description: "Stunning smiling sled dog with a snow white coat.",
        iconClass: "fa-dog",
        iconColor: "#ffffff"
    },
    basset_hound: {
        id: "basset_hound",
        name: "Basset Hound",
        cost: 105,
        color: "#b08d6c",
        subColor: "#ffffff",
        accentColor: "#7e57c2",
        description: "Charming long ears, short legs, and sad eyes.",
        iconClass: "fa-dog",
        iconColor: "#b08d6c"
    },
    boston_terrier: {
        id: "boston_terrier",
        name: "Boston Terrier",
        cost: 125,
        color: "#303030",
        subColor: "#ffffff",
        accentColor: "#76ff03",
        description: "Dapper little gentleman wearing a natural tuxedo.",
        iconClass: "fa-dog",
        iconColor: "#303030"
    },
    bloodhound: {
        id: "bloodhound",
        name: "Detective Hound",
        cost: 240,
        color: "#966f50",
        subColor: "#5d3c26",
        accentColor: "#ff9800",
        description: "Unrivaled scent tracker with loose, wrinkled skin.",
        iconClass: "fa-dog",
        iconColor: "#966f50"
    },
    sheepdog: {
        id: "sheepdog",
        name: "Old Sheepdog",
        cost: 270,
        color: "#b0bec5",
        subColor: "#ffffff",
        accentColor: "#673ab7",
        description: "Shaggy herding dog with long fur covering its eyes.",
        iconClass: "fa-dog",
        iconColor: "#b0bec5"
    },
    newfoundland: {
        id: "newfoundland",
        name: "Newfoundland",
        cost: 280,
        color: "#263238",
        subColor: "#37474f",
        accentColor: "#00e676",
        description: "Massive helper water dog with thick heavy coat.",
        iconClass: "fa-shield-dog",
        iconColor: "#263238"
    }
};

// ==========================================================================
// Game State
// ==========================================================================
let gameState = {
    highScore: 0,
    coins: 0,
    activeSkin: "goldendoodle",
    purchasedSkins: ["goldendoodle"],
    dogName: "Doggy"
};

// ==========================================================================
// Engine Variables
// ==========================================================================
let canvas = null;
let ctx = null;
let gameRunning = false;
let animationFrameId = null;

// Game entities
let dog = {
    x: 80,
    y: 0,
    width: 60,
    height: 45,
    vy: 0,
    jumpForce: -12,
    gravity: 0.6,
    isJumping: false,
    runFrame: 0,
    runTimer: 0
};

let obstacles = [];
let coins = [];
let particles = [];

// Scrolling background layers
let bgOffsetCity = 0;
let bgOffsetFloor = 0;

let score = 0;
let coinsCollectedThisRun = 0;
let gameSpeed = 5.5;
let spawnTimer = 0;

// Ground coordinates
const GROUND_Y = 320;

// Input tracking
let spacePressed = false;

// Rush Super Ability State
let rushState = {
    active: false,
    cooldown: false,
    startTime: 0,
    cooldownStartTime: 0
};

// Dog Immortality flag
dog.isImmortal = false;

function activateRush() {
    rushState.active = true;
    rushState.cooldown = false;
    rushState.startTime = Date.now();
    dog.isImmortal = true;
    
    // Add golden flash particles
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: dog.x + 30,
            y: dog.y + 20,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 5 + 4,
            color: "rgba(255, 204, 0, 0.9)",
            alpha: 1
        });
    }
}

function endRush() {
    rushState.active = false;
    rushState.cooldown = true;
    rushState.cooldownStartTime = Date.now();
    dog.isImmortal = false;
    
    const btn = document.getElementById("rushBtn");
    if (btn) {
        btn.disabled = true;
    }
}

function readyRush() {
    rushState.active = false;
    rushState.cooldown = false;
    
    const btn = document.getElementById("rushBtn");
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-bolt fa-beat"></i> RUSH READY`;
        btn.style.background = "linear-gradient(45deg, var(--color-yellow), #ffaa00)";
        btn.disabled = false;
    }
}

function resetRush() {
    rushState.active = false;
    rushState.cooldown = false;
    dog.isImmortal = false;
    readyRush();
}

// ==========================================================================
// Document Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    loadSave();
    setupShop();
    renderStats();

    // Resize canvas if container smaller (handled in CSS scale, but keeps resolution)
    canvas.width = 800;
    canvas.height = 400;

    // Controls setup
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", triggerJump, { passive: true });
    canvas.addEventListener("mousedown", triggerJump);

    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("retryBtn").addEventListener("click", startGame);
    document.getElementById("resetDataBtn").addEventListener("click", resetAllData);
    
    // Name input listener
    document.getElementById("dogNameInput").addEventListener("input", (e) => {
        gameState.dogName = e.target.value.trim() || "Doggy";
        saveData();
    });

    // Rush button click listener
    document.getElementById("rushBtn").addEventListener("click", () => {
        const isQuincy = gameState.dogName.toLowerCase() === "quincy";
        const isDoodle = gameState.activeSkin === "goldendoodle";
        if (isQuincy && isDoodle && gameRunning && !rushState.active && !rushState.cooldown) {
            activateRush();
        }
    });

    // Initial canvas paint (drawn static)
    drawStaticMenu();
});

// ==========================================================================
// Input Handling
// ==========================================================================
function handleKeyDown(e) {
    if ((e.code === "Space" || e.code === "ArrowUp") && !spacePressed) {
        e.preventDefault();
        spacePressed = true;
        triggerJump();
    }
    if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyR") {
        const isQuincy = gameState.dogName.toLowerCase() === "quincy";
        const isDoodle = gameState.activeSkin === "goldendoodle";
        if (isQuincy && isDoodle && gameRunning && !rushState.active && !rushState.cooldown) {
            activateRush();
        }
    }
}

function handleKeyUp(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
        spacePressed = false;
    }
}

function triggerJump(e) {
    if (e) {
        // Prevent click events running if screen overlay active
        if (!gameRunning) return;
    }
    
    if (!dog.isJumping) {
        dog.vy = dog.jumpForce;
        dog.isJumping = true;
    }
}

// ==========================================================================
// Game Engine Loops
// ==========================================================================
function startGame() {
    // Hide screens
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameOverScreen").classList.add("hidden");

    // Reset variables
    gameRunning = true;
    score = 0;
    coinsCollectedThisRun = 0;
    gameSpeed = 5.5;
    obstacles = [];
    coins = [];
    particles = [];
    spawnTimer = 0;

    dog.y = GROUND_Y - dog.height;
    dog.vy = 0;
    dog.isJumping = false;
    dog.runFrame = 0;
    dog.runTimer = 0;
    
    resetRush();

    // Start loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    // Save records
    gameState.coins += coinsCollectedThisRun;
    if (score > gameState.highScore) {
        gameState.highScore = score;
    }
    saveData();
    renderStats();
    setupShop(); // Refresh shop buttons with new coin count
    
    resetRush();

    // Update screen text
    document.getElementById("finalScore").textContent = Math.floor(score);
    document.getElementById("finalCoins").textContent = coinsCollectedThisRun;
    document.getElementById("gameOverScreen").classList.remove("hidden");
}

function gameLoop(timestamp) {
    if (!gameRunning) return;

    updatePhysics();
    drawAll();

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ==========================================================================
// Physics Update
// ==========================================================================
function updatePhysics() {
    // 1. Quincy + Golden Doodle cheat check
    const isQuincy = gameState.dogName.toLowerCase() === "quincy";
    const isDoodle = gameState.activeSkin === "goldendoodle";
    const btn = document.getElementById("rushBtn");
    
    if (isQuincy && isDoodle && gameRunning) {
        btn.classList.remove("hidden");
    } else {
        btn.classList.add("hidden");
        if (rushState.active) endRush();
    }

    // 2. Tick Rush state active/cooldown timers
    if (rushState.active) {
        const elapsed = (Date.now() - rushState.startTime) / 1000;
        const left = Math.ceil(30 - elapsed);
        if (left <= 0) {
            endRush();
        } else {
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-shield-dog fa-bounce"></i> ACTIVE (${left}s)`;
                btn.style.background = "linear-gradient(45deg, var(--color-green), #2db30f)";
            }
        }
        // Spawns gold particles behind the dog when active!
        particles.push({
            x: dog.x + 10,
            y: dog.y + dog.height / 2 + Math.random() * 10 - 5,
            vx: -2 - Math.random() * 2,
            vy: Math.random() * 2 - 1,
            size: Math.random() * 3 + 2,
            color: "rgba(255, 204, 0, 0.7)",
            alpha: 1
        });
    } else if (rushState.cooldown) {
        const elapsed = (Date.now() - rushState.cooldownStartTime) / 1000;
        const left = Math.ceil(10 - elapsed);
        if (left <= 0) {
            readyRush();
        } else {
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-rotate fa-spin"></i> RELOADING (${left}s)`;
                btn.style.background = "linear-gradient(45deg, var(--color-red), #b3052b)";
            }
        }
    }

    // 3. Tick score
    score += 0.15;
    
    // 4. Increase speed gradually
    gameSpeed = 5.5 + (score * 0.001);

    // 5. Dog physics
    dog.vy += dog.gravity;
    dog.y += dog.vy;

    // Ceiling clamp
    if (dog.y < 0) {
        dog.y = 0;
        dog.vy = 0;
    }

    // Floor clamp
    if (dog.y >= GROUND_Y - dog.height) {
        dog.y = GROUND_Y - dog.height;
        dog.vy = 0;
        dog.isJumping = false;
    }

    // Dog running frames
    if (!dog.isJumping) {
        dog.runTimer += gameSpeed * 0.15;
        if (dog.runTimer >= 5) {
            dog.runFrame = (dog.runFrame + 1) % 4;
            dog.runTimer = 0;
        }
    }

    // 6. Parallax Background scroll
    bgOffsetCity -= gameSpeed * 0.15;
    bgOffsetFloor -= gameSpeed;

    if (bgOffsetCity <= -800) bgOffsetCity = 0;
    if (bgOffsetFloor <= -40) bgOffsetFloor = 0;

    // 7. Spawn obstacles & coins
    spawnTimer--;
    if (spawnTimer <= 0) {
        spawnEntities();
        spawnTimer = Math.floor(Math.random() * 50 + 60); // frame delays
    }

    // 8. Update obstacles
    obstacles.forEach((obs, idx) => {
        obs.x -= gameSpeed;
        
        // Collide checking
        if (checkCollision(dog, obs)) {
            if (!dog.isImmortal) {
                gameOver();
            } else {
                // Flash and shatter obstacle!
                for (let i = 0; i < 6; i++) {
                    particles.push({
                        x: obs.x + obs.width/2,
                        y: obs.y + obs.height/2,
                        vx: Math.random() * 4 + 2,
                        vy: (Math.random() - 0.5) * 6,
                        size: Math.random() * 3 + 2,
                        color: "rgba(255, 204, 0, 0.8)",
                        alpha: 1
                    });
                }
                obstacles.splice(idx, 1);
            }
        }
    });

    // Remove offscreen obstacles
    obstacles = obstacles.filter(obs => obs.x > -obs.width);

    // 7. Update coins
    coins.forEach((c, idx) => {
        c.x -= gameSpeed;
        
        // Collide checking
        if (checkCollision(dog, c)) {
            coinsCollectedThisRun++;
            spawnCoinExplosion(c.x + c.width/2, c.y + c.height/2);
            coins.splice(idx, 1);
        }
    });

    // Remove offscreen coins
    coins = coins.filter(c => c.x > -c.width);

    // 8. Cosmic trail particles if using cosmic shiba skin
    if (gameState.activeSkin === "cosmicshiba") {
        particles.push({
            x: dog.x + 10,
            y: dog.y + dog.height / 2 + Math.random() * 10 - 5,
            vx: -2 - Math.random() * 2,
            vy: Math.random() * 2 - 1,
            size: Math.random() * 4 + 2,
            color: Math.random() < 0.5 ? "rgba(57, 255, 20, 0.6)" : "rgba(0, 240, 255, 0.6)",
            alpha: 1
        });
    }

    // Update particles
    particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
            particles.splice(idx, 1);
        }
    });
}

function spawnEntities() {
    const roll = Math.random();
    
    if (roll < 0.6) {
        // Spawn Obstacle
        const obsWidth = Math.floor(Math.random() * 15 + 25);
        const obsHeight = Math.floor(Math.random() * 15 + 30);
        const type = Math.random() < 0.5 ? "hydrant" : "bin";
        
        obstacles.push({
            x: 850,
            y: GROUND_Y - obsHeight,
            width: obsWidth,
            height: obsHeight,
            type: type
        });
    } else {
        // Spawn Coin Cluster (3 coins in a line or arch)
        const spawnHeight = GROUND_Y - 50 - Math.random() * 80;
        for (let i = 0; i < 3; i++) {
            coins.push({
                x: 850 + (i * 35),
                y: spawnHeight,
                width: 20,
                height: 20
            });
        }
    }
}

function checkCollision(rect1, rect2) {
    // Add small tolerance padding for fair player feedback
    const padX = 4;
    const padY = 4;
    return (
        rect1.x + padX < rect2.x + rect2.width &&
        rect1.x + rect1.width - padX > rect2.x &&
        rect1.y + padY < rect2.y + rect2.height &&
        rect1.y + rect1.height - padY > rect2.y
    );
}

function spawnCoinExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 4 + 3,
            color: "rgba(255, 204, 0, 0.8)",
            alpha: 1
        });
    }
}

// ==========================================================================
// Canvas Draw Logic
// ==========================================================================
function drawAll() {
    // Clean
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Sky (Dark Gradient)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, "#080911");
    skyGrad.addColorStop(1, "#141624");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Stars (Static)
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(120, 40, 2, 2);
    ctx.fillRect(320, 80, 2, 2);
    ctx.fillRect(550, 60, 2, 2);
    ctx.fillRect(720, 30, 2, 2);

    // 3. Draw Parallax Neon Mountains
    ctx.strokeStyle = "rgba(189, 0, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let mountainPoints = [
        { x: 0, y: 240 }, { x: 150, y: 120 }, { x: 300, y: 260 },
        { x: 450, y: 150 }, { x: 600, y: 250 }, { x: 750, y: 110 }, { x: 900, y: 240 }
    ];
    mountainPoints.forEach((pt, i) => {
        let scX = pt.x + bgOffsetCity;
        if (scX < -150) scX += 900;
        if (i === 0) ctx.moveTo(scX, pt.y);
        else ctx.lineTo(scX, pt.y);
    });
    ctx.stroke();

    // 4. Draw Ground / Floor Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();

    // Ground mesh dashes
    ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = bgOffsetFloor; x < canvas.width + 40; x += 40) {
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x - 50, canvas.height);
    }
    ctx.stroke();

    // 5. Draw Particles
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // 6. Draw Coins
    coins.forEach(c => {
        ctx.fillStyle = "#ffcc00";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        // Inner coin detail
        ctx.fillStyle = "#cca300";
        ctx.beginPath();
        ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/4, 0, Math.PI*2);
        ctx.fill();
    });

    // 7. Draw Obstacles
    obstacles.forEach(obs => {
        if (obs.type === "hydrant") {
            // Draw red Fire Hydrant
            ctx.fillStyle = "#ff073a";
            ctx.fillRect(obs.x + 2, obs.y + 6, obs.width - 4, obs.height - 6);
            ctx.fillStyle = "#b30022";
            ctx.fillRect(obs.x + 4, obs.y + 12, obs.width - 8, obs.height - 12);
            // Cap top
            ctx.fillStyle = "#ff073a";
            ctx.beginPath();
            ctx.arc(obs.x + obs.width/2, obs.y + 6, obs.width/2 - 2, Math.PI, 0);
            ctx.fill();
        } else {
            // Draw Gray Trash Bin
            ctx.fillStyle = "#505562";
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            // Ridges
            ctx.fillStyle = "#2d3039";
            for (let rx = obs.x + 4; rx < obs.x + obs.width; rx += 8) {
                ctx.fillRect(rx, obs.y + 6, 2, obs.height - 10);
            }
            // Lid handle
            ctx.fillStyle = "#8e94a2";
            ctx.fillRect(obs.x + 2, obs.y, obs.width - 4, 3);
        }
    });

    // 8. Draw Dog
    drawDogEntity();

    // 9. Running HUD overlays
    ctx.font = "bold 13px Orbitron";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(`SCORE: ${Math.floor(score)}`, 20, 30);
    ctx.fillText(`COINS: ${coinsCollectedThisRun}`, 20, 50);
}

function drawDogEntity() {
    const skin = SKINS_DATABASE[gameState.activeSkin] || SKINS_DATABASE.default;
    
    ctx.save();
    ctx.translate(dog.x, dog.y);

    // Draw Name above head
    ctx.font = "bold 9px Orbitron";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.textAlign = "center";
    ctx.fillText(gameState.dogName.toUpperCase(), 30, -10 + (dog.vy * 0.1));

    // Draw golden glow shield if Rush super is active
    if (rushState.active) {
        ctx.strokeStyle = "rgba(255, 204, 0, 0.7)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ffcc00";
        ctx.beginPath();
        ctx.arc(30, 20, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
    }

    // Frame-based running offsets
    let runOffset = 0;
    if (!dog.isJumping) {
        // Simple leg oscillation values
        if (dog.runFrame === 1 || dog.runFrame === 3) {
            runOffset = 2;
        }
    }

    // 1. Draw Cape if Super Corgi
    if (skin.id === "supercorgi") {
        ctx.fillStyle = skin.accentColor; // purple
        ctx.beginPath();
        ctx.moveTo(10, 18);
        ctx.lineTo(-20 + (dog.vy * 0.8), 28 + runOffset);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();
    }

    // 2. Draw Tail
    ctx.fillStyle = skin.color;
    ctx.beginPath();
    ctx.moveTo(8, 20);
    ctx.quadraticCurveTo(-15, 8 - (dog.vy * 0.5), -5, 24);
    ctx.closePath();
    ctx.fill();

    // 3. Body
    ctx.fillStyle = skin.color;
    ctx.fillRect(10, 15 + runOffset, 32, 20); // main trunk
    
    // Underbelly subcolor
    ctx.fillStyle = skin.subColor;
    ctx.fillRect(15, 28 + runOffset, 22, 7);

    // 4. Head
    ctx.fillStyle = skin.color;
    ctx.fillRect(36, 6 + runOffset, 20, 16); // head box
    // Snout
    ctx.fillRect(48, 12 + runOffset, 12, 8);
    ctx.fillStyle = "#000"; // nose tip
    ctx.fillRect(58, 12 + runOffset, 2, 3);

    // 5. Ears
    ctx.fillStyle = skin.color;
    ctx.beginPath();
    ctx.moveTo(38, 6 + runOffset);
    ctx.lineTo(43, -2 + runOffset);
    ctx.lineTo(46, 6 + runOffset);
    ctx.closePath();
    ctx.fill();

    // Inner ear
    ctx.fillStyle = skin.subColor;
    ctx.beginPath();
    ctx.moveTo(40, 6 + runOffset);
    ctx.lineTo(43, 1 + runOffset);
    ctx.lineTo(45, 6 + runOffset);
    ctx.closePath();
    ctx.fill();

    // 6. Eyes (Dynamic by Skin)
    if (skin.id === "robodog") {
        // Red laser visor
        ctx.fillStyle = skin.accentColor;
        ctx.fillRect(44, 9 + runOffset, 8, 3);
        // Cyber eye shine
        ctx.fillStyle = "#fff";
        ctx.fillRect(49, 10 + runOffset, 2, 2);
    } else {
        // Standard eyes
        ctx.fillStyle = "#000";
        ctx.fillRect(44, 9 + runOffset, 4, 4);
        ctx.fillStyle = (skin.id === "husky") ? skin.accentColor : "#fff"; // blue husky eyes
        ctx.fillRect(46, 9 + runOffset, 2, 2);
    }

    // 7. Space Helmet if Cosmic Shiba
    if (skin.id === "cosmicshiba") {
        ctx.strokeStyle = skin.accentColor; // green glow
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(46, 14 + runOffset, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.arc(46, 14 + runOffset, 13, 0, Math.PI * 2);
        ctx.fill();
    }

    // 8. Collar
    ctx.fillStyle = skin.accentColor;
    ctx.fillRect(34, 18 + runOffset, 4, 12);

    // 9. Legs (oscillate when running)
    ctx.fillStyle = skin.color;
    let legOffset1 = 0;
    let legOffset2 = 0;
    
    if (!dog.isJumping) {
        if (dog.runFrame === 0 || dog.runFrame === 2) {
            legOffset1 = 8;
            legOffset2 = -8;
        } else {
            legOffset1 = -8;
            legOffset2 = 8;
        }
    }

    // Front legs
    ctx.fillRect(34 + (legOffset1 * 0.2), 35, 6, 10);
    // Back legs
    ctx.fillRect(14 + (legOffset2 * 0.2), 35, 6, 10);

    ctx.restore();
}

function drawStaticMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky background
    ctx.fillStyle = "#0d0e14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();

    // Draw dog sitting
    dog.y = GROUND_Y - dog.height;
    drawDogEntity();
}

// ==========================================================================
// UI Data Bindings & Shop Control
// ==========================================================================
function renderStats() {
    document.getElementById("highScore").textContent = Math.floor(gameState.highScore);
    document.getElementById("coinCount").textContent = gameState.coins;
    document.getElementById("currentScore").textContent = "0";
    document.getElementById("dogNameInput").value = gameState.dogName;
}

function setupShop() {
    const grid = document.getElementById("shopGrid");
    grid.innerHTML = "";

    for (const [key, skin] of Object.entries(SKINS_DATABASE)) {
        const isOwned = gameState.purchasedSkins.includes(key);
        const isActive = gameState.activeSkin === key;

        const card = document.createElement("div");
        card.className = isActive ? "skin-card active" : "skin-card";

        // Generate action button
        let actionBtnHTML = "";
        if (isActive) {
            actionBtnHTML = `<span class="active-tag"><i class="fa-solid fa-circle-check"></i> EQUIPPED</span>`;
        } else if (isOwned) {
            actionBtnHTML = `<button class="equip-btn" onclick="equipSkin('${key}')">EQUIP</button>`;
        } else {
            actionBtnHTML = `
                <button class="buy-btn" onclick="buySkin('${key}', ${skin.cost})">
                    <i class="fa-solid fa-coins"></i> ${skin.cost}
                </button>`;
        }

        card.innerHTML = `
            <div class="skin-left">
                <div class="skin-icon-wrap" style="background:rgba(255, 255, 255, 0.02); color:${skin.iconColor}; border-color:${skin.color}44;">
                    <i class="fa-solid ${skin.iconClass}"></i>
                </div>
                <div class="skin-details">
                    <h3>${skin.name}</h3>
                    <p>${skin.description}</p>
                </div>
            </div>
            <div class="skin-action">
                ${actionBtnHTML}
            </div>
        `;

        grid.appendChild(card);
    }
}

window.buySkin = function(key, cost) {
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        gameState.purchasedSkins.push(key);
        gameState.activeSkin = key;
        saveData();
        renderStats();
        setupShop();
        
        // Redraw sitting dog with new skin
        drawStaticMenu();
    } else {
        alert("Not enough coins to purchase this skin!");
    }
};

window.equipSkin = function(key) {
    if (gameState.purchasedSkins.includes(key)) {
        gameState.activeSkin = key;
        saveData();
        setupShop();
        
        // Redraw sitting dog with new skin
        drawStaticMenu();
    }
};

// ==========================================================================
// Save & Load
// ==========================================================================
function saveData() {
    localStorage.setItem("doggy_run_save", JSON.stringify(gameState));
}

function loadSave() {
    const saved = localStorage.getItem("doggy_run_save");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState.highScore = parsed.highScore || 0;
            gameState.coins = parsed.coins || 0;
            gameState.activeSkin = parsed.activeSkin || "default";
            gameState.purchasedSkins = parsed.purchasedSkins || ["default"];
            gameState.dogName = parsed.dogName || "Doggy";
        } catch (err) {
            console.error("Failed to parse save", err);
        }
    }
}

function resetAllData() {
    if (confirm("Are you sure you want to reset all high scores and skins?")) {
        localStorage.removeItem("doggy_run_save");
        gameState = {
            highScore: 0,
            coins: 0,
            activeSkin: "goldendoodle",
            purchasedSkins: ["goldendoodle"],
            dogName: "Doggy"
        };
        saveData();
        renderStats();
        setupShop();
        drawStaticMenu();
    }
}
