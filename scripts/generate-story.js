// ==========================================================================
// DinoIsland — Daily Story Generator
// Runs via GitHub Actions every evening at 6 PM Pacific.
//
// Required environment variables (set as GitHub Secrets):
//   GEMINI_API_KEY           — from aistudio.google.com
//   FIREBASE_SERVICE_ACCOUNT — JSON content of Firebase service account key
// ==========================================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech          = require('@google-cloud/text-to-speech');
const admin                 = require('firebase-admin');

// ── Firebase & GCP init ────────────────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

function getBucket() {
    const bName = serviceAccount.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : 'eric-arcade.firebasestorage.app';
    return admin.storage().bucket(bName);
}

// ── TTS Client (uses same GCP service account) ────────────────────────────
const ttsClient = new textToSpeech.TextToSpeechClient({ credentials: serviceAccount });

// ── Gemini client ──────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================================================
// Story Bible
// ==========================================================================
const STORY_BIBLE = `
You are the author of an ongoing serialized adventure story called "ISLA FRAGMENTUM".

SETTING:
A remote volcanic island in the Pacific called Isla Fragmentum. Hidden beneath its jungle canopy is a state-of-the-art genetic research facility called HELIX CORP. Scientists at Helix Corp splice dinosaur DNA from multiple species to create powerful hybrid creatures. These hybrids are labeled and catalogued.

KEY CHARACTERS:
- D-REX (Distortus Rex): The primary protagonist — a massive hybrid dinosaur created by fusing T-Rex, Spinosaurus, and Velociraptor DNA. He has a twisted, asymmetrical body with one arm longer than the other, razor-sharp spinal fins, and glowing amber eyes. He is cunning, fierce, and surprisingly intelligent. He escaped from Lab 7 containment in Episode 1.
- DR. VERA OSEI: Lead geneticist at Helix Corp. Brilliant but haunted by the ethical weight of what she's creating. She secretly admires D-Rex's will to survive.
- CHIEF REYES: Head of island security. Cold, tactical, wants all escaped hybrids recaptured or eliminated.
- SAURONIX: A hybrid fused from Ankylosaurus and Carnotaurus DNA. Built like a tank with bone-plate armor and twin horn-charges. Territorial and aggressive. Rules the eastern jungle.
- AQUAFANG: A water-bound hybrid fused from Mosasaurus and Kronosaurus. Controls the island's coastal waterways. Cunning and ambush-oriented.
- THE ARCHITECT: A mysterious shadowy figure pulling strings behind Helix Corp's experiments. Unknown motivations.

TONE: Cinematic, action-packed, with moments of tension and wonder. Think Jurassic Park meets Pacific Rim. Age range: 10+.

EPISODE STRUCTURE:
Each episode MUST be a 10-minute read (approximately 2,000–2,500 words). No exceptions — longer is better than shorter.
It must have:
- A vivid episode title
- A one-sentence "Previously on Isla Fragmentum..." hook (in bold)
- 4-5 distinct scenes that advance the plot with rich descriptive detail
- At least one tense action sequence or confrontation with detailed choreography
- Atmospheric world-building (at least 8-10 lines of spoken dialogue)
- A cliffhanger or unresolved tension at the end

CONTINUITY: Always honor what happened in previous episodes. Characters remember events. Wounds persist. Alliances shift.
`;

