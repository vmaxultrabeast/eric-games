// ==========================================================================
// DINO QUIZ MASTER — Core Logic & Firebase Firestore Integration
// ==========================================================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase Config (Matches Eric's Arcade)
const firebaseConfig = {
    apiKey: "AIzaSyD-placeholder",
    authDomain: "eric-arcade.firebaseapp.com",
    projectId: "eric-arcade",
    storageBucket: "eric-arcade.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firestore fallback active:", e);
}

// ── Dinosaur Master Database (32 Dinosaurs) ──────────────────────────────
const DINOSAURS = [
    {
        name: "Tyrannosaurus Rex",
        pronunciation: "tie-RAN-oh-SORE-us REX",
        era: "Late Cretaceous (68-66 Mya)",
        diet: "Carnivore",
        size: "12 meters (40 ft)",
        fact: "T-Rex had teeth up to 12 inches long and a bite force of 12,800 lbs — enough to crush solid bone!",
        svgType: "trex"
    },
    {
        name: "Triceratops",
        pronunciation: "try-SER-uh-tops",
        era: "Late Cretaceous (68-66 Mya)",
        diet: "Herbivore",
        size: "9 meters (30 ft)",
        fact: "Triceratops had a massive skull featuring 3 facial horns and a solid bone frill that was nearly 7 feet wide!",
        svgType: "triceratops"
    },
    {
        name: "Velociraptor",
        pronunciation: "veh-LOSS-ih-RAP-tor",
        era: "Late Cretaceous (75-71 Mya)",
        diet: "Carnivore",
        size: "2 meters (6.5 ft)",
        fact: "Unlike movie depictions, real Velociraptors were about the size of a turkey and were covered in feathers!",
        svgType: "raptor"
    },
    {
        name: "Stegosaurus",
        pronunciation: "STEG-oh-SORE-us",
        era: "Late Jurassic (155-150 Mya)",
        diet: "Herbivore",
        size: "9 meters (30 ft)",
        fact: "Stegosaurus had 17 dermal plates along its back and 4 sharp tail spikes called a 'thagomizer' for defense!",
        svgType: "stegosaurus"
    },
    {
        name: "Brachiosaurus",
        pronunciation: "BRACK-ee-oh-SORE-us",
        era: "Late Jurassic (154-150 Mya)",
        diet: "Herbivore",
        size: "26 meters (85 ft)",
        fact: "Brachiosaurus had longer front legs than hind legs, allowing its neck to reach tall tree crowns 40 feet high!",
        svgType: "brachiosaurus"
    },
    {
        name: "Spinosaurus",
        pronunciation: "SPINE-oh-SORE-us",
        era: "Cretaceous (112-93 Mya)",
        diet: "Piscivore / Carnivore",
        size: "15 meters (50 ft)",
        fact: "Spinosaurus was larger than T-Rex and was the first known semi-aquatic dinosaur, swimming with a paddle-like tail!",
        svgType: "spinosaurus"
    },
    {
        name: "Ankylosaurus",
        pronunciation: "an-KYE-loh-SORE-us",
        era: "Late Cretaceous (68-66 Mya)",
        diet: "Herbivore",
        size: "8 meters (26 ft)",
        fact: "Ankylosaurus was covered in thick armored plates and possessed a heavy bone club tail capable of snapping a predator's leg!",
        svgType: "ankylosaurus"
    },
    {
        name: "Pteranodon",
        pronunciation: "ter-AN-oh-don",
        era: "Late Cretaceous (86-84 Mya)",
        diet: "Piscivore",
        size: "6 meter wingspan",
        fact: "Although a flying reptile (pterosaur), Pteranodon lived alongside dinosaurs, soaring across oceans to scoop up fish without teeth!",
        svgType: "pteranodon"
    },
    {
        name: "Parasaurolophus",
        pronunciation: "PAIR-uh-sore-ALL-oh-fuss",
        era: "Late Cretaceous (76-73 Mya)",
        diet: "Herbivore",
        size: "10 meters (33 ft)",
        fact: "Parasaurolophus had a long hollow crest on its head that acted like a horn to trumpet deep resonant sounds to its herd!",
        svgType: "parasaurolophus"
    },
    {
        name: "Diplodocus",
        pronunciation: "dih-PLOD-oh-kuss",
        era: "Late Jurassic (154-152 Mya)",
        diet: "Herbivore",
        size: "27 meters (90 ft)",
        fact: "Diplodocus had an extremely long whip-like tail consisting of over 80 vertebrae that could crack like a whip faster than sound!",
        svgType: "brachiosaurus"
    },
    {
        name: "Allosaurus",
        pronunciation: "AL-oh-SORE-us",
        era: "Late Jurassic (155-145 Mya)",
        diet: "Carnivore",
        size: "8.5 meters (28 ft)",
        fact: "Allosaurus was the top apex predator of Jurassic North America, equipped with serrated teeth and sharp clawed hands!",
        svgType: "trex"
    },
    {
        name: "Carnotaurus",
        pronunciation: "CAR-noh-TORE-us",
        era: "Late Cretaceous (72-69 Mya)",
        diet: "Carnivore",
        size: "8 meters (26 ft)",
        fact: "Carnotaurus had two distinct bull-like horns above its eyes and tiny arms even smaller than those of T-Rex!",
        svgType: "trex"
    },
    {
        name: "Dilophosaurus",
        pronunciation: "dye-LOAF-oh-SORE-us",
        era: "Early Jurassic (193 Mya)",
        diet: "Carnivore",
        size: "7 meters (23 ft)",
        fact: "Dilophosaurus possessed two striking parallel crests on top of its head, used for mating displays and species recognition!",
        svgType: "raptor"
    },
    {
        name: "Pachycephalosaurus",
        pronunciation: "PACK-ee-SEF-uh-loh-SORE-us",
        era: "Late Cretaceous (70-66 Mya)",
        diet: "Herbivore",
        size: "4.5 meters (15 ft)",
        fact: "Pachycephalosaurus had a dome of solid bone on its skull up to 10 inches thick, used for head-butting rivals!",
        svgType: "pachy"
    },
    {
        name: "Giganotosaurus",
        pronunciation: "JYE-ga-NO-toe-SORE-us",
        era: "Late Cretaceous (98-97 Mya)",
        diet: "Carnivore",
        size: "13 meters (43 ft)",
        fact: "Giganotosaurus was one of the largest terrestrial carnivores ever, hunting giant sauropods in prehistoric South America!",
        svgType: "spinosaurus"
    },
    {
        name: "Deinonychus",
        pronunciation: "dye-NON-ih-kuss",
        era: "Early Cretaceous (115-108 Mya)",
        diet: "Carnivore",
        size: "3.4 meters (11 ft)",
        fact: "Deinonychus had a huge sickle-shaped claw on each hind foot, inspiring the modern scientific understanding of active, warm-blooded dinosaurs!",
        svgType: "raptor"
    },
    {
        name: "Therizinosaurus",
        pronunciation: "THER-ih-ZIN-oh-SORE-us",
        era: "Late Cretaceous (70 Mya)",
        diet: "Herbivore",
        size: "10 meters (33 ft)",
        fact: "Therizinosaurus possessed the longest claws of any animal in Earth's history — measuring over 3 feet (1 meter) in length!",
        svgType: "therizino"
    },
    {
        name: "Baryonyx",
        pronunciation: "BAIR-ee-ON-iks",
        era: "Early Cretaceous (130-125 Mya)",
        diet: "Piscivore",
        size: "9 meters (30 ft)",
        fact: "Baryonyx had a long crocodile-like snout and a massive 12-inch thumb claw designed for snagging slippery fish from riverbanks!",
        svgType: "spinosaurus"
    },
    {
        name: "Argentinosaurus",
        pronunciation: "AR-jen-TEE-noh-SORE-us",
        era: "Late Cretaceous (96-92 Mya)",
        diet: "Herbivore",
        size: "35 meters (115 ft)",
        fact: "Argentinosaurus was one of the heaviest land animals ever to exist, weighing up to 100 tons (equal to 15 elephants)!",
        svgType: "brachiosaurus"
    },
    {
        name: "Styracosaurus",
        pronunciation: "sty-RAK-oh-SORE-us",
        era: "Late Cretaceous (75 Mya)",
        diet: "Herbivore",
        size: "5.5 meters (18 ft)",
        fact: "Styracosaurus boasted a formidable head frill lined with 4 to 6 long neck spikes and a massive nose horn over 2 feet long!",
        svgType: "triceratops"
    },
    {
        name: "Gallimimus",
        pronunciation: "GAL-ih-MY-muss",
        era: "Late Cretaceous (70 Mya)",
        diet: "Omnivore",
        size: "6 meters (20 ft)",
        fact: "Gallimimus resembled a giant ostrich and could sprint at speeds up to 50 km/h (30 mph) to escape predators!",
        svgType: "raptor"
    },
    {
        name: "Iguanodon",
        pronunciation: "ig-WAH-noh-don",
        era: "Early Cretaceous (126-122 Mya)",
        diet: "Herbivore",
        size: "10 meters (33 ft)",
        fact: "Iguanodon was the second dinosaur ever scientifically named (in 1825) and possessed a sharp conical thumb spike for defense!",
        svgType: "parasaurolophus"
    },
    {
        name: "Archaeopteryx",
        pronunciation: "AR-kee-OP-ter-iks",
        era: "Late Jurassic (150 Mya)",
        diet: "Carnivore",
        size: "0.5 meters (1.6 ft)",
        fact: "Archaeopteryx is famous as the transitional fossil link between non-avian feathered dinosaurs and modern birds!",
        svgType: "pteranodon"
    },
    {
        name: "Compsognathus",
        pronunciation: "KOMP-sog-NAY-thuss",
        era: "Late Jurassic (150 Mya)",
        diet: "Carnivore",
        size: "1 meter (3.3 ft)",
        fact: "Compsognathus was about the size of a chicken, agile and fast, hunting small lizards and insects in ancient Germany and France!",
        svgType: "raptor"
    },
    {
        name: "Oviraptor",
        pronunciation: "OH-vee-RAP-tor",
        era: "Late Cretaceous (75 Mya)",
        diet: "Omnivore",
        size: "2 meters (6.5 ft)",
        fact: "Originally misnamed 'egg thief', fossil discoveries later proved Oviraptor was actually brooding and protecting its own nest of eggs!",
        svgType: "raptor"
    },
    {
        name: "Microraptor",
        pronunciation: "MY-kroh-RAP-tor",
        era: "Early Cretaceous (120 Mya)",
        diet: "Carnivore",
        size: "0.8 meters (2.6 ft)",
        fact: "Microraptor was a 4-winged dinosaur with flight feathers on both its forelimbs and hindlegs, gliding between trees!",
        svgType: "pteranodon"
    },
    {
        name: "Edmontosaurus",
        pronunciation: "ed-MON-toe-SORE-us",
        era: "Late Cretaceous (73-66 Mya)",
        diet: "Herbivore",
        size: "12 meters (39 ft)",
        fact: "Edmontosaurus was a duck-billed dinosaur that traveled in massive herds of thousands across North America!",
        svgType: "parasaurolophus"
    },
    {
        name: "Corythosaurus",
        pronunciation: "ko-RITH-oh-SORE-us",
        era: "Late Cretaceous (77-75 Mya)",
        diet: "Herbivore",
        size: "9 meters (30 ft)",
        fact: "Corythosaurus had a helmet-like crest resembling a Corinthian soldier's helmet, which was used for vocal amplification!",
        svgType: "parasaurolophus"
    },
    {
        name: "Kentrosaurus",
        pronunciation: "KEN-troh-SORE-us",
        era: "Late Jurassic (152 Mya)",
        diet: "Herbivore",
        size: "4.5 meters (15 ft)",
        fact: "Kentrosaurus was a cousin of Stegosaurus that featured paired rows of tall sharp spikes stretching from its waist all the way down its tail!",
        svgType: "stegosaurus"
    },
    {
        name: "Majungasaurus",
        pronunciation: "mah-JOONG-guh-SORE-us",
        era: "Late Cretaceous (70-66 Mya)",
        diet: "Carnivore",
        size: "7 meters (23 ft)",
        fact: "Majungasaurus was the apex predator of Madagascar and is one of the few dinosaurs with direct fossil evidence of cannibalism!",
        svgType: "trex"
    },
    {
        name: "Albertosaurus",
        pronunciation: "al-BER-toe-SORE-us",
        era: "Late Cretaceous (70 Mya)",
        diet: "Carnivore",
        size: "9 meters (30 ft)",
        fact: "Albertosaurus was a lighter, faster cousin of T-Rex that hunted in pack formations across ancient Alberta, Canada!",
        svgType: "trex"
    },
    {
        name: "Pachyrhinosaurus",
        pronunciation: "PACK-ee-RYE-noh-SORE-us",
        era: "Late Cretaceous (73-69 Mya)",
        diet: "Herbivore",
        size: "8 meters (26 ft)",
        fact: "Instead of a long nose horn, Pachyrhinosaurus had a massive flattened bone boss (rough pad) on its snout used for ramming!",
        svgType: "triceratops"
    }
];

