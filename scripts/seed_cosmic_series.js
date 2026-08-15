const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');
const { execSync } = require('child_process');

let serviceAccount;
try {
    serviceAccount = require('./serviceAccount.json');
} catch (e) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        console.error('❌ Missing serviceAccount.json');
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'eric-arcade.firebasestorage.app'
    });
}

const db = admin.firestore();

// ── Episode 1 Content for The Cosmic Treehouse Explorers ──────────────────
const EPISODE_1 = {
    episodeNumber: 1,
    title: 'The Crystal Nebulae Rescue',
    hybrids: ['Spark (Electric Sprite)', 'Crystal Emberfox'],
    summary: 'Leo, Maya, and Spark open the treehouse star-portal into Sector 4 — The Crystal Nebulae — where a rare glowing Emberfox is trapped inside an ancient energy grid. By deciphering ancient light codes and harnessing Spark’s electrical boost, they free the creature and catalog their first cosmic rescue.',
    content: `**Welcome to The Cosmic Treehouse Explorers!**

The oak tree in Leo and Maya’s backyard looked like any ordinary treehouse from the outside. But behind the bookshelf on the top floor hid a humming brass console embedded with glowing starlight dials. 

"Portal alignment locked," ten-year-old Leo declared, adjusting his star-chart goggles. His map screen glowed with blue grid lines showing Sector 4 — a floating cluster of glowing purple asteroids known as the Crystal Nebulae. "Route is clear, Maya. We’ve got twenty minutes before the atmospheric shift."

Nine-year-old Maya tapped her modified encyclopedia tablet, her eyes lighting up. "Sensors are picking up a distress pulse! It's a Crystal Emberfox — a rare elemental creature whose fur glows like molten sapphire. Its tail is trapped in an ancient orbital energy grid!"

Suddenly, a bright yellow fluffball zapped across the console with a cheery *BZZZT!* Spark, their energetic companion creature, did a mid-air somersault, sparking tiny harmless blue lightning bolts from his fluffy ears. 

"Stay focused, Sparky," Maya laughed, scratching him behind the ears. "No chasing shiny space-dust today!"

Leo pulled the main lever. With a soft chime, the treehouse trapdoor opened into swirling violet starlight. The trio stepped through the portal onto a floating crystal platform. The air smelled like ozone and fresh rain. 

Fifty yards away, the Emberfox whimpered. It was trapped inside a glowing cage made of interlocking light beams. Above the cage rested an ancient alien lock wheel covered in glowing geometric symbols.

"The barrier is locked with a light-frequency cipher," Maya noted, scanning the glyphs with her tablet. "We need to align three matching energy colors — Red, Teal, and Gold — in exact sequence to disarm the power field!"

"I've got the route," Leo called out, studying the power conduit lines running under the crystal floor. "If we redirect the energy from the main conduit, the lock wheel will rotate. But we need a high-voltage surge to jumpstart the circuit board."

"Spark, that's your cue!" Maya pointed to the primary power socket on the side of the lock pedestal. 

Spark chirped eagerly, hovering over the socket. But just as he prepared to discharge, a shimmering silver space-beetle buzzed past his nose. Spark's eyes widened. *BZZZT!* He zoomed off, chasing the shiny beetle around a floating crystal spire.

"Spark, no!" Leo groaned. "Come back!"

Maya pulled a shiny foil wrapper from her pocket and held it in the sunlight. "Over here, Sparky! Check out this ultra-shiny prize!"

Spark froze mid-air, zipped back instantly, and landed squarely on the socket, mesmerized by the foil. *ZAPPP!* A bright golden surge of electricity shot from Spark's ears directly into the pedestal!

The lock wheel spun rapidly. Maya tapped the glowing glyphs in order: "Triangle! Diamond! Spiral!"

*CLACK-ZRRRT!* 

The purple light beams dissolved into sparkling starlight dust. The Crystal Emberfox bounded out of the cage, nuzzling Maya’s hand before doing a joyful leap into the sky. Maya’s tablet chimed as it recorded the creature's data: *Rescue Cataloged: Crystal Emberfox — Status: Safe.*

"Great teamwork," Leo smiled, tapping his star-chart. "First rescue of the day is a success!"

Suddenly, Maya’s tablet beeped with a deep crimson alert. "Leo, look! Sector 9 just activated — the Floating Lava Isles. And whatever is trapped there is twice as big!"

Leo grinned, adjusting his goggles. "Set coordinates for Sector 9. The adventure is just getting started!"`,
    imagePrompt: 'Cinematic 8k movie still, photorealistic concept art: Two clever kid explorers (Leo and Maya) and a cute glowing yellow electric creature (Spark) standing inside a secret treehouse portal looking out at a magnificent floating crystal asteroid nebulae in deep space. Glowing purple crystals, starlight fog, sci-fi adventure, Pixar meets Star Wars concept art.',
};

