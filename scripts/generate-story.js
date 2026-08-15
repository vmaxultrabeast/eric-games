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

// ── Gemini client (uses v1beta for Pro preview models) ────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1beta' });

// ==========================================================================
// Story Bible
// ==========================================================================
const STORY_BIBLE = `
You are the lead author of an ongoing serialized adventure story called "ISLA FRAGMENTUM".

TARGET AUDIENCE: 8 and 10-year-old boys who love dinosaurs, awesome creature battles, cool sci-fi gadgets, secret island mysteries, and epic action!

SETTING:
A remote, stormy volcanic island in the Pacific called Isla Fragmentum. Hidden beneath its dense jungle canopy and glowing lava caves is a secret genetic facility called HELIX CORP. Scientists at Helix Corp splice dinosaur DNA from multiple species to create powerful hybrid creatures with unique abilities, armor, and combat powers.

KEY CHARACTERS & HYBRIDS:
- D-REX (Distortus Rex): The ultimate hero hybrid — fused from T-Rex, Spinosaurus, and Velociraptor DNA. He has a massive, battle-scarred body, glowing amber eyes, razor-sharp spinal fins, and incredible tactical intelligence. He escaped from Lab 7 containment in Episode 1 and now roams the island as a free apex predator.
- DR. VERA OSEI: Brilliant lead geneticist at Helix Corp. Protective of the creatures, super smart, and always trying to stop Chief Reyes from destroying the island's wildlife.
- CHIEF REYES: Head of island security. Controls heavily armed security mechs, tracking drones, and containment squads. Driven to recapture D-Rex at all costs.
- SAURONIX: Heavyweight armored hybrid — fused from Ankylosaurus and Carnotaurus. A walking tank with spiked bone armor, a wrecking-ball tail, and twin battering horns.
- AQUAFANG: Aquatic apex predator — fused from Mosasaurus and Kronosaurus. Dominates rivers and coastal lagoons with lightning-fast water ambushes.
- THE ARCHITECT: Mysterious mastermind pulling the strings behind Helix Corp's secret hybrid projects.

NEW HYBRID CREATION RULE:
- In EVERY NEW EPISODE, you are strongly encouraged to invent and introduce at least ONE BRAND NEW HYBRID DINOSAUR!
- Clearly specify the 2 or 3 species spliced together (e.g., Carnotaurus + Pteranodon = Carnopterus; Therizinosaurus + Stegosaurus = Razor-Titan; Velociraptor + Electric Eel = Volt-Raptor).
- Give the new hybrid a legendary name, striking visual features (spiked armor, wings, bioluminescent glow, venom-spitters, tail blades), and a signature combat power!
- Feature them in the episode's action — either as Helix Corp's newly unleashed containment threat, a rival predator in a new island biome, or an unexpected ally!

AUDIOBOOK NARRATIVE SCRIPTING (CRITICAL):
This story is primarily consumed as a STUDIO AI AUDIOBOOK NARRATION for 8–10 year old listeners!
- Write specifically for spoken audio performance: short punchy sentence rhythm, dramatic pauses (...), and vivid cinematic pacing.
- Include exciting onomatopoeia sound effects (KABOOM!, ZZZZT!, THUD-THUD-THUD, SKRRRREEECH!, ROAAAR!) that the neural narrator performs with maximum energy!
- Emphasize rich spatial audio descriptions (echoing metal corridors, dripping lava caves, hum of high-voltage fences, heavy jungle rainfall).
- Give every character distinct, expressive dialogue tags ("..." shouted Vera, "..." growled Reyes) so listeners easily track character voices in audio format.

EPISODE STRUCTURE:
Each episode MUST be a 10 to 12-minute audiobook chapter (approximately 2,200–2,800 words total).
- A thrilling episode title
- Bold **Previously on Isla Fragmentum...** recap line
- 5 distinct action-packed scenes
- At least 1 epic hybrid vs. hybrid battle or security mech showdown
- Introduction of a cool new spliced dinosaur hybrid
- Suspenseful cliffhanger ending

CONTINUITY: Always respect previous events. Characters remember battles. Wounds persist. Alliances evolve. All created hybrids remain part of the island's growing roster!
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

    // Auto-discover available models for this API key via Google ModelService
    let candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
    try {
        console.log('🔍 Discovering available models for API key...');
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        if (listRes.ok) {
            const listJson = await listRes.json();
            const valid = (listJson.models || [])
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.replace('models/', ''));

            if (valid.length > 0) {
                console.log('📋 Live models available for key:', valid.join(', '));
                // Sort to prefer Pro models if key supports them, followed by Flash models
                const proModels   = valid.filter(m => m.includes('pro'));
                const flashModels = valid.filter(m => m.includes('flash'));
                const otherModels = valid.filter(m => !m.includes('pro') && !m.includes('flash'));
                candidateModels   = [...proModels, ...flashModels, ...otherModels];
            }
        }
    } catch (e) {
        console.warn('⚠️ Model discovery note:', e.message);
    }

    console.log(`🤖 Model attempt order:`, candidateModels.slice(0, 5).join(', '));

    let activeModelName = candidateModels[0];
    let rawText = null;
    for (const modelName of [...new Set(candidateModels)]) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.90, topP: 0.95, maxOutputTokens: 8192 }
            });
            const textResult = await model.generateContent(storyPrompt);
            rawText = textResult.response.text();
            activeModelName = modelName;
            console.log(`✨ Success with model "${modelName}"!`);
            break;
        } catch (err) {
            console.warn(`⚠️ Model "${modelName}" note:`, err.message.split('\n')[0]);
        }
    }

    if (!rawText) {
        throw new Error('All candidate Gemini models failed to generate content.');
    }

    const parsed = parseEpisodeResponse(rawText, episodeNumber);

    let wordCount = parsed.content.split(/\s+/).length;
    console.log(`✍️ Initial draft: "${parsed.title}" — ${wordCount} words`);

    // Automatic Narrative Expansion if draft is under 1,800 words (~10-min read target)
    if (wordCount < 1800) {
        console.log(`📖 Episode is under 1,800 words (${wordCount} w). Expanding narrative to reach 2,000+ word 10-minute read target...`);
        try {
            const expandPrompt = `You are the lead author of ISLA FRAGMENTUM.