// ── Web Audio API Synthesizer ───────────────────────────────────────────────
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'correct') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
        });
    } else if (type === 'wrong') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'lifeline') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'fanfare') {
        const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        melody.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.15, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.3);
        });
    }
}

// ── SVG Dinosaur Graphic Generator ─────────────────────────────────────────
function renderDinoSVG(dino) {
    const type = dino.svgType;
    let pathContent = '';
    let accentColor = '#00f0ff';

    if (type === 'trex') {
        accentColor = '#ff073a';
        pathContent = `
            <path d="M 40 180 Q 70 120 120 100 Q 150 90 200 80 Q 240 60 270 90 Q 280 110 260 130 Q 230 140 210 135 L 230 150 L 190 155 Q 170 180 150 200 L 140 250 L 110 260 L 120 200 Q 80 210 40 180 Z" fill="url(#dinoGrad1)" stroke="${accentColor}" stroke-width="2"/>
            <circle cx="245" cy="85" r="4" fill="#fff"/>
            <path d="M 230 115 L 235 125 L 242 115 L 248 125 L 255 115" stroke="#fff" stroke-width="2" fill="none"/>
            <path d="M 180 140 Q 190 155 185 165" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
        `;
    } else if (type === 'triceratops') {
        accentColor = '#bd00ff';
        pathContent = `
            <path d="M 50 190 Q 80 140 140 130 Q 180 100 230 110 Q 270 120 280 160 Q 260 190 220 195 L 200 250 L 175 250 L 180 200 Q 130 205 100 240 L 75 240 L 85 190 Z" fill="url(#dinoGrad2)" stroke="${accentColor}" stroke-width="2"/>
            <path d="M 220 110 L 260 60 L 235 120" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 245 130 L 285 90 L 255 140" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M 270 155 L 295 145 L 275 165" stroke="#fff" stroke-width="3" fill="none"/>
            <circle cx="230" cy="135" r="4" fill="#fff"/>
        `;
    } else if (type === 'stegosaurus') {
        accentColor = '#ffcc00';
        pathContent = `
            <path d="M 40 180 Q 90 140 160 140 Q 220 140 260 175 L 280 190 L 250 200 Q 200 210 160 210 Q 110 210 70 240 L 50 240 Z" fill="url(#dinoGrad3)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Back plates -->
            <polygon points="90,140 105,100 120,140" fill="${accentColor}" opacity="0.8"/>
            <polygon points="130,135 150,85 170,135" fill="${accentColor}" opacity="0.9"/>
            <polygon points="180,138 200,90 220,138" fill="${accentColor}" opacity="0.9"/>
            <polygon points="225,145 240,110 255,150" fill="${accentColor}" opacity="0.8"/>
            <!-- Thagomizer spikes -->
            <line x1="40" y1="180" x2="15" y2="160" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <line x1="35" y1="185" x2="10" y2="180" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        `;
    } else if (type === 'brachiosaurus') {
        accentColor = '#00f0ff';
        pathContent = `
            <path d="M 50 220 Q 90 210 120 200 L 150 70 Q 165 40 180 45 Q 190 55 175 80 L 155 190 Q 220 190 250 210 L 250 260 L 230 260 L 230 220 Q 180 220 140 220 L 140 260 L 120 260 L 120 220 Q 80 230 50 220 Z" fill="url(#dinoGrad1)" stroke="${accentColor}" stroke-width="2"/>
            <circle cx="178" cy="50" r="3" fill="#fff"/>
        `;
    } else if (type === 'spinosaurus') {
        accentColor = '#10b981';
        pathContent = `
            <path d="M 40 200 Q 80 160 140 155 Q 210 150 270 170 L 290 185 L 250 195 Q 190 205 140 200 L 120 250 L 95 250 L 105 200 Z" fill="url(#dinoGrad2)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Sail -->
            <path d="M 100 160 Q 160 70 230 155 Z" fill="url(#dinoGrad1)" opacity="0.85" stroke="${accentColor}" stroke-width="2"/>
            <circle cx="265" cy="175" r="3.5" fill="#fff"/>
        `;
    } else if (type === 'ankylosaurus') {
        accentColor = '#f97316';
        pathContent = `
            <path d="M 40 180 Q 90 150 160 150 Q 230 150 270 180 L 250 210 Q 170 220 90 210 Z" fill="url(#dinoGrad3)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Armor bumps -->
            <circle cx="110" cy="165" r="6" fill="${accentColor}"/>
            <circle cx="150" cy="160" r="8" fill="${accentColor}"/>
            <circle cx="190" cy="165" r="7" fill="${accentColor}"/>
            <!-- Tail Club -->
            <ellipse cx="35" cy="180" rx="14" ry="10" fill="#fff"/>
        `;
    } else if (type === 'pteranodon') {
        accentColor = '#00f0ff';
        pathContent = `
            <!-- Wings -->
            <path d="M 160 150 L 40 80 Q 100 140 160 160 L 280 80 Q 220 140 160 160 Z" fill="url(#dinoGrad1)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Head crest -->
            <path d="M 160 130 L 140 90 L 165 140 L 180 150 Z" fill="${accentColor}"/>
            <circle cx="163" cy="142" r="3" fill="#fff"/>
        `;
    } else {
        // Raptor / General Theropod
        accentColor = '#bd00ff';
        pathContent = `
            <path d="M 40 210 Q 80 170 130 150 Q 180 120 230 120 L 260 135 L 220 150 Q 170 170 140 180 L 130 250 L 110 250 L 115 190 Q 70 210 40 210 Z" fill="url(#dinoGrad2)" stroke="${accentColor}" stroke-width="2"/>
            <!-- Sickle claw -->
            <path d="M 125 245 Q 140 240 135 255" stroke="#fff" stroke-width="4" fill="none"/>
            <circle cx="240" cy="128" r="3.5" fill="#fff"/>
        `;
    }

    return `
        <svg viewBox="0 0 320 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="dinoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#bd00ff" stop-opacity="0.4"/>
                </linearGradient>
                <linearGradient id="dinoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#bd00ff" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#ffcc00" stop-opacity="0.4"/>
                </linearGradient>
                <linearGradient id="dinoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffcc00" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.4"/>
                </linearGradient>
                <filter id="neonGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <!-- Background Grid & Fossil Aura -->
            <circle cx="160" cy="150" r="110" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="4,6" opacity="0.3"/>
            <circle cx="160" cy="150" r="85" fill="none" stroke="#fff" stroke-width="1" opacity="0.1"/>

            <g filter="url(#neonGlow)">
                ${pathContent}
            </g>

            <!-- Dinosaur Specimen Badge -->
            <rect x="20" y="240" width="120" height="24" rx="6" fill="rgba(14,17,30,0.8)" stroke="${accentColor}" stroke-width="1"/>
            <text x="30" y="256" font-family="'Orbitron', sans-serif" font-size="10" fill="${accentColor}" font-weight="700">FOSSIL #${Math.floor(Math.random()*900)+100}</text>
        </svg>
    `;
}