// ==========================================================================
// Main
// ==========================================================================
async function main() {
    console.log('🦖 DinoIsland Story Generator starting...');

    // 1. Fetch current story state from Firestore
    const storyRef    = db.collection('dino-island').doc('story');
    const episodesRef = storyRef.collection('episodes');
    const storySnap   = await storyRef.get();

    let episodeNumber    = 1;
    let runningSummary   = '';

    if (storySnap.exists) {
        const data       = storySnap.data();
        episodeNumber    = (data.totalEpisodes || 0) + 1;
        runningSummary   = data.runningSummary  || '';
    }

    console.log(`📖 Generating Episode ${episodeNumber}...`);

    // 2. Generate story text with Gemini (with dynamic model discovery)
    const storyPrompt = buildStoryPrompt(episodeNumber, runningSummary);

    // Auto-discover available models for this API key
    let targetModelName = 'gemini-1.5-flash';
    try {
        console.log('🔍 Discovering available models for API key...');
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        if (listRes.ok) {
            const listJson = await listRes.json();
            const valid = (listJson.models || [])
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''));

            console.log('📋 Available models for key:', valid.join(', '));
            // Prioritize Gemini Pro models for long-form story generation (10+ min chapters)
            const preferred = [
                'gemini-3.1-pro-preview',
                'gemini-2.5-pro',
                'gemini-pro-latest',
                'gemini-3.6-flash',
                'gemini-3.5-flash',
                'gemini-flash-latest'
            ];
            const found = preferred.find(p => valid.includes(p)) || valid[0];
            if (found) targetModelName = found;
        }
    } catch (e) {
        console.warn('⚠️ Model discovery note:', e.message);
    }

    console.log(`🤖 Selected Pro model for long-form story: "${targetModelName}"`);
    const candidateModels = [
        targetModelName,
        'gemini-3.1-pro-preview',
        'gemini-2.5-pro',
        'gemini-pro-latest',
        'gemini-3.6-flash',
        'gemini-3.5-flash'
    ];

    let rawText = null;
    for (const modelName of [...new Set(candidateModels)]) {
        try {
            // Target v1beta explicitly so gemini-3.1-pro-preview / gemini-2.5-pro work
            const model = genAI.getGenerativeModel(
                { model: modelName, generationConfig: { temperature: 0.90, topP: 0.95, maxOutputTokens: 8192 } },
                { apiVersion: 'v1beta' }
            );
            const textResult = await model.generateContent(storyPrompt);
            rawText = textResult.response.text();
            console.log(`✨ Success with model "${modelName}" (v1beta API)!`);
            break;
        } catch (err1) {
            try {
                const model = genAI.getGenerativeModel(
                    { model: modelName, generationConfig: { temperature: 0.90, topP: 0.95, maxOutputTokens: 8192 } },
                    { apiVersion: 'v1' }
                );
                const textResult = await model.generateContent(storyPrompt);
                rawText = textResult.response.text();
                console.log(`✨ Success with model "${modelName}" (v1 API)!`);
                break;
            } catch (err2) {
                console.warn(`⚠️ Model "${modelName}" note:`, err2.message.split('\n')[0]);
            }
        }
    }

    if (!rawText) {
        throw new Error('All candidate Gemini models failed to generate content.');
    }

    const parsed = parseEpisodeResponse(rawText, episodeNumber);

    const wordCount = parsed.content.split(/\s+/).length;
    console.log(`✍️  Story: "${parsed.title}" — ${wordCount} words`);

    // 3. Generate episode image (Imagen 3 / Pollinations AI fallback)
    let imageUrl = null;
    try {
        imageUrl = await generateAndUploadImage(parsed, episodeNumber);
        console.log(`🖼️  Image uploaded: ${imageUrl}`);
    } catch (imgErr) {
        console.error('⚠️  Image generation failed (non-fatal):', imgErr.message);
    }

    // 4. Generate studio AI narration audio (Neural2 MP3)
    let audioUrl = null;
    try {
        audioUrl = await generateAndUploadAudio(parsed.content, episodeNumber);
        console.log(`🎙️  Studio Audio uploaded: ${audioUrl}`);
    } catch (audioErr) {
        console.error('⚠️  Audio generation failed (non-fatal):', audioErr.message);
    }

    // 5. Save episode document to Firestore
    const epId      = `episode-${String(episodeNumber).padStart(3, '0')}`;
    const epDocRef  = episodesRef.doc(epId);

    await epDocRef.set({
        episodeNumber,
        title:         parsed.title,
        hybrids:       parsed.hybrids,
        content:       parsed.content,
        wordCount,
        summary:       parsed.summary,
        imageUrl:      imageUrl || null,
        audioUrl:      audioUrl || null,
        imagePrompt:   parsed.imagePrompt || null,
        ratingSum:     0,
        ratingCount:   0,
        averageRating: 0,
        generatedAt:   admin.firestore.FieldValue.serverTimestamp(),
        publishedAt:   new Date().toISOString(),
    });

    // 5. Update story meta document
    await storyRef.set({
        totalEpisodes:        episodeNumber,
        runningSummary:       parsed.newRunningSummary,
        lastGeneratedAt:      admin.firestore.FieldValue.serverTimestamp(),
        latestEpisodeTitle:   parsed.title,
        latestEpisodeNumber:  episodeNumber,
    }, { merge: true });

    console.log(`✅ Episode ${episodeNumber} "${parsed.title}" saved to Firestore.`);
}