Expand the following story content into a full, immersive, highly detailed 2,200 to 2,800-word chapter (~10-minute read).

RULES FOR EXPANSION:
- Keep the exact same plot, characters, and title.
- Do NOT write summaries. Write out every single scene in rich multi-paragraph prose.
- Add rich environmental descriptions (bioluminescent jungle, volcanic ash, heavy rain), step-by-step physical action choreography, character dialogue, and internal thoughts.
- Expand tactical exchanges and dialogue between Dr. Vera Osei, Chief Reyes, and security personnel.

CURRENT DRAFT TO EXPAND:
${parsed.content}

Output ONLY the expanded story text, starting with **Previously on Isla Fragmentum...** in bold.`;

            const expModel = genAI.getGenerativeModel({
                model: activeModelName,
                generationConfig: { temperature: 0.92, topP: 0.95, maxOutputTokens: 8192 }
            });
            const expRes = await expModel.generateContent(expandPrompt);
            const expText = expRes.response.text().trim();
            if (expText && expText.length > parsed.content.length) {
                parsed.content = expText;
                wordCount = parsed.content.split(/\s+/).length;
                console.log(`✨ Successfully expanded story to ${wordCount} words!`);
            }
        } catch (expErr) {
            console.warn('⚠️ Narrative expansion note:', expErr.message.split('\n')[0]);
        }
    }

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
    const rawPrompt = parsed.imagePrompt ||
        `A dramatic scene from a dinosaur island adventure story. ` +
        `Episode "${parsed.title}". Featured hybrids: ${parsed.hybrids.join(', ')}. ` +
        `Dense tropical jungle, volcanic peaks, stormy dramatic atmosphere, bioluminescent plants.`;

    const nanoBanaPrompt = `Cinematic 8K masterpiece movie still, photorealistic concept art, high definition hyper-detailed 3D render, ` +
        `Jurassic Park apex hybrid dinosaur aesthetic, dramatic volumetric storm lighting, bioluminescent volcanic jungle fog, ` +
        `epic 16:9 widescreen composition, ultra-sharp focus, vivid color grade: ${rawPrompt}`;

    const candidateModels = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001',
        'imagen-3.0-generate-001',
        'gemini-2.5-flash-image'
    ];

    let b64 = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
        for (const mName of candidateModels) {
            try {
                // 1. Try Imagen 3 :predict API
                const predictUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:predict?key=${apiKey}`;
                const pRes = await fetch(predictUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: nanoBanaPrompt }],
                        parameters: { sampleCount: 1, aspectRatio: '16:9', outputOptions: { mimeType: 'image/jpeg' } }
                    })
                });

                if (pRes.ok) {
                    const json = await pRes.json();
                    if (json.predictions && json.predictions.length > 0 && json.predictions[0].bytesBase64Encoded) {
                        b64 = json.predictions[0].bytesBase64Encoded;
                        console.log(`✨ Imagen 3 / Gemini Image success using model "${mName}" (:predict)`);
                        break;
                    }
                }

                // 2. Try :generateImages API
                const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateImages?key=${apiKey}`;
                const gRes = await fetch(genUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: nanoBanaPrompt,
                        config: { numberOfImages: 1, aspectRatio: '16:9', outputMimeType: 'image/jpeg', personGeneration: 'DONT_ALLOW' }
                    })
                });

                if (gRes.ok) {
                    const json = await gRes.json();
                    if (json.generatedImages && json.generatedImages.length > 0) {
                        b64 = json.generatedImages[0].image.imageBytes;
                        console.log(`✨ Imagen 3 / Gemini Image success using model "${mName}" (:generateImages)`);
                        break;
                    }
                }
            } catch (e) {
                console.warn(`Gemini Image model "${mName}" note:`, e.message);
            }
        }
    }

    const enhancedPrompt = `Cinematic 8k masterpiece movie still, photorealistic concept art, Jurassic Park aesthetics, dramatic storm lighting, bioluminescent jungle fog, epic 16:9 widescreen shot: ${rawPrompt}`;

    let imageBytes = null;
    if (b64) {
        imageBytes = Buffer.from(b64, 'base64');
    } else {
        console.log('🎨 Generating 1080p Ultra-HD Photorealistic Flux AI scene image...');
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1920&height=1080&model=flux&nologo=true&enhance=true&seed=${episodeNumber * 99991}`;
        const pRes = await fetch(pollUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!pRes.ok) throw new Error(`Flux AI image fetch failed: ${pRes.status}`);
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

    // 1. Generate high-definition studio narration via edge-tts (Python) chunk-by-chunk
    try {
        const { execSync } = require('child_process');
        const fs = require('fs');
        const path = require('path');

        console.log(`🎙️ Generating Dramatic Studio Audiobook (en-US-AndrewMultilingualNeural HD Narrator) for ${chunks.length} chunk(s)...`);
        const chunkBuffers = [];

        for (let i = 0; i < chunks.length; i++) {
            const tmpTxt = path.join(__dirname, `tmp_ep_${episodeNumber}_${i}.txt`);
            const tmpMp3 = path.join(__dirname, `tmp_ep_${episodeNumber}_${i}.mp3`);

            // Strip any raw markdown header hashes, hashtags, and formatting symbols for clean narration
            const cleanText = chunks[i]
                .replace(/#+/g, '')
                .replace(/\*\*/g, '')
                .replace(/__/g, '')
                .replace(/\*/g, '')
                .replace(/_/g, '')
                .replace(/---/g, '')
                .replace(/[`~]/g, '');

            fs.writeFileSync(tmpTxt, cleanText, 'utf-8');

            console.log(`  🎭 Synthesizing Dramatic Chunk ${i + 1}/${chunks.length}...`);
            try {
                execSync(`edge-tts --file "${tmpTxt}" --voice en-US-AndrewMultilingualNeural --rate="-4%" --write-media "${tmpMp3}"`);
            } catch (err) {
                console.warn(`  ⚠️ Chunk ${i + 1} narration note:`, err.message);
            } finally {
                try { if (fs.existsSync(tmpTxt)) fs.unlinkSync(tmpTxt); } catch {}
            }

            if (fs.existsSync(tmpMp3)) {
                chunkBuffers.push(fs.readFileSync(tmpMp3));
                try { fs.unlinkSync(tmpMp3); } catch {}
            }
        }

        if (chunkBuffers.length > 0) {
            fullAudioBuffer = Buffer.concat(chunkBuffers);
            console.log(`✅ Complete Studio MP3 generated (${fullAudioBuffer.length} bytes)!`);
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
[Full episode text, MUST BE AT LEAST 2,200 WORDS (~10-minute read). Start with **Previously on Isla Fragmentum...** in bold. Third-person narrative. Do NOT use markdown headers (#, ##, ###) or hashtags anywhere in the text. Write plain narrative prose.]

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