// ── Game State Variables ───────────────────────────────────────────────────
const TOTAL_QUESTIONS = 25;
const QUESTION_TIME_LIMIT = 15; // seconds

let currentRoundQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let correctCount = 0;
let timerInterval = null;
let timeLeft = QUESTION_TIME_LIMIT;
let isAnswered = false;

let lifelines = {
    fifty: 1,
    hint: 2,
    freeze: 1
};

// ── DOM Elements ───────────────────────────────────────────────────────────
const startScreen       = document.getElementById('startScreen');
const quizScreen        = document.getElementById('quizScreen');
const resultsScreen     = document.getElementById('resultsScreen');

const startQuizBtn      = document.getElementById('startQuizBtn');
const openLeaderboardBtn= document.getElementById('openLeaderboardBtn');
const soundToggleBtn    = document.getElementById('soundToggleBtn');

const currentScoreEl    = document.getElementById('currentScore');
const currentStreakEl   = document.getElementById('currentStreak');

const questionCounterEl = document.getElementById('questionCounter');
const accuracyTagEl     = document.getElementById('accuracyTag');
const progressBarFill   = document.getElementById('progressBarFill');

const timerBadge        = document.getElementById('timerBadge');
const timerCircle       = document.getElementById('timerCircle');
const timerText         = document.getElementById('timerText');