// ==========================================================================
// Generate & upload episode image via Imagen 3
// ==========================================================================
async function generateAndUploadImage(parsed, episodeNumber) {
    const imagePrompt = parsed.imagePrompt ||
        `Cinematic digital concept art: A dramatic scene from a dinosaur island adventure. ` +
        `Episode "${parsed.title}". Featured hybrids: ${parsed.hybrids.join(', ')}. ` +
        `Dense tropical jungle, volcanic peaks, stormy dramatic atmosphere, bioluminescent plants. ` +
        `Photorealistic, epic scale, Jurassic Park meets Pacific Rim style, 16:9 wide shot.`;

    const candidateModels = [
        'imagen-3.0-generate-002',
        'imagen-3.0-generate-001',
        'imagen-3.0-fast-generate-001'
    ];

    let b64 = null;
    for (const mName of candidateModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateImages?key=${process.env.GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    config: {
                        numberOfImages: 1,
                        aspectRatio: '16:9',
                        outputMimeType: 'image/jpeg',
                        personGeneration: 'DONT_ALLOW'
                    }
                })
            });

            if (res.ok) {
                const json = await res.json();
                if (json.generatedImages && json.generatedImages.length > 0) {
                    b64 = json.generatedImages[0].image.imageBytes;
                    console.log(`✨ Imagen success using model "${mName}"`);
                    break;
                }
            }
        } catch (e) {
            console.warn(`Imagen model "${mName}" note:`, e.message);
        }
    }

    let imageBytes = null;
    if (b64) {
        imageBytes = Buffer.from(b64, 'base64');
    } else {
        console.log('🎨 Generating HD AI scene image via Pollinations AI fallback...');
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1280&height=720&nologo=true&seed=${episodeNumber * 1337}`;
        const pRes = await fetch(pollUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!pRes.ok) throw new Error(`Pollinations image fetch failed: ${pRes.status}`);
        const ab = await pRes.arrayBuffer();
        imageBytes = Buffer.from(ab);
    }

    // Save to repository static directory (games/dino-island-story/images/episode-XXX.jpg)
    const fs = require('fs');
    const path = require('path');
    const epStr = String(episodeNumber).padStart(3, '0');
    const relImgPath = `images/episode-${epStr}.jpg`;
    const localImgPath = path.join(__dirname, '..', 'games', 'dino-island-story', 'images', `episode-${epStr}.jpg`);

    const imgDir = path.dirname(localImgPath);
    if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
    fs.writeFileSync(localImgPath, imageBytes);
    console.log(`🖼️ Saved image to repository static path: ${relImgPath}`);

    return relImgPath;
}

// ==========================================================================
// Generate studio AI audio narration via edge-tts / GCP Text-to-Speech
// ==========================================================================
async function generateAndUploadAudio(storyContentText, episodeNumber) {
    console.log('🎙️  Synthesizing Studio Neural audio narration...');

    let cleanText = storyContentText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/^---$/gm, '')
        .replace(/\n{2,}/g, '\n\n')
        .trim();

    const paragraphs = cleanText.split('\n\n');
    const chunks = [];
    let currentChunk = '';

    for (const p of paragraphs) {
        if ((currentChunk + '\n\n' + p).length > 4500) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = p;
        } else {
            currentChunk = currentChunk ? (currentChunk + '\n\n' + p) : p;
        }
    }
    if (currentChunk) chunks.push(currentChunk);

    let fullAudioBuffer = null;

    // 1. Generate high-definition studio narration via edge-tts (Python)
    try {
        const { execSync } = require('child_process');
        const fs = require('fs');
        const path = require('path');

        const tmpTxt = path.join(__dirname, `tmp_ep_${episodeNumber}.txt`);
        const tmpMp3 = path.join(__dirname, `tmp_ep_${episodeNumber}.mp3`);
        fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

        console.log('🎙️ Generating Studio Neural MP3 narration (en-US-ChristopherNeural)...');
        execSync(`edge-tts --file "${tmpTxt}" --voice en-US-ChristopherNeural --rate="-4%" --write-media "${tmpMp3}"`);

        if (fs.existsSync(tmpMp3)) {
            fullAudioBuffer = fs.readFileSync(tmpMp3);
            try { fs.unlinkSync(tmpTxt); fs.unlinkSync(tmpMp3); } catch {}
        }
    } catch (pyErr) {
        console.warn('⚠️ edge-tts note:', pyErr.message);
    }

    // 2. Fallback to GCP Text-to-Speech API if edge-tts unavailable
    if (!fullAudioBuffer) {
        try {
            const audioBuffers = [];
            for (let i = 0; i < chunks.length; i++) {
                const [response] = await ttsClient.synthesizeSpeech({
                    input: { text: chunks[i] },
                    voice: { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
                    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.96, pitch: -1.5 },
                });
                if (response.audioContent) audioBuffers.push(Buffer.from(response.audioContent));
            }
            if (audioBuffers.length > 0) fullAudioBuffer = Buffer.concat(audioBuffers);
        } catch (gcpErr) {
            console.warn('⚠️ GCP TTS note:', gcpErr.message.split('\n')[0]);
        }
    }

    if (!fullAudioBuffer) {
        throw new Error('Audio synthesis returned no audio buffer.');
    }

    // Save MP3 directly to repository static directory (games/dino-island-story/audio/episode-XXX.mp3)
    const fs = require('fs');
    const path = require('path');
    const epStr = String(episodeNumber).padStart(3, '0');
    const relAudioPath = `audio/episode-${epStr}.mp3`;
    const localAudioPath = path.join(__dirname, '..', 'games', 'dino-island-story', 'audio', `episode-${epStr}.mp3`);

    const audDir = path.dirname(localAudioPath);
    if (!fs.existsSync(audDir)) fs.mkdirSync(audDir, { recursive: true });
    fs.writeFileSync(localAudioPath, fullAudioBuffer);
    console.log(`🎙️ Saved studio MP3 to repository static path: ${relAudioPath}`);

    return relAudioPath;
}

// ==========================================================================
// Build the Gemini prompt
// ==========================================================================
function buildStoryPrompt(episodeNumber, runningSummary) {
    const isFirst = episodeNumber === 1;

    const context = isFirst
        ? `This is the FIRST EPISODE. Introduce D-Rex escaping from Lab 7 containment during a violent Pacific storm.
Show the chaos in vivid detail — the containment breach, Dr. Vera Osei's conflicted reaction, Chief Reyes mobilizing security.
End with D-Rex vanishing into the jungle.`
        : `STORY SO FAR:\n${runningSummary}\n\nContinue naturally from where the story left off for Episode ${episodeNumber}.`;

    return `${STORY_BIBLE}

---

CRITICAL LENGTH REQUIREMENT:
You MUST write a long, immersive episode containing AT LEAST 2,200 WORDS (2,200 to 2,800 words total).
Do NOT write short summaries. Write out every single interaction, sensory detail, environment description, and line of dialogue in full prose.

To reach the 2,200+ word length target, structure the story into 5 distinct, highly detailed scenes:
- SCENE 1 (~450 words): Atmospheric opening, immediate aftermath of previous events, character perspectives and sensory detail.
- SCENE 2 (~450 words): Tactical movement, jungle exploration, tracking signatures, or lab operations.
- SCENE 3 (~550 words): Major action sequence, confrontation, or battle between hybrids/security forces with step-by-step physical choreography.
- SCENE 4 (~450 words): Dramatic dialogue exchange, ethical dilemma, or lore reveal involving Dr. Vera Osei, Chief Reyes, or the Architect.
- SCENE 5 (~450 words): High-tension climax and suspenseful cliffhanger hook for the next episode.

---

TASK: Write Episode ${episodeNumber} of Isla Fragmentum.

${context}

---

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (all six section headers required):

HYBRIDS: [Hybrid dinosaur names in this episode, comma-separated]

TITLE: [A dramatic episode title]

IMAGE_PROMPT: [2-3 sentences describing the most cinematic scene from this episode for an AI image generator. Mention specific hybrids, environment details, lighting, mood. Photorealistic cinematic concept art style.]

CONTENT:
[Full episode text, MUST BE AT LEAST 2,200 WORDS (~10-minute read). Start with **Previously on Isla Fragmentum...** in bold. Third-person narrative. Rich sensory detail, strong action choreography, meaningful dialogue.]

EPISODE_SUMMARY:
[4-6 sentences summarizing this episode's key events, characters involved, and changes.]

UPDATED_RUNNING_SUMMARY:
[Complete updated running summary of ALL events across all episodes, including this one. Max 1,000 words. Future episodes will only have this context, so be thorough.]
`;
}

// ==========================================================================
// Parse Gemini's structured response
// ==========================================================================
function parseEpisodeResponse(rawText, episodeNumber) {
    const extract = (label, nextLabel) => {
        const pattern = new RegExp(
            `^${label}:[\\s]*([\\s\\S]*?)(?=^${nextLabel}:|\\Z)`,
            'im'
        );
        const match = rawText.match(pattern);
        return match ? match[1].trim() : '';
    };

    const hybridsRaw        = extract('HYBRIDS',                  'TITLE');
    const title             = extract('TITLE',                     'IMAGE_PROMPT');
    const imagePrompt       = extract('IMAGE_PROMPT',              'CONTENT');
    const content           = extract('CONTENT',                   'EPISODE_SUMMARY');
    const summary           = extract('EPISODE_SUMMARY',           'UPDATED_RUNNING_SUMMARY');
    const newRunningSummary = extract('UPDATED_RUNNING_SUMMARY',   'ZZZEOF');

    const hybrids = hybridsRaw
        ? hybridsRaw.split(',').map(h => h.trim()).filter(Boolean)
        : ['D-Rex'];

    return {
        title: title || `Episode ${episodeNumber}`,
        hybrids,
        imagePrompt:       imagePrompt || null,
        content:           content     || rawText,
        summary:           summary     || '',
        newRunningSummary: newRunningSummary || summary || '',
    };
}

// ==========================================================================
// Run
// ==========================================================================
main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
