// ==========================================================================
// Dinosaur Database (67 Dinosaurs: 23 Common, 18 Uncommon, 15 Rare, 7 Epic, 3 Legendary, 1 OG)
// ==========================================================================
const DINOSAURS_DATABASE = [
    // --- COMMON (23) ---
    { id: "triceratops", name: "Triceratops", rarity: "common", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "Recognizable by its large bony frill and three defensive horns." },
    { id: "stegosaurus", name: "Stegosaurus", rarity: "common", type: "quadruped", era: "Late Jurassic", diet: "Herbivore", desc: "Known for the double row of leaf-shaped plates along its back." },
    { id: "velociraptor", name: "Velociraptor", rarity: "common", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "A fast, feathered predator with a signature sickle-shaped claw." },
    { id: "anchisaurus", name: "Anchisaurus", rarity: "common", type: "biped", era: "Early Jurassic", diet: "Herbivore", desc: "A small, primitive sauropodomorph that could walk on two or four legs." },
    { id: "coelophysis", name: "Coelophysis", rarity: "common", type: "biped", era: "Late Triassic", diet: "Carnivore", desc: "A slender, agile hunter that was one of the earliest dinosaurs." },
    { id: "compsognathus", name: "Compsognathus", rarity: "common", type: "biped", era: "Late Jurassic", diet: "Carnivore", desc: "A tiny, bird-like theropod that hunted small lizards and insects." },
    { id: "eoraptor", name: "Eoraptor", rarity: "common", type: "biped", era: "Late Triassic", diet: "Omnivore", desc: "One of the earliest known dinosaurs, small and light-footed." },
    { id: "lesothosaurus", name: "Lesothosaurus", rarity: "common", type: "biped", era: "Early Jurassic", diet: "Herbivore", desc: "A small, fleet-footed herbivore built to outrun predators." },
    { id: "plateosaurus", name: "Plateosaurus", rarity: "common", type: "longneck", era: "Late Triassic", diet: "Herbivore", desc: "An early long-necked herbivore that walked Triassic Europe." },
    { id: "scutellosaurus", name: "Scutellosaurus", rarity: "common", type: "quadruped", era: "Early Jurassic", diet: "Herbivore", desc: "A small armored dinosaur covered in tiny protective studs." },
    { id: "thecodontosaurus", name: "Thecodontosaurus", rarity: "common", type: "biped", era: "Late Triassic", diet: "Herbivore", desc: "A small, agile herbivore from the late Triassic of England." },
    { id: "dilophosaurus", name: "Dilophosaurus", rarity: "common", type: "biped", era: "Early Jurassic", diet: "Carnivore", desc: "Known for the dual crests on its head; did not actually spit acid." },
    { id: "protoceratops", name: "Protoceratops", rarity: "common", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "A sheep-sized relative of Triceratops with a beak and small frill." },
    { id: "psittacosaurus", name: "Psittacosaurus", rarity: "common", type: "quadruped", era: "Early Cretaceous", diet: "Herbivore", desc: "The 'parrot lizard,' recognized by its sharp, beak-like jaws." },
    { id: "oviraptor", name: "Oviraptor", rarity: "common", type: "biped", era: "Late Cretaceous", diet: "Omnivore", desc: "Originally thought to steal eggs, it was actually a protective parent." },
    { id: "gallimimus", name: "Gallimimus", rarity: "common", type: "biped", era: "Late Cretaceous", diet: "Omnivore", desc: "A swift-running dinosaur shaped like a modern ostrich." },
    { id: "ornithomimus", name: "Ornithomimus", rarity: "common", type: "biped", era: "Late Cretaceous", diet: "Omnivore", desc: "A fast runner that likely fed on plants, insects, and small prey." },
    { id: "struthiomimus", name: "Struthiomimus", rarity: "common", type: "biped", era: "Late Cretaceous", diet: "Herbivore", desc: "Another ostrich-mimic dinosaur built for high-speed escapes." },
    { id: "microceratus", name: "Microceratus", rarity: "common", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "One of the smallest known ceratopsians, running on short legs." },
    { id: "minmi", name: "Minmi", rarity: "common", type: "quadruped", era: "Early Cretaceous", diet: "Herbivore", desc: "A small, heavily armored ankylosaur from Australia." },
    { id: "mussaurus", name: "Mussaurus", rarity: "common", type: "longneck", era: "Late Triassic", diet: "Herbivore", desc: "A primitive long-necked dinosaur; fossils include tiny hatchlings." },
    { id: "pisanosaurus", name: "Pisanosaurus", rarity: "common", type: "biped", era: "Late Triassic", diet: "Herbivore", desc: "An extremely primitive Triassic dinosaur from South America." },
    { id: "saltopus", name: "Saltopus", rarity: "common", type: "biped", era: "Late Triassic", diet: "Carnivore", desc: "A tiny Triassic reptile, roughly the size of a domestic cat." },

    // --- UNCOMMON (18) ---
    { id: "ankylosaurus", name: "Ankylosaurus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "An armored tank with a heavy bone club at the end of its tail." },
    { id: "brachiosaurus", name: "Brachiosaurus", rarity: "uncommon", type: "longneck", era: "Late Jurassic", diet: "Herbivore", desc: "A massive sauropod with longer front legs, giving it a giraffe-like posture." },
    { id: "pterodactyl", name: "Pterodactyl", rarity: "uncommon", type: "flyer", era: "Late Jurassic", diet: "Piscivore", desc: "A flying reptile that glided over prehistoric coastal lakes." },
    { id: "diplodocus", name: "Diplodocus", rarity: "uncommon", type: "longneck", era: "Late Jurassic", diet: "Herbivore", desc: "A whip-tailed sauropod that stretched over 90 feet in length." },
    { id: "allosaurus", name: "Allosaurus", rarity: "uncommon", type: "biped", era: "Late Jurassic", diet: "Carnivore", desc: "The apex predator of the Jurassic, boasting sharp teeth and claws." },
    { id: "iguanodon", name: "Iguanodon", rarity: "uncommon", type: "quadruped", era: "Early Cretaceous", diet: "Herbivore", desc: "A herbivore famous for the conical thumb spikes on its front hands." },
    { id: "parasaurolophus", name: "Parasaurolophus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "Distinctive for the long, curved tubular crest on its head." },
    { id: "corythosaurus", name: "Corythosaurus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "Had a hollow, helmet-like crest on its skull used to make sounds." },
    { id: "edmontosaurus", name: "Edmontosaurus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "A flat-headed duck-billed dinosaur that migrated in giant herds." },
    { id: "hadrosaurus", name: "Hadrosaurus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "The first dinosaur skeleton ever put on display in North America." },
    { id: "maiasaura", name: "Maiasaura", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "The 'good mother lizard,' known for nesting in huge colonies." },
    { id: "ouranosaurus", name: "Ouranosaurus", rarity: "uncommon", type: "quadruped", era: "Early Cretaceous", diet: "Herbivore", desc: "Possessed a sail-like ridge running down its spine." },
    { id: "pachycephalosaurus", name: "Pachycephalosaurus", rarity: "uncommon", type: "biped", era: "Late Cretaceous", diet: "Herbivore", desc: "Has an extremely thick, dome-shaped skull dome for headbutting." },
    { id: "styracosaurus", name: "Styracosaurus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "A relative of Triceratops with six long spikes lining its frill." },
    { id: "kentrosaurus", name: "Kentrosaurus", rarity: "uncommon", type: "quadruped", era: "Late Jurassic", diet: "Herbivore", desc: "A stegosaur with long defensive spikes on its shoulders and tail." },
    { id: "polacanthus", name: "Polacanthus", rarity: "uncommon", type: "quadruped", era: "Early Cretaceous", diet: "Herbivore", desc: "An armored dinosaur covered in spikes and a large sacral shield." },
    { id: "nodosaurus", name: "Nodosaurus", rarity: "uncommon", type: "quadruped", era: "Late Cretaceous", diet: "Herbivore", desc: "Covered in bony plates, but lacking a tail club." },
    { id: "sauropelta", name: "Sauropelta", rarity: "uncommon", type: "quadruped", era: "Early Cretaceous", diet: "Herbivore", desc: "Armed with long spikes projecting outwards from its neck." },

    // --- RARE (15) ---
    { id: "spinosaurus", name: "Spinosaurus", rarity: "rare", type: "swimmer", era: "Late Cretaceous", diet: "Piscivore", desc: "A massive sail-backed predator adapted for a semi-aquatic lifestyle." },
    { id: "carnotaurus", name: "Carnotaurus", rarity: "rare", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "A fast theropod with unique bull-like horns above its eyes." },
    { id: "baryonyx", name: "Baryonyx", rarity: "rare", type: "biped", era: "Early Cretaceous", diet: "Piscivore", desc: "A spinosaur relative with a long snout and giant curved thumb claws." },
    { id: "plesiosaurus", name: "Plesiosaurus", rarity: "rare", type: "swimmer", era: "Early Jurassic", diet: "Piscivore", desc: "A marine reptile with a long neck and four powerful flippers." },
    { id: "deinonychus", name: "Deinonychus", rarity: "rare", type: "biped", era: "Early Cretaceous", diet: "Carnivore", desc: "The dinosaur that inspired the Velociraptors of popular movies." },
    { id: "albertosaurus", name: "Albertosaurus", rarity: "rare", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "A smaller, sleeker, and faster relative of the T-Rex." },
    { id: "megalosaurus", name: "Megalosaurus", rarity: "rare", type: "biped", era: "Middle Jurassic", diet: "Carnivore", desc: "The very first dinosaur species to be scientifically named." },
    { id: "ceratosaurus", name: "Ceratosaurus", rarity: "rare", type: "biped", era: "Late Jurassic", diet: "Carnivore", desc: "Distinguished by a small horn on its nose and bony back ridges." },
    { id: "amargasaurus", name: "Amargasaurus", rarity: "rare", type: "longneck", era: "Early Cretaceous", diet: "Herbivore", desc: "A sauropod with a double row of long, sharp neck spines." },
    { id: "apatosaurus", name: "Apatosaurus", rarity: "rare", type: "longneck", era: "Late Jurassic", diet: "Herbivore", desc: "A massive, heavy-set Jurassic sauropod formerly known as Brontosaurus." },
    { id: "camarasaurus", name: "Camarasaurus", rarity: "rare", type: "longneck", era: "Late Jurassic", diet: "Herbivore", desc: "The most common sauropod found in North American Jurassic beds." },
    { id: "therizinosaurus", name: "Therizinosaurus", rarity: "rare", type: "biped", era: "Late Cretaceous", diet: "Herbivore", desc: "Possessed three-foot-long scythe-like claws on its front limbs." },
    { id: "giganotosaurus", name: "Giganotosaurus", rarity: "rare", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "One of the largest land predators to have ever walked the Earth." },
    { id: "carcharodontosaurus", name: "Carcharodontosaurus", rarity: "rare", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "Named 'shark-toothed lizard' due to its sharp serrated teeth." },
    { id: "suchomimus", name: "Suchomimus", rarity: "rare", type: "biped", era: "Early Cretaceous", diet: "Piscivore", desc: "Had a long, low snout like a crocodile, built for snatching fish." },

    // --- EPIC (7) ---
    { id: "pteranodon", name: "Pteranodon", rarity: "epic", type: "flyer", era: "Late Cretaceous", diet: "Piscivore", desc: "A giant flying reptile with a long crest on the back of its skull." },
    { id: "elasmosaurus", name: "Elasmosaurus", rarity: "epic", type: "swimmer", era: "Late Cretaceous", diet: "Piscivore", desc: "A marine reptile with an extremely long neck containing 72 vertebrae." },
    { id: "mosasaurus", name: "Mosasaurus", rarity: "epic", type: "swimmer", era: "Late Cretaceous", diet: "Carnivore", desc: "A colossal marine apex predator with powerful jaws." },
    { id: "quetzalcoatlus", name: "Quetzalcoatlus", rarity: "epic", type: "flyer", era: "Late Cretaceous", diet: "Carnivore", desc: "The largest flying creature of all time, standing as tall as a giraffe." },
    { id: "dimetrodon", name: "Dimetrodon", rarity: "epic", type: "quadruped", era: "Permian", diet: "Carnivore", desc: "A sail-backed synapsid that lived before the first true dinosaurs." },
    { id: "ichthyosaurus", name: "Ichthyosaurus", rarity: "epic", type: "swimmer", era: "Early Jurassic", diet: "Piscivore", desc: "A dolphin-like marine reptile that swam Jurassic seas." },
    { id: "liopleurodon", name: "Liopleurodon", rarity: "epic", type: "swimmer", era: "Late Jurassic", diet: "Carnivore", desc: "A massive short-necked pliosaur with bone-crushing teeth." },

    // --- LEGENDARY (3) ---
    { id: "tyrannosaurus", name: "Tyrannosaurus Rex", rarity: "legendary", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "The undisputed king of the dinosaurs, boasting the strongest bite force." },
    { id: "giganotosaurus_rex", name: "Giganotosaurus Rex", rarity: "legendary", type: "biped", era: "Late Cretaceous", diet: "Carnivore", desc: "A hybrid gigantism variant of the giant Argentine predator." },
    { id: "argentinosaurus", name: "Argentinosaurus", rarity: "legendary", type: "longneck", era: "Late Cretaceous", diet: "Herbivore", desc: "The heaviest and largest land animal currently known to science." },

    // --- OG (1) ---
    { id: "archaeopteryx", name: "Archaeopteryx", rarity: "og", type: "flyer", era: "Late Jurassic", diet: "Carnivore", desc: "The original missing link between dinosaurs and modern birds." }
];

// Rarity configuration
const RARITY_CONFIG = {
    common: { name: "Common", color: "#39ff14", border: "border-common", bg: "tier-common", weight: 100 },
    uncommon: { name: "Uncommon", color: "#00f0ff", border: "border-uncommon", bg: "tier-uncommon", weight: 60 },
    rare: { name: "Rare", color: "#bd00ff", border: "border-rare", bg: "tier-rare", weight: 30 },
    epic: { name: "Epic", color: "#ff6600", border: "border-epic", bg: "tier-epic", weight: 15 },
    legendary: { name: "Legendary", color: "#ffcc00", border: "border-legendary", bg: "tier-legendary", weight: 5 },
    og: { name: "OG", color: "#ff007f", border: "border-og", bg: "tier-og", weight: 1 }
};

// ==========================================================================
// Game State Management
// ==========================================================================
// Time Constant & Mode
var TIME_PER_DNA = 600000; // 10 minutes in ms

let gameState = {
    dinos: {}, // dinoId -> quantity
    lastCollectTime: Date.now(),
    stackedDNA: 0,
    cardsFlipped: 0,
    pendingCards: [] // list of card objects: { id, dinoId, flipped: false }
};

// Cooldown/progress for manual synthesis
let manualSynthesizing = false;
let manualProgress = 0;
let manualTimerId = null;

// Rarity weights calculation helper
let totalWeight = 0;
DINOSAURS_DATABASE.forEach(d => {
    totalWeight += RARITY_CONFIG[d.rarity].weight;
});


// Save / Load data
function loadSave() {
    const data = localStorage.getItem("dino_dna_save");
    if (data) {
        try {
            const parsed = JSON.parse(data);
            gameState.dinos = parsed.dinos || {};
            gameState.lastCollectTime = Number(parsed.lastCollectTime) || Date.now();
            gameState.stackedDNA = Number(parsed.stackedDNA) || 0;
            gameState.cardsFlipped = Number(parsed.cardsFlipped) || 0;
            gameState.pendingCards = parsed.pendingCards || [];
        } catch (e) {
            console.error("Save load error", e);
        }
    }
}

function saveData() {
    localStorage.setItem("dino_dna_save", JSON.stringify(gameState));
}

// Calculate stacked offline DNA
function updateOfflineAccumulation() {
    const now = Date.now();
    
    // Safety check for clock desyncs/future saved timestamps
    if (gameState.lastCollectTime > now || isNaN(gameState.lastCollectTime)) {
        gameState.lastCollectTime = now;
        saveData();
    }
    
    const elapsed = now - gameState.lastCollectTime;
    const rate = TIME_PER_DNA;
    const newlyStacked = Math.floor(elapsed / rate);
    
    if (newlyStacked > 0) {
        gameState.stackedDNA += newlyStacked;
        gameState.lastCollectTime = gameState.lastCollectTime + (newlyStacked * rate);
        saveData();
    }
}

// ==========================================================================
// Procedural Dinosaur Canvas Drawing Engine
// ==========================================================================
function drawDinosaur(canvas, dino) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Setup drawing style based on rarity
    const config = RARITY_CONFIG[dino.rarity];
    ctx.strokeStyle = config.color;
    ctx.fillStyle = config.color + "1a"; // Semi-transparent fill
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    
    // Add custom glow effect for premium feel
    ctx.shadowBlur = 6;
    ctx.shadowColor = config.color;
    
    ctx.beginPath();
    
    if (dino.type === "biped") {
        // Draw T-Rex / Raptor structure
        // Head
        ctx.moveTo(w * 0.65, h * 0.25);
        ctx.lineTo(w * 0.8, h * 0.25);
        ctx.lineTo(w * 0.8, h * 0.38);
        ctx.lineTo(w * 0.65, h * 0.38);
        
        // Neck/Body
        ctx.quadraticCurveTo(w * 0.5, h * 0.45, w * 0.4, h * 0.55);
        
        // Tail
        ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.1, h * 0.45);
        ctx.quadraticCurveTo(w * 0.2, h * 0.65, w * 0.45, h * 0.65);
        
        // Back leg
        ctx.lineTo(w * 0.42, h * 0.82);
        ctx.lineTo(w * 0.48, h * 0.82);
        ctx.moveTo(w * 0.45, h * 0.65);
        
        // Front leg
        ctx.lineTo(w * 0.52, h * 0.82);
        ctx.lineTo(w * 0.58, h * 0.82);
        
        // Chest/Arm
        ctx.moveTo(w * 0.52, h * 0.58);
        ctx.lineTo(w * 0.6, h * 0.55); // Arm
        ctx.lineTo(w * 0.58, h * 0.6);
        
        // Throat
        ctx.moveTo(w * 0.52, h * 0.58);
        ctx.quadraticCurveTo(w * 0.62, h * 0.48, w * 0.65, h * 0.38);
    } 
    else if (dino.type === "quadruped") {
        // Triceratops / Stegosaurus structure
        // Head
        ctx.moveTo(w * 0.72, h * 0.45);
        ctx.lineTo(w * 0.82, h * 0.5); // nose
        ctx.lineTo(w * 0.75, h * 0.6);
        
        // Frill / Back of head
        if (dino.id === "triceratops" || dino.id === "styracosaurus" || dino.id === "protoceratops") {
            ctx.lineTo(w * 0.68, h * 0.35); // Frill peak
            ctx.lineTo(w * 0.72, h * 0.45);
        }
        
        // Neck/Back
        ctx.moveTo(w * 0.7, h * 0.5);
        ctx.quadraticCurveTo(w * 0.5, h * 0.35, w * 0.35, h * 0.45);
        
        // Stegosaur Plates / Spikes
        if (dino.id === "stegosaurus" || dino.id === "kentrosaurus") {
            ctx.moveTo(w * 0.65, h * 0.44); ctx.lineTo(w * 0.63, h * 0.36); ctx.lineTo(w * 0.58, h * 0.41);
            ctx.moveTo(w * 0.55, h * 0.39); ctx.lineTo(w * 0.51, h * 0.31); ctx.lineTo(w * 0.46, h * 0.39);
            ctx.moveTo(w * 0.43, h * 0.42); ctx.lineTo(w * 0.39, h * 0.34); ctx.lineTo(w * 0.35, h * 0.44);
        }
        
        // Tail
        ctx.moveTo(w * 0.35, h * 0.45);
        ctx.quadraticCurveTo(w * 0.2, h * 0.48, w * 0.1, h * 0.38);
        ctx.quadraticCurveTo(w * 0.18, h * 0.6, w * 0.3, h * 0.6);
        
        // Back leg
        ctx.lineTo(w * 0.32, h * 0.78);
        ctx.lineTo(w * 0.38, h * 0.78);
        ctx.lineTo(w * 0.4, h * 0.6);
        
        // Belly
        ctx.lineTo(w * 0.58, h * 0.6);
        
        // Front leg
        ctx.lineTo(w * 0.6, h * 0.78);
        ctx.lineTo(w * 0.66, h * 0.78);
        ctx.lineTo(w * 0.68, h * 0.56);
        
        // Neck/Throat
        ctx.lineTo(w * 0.7, h * 0.5);
        
        // Horns for Triceratops
        if (dino.id === "triceratops" || dino.id === "styracosaurus") {
            ctx.moveTo(w * 0.74, h * 0.45);
            ctx.lineTo(w * 0.8, h * 0.38); // Horn 1
            ctx.moveTo(w * 0.76, h * 0.47);
            ctx.lineTo(w * 0.82, h * 0.42); // Horn 2
        }
    } 
    else if (dino.type === "longneck") {
        // Sauropod structure
        // Tail
        ctx.moveTo(w * 0.08, h * 0.62);
        ctx.quadraticCurveTo(w * 0.2, h * 0.6, w * 0.35, h * 0.55);
        
        // Back
        ctx.quadraticCurveTo(w * 0.5, h * 0.45, w * 0.6, h * 0.52);
        
        // Long Neck
        ctx.quadraticCurveTo(w * 0.75, h * 0.4, w * 0.78, h * 0.18);
        
        // Head
        ctx.lineTo(w * 0.84, h * 0.18);
        ctx.lineTo(w * 0.84, h * 0.23);
        ctx.lineTo(w * 0.78, h * 0.25);
        
        // Throat/Chest
        ctx.quadraticCurveTo(w * 0.72, h * 0.45, w * 0.62, h * 0.6);
        
        // Front Leg
        ctx.lineTo(w * 0.6, h * 0.8);
        ctx.lineTo(w * 0.66, h * 0.8);
        ctx.lineTo(w * 0.68, h * 0.62);
        
        // Belly
        ctx.lineTo(w * 0.42, h * 0.62);
        
        // Back Leg
        ctx.lineTo(w * 0.4, h * 0.8);
        ctx.lineTo(w * 0.46, h * 0.8);
        ctx.lineTo(w * 0.48, h * 0.58);
        
        // Tail bottom
        ctx.quadraticCurveTo(w * 0.25, h * 0.68, w * 0.08, h * 0.62);
    } 
    else if (dino.type === "flyer") {
        // Pterosaur structure
        // Head/Beak
        ctx.moveTo(w * 0.5, h * 0.4);
        ctx.lineTo(w * 0.65, h * 0.38); // Beak
        ctx.lineTo(w * 0.52, h * 0.44);
        ctx.lineTo(w * 0.45, h * 0.32); // Crest
        ctx.closePath();
        
        // Body
        ctx.moveTo(w * 0.5, h * 0.44);
        ctx.quadraticCurveTo(w * 0.42, h * 0.55, w * 0.35, h * 0.62); // Tail
        
        // Left Wing
        ctx.moveTo(w * 0.48, h * 0.46);
        ctx.quadraticCurveTo(w * 0.4, h * 0.22, w * 0.25, h * 0.18); // Wingtip
        ctx.quadraticCurveTo(w * 0.38, h * 0.42, w * 0.42, h * 0.54);
        
        // Right Wing
        ctx.moveTo(w * 0.48, h * 0.46);
        ctx.quadraticCurveTo(w * 0.56, h * 0.24, w * 0.72, h * 0.22); // Wingtip 2
        ctx.quadraticCurveTo(w * 0.58, h * 0.44, w * 0.45, h * 0.54);
        
        // Feet
        ctx.moveTo(w * 0.4, h * 0.58);
        ctx.lineTo(w * 0.38, h * 0.68);
        ctx.moveTo(w * 0.43, h * 0.58);
        ctx.lineTo(w * 0.42, h * 0.68);
    } 
    else if (dino.type === "swimmer") {
        // Plesiosaur / Mosasaur structure
        // Body Center
        ctx.moveTo(w * 0.35, h * 0.5);
        
        // Long Neck/Head
        ctx.quadraticCurveTo(w * 0.55, h * 0.4, w * 0.75, h * 0.28);
        ctx.lineTo(w * 0.8, h * 0.28);
        ctx.lineTo(w * 0.76, h * 0.35);
        ctx.quadraticCurveTo(w * 0.58, h * 0.48, w * 0.5, h * 0.55);
        
        // Front Flipper
        ctx.lineTo(w * 0.46, h * 0.75);
        ctx.lineTo(w * 0.4, h * 0.72);
        ctx.lineTo(w * 0.42, h * 0.56);
        
        // Tail
        ctx.lineTo(w * 0.25, h * 0.58);
        ctx.quadraticCurveTo(w * 0.12, h * 0.58, w * 0.08, h * 0.5);
        ctx.quadraticCurveTo(w * 0.16, h * 0.42, w * 0.35, h * 0.5);
        
        // Back Flipper
        ctx.moveTo(w * 0.28, h * 0.57);
        ctx.lineTo(w * 0.24, h * 0.72);
        ctx.lineTo(w * 0.2, h * 0.7);
        ctx.lineTo(w * 0.24, h * 0.56);
    }
    
    ctx.stroke();
    ctx.fill();
    
    // Reset shadow values
    ctx.shadowBlur = 0;
}

// ==========================================================================
// Dino DNA Core Gameplay logic
// ==========================================================================

// Get a random dinosaur weighted by rarity
function rollDinosaur() {
    let roll = Math.random() * totalWeight;
    let accum = 0;
    
    for (let i = 0; i < DINOSAURS_DATABASE.length; i++) {
        const dino = DINOSAURS_DATABASE[i];
        accum += RARITY_CONFIG[dino.rarity].weight;
        if (roll <= accum) {
            return dino;
        }
    }
    return DINOSAURS_DATABASE[0];
}

// Format timer strings
function formatTime(ms) {
    if (ms < 0) ms = 0;
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Main grid rendering
function renderCollection() {
    const grid = document.getElementById("dinoGrid");
    const query = document.getElementById("dinoSearch").value.toLowerCase().trim();
    const filter = document.getElementById("rarityFilter").value;
    
    grid.innerHTML = "";
    
    // Sort database by rarity tiers config order or standard listing
    let sortedDb = [...DINOSAURS_DATABASE];
    
    // Filter
    let filteredDb = sortedDb.filter(d => {
        const matchesQuery = d.name.toLowerCase().includes(query) || d.desc.toLowerCase().includes(query);
        const matchesRarity = filter === "all" || d.rarity === filter;
        return matchesQuery && matchesRarity;
    });
    
    filteredDb.forEach(dino => {
        const quantity = gameState.dinos[dino.id] || 0;
        const unlocked = quantity > 0;
        
        const square = document.createElement("div");
        square.className = `dino-square ${unlocked ? 'unlocked' : 'locked'}`;
        if (unlocked) {
            square.classList.add(`border-${dino.rarity}`);
        }
        
        // Count badge on top right
        if (unlocked) {
            const count = document.createElement("span");
            count.className = "count-badge";
            count.textContent = `x${quantity}`;
            square.appendChild(count);
        }
        
        // Canvas for procedural dino drawing
        const canvas = document.createElement("canvas");
        canvas.width = 120;
        canvas.height = 90;
        square.appendChild(canvas);
        
        // Draw dino (even if locked, we'll hide it with CSS filter: brightness(0))
        drawDinosaur(canvas, dino);
        
        // Name
        const nameEl = document.createElement("span");
        nameEl.className = "dino-name";
        nameEl.textContent = unlocked ? dino.name.toUpperCase() : "???";
        square.appendChild(nameEl);
        
        // Click to view details
        square.addEventListener("click", () => {
            if (unlocked) {
                showDetailModal(dino, quantity);
            }
        });
        
        grid.appendChild(square);
    });
    
    // Update dashboard statistics
    let discovered = 0;
    DINOSAURS_DATABASE.forEach(d => {
        if (gameState.dinos[d.id] > 0) discovered++;
    });
    document.getElementById("dinosDiscovered").textContent = `${discovered} / 67`;
    document.getElementById("cardsFlipped").textContent = gameState.cardsFlipped;
}

// Modal zoom showcase
function showDetailModal(dino, count) {
    const modal = document.getElementById("detailOverlay");
    document.getElementById("detailTitle").textContent = dino.name.toUpperCase();
    document.getElementById("detailCount").textContent = `x${count}`;
    document.getElementById("detailEra").textContent = dino.era;
    document.getElementById("detailDiet").textContent = dino.diet;
    document.getElementById("detailDesc").textContent = dino.desc;
    
    // Rarity Badge styling
    const badge = document.getElementById("detailRarityBadge");
    badge.className = `rarity-badge tier-${dino.rarity}`;
    badge.textContent = dino.rarity.toUpperCase();
    
    // Redraw on detail modal canvas
    const canvas = document.getElementById("detailCanvas");
    drawDinosaur(canvas, dino);
    
    modal.classList.add("active");
}

function closeDetailModal() {
    document.getElementById("detailOverlay").classList.remove("active");
}

// Generate physical face-down flippable card items
function spawnPendingCards() {
    const grid = document.getElementById("pendingCardsGrid");
    if (!grid) return;
    
    if (gameState.pendingCards.length === 0) {
        grid.innerHTML = `
            <div class="empty-deck-message" id="emptyDeckMsg">
                <i class="fa-solid fa-box-archive"></i>
                <p>No pending DNA packages. Wait for the factory or manually synthesize DNA to get cards to flip!</p>
            </div>
        `;
        document.getElementById("pendingCount").textContent = "0";
        return;
    }
    
    grid.innerHTML = "";
    document.getElementById("pendingCount").textContent = gameState.pendingCards.length;
    
    gameState.pendingCards.forEach((c) => {
        const container = document.createElement("div");
        container.className = "card-container";
        
        const card = document.createElement("div");
        card.className = "flip-card";
        if (c.flipped) {
            card.classList.add("flipped");
        }
        
        // Face Back
        const back = document.createElement("div");
        back.className = "card-face card-back";
        
        const backIcon = document.createElement("i");
        backIcon.className = "fa-solid fa-dna card-back-icon";
        back.appendChild(backIcon);
        
        const backText = document.createElement("span");
        backText.className = "card-back-text";
        backText.textContent = "TAP TO FLIP";
        back.appendChild(backText);
        
        // Face Front
        const front = document.createElement("div");
        front.className = "card-face card-front";
        
        // Find dino metadata
        const dino = DINOSAURS_DATABASE.find(d => d.id === c.dinoId);
        
        // Color front card based on rarity
        front.classList.add(`tier-${dino.rarity}`);
        
        const frontCanvas = document.createElement("canvas");
        frontCanvas.width = 100;
        frontCanvas.height = 75;
        front.appendChild(frontCanvas);
        
        const frontTitle = document.createElement("h4");
        frontTitle.textContent = dino.name.toUpperCase();
        front.appendChild(frontTitle);
        
        const frontTag = document.createElement("span");
        frontTag.className = "card-rarity-tag";
        frontTag.textContent = dino.rarity.toUpperCase();
        front.appendChild(frontTag);
        
        // Add to DOM
        card.appendChild(back);
        card.appendChild(front);
        container.appendChild(card);
        
        // Draw dino on front canvas if it exists
        drawDinosaur(frontCanvas, dino);
        
        // Click action
        container.addEventListener("click", () => {
            if (!c.flipped) {
                c.flipped = true;
                card.classList.add("flipped");
                
                // Add to collections
                gameState.dinos[dino.id] = (gameState.dinos[dino.id] || 0) + 1;
                gameState.cardsFlipped++;
                
                saveData();
                renderCollection();
                
                // Remove from pending deck after a delay
                setTimeout(() => {
                    gameState.pendingCards = gameState.pendingCards.filter(pc => pc.id !== c.id);
                    saveData();
                    spawnPendingCards();
                    document.getElementById("pendingCount").textContent = gameState.pendingCards.length;
                }, 1800);
            }
        });
        
        grid.appendChild(container);
    });
}

// Add stacked DNA packs to the deck
function collectDNA() {
    updateOfflineAccumulation();
    const count = gameState.stackedDNA;
    if (count <= 0) return;
    
    for (let i = 0; i < count; i++) {
        const dino = rollDinosaur();
        gameState.pendingCards.push({
            id: Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            dinoId: dino.id,
            flipped: false
        });
    }
    
    gameState.stackedDNA = 0;
    gameState.lastCollectTime = Date.now();
    saveData();
    
    spawnPendingCards();
    updateUIElements();
}

// Manual synthesis action
function startManualSynthesis() {
    if (manualSynthesizing) return;
    
    manualSynthesizing = true;
    document.getElementById("synthesizeBtn").disabled = true;
    manualProgress = 0;
    
    const startTime = Date.now();
    const duration = 5000; // 5 seconds
    
    function tick() {
        const now = Date.now();
        const elapsed = now - startTime;
        manualProgress = Math.min(100, (elapsed / duration) * 100);
        
        const btn = document.getElementById("synthesizeBtn");
        btn.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-cyan"></i> SYNTHESIZING (${Math.ceil((duration - elapsed)/1000)}s)`;
        
        if (elapsed < duration) {
            manualTimerId = requestAnimationFrame(tick);
        } else {
            // Done!
            manualSynthesizing = false;
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-flask"></i> MANUAL SYNTHESIS (5s)`;
            
            // Add 1 stacked DNA
            gameState.stackedDNA++;
            saveData();
            updateUIElements();
        }
    }
    
    manualTimerId = requestAnimationFrame(tick);
}

// Update text values & buttons
function updateUIElements() {
    const count = gameState.stackedDNA;
    const collectBtn = document.getElementById("collectBtn");
    
    collectBtn.textContent = `COLLECT STACKED DNA (${count})`;
    collectBtn.disabled = count <= 0;
    document.getElementById("stackedCount").textContent = `${count} DNA Package${count === 1 ? '' : 's'}`;
    
    document.getElementById("productionRate").textContent = "1 DNA / 10 minutes";
}

// Tick loop for factory progress bar
function gameTick() {
    updateOfflineAccumulation();
    
    const now = Date.now();
    const elapsed = now - gameState.lastCollectTime;
    const rate = TIME_PER_DNA;
    
    // Percentage completion
    const percent = Math.min(100, (elapsed / rate) * 100);
    document.getElementById("factoryProgress").style.width = `${percent}%`;
    
    // Timer text
    const remaining = Math.max(0, rate - elapsed);
    document.getElementById("factoryTime").textContent = `${formatTime(elapsed)} / ${formatTime(rate)}`;
    
    updateUIElements();
}


// Apply cheat code
function applyCheat() {
    const input = document.getElementById("cheatInput").value.trim();
    const feedback = document.getElementById("cheatFeedback");
    
    if (input === "2011") {
        feedback.style.color = RARITY_CONFIG.common.color;
        feedback.textContent = "CHEAT ACTIVE: +10 DNA CARDS!";
        
        for (let i = 0; i < 10; i++) {
            const dino = rollDinosaur();
            gameState.pendingCards.push({
                id: Date.now() + "_" + Math.random().toString(36).substr(2, 5),
                dinoId: dino.id,
                flipped: false
            });
        }
        
        saveData();
        spawnPendingCards();
        updateUIElements();
        
        setTimeout(() => {
            feedback.textContent = "";
            document.getElementById("cheatInput").value = "";
        }, 3000);
    } else {
        feedback.style.color = "#ff073a";
        feedback.textContent = "INVALID CODE";
        setTimeout(() => { feedback.textContent = ""; }, 2000);
    }
}

// Reset archives
function resetArchives() {
    if (confirm("Are you sure you want to completely erase all discovered DNA cards and start over?")) {
        localStorage.removeItem("dino_dna_save");
        gameState = {
            dinos: {},
            lastCollectTime: Date.now(),
            stackedDNA: 0,
            cardsFlipped: 0,
            pendingCards: []
        };
        saveData();
        renderCollection();
        spawnPendingCards();
        updateUIElements();
    }
}

// ==========================================================================
// Initialization & Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadSave();
    
    // Render
    renderCollection();
    spawnPendingCards();
    updateUIElements();
    
    // Bind listeners
    document.getElementById("collectBtn").addEventListener("click", collectDNA);
    document.getElementById("synthesizeBtn").addEventListener("click", startManualSynthesis);
    document.getElementById("cheatBtn").addEventListener("click", applyCheat);
    document.getElementById("resetDataBtn").addEventListener("click", resetArchives);
    
    // Detail Modal close
    document.getElementById("detailCloseBtn").addEventListener("click", closeDetailModal);
    document.getElementById("detailOverlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("detailOverlay")) {
            closeDetailModal();
        }
    });
    
    // Filters & Searches
    document.getElementById("dinoSearch").addEventListener("input", renderCollection);
    document.getElementById("rarityFilter").addEventListener("change", renderCollection);
    
    // Start main game loop (runs active clock ticker)
    setInterval(gameTick, 100);
});