const lifelineFifty     = document.getElementById('lifelineFifty');
const lifelineHint      = document.getElementById('lifelineHint');
const lifelineFreeze    = document.getElementById('lifelineFreeze');

const countFifty        = document.getElementById('countFifty');
const countHint         = document.getElementById('countHint');
const countFreeze       = document.getElementById('countFreeze');

const dinoVisual        = document.getElementById('dinoVisual');
const hintOverlay       = document.getElementById('hintOverlay');
const hintText          = document.getElementById('hintText');
const choicesGrid       = document.getElementById('choicesGrid');

const factModal         = document.getElementById('factModal');
const factStatusBadge   = document.getElementById('factStatusBadge');
const factDinoName      = document.getElementById('factDinoName');
const factEra           = document.getElementById('factEra');
const factDiet          = document.getElementById('factDiet');
const factSize          = document.getElementById('factSize');
const factTextEl        = document.getElementById('factText');
const nextQuestionBtn   = document.getElementById('nextQuestionBtn');

const resFinalScore     = document.getElementById('resFinalScore');
const resAccuracy       = document.getElementById('resAccuracy');
const resBestStreak     = document.getElementById('resBestStreak');
const resCorrect        = document.getElementById('resCorrect');
const rankIcon          = document.getElementById('rankIcon');
const rankTitle         = document.getElementById('rankTitle');
const playerNameInput   = document.getElementById('playerNameInput');
const submitScoreBtn    = document.getElementById('submitScoreBtn');
const submitFeedback    = document.getElementById('submitFeedback');
const playAgainBtn      = document.getElementById('playAgainBtn');
const viewLeaderboardResultsBtn = document.getElementById('viewLeaderboardResultsBtn');

