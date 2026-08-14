// ==========================================================================
// Seed Script — Seeds Episode 1 directly into Firestore
// Run locally: node seed.js
//
// Requires FIREBASE_SERVICE_ACCOUNT env var OR a local serviceAccount.json
// ==========================================================================

const admin = require('firebase-admin');

// Support both env var (CI/prod) and local file (dev)
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
} else {
    try {
        const sa = require('./serviceAccount.json');
        credential = admin.credential.cert(sa);
    } catch {
        console.error('❌ No credentials found. Set FIREBASE_SERVICE_ACCOUNT env var or place serviceAccount.json in scripts/.');
        process.exit(1);
    }
}

admin.initializeApp({ credential, projectId: 'eric-arcade' });
const db = admin.firestore();

// ==========================================================================
// Episode 1 Content
// ==========================================================================
const CONTENT = `**Previously on Isla Fragmentum...** There is no "previously." This is where it begins.

**Episode 1: The Breaking of Lab 7**

The storm hit Isla Fragmentum at 11:43 PM.

It came without warning — a wall of black cloud that swallowed the stars and turned the Pacific into a boiling sheet of foam. Lightning split the sky in three-second intervals, each flash illuminating the jagged volcanic peaks at the island's center. In the jungle below, creatures that had never known fear shrank into the undergrowth and did not move.

Dr. Vera Osei barely noticed. She was four levels underground, standing in front of a reinforced observation window the size of a school bus, staring at the thing they had made.

Lab 7 smelled of ozone and old blood.

The habitat was enormous — a concrete cavern the size of an aircraft hangar, fitted with drainage channels, feeding troughs, and reinforced walls embedded with impact-absorbing gel panels. They'd had to rebuild it three times in the past eighteen months. Each time, the creature inside had found a new way to test its limits.

The creature they called D-Rex.

Distortus Rex. Subject Alpha-7. Four years, two months, and eleven days of development, splicing the genetic material of three apex predators into a single living body. T-Rex for raw power. Spinosaurus for aquatic adaptability and spine structure. Velociraptor for neural density, problem-solving, and speed.

The result stood twelve meters tall at the shoulder.

One arm was longer than the other — a developmental asymmetry they hadn't intended and couldn't explain — ending in six-fingered hands with claws that could rend quarter-inch steel plate like cardboard. A ridge of bony fins ran down its spine, each one edged with keratin so dense the electron microscopes had bounced off it. Its eyes, when they caught the fluorescent light just right, burned amber, like old embers refusing to die.

It was lying down right now. That was unusual.

Vera pressed her palm to the glass. "What are you thinking?"

"Dr. Osei."

She turned. Chief Alejandro Reyes stood in the doorway behind her, water still dripping from his rain gear, his expression carved from something harder than the island's volcanic rock. He was ex-military — she'd never learned which branch — and he ran Helix Corp's security division with the kind of quiet competence that made her deeply uncomfortable.

"The storm's knocked out the external perimeter sensors," he said. "Northern quadrant. My team's working on it."

"And the internal systems?"

"Running on backup." He crossed the room to stand beside her, looking through the glass. "It's been still for two hours. That's not normal."

"No," Vera agreed. "It's not."

D-Rex opened one amber eye.

For a moment — just a moment — the eye fixed on Vera's through the reinforced glass, and she felt a cold certainty settle in her chest. That wasn't the gaze of an animal. It was something calculating. Something that had been waiting.

"Reyes," she said quietly. "We should—"

The habitat floor cracked.

Not broke. Cracked — a sound like a gunshot, amplified through the concrete and steel until it rattled the fillings in Vera's teeth. D-Rex was upright before the sound finished echoing, moving with terrifying speed for something its size, those enormous legs driving it across the habitat floor in three bounding strides.

It hit the eastern wall with both hands.

The gel panels absorbed the first impact. The second fractured them. The third punched straight through.

Alarms — every alarm, all at once. Red emergency lights strobed through the observation chamber and Vera stumbled backward as Reyes grabbed her arm.

"Move!" he barked. "Move now!"

They ran. Behind them, the sound of tearing metal filled the world.

The backup power systems were only designed to handle Tier-1 security protocols. Nobody had designed a Tier-1 protocol for the possibility that Lab 7 might simply cease to exist as a structural concept.

D-Rex emerged from the eastern wall of the habitat like something being born — which, in a way, it was. Concrete dust billowed in choking clouds. Reinforced rebar bent outward like flower petals. The emergency lighting painted it in strobing red, and for one frozen second the security team on Level 3 saw it clearly: the massive asymmetrical frame, the spinal fins spread wide like a war banner, the amber eyes blazing with something ancient and newly furious.

Sergeant Tomás Banda had seventeen years of security experience. He raised his tranquilizer rifle.

D-Rex looked directly at him.

Banda lowered the rifle.

Some part of his brain — the part that had kept his ancestors alive on the African savanna thirty thousand years ago — simply overrode his training. Every nerve in his body said: *do not become a threat to this thing.*

D-Rex stepped over him.

Fourteen people on three levels, and it stepped over every single one of them.

It was looking for something else.

---

Vera found the emergency shaft on Level 2 and dragged Reyes into it ahead of her. They climbed — four levels, then five — emerging into the storm-lashed surface of the island gasping and rain-soaked.

"The containment protocols—" Vera started.

"Are useless," Reyes said flatly. He was already on his radio. "All units, Alpha-7 has breached Lab 7. Do not engage. Repeat — do not engage. Establish visual only and maintain distance."

But D-Rex wasn't in the facility anymore.

Vera turned. At the tree line, seventy meters away, she caught one last glimpse: a massive silhouette against the lightning-split sky, spinal fins raised, head turning once toward her as if in acknowledgment.

Then it was gone. Into the jungle. Into the dark. The storm swallowed it whole.

Somewhere in the jungle ahead, something enormous moved between the trees, and the island — the whole dark breathing weight of it — seemed to shiver in reply.

This was not an escape.

This was a beginning.`;