async function generateAudio(text, epNum) {
    const cleanText = text
        .replace(/#+/g, '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/---/g, '');

    const tmpTxt = path.join(__dirname, `tmp_cosmic_${epNum}.txt`);
    const tmpMp3 = path.join(__dirname, `tmp_cosmic_${epNum}.mp3`);
    fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

    console.log('🎙️ Synthesizing Studio Audio using en-US-AndrewMultilingualNeural...');
    execSync(`python -m edge_tts --file "${tmpTxt}" --voice en-US-AndrewMultilingualNeural --rate="-3%" --write-media "${tmpMp3}"`);

    const destMp3 = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', `cosmic-episode-001.mp3`);
    const audDir = path.dirname(destMp3);
    if (!fs.existsSync(audDir)) fs.mkdirSync(audDir, { recursive: true });
    fs.copyFileSync(tmpMp3, destMp3);

    try { fs.unlinkSync(tmpTxt); fs.unlinkSync(tmpMp3); } catch {}
    console.log(`✅ Studio Audio saved to: games/dino-island-story/audio/cosmic-episode-001.mp3`);
    return 'audio/cosmic-episode-001.mp3';
}

async function generateImage(epNum) {
    const prompt = 'Cinematic 8k movie still, photorealistic Pixar Pixar-style sci-fi concept art: Two brilliant kid explorers Leo and Maya with their fluffy glowing yellow electric pet Spark inside a secret cosmic treehouse portal staring at floating crystal asteroids in space. Glowing violet nebulae, starlight beams, high resolution.';
    console.log('🎨 Generating ultra-HD Photorealistic Flux AI cover image...');
    const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&model=flux-realism&nologo=true&enhance=true&seed=99991`;
    const res = await fetch(pollUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error('Image fetch failed');
    const ab = await res.arrayBuffer();
    const buffer = Buffer.from(ab);

    const destCover = path.join(__dirname, '..', 'games', 'dino-island-story', 'images', `cosmic-treehouse-cover.png`);
    const destEp    = path.join(__dirname, '..', 'games', 'dino-island-story', 'images', `cosmic-episode-001.jpg`);
    const imgDir = path.dirname(destCover);
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

    fs.writeFileSync(destCover, buffer);
    fs.writeFileSync(destEp, buffer);
    console.log('🖼️ Cover & Episode 1 images saved to games/dino-island-story/images/');
    return 'images/cosmic-episode-001.jpg';
}

async function run() {
    console.log('🚀 Seeding Series 2: The Cosmic Treehouse Explorers...');

    const audioUrl = await generateAudio(EPISODE_1.content, 1);
    const imageUrl = await generateImage(1);

    const wordCount = EPISODE_1.content.split(/\s+/).length;

    // Save to Firestore under cosmic-treehouse/episodes/all/episode-001
    const epRef = db.collection('cosmic-treehouse').doc('episodes').collection('all').doc('episode-001');
    await epRef.set({
        episodeNumber: 1,
        title: EPISODE_1.title,
        hybrids: EPISODE_1.hybrids,
        content: EPISODE_1.content,
        wordCount,
        summary: EPISODE_1.summary,
        imageUrl,
        audioUrl,
        imagePrompt: EPISODE_1.imagePrompt,
        ratingSum: 5,
        ratingCount: 1,
        averageRating: 5.0,
        publishedAt: new Date().toISOString()
    }, { merge: true });

    // Save series metadata
    await db.collection('cosmic-treehouse').doc('story').set({
        totalEpisodes: 1,
        latestEpisodeNumber: 1,
        latestEpisodeTitle: EPISODE_1.title,
        lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('🎉 Series 2 Episode 1 successfully created and saved to Firestore!');
    process.exit(0);
}

run().catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
});