const leaderboardModal  = document.getElementById('leaderboardModal');
const closeLeaderboardBtn= document.getElementById('closeLeaderboardBtn');
const closeLeaderboardFooterBtn = document.getElementById('closeLeaderboardFooterBtn');
const leaderboardTbody  = document.getElementById('leaderboardTbody');

// ── Initialize Event Listeners ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    startQuizBtn.addEventListener('click', () => {
        playSound('click');
        startNewRound();
    });

    openLeaderboardBtn.addEventListener('click', () => {
        playSound('click');
        openLeaderboard();
    });

    viewLeaderboardResultsBtn.addEventListener('click', () => {
        playSound('click');
        openLeaderboard();
    });

    closeLeaderboardBtn.addEventListener('click', () => {
        playSound('click');
        leaderboardModal.classList.add('hidden');
    });

    closeLeaderboardFooterBtn.addEventListener('click', () => {
        playSound('click');
        leaderboardModal.classList.add('hidden');
    });

    playAgainBtn.addEventListener('click', () => {
        playSound('click');
        startNewRound();
    });

    nextQuestionBtn.addEventListener('click', () => {
        playSound('click');
        factModal.classList.add('hidden');
        advanceToNextQuestion();
    });

    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggleBtn.innerHTML = soundEnabled 
            ? '<i class="fa-solid fa-volume-high"></i>'
            : '<i class="fa-solid fa-volume-xmark"></i>';
    });

    submitScoreBtn.addEventListener('click', handleScoreSubmission);

    // Lifeline buttons
    lifelineFifty.addEventListener('click', useFiftyFifty);
    lifelineHint.addEventListener('click', useHint);
    lifelineFreeze.addEventListener('click', useTimeFreeze);
});

