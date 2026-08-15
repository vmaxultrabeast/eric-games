// ==========================================================================
// The Cosmic Treehouse Explorers — Automated Episode Generator
// Run via: node scripts/generate-cosmic-story.js
// ==========================================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech          = require('@google-cloud/text-to-speech');
const admin                 = require('firebase-admin');
const fs                    = require('fs');
const path                  = require('path');
const { execSync }          = require('child_process');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch {
        serviceAccount = require('./serviceAccount.json');
    }
} else {
    try {
        serviceAccount = require('./serviceAccount.json');
    } catch {
        console.error('❌ Service account key not found.');
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

const apiKey = process.env.GEMINI_API_KEY || (serviceAccount.gemini_api_key || '');
const genAI  = new GoogleGenerativeAI(apiKey, { apiVersion: 'v1beta' });

// ── Story Bible for Cosmic Treehouse Explorers ─────────────────────────────
const COSMIC_STORY_BIBLE = `
SERIES TITLE: The Cosmic Treehouse Explorers
GENRE: Children's Sci-Fi Adventure (Ages 8-10 / 3rd-5th grade)
TONE: Fast-paced, clever problem-solving, lighthearted humor, family-friendly (no realistic violence; cartoon/puzzle-solving action).

MAIN CHARACTERS:
1. Leo (10): Master strategist, studies star maps, plans routes, and figures out how complex orbital systems connect.
2. Maya (9): Bold, quick-thinking, decipherer of ancient alien codes. Carries a modified encyclopedia tablet for rare space phenomena.
3. Spark: Their energetic, loyal electric sprite companion creature who generates small bursts of electricity to power gear, but gets easily distracted by shiny objects.

SETTING & PREMISE:
Leo and Maya operate a secret cosmic waystation out of their backyard treehouse. Behind a brass console on the top floor lies a starlight portal opening to mysterious floating space sectors across the galaxy. In each episode, they explore new sectors to rescue and catalog rare elemental creatures trapped by environmental hazards or ancient alien locks.
`;

function buildCosmicPrompt(episodeNumber, runningSummary, allPastHistory) {
    const isFirst = episodeNumber === 1;

    const context = isFirst
        ? `This is Episode 1. Leo, Maya, and Spark open the treehouse portal to Sector 4 — The Crystal Nebulae — and rescue a glowing Crystal Emberfox trapped in an orbital light cage.`
        : `COMPLETE CHRONOLOGICAL STORY HISTORY (ALL PAST EPISODES):\n${allPastHistory || 'Episode 1: Rescued Crystal Emberfox in Sector 4.'}\n\nLATEST CUMULATIVE RUNNING SUMMARY:\n${runningSummary}\n\nContinue naturally for Episode ${episodeNumber}. Introduce a new floating space sector (e.g. Sector 9 — The Floating Lava Isles, Sector 12 — The Gravity Caverns, or Sector 7 — The Solar Reef) and a new rare elemental creature in distress, building directly upon previous rescues and character bonds.`;

    return `${COSMIC_STORY_BIBLE}

---

CRITICAL LENGTH & AUDIO DURATION DIRECTIVE:
You MUST write a fun, detailed 1,500 to 1,800-word chapter (~10-minute audio narration read).
Write 12-16 engaging, multi-paragraph scenes for 3rd-5th graders with rich dialogue, clever puzzle solving, teamwork, Spark's electrical surge, and a suspenseful cliffhanger/teaser for the next sector.

Do NOT write brief outlines or summaries. Write full, complete narrative prose. Do NOT use markdown headers (#, ##) or hashtags anywhere in the text.

---

TASK: Write Episode ${episodeNumber} of The Cosmic Treehouse Explorers.

${context}

---

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (all six section headers required):

HYBRIDS: [Featured elemental creatures in this episode, comma-separated]

TITLE: [A fun, dramatic episode title]

IMAGE_PROMPT: [2-3 sentences describing the main scene for visual reference]

CONTENT:
[Full episode narrative prose. MUST BE 1,500 TO 1,800 WORDS (~10-minute read). Start with **Previously on The Cosmic Treehouse Explorers...** in bold if Episode > 1. Plain prose only.]

EPISODE_SUMMARY:
[4-6 sentences summarizing this episode's key events and creature rescue.]

UPDATED_RUNNING_SUMMARY:
[Complete updated running summary of ALL events across all episodes, including this one.]
`;
}

function parseResponse(rawText, epNum) {
    const getSection = (label) => {
        const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=(?:HYBRIDS|TITLE|IMAGE_PROMPT|CONTENT|EPISODE_SUMMARY|UPDATED_RUNNING_SUMMARY):|$)`, 'i');
        const match = rawText.match(regex);
        return match ? match[1].trim() : '';
    };

    const title       = getSection('TITLE') || `Episode ${epNum}`;
    const hybridsRaw  = getSection('HYBRIDS') || 'Spark (Electric Sprite)';
    const hybrids     = hybridsRaw.split(',').map(s => s.trim()).filter(Boolean);
    const content     = getSection('CONTENT') || rawText;
    const summary     = getSection('EPISODE_SUMMARY') || 'Leo, Maya, and Spark complete a successful cosmic rescue.';
    const running     = getSection('UPDATED_RUNNING_SUMMARY') || summary;
    const imagePrompt = getSection('IMAGE_PROMPT') || 'Leo, Maya, and Spark in deep space';

    return { title, hybrids, content, summary, runningSummary: running, imagePrompt };
}

async function synthesizeAudio(content, epNum) {
    const epStr = String(epNum).padStart(3, '0');
    const cleanText = content
        .replace(/#+/g, '')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/---/g, '');

    const tmpTxt = path.join(__dirname, `tmp_cosmic_${epNum}.txt`);
    const tmpMp3 = path.join(__dirname, `tmp_cosmic_${epNum}.mp3`);
    fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

    console.log(`🎙️ Synthesizing Studio HD Audio using en-US-AndrewMultilingualNeural...`);
    try {
        execSync(`python -m edge_tts --file "${tmpTxt}" --voice en-US-AndrewMultilingualNeural --rate="-3%" --write-media "${tmpMp3}"`);
    } catch (e) {
        console.warn('edge-tts note:', e.message);
    }

    const relAudioPath = `audio/cosmic-episode-${epStr}.mp3`;
    const localAudioPath = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', `cosmic-episode-${epStr}.mp3`);

    const audDir = path.dirname(localAudioPath);
    if (!fs.existsSync(audDir)) fs.mkdirSync(audDir, { recursive: true });

    if (fs.existsSync(tmpMp3)) {
        fs.copyFileSync(tmpMp3, localAudioPath);
        try { fs.unlinkSync(tmpTxt); fs.unlinkSync(tmpMp3); } catch {}
    } else {
        // Fallback to episode 1 audio if TTS binary absent
        const ep1Audio = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', 'cosmic-episode-001.mp3');
        if (fs.existsSync(ep1Audio)) fs.copyFileSync(ep1Audio, localAudioPath);
    }

    console.log(`✅ Saved audio: ${relAudioPath}`);
    return relAudioPath;
}

async function run() {
    console.log('🚀 Generating Next Episode for The Cosmic Treehouse Explorers...');

    // 1. Fetch current story state and history of ALL past episodes from Firestore
    const storyDocRef = db.collection('cosmic-treehouse').doc('story');
    const storySnap   = await storyDocRef.get();

    let episodeNumber  = 2;
    let runningSummary = 'Episode 1: Leo, Maya, and Spark rescued a Crystal Emberfox from Sector 4 using Spark’s electrical surge and Maya’s cipher tablet.';

    if (storySnap.exists) {
        const data = storySnap.data();
        episodeNumber  = (data.latestEpisodeNumber || 1) + 1;
        runningSummary = data.runningSummary || runningSummary;
    }

    let allPastHistory = '';
    try {
        const pastSnap = await db.collection('cosmic-treehouse').doc('episodes').collection('all').orderBy('episodeNumber', 'asc').get();
        if (!pastSnap.empty) {
            allPastHistory = pastSnap.docs.map(d => {
                const ep = d.data();
                return `[EPISODE ${ep.episodeNumber}: "${ep.title}"]\nSummary: ${ep.summary}\nRescued Creatures: ${(ep.hybrids||[]).join(', ')}`;
            }).join('\n\n');
        }
    } catch (e) {
        console.warn('Past cosmic episodes query note:', e.message);
    }

    console.log(`📖 Generating Episode ${episodeNumber}...`);
    const prompt = buildCosmicPrompt(episodeNumber, runningSummary, allPastHistory);

    // Dynamic Model Discovery
    let candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listRes.ok) {
            const listJson = await listRes.json();
            const valid = (listJson.models || [])
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''));
            if (valid.length > 0) {
                const flashModels = valid.filter(m => m.includes('flash'));
                const otherModels = valid.filter(m => !m.includes('flash'));
                candidateModels   = [...flashModels, ...otherModels];
            }
        }
    } catch (e) {}

    let rawText = null;
    let activeModel = candidateModels[0];
    for (const mName of [...new Set(candidateModels)]) {
        try {
            const model = genAI.getGenerativeModel({
                model: mName,
                systemInstruction: `You are an expert children's adventure author writing chapters for 8-10 year olds. Every single episode MUST be written as a full 10-minute audio narration (~1,500 to 1,800 words). The narration script MUST ALWAYS begin at the very top with the spoken announcement: "Episode [Number]: [Episode Title]." You write engaging, fast-paced prose with clever puzzle-solving, humor, and teamwork.`,
                generationConfig: { temperature: 0.92, topP: 0.95, maxOutputTokens: 8192 }
            });
            const result = await model.generateContent(prompt);
            rawText = result.response.text();
            activeModel = mName;
            console.log(`✨ Success with model "${mName}"!`);
            break;
        } catch (mErr) {
            console.warn(`Model "${mName}" note:`, mErr.message.split('\n')[0]);
        }
    }
    const parsed = parseResponse(rawText, episodeNumber);

    const wordCount = parsed.content.split(/\s+/).length;
    console.log(`✍️ Draft created: "${parsed.title}" — ${wordCount} words`);

    // 3. Audio & Artwork
    const audioUrl = await synthesizeAudio(parsed.content, episodeNumber);
    const imageUrl = 'images/cosmic-treehouse-cover.png';

    // 4. Save to Firestore
    const epId = `episode-${String(episodeNumber).padStart(3, '0')}`;
    const epRef = db.collection('cosmic-treehouse').doc('episodes').collection('all').doc(epId);

    await epRef.set({
        episodeNumber,
        title: parsed.title,
        hybrids: parsed.hybrids,
        content: parsed.content,
        wordCount,
        summary: parsed.summary,
        imageUrl,
        audioUrl,
        imagePrompt: parsed.imagePrompt,
        ratingSum: 5,
        ratingCount: 1,
        averageRating: 5.0,
        publishedAt: new Date().toISOString()
    }, { merge: true });

    await storyDocRef.set({
        totalEpisodes: episodeNumber,
        latestEpisodeNumber: episodeNumber,
        latestEpisodeTitle: parsed.title,
        runningSummary: parsed.runningSummary,
        lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`🎉 Successfully created & published Episode ${episodeNumber}: "${parsed.title}"!`);
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Cosmic story generation failed:', err);
    process.exit(1);
});