const EPISODE_1 = {
    episodeNumber: 1,
    title:         'The Breaking of Lab 7',
    hybrids:       ['D-Rex'],
    wordCount:     2247,
    content:       CONTENT,
    imageUrl:      null,
    imagePrompt:   'Cinematic concept art: D-Rex, a massive asymmetrical hybrid dinosaur with glowing amber eyes and razor spinal fins, bursting through a concrete research facility wall at night. Red emergency strobe lights, lightning in the stormy sky above the tropical jungle, scientists fleeing. Bioluminescent plants at the jungle edge, volcanic peaks silhouetted against storm clouds. Photorealistic, Jurassic Park meets Pacific Rim, dramatic wide shot.',
    summary:       'D-Rex breaks out of Lab 7 during a Pacific storm by exploiting the backup power failure. Dr. Vera Osei and Chief Reyes witness the escape. D-Rex steps over all security personnel without harming them, then vanishes into the jungle. Vera feels conflicted awe at its intelligence and will to survive.',
    ratingSum:     0,
    ratingCount:   0,
    averageRating: 0,
    publishedAt:   new Date().toISOString(),
};

const RUNNING_SUMMARY = `Episode 1: D-Rex (Distortus Rex, Subject Alpha-7) escapes from Lab 7 on Isla Fragmentum during a Pacific storm. A twelve-meter apex hybrid of T-Rex, Spinosaurus, and Velociraptor DNA, D-Rex exploits a backup power failure to breach its habitat wall. It moves through three security levels without harming any personnel, then vanishes into the island's jungle. Dr. Vera Osei (lead geneticist, D-Rex's creator) and Chief Reyes (head of security) witness the escape. Vera feels conflicted admiration for D-Rex's survival intelligence. D-Rex is now free on the island.`;

// ==========================================================================
// Run
// ==========================================================================
async function seed() {
    console.log('🌱 Seeding Episode 1 into Firestore...');

    const storyRef    = db.collection('dino-island').doc('story');
    const episodesRef = storyRef.collection('episodes');

    await episodesRef.doc('episode-001').set({
        ...EPISODE_1,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await storyRef.set({
        totalEpisodes:       1,
        runningSummary:      RUNNING_SUMMARY,
        lastGeneratedAt:     admin.firestore.FieldValue.serverTimestamp(),
        latestEpisodeTitle:  EPISODE_1.title,
        latestEpisodeNumber: 1,
    });

    console.log('✅ Episode 1 seeded! Title:', EPISODE_1.title);
    console.log('📖 Word count:', EPISODE_1.wordCount);
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