// ── Game Logic ─────────────────────────────────────────────────────────────
function startNewRound() {
    score = 0;
    streak = 0;
    bestStreak = 0;
    correctCount = 0;
    currentQuestionIndex = 0;

    lifelines = { fifty: 1, hint: 2, freeze: 1 };
    updateLifelineUI();

    // Shuffle & Pick 25 Questions
    const shuffled = [...DINOSAURS].sort(() => 0.5 - Math.random());
    currentRoundQuestions = shuffled.slice(0, TOTAL_QUESTIONS);

    updateHeaderUI();

    startScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion(0);
}

function loadQuestion(index) {
    isAnswered = false;
    currentQuestionIndex = index;
    const currentDino = currentRoundQuestions[index];

    // Update Progress UI
    questionCounterEl.textContent = index + 1;
    const pct = ((index + 1) / TOTAL_QUESTIONS) * 100;
    progressBarFill.style.width = `${pct}%`;
    const accuracy = index > 0 ? Math.round((correctCount / index) * 100) : 100;
    accuracyTagEl.textContent = `${accuracy}% Accuracy`;

    // Render Dino Visual
    dinoVisual.innerHTML = renderDinoSVG(currentDino);
    hintOverlay.classList.add('hidden');

    // Generate 4 Choices (1 Correct + 3 Distractors)
    const distractors = DINOSAURS
        .filter(d => d.name !== currentDino.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    const allChoices = [currentDino, ...distractors].sort(() => 0.5 - Math.random());

    choicesGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    allChoices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.setAttribute('data-letter', letters[i]);
        btn.setAttribute('data-name', choice.name);
        btn.textContent = choice.name;
        btn.addEventListener('click', () => handleAnswerSelect(choice.name, currentDino.name, btn));
        choicesGrid.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = QUESTION_TIME_LIMIT;
    timerBadge.classList.remove('warning');
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 3) {
            timerBadge.classList.add('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    timerText.textContent = timeLeft;
    const dash = (timeLeft / QUESTION_TIME_LIMIT) * 100;
    timerCircle.setAttribute('stroke-dasharray', `${dash}, 100`);
}

function handleAnswerSelect(selectedName, correctName, btn) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    const isCorrect = (selectedName === correctName);

    // Disable all choice buttons
    const allBtns = choicesGrid.querySelectorAll('.choice-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-name') === correctName) {
            b.classList.add('correct');
        }
    });

    if (isCorrect) {
        btn.classList.add('correct');
        playSound('correct');
        correctCount++;
        streak++;
        if (streak > bestStreak) bestStreak = streak;

        // Base points (100) + Time bonus (timeLeft * 10) + Streak bonus (streak * 20)
        const roundPoints = 100 + (timeLeft * 10) + (streak * 20);
        score += roundPoints;
    } else {
        btn.classList.add('incorrect');
        playSound('wrong');
        streak = 0;
    }

    updateHeaderUI();

    // Delay 1s then show Fact Modal
    setTimeout(() => {
        showFactModal(currentRoundQuestions[currentQuestionIndex], isCorrect);
    }, 1000);
}

function handleTimeOut() {
    if (isAnswered) return;
    isAnswered = true;

    playSound('wrong');
    streak = 0;
    updateHeaderUI();

    const currentDino = currentRoundQuestions[currentQuestionIndex];
    const allBtns = choicesGrid.querySelectorAll('.choice-btn');
    allBtns.forEach(b => {
        b.disabled = true;
        if (b.getAttribute('data-name') === currentDino.name) {
            b.classList.add('correct');
        }
    });

    setTimeout(() => {
        showFactModal(currentDino, false, true);
    }, 1000);
}

function showFactModal(dino, isCorrect, isTimeout = false) {
    if (isCorrect) {
        factStatusBadge.className = 'fact-status-badge correct-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> CORRECT!';
    } else if (isTimeout) {
        factStatusBadge.className = 'fact-status-badge incorrect-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-hourglass-end"></i> TIME EXPIRED!';
    } else {
        factStatusBadge.className = 'fact-status-badge incorrect-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> INCORRECT!';
    }

    factDinoName.textContent = dino.name;
    factEra.textContent = dino.era;
    factDiet.textContent = dino.diet;
    factSize.textContent = dino.size;
    factTextEl.textContent = dino.fact;

    factModal.classList.remove('hidden');
}

function advanceToNextQuestion() {
    if (currentQuestionIndex + 1 < TOTAL_QUESTIONS) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        endRound();
    }
}

function endRound() {
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');

    playSound('fanfare');

    const accuracyPct = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

    resFinalScore.textContent = score.toLocaleString();
    resAccuracy.textContent = `${accuracyPct}%`;
    resBestStreak.textContent = `${bestStreak}🔥`;
    resCorrect.textContent = `${correctCount} / ${TOTAL_QUESTIONS}`;

    // Calculate Rank
    if (accuracyPct >= 95) {
        rankIcon.textContent = '👑';
        rankTitle.textContent = 'S+ RANK — APEX PALEONTOLOGIST';
    } else if (accuracyPct >= 80) {
        rankIcon.textContent = '🏆';
        rankTitle.textContent = 'S RANK — DINO MASTER';
    } else if (accuracyPct >= 60) {
        rankIcon.textContent = '🥇';
        rankTitle.textContent = 'A RANK — FOSSIL EXPERT';
    } else if (accuracyPct >= 40) {
        rankIcon.textContent = '🥈';
        rankTitle.textContent = 'B RANK — DINO EXPLORER';
    } else {
        rankIcon.textContent = '🦕';
        rankTitle.textContent = 'C RANK — DINO NOVICE';
    }

    // Save High Score to localStorage
    const stored = parseInt(localStorage.getItem('dino_quiz_high_score') || '0', 10);
    if (score > stored) {
        localStorage.setItem('dino_quiz_high_score', score.toString());
    }

    // Pre-fill Player Name if signed in or saved
    const savedName = localStorage.getItem('dino_quiz_player_name') || window.parent._arcadeUser?.displayName || 'Guest Dino Hunter';
    playerNameInput.value = savedName;
    submitFeedback.textContent = '';
}

// ── Lifelines Implementation ───────────────────────────────────────────────
function useFiftyFifty() {
    if (lifelines.fifty <= 0 || isAnswered) return;
    lifelines.fifty--;
    updateLifelineUI();
    playSound('lifeline');

    const currentDino = currentRoundQuestions[currentQuestionIndex];
    const allBtns = Array.from(choicesGrid.querySelectorAll('.choice-btn'));
    
    const incorrectBtns = allBtns.filter(b => b.getAttribute('data-name') !== currentDino.name);
    // Remove 2 incorrect buttons
    const toRemove = incorrectBtns.sort(() => 0.5 - Math.random()).slice(0, 2);
    toRemove.forEach(b => {
        b.disabled = true;
        b.classList.add('dimmed');
    });
}

function useHint() {
    if (lifelines.hint <= 0 || isAnswered) return;
    lifelines.hint--;
    updateLifelineUI();
    playSound('lifeline');

    const currentDino = currentRoundQuestions[currentQuestionIndex];
    hintText.textContent = `HINT — ERA: ${currentDino.era} | DIET: ${currentDino.diet}`;
    hintOverlay.classList.remove('hidden');
}

function useTimeFreeze() {
    if (lifelines.freeze <= 0 || isAnswered) return;
    lifelines.freeze--;
    updateLifelineUI();
    playSound('lifeline');

    timeLeft += 10;
    updateTimerUI();
}

function updateLifelineUI() {
    countFifty.textContent = lifelines.fifty;
    countHint.textContent = lifelines.hint;
    countFreeze.textContent = lifelines.freeze;

    lifelineFifty.disabled = lifelines.fifty <= 0;
    lifelineHint.disabled = lifelines.hint <= 0;
    lifelineFreeze.disabled = lifelines.freeze <= 0;
}

function updateHeaderUI() {
    currentScoreEl.textContent = score.toLocaleString();
    currentStreakEl.textContent = `${streak}×`;
}

// ── Leaderboard Submission & Fetching ──────────────────────────────────────
async function handleScoreSubmission() {
    const playerName = playerNameInput.value.trim() || 'Anonymous Explorer';
    localStorage.setItem('dino_quiz_player_name', playerName);
    submitScoreBtn.disabled = true;
    submitFeedback.textContent = "Submitting score to Leaderboard...";

    const entry = {
        name: playerName,
        score: score,
        accuracy: Math.round((correctCount / TOTAL_QUESTIONS) * 100),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Date.now()
    };

    // 1. Save to Local High Scores
    let localLb = JSON.parse(localStorage.getItem('dino_quiz_leaderboard') || '[]');
    localLb.push(entry);
    localLb.sort((a, b) => b.score - a.score);
    localLb = localLb.slice(0, 20);
    localStorage.setItem('dino_quiz_leaderboard', JSON.stringify(localLb));

    // 2. Try Firestore Push
    if (db) {
        try {
            await addDoc(collection(db, 'dino-quiz-leaderboard'), entry);
            submitFeedback.textContent = "✅ High Score successfully posted to Global Leaderboard!";
        } catch (e) {
            console.warn("Firestore error:", e);
            submitFeedback.textContent = "✅ Score saved to Local Leaderboard!";
        }
    } else {
        submitFeedback.textContent = "✅ Score saved to Local Leaderboard!";
    }
}

async function openLeaderboard() {
    leaderboardModal.classList.remove('hidden');
    leaderboardTbody.innerHTML = `<tr><td colspan="5" class="lb-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading Leaderboard...</td></tr>`;

    let entries = [];

    if (db) {
        try {
            const q = query(collection(db, 'dino-quiz-leaderboard'), orderBy('score', 'desc'), limit(15));
            const snap = await getDocs(q);
            snap.forEach(docSnap => {
                entries.push(docSnap.data());
            });
        } catch (e) {
            console.warn("Falling back to local leaderboard:", e);
        }
    }

    if (entries.length === 0) {
        entries = JSON.parse(localStorage.getItem('dino_quiz_leaderboard') || '[]');
    }

    // Default Demo Entries if empty
    if (entries.length === 0) {
        entries = [
            { name: "Dr. Alan Grant", score: 4850, accuracy: 100, date: "Aug 15, 2026" },
            { name: "Ellie Sattler", score: 4620, accuracy: 96, date: "Aug 15, 2026" },
            { name: "Ian Malcolm", score: 4100, accuracy: 92, date: "Aug 14, 2026" },
            { name: "Eric F.", score: 3950, accuracy: 88, date: "Aug 14, 2026" },
            { name: "Guest Explorer", score: 3200, accuracy: 80, date: "Aug 13, 2026" }
        ];
    }

    renderLeaderboardRows(entries);
}

function renderLeaderboardRows(entries) {
    if (entries.length === 0) {
        leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;">No high scores yet! Be the first to play!</td></tr>`;
        return;
    }

    const rows = entries.map((item, index) => {
        let rankBadge = `${index + 1}`;
        if (index === 0) rankBadge = '🥇 1st';
        else if (index === 1) rankBadge = '🥈 2nd';
        else if (index === 2) rankBadge = '🥉 3rd';

        return `
            <tr>
                <td><strong>${rankBadge}</strong></td>
                <td>${escapeHTML(item.name)}</td>
                <td><strong style="color:var(--cyan);">${item.score.toLocaleString()}</strong></td>
                <td>${item.accuracy}%</td>
                <td style="color:var(--text-dim);font-size:0.8rem;">${item.date || 'Today'}</td>
            </tr>
        `;
    }).join('');

    leaderboardTbody.innerHTML = rows;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, match => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
}
