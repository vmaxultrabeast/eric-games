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
    credential:    admin.credential.cert(serviceAccount),
    storageBucket: 'eric-arcade.firebasestorage.app',
});
const db      = admin.firestore();
const storage = admin.storage();

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

    // 2. Generate story text with Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.88,
            topP: 0.95,
            maxOutputTokens: 8192,
        }
    });

    const storyPrompt = buildStoryPrompt(episodeNumber, runningSummary);
    const textResult  = await model.generateContent(storyPrompt);
    const rawText     = textResult.response.text();
    const parsed      = parseEpisodeResponse(rawText, episodeNumber);

    const wordCount = parsed.content.split(/\s+/).length;
    console.log(`✍️  Story: "${parsed.title}" — ${wordCount} words`);

    // 3. Generate episode image with Imagen 3 REST API
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${process.env.GEMINI_API_KEY}`;
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

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Imagen API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    if (!json.generatedImages || json.generatedImages.length === 0) {
        throw new Error('Imagen returned no images');
    }

    const b64 = json.generatedImages[0].image.imageBytes;
    const imageBytes = Buffer.from(b64, 'base64');

    // Upload to Firebase Storage
    const bucket   = storage.bucket();
    const fileName = `dino-island/episodes/episode-${String(episodeNumber).padStart(3, '0')}.jpg`;
    const file     = bucket.file(fileName);

    await file.save(imageBytes, {
        metadata: {
            contentType: 'image/jpeg',
            metadata: {
                episodeNumber: String(episodeNumber),
                episodeTitle:  parsed.title,
            },
        },
    });

    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// ==========================================================================
// Generate & upload studio AI audio narration via GCP Text-to-Speech
// ==========================================================================
async function generateAndUploadAudio(storyContentText, episodeNumber) {
    console.log('🎙️  Synthesizing Studio Neural2 audio narration...');

    // 1. Strip markdown elements for clean TTS reading
    let cleanText = storyContentText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/^---$/gm, '')
        .replace(/\n{2,}/g, '\n\n')
        .trim();

    // 2. Chunk text into segments <= 4500 chars (GCP TTS limit is 5000)
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

    console.log(`🎙️  Synthesizing ${chunks.length} audio chunk(s)...`);

    // 3. Synthesize each chunk with GCP Text-to-Speech (Neural2 narrator voice)
    const audioBuffers = [];
    for (let i = 0; i < chunks.length; i++) {
        const [response] = await ttsClient.synthesizeSpeech({
            input: { text: chunks[i] },
            voice: {
                languageCode: 'en-US',
                name:         'en-US-Neural2-D', // Deep, cinematic male narrator
                ssmlGender:   'MALE',
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate:  0.96, // Slight slow pacing for dramatic effect
                pitch:         -1.5, // Deeper narrator tone
            },
        });

        if (response.audioContent) {
            audioBuffers.push(Buffer.from(response.audioContent));
        }
    }

    if (audioBuffers.length === 0) {
        throw new Error('TTS returned no audio content');
    }

    const fullAudioBuffer = Buffer.concat(audioBuffers);

    // 4. Upload MP3 to Firebase Storage
    const bucket   = storage.bucket();
    const fileName = `dino-island/episodes/episode-${String(episodeNumber).padStart(3, '0')}.mp3`;
    const file     = bucket.file(fileName);

    await file.save(fullAudioBuffer, {
        metadata: {
            contentType: 'audio/mpeg',
            metadata: {
                episodeNumber: String(episodeNumber),
            },
        },
    });

    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// ==========================================================================
// Build the Gemini prompt
// ==========================================================================
function buildStoryPrompt(episodeNumber, runningSummary) {
    const isFirst = episodeNumber === 1;

    const context = isFirst
        ? `This is the FIRST EPISODE. Introduce D-Rex escaping from Lab 7 containment during a violent Pacific storm.
Show the chaos in vivid detail — the containment breach, Dr. Vera Osei's conflicted reaction, Chief Reyes mobilizing security.
End with D-Rex vanishing into the jungle. MINIMUM 2,000 words.`
        : `STORY SO FAR:\n${runningSummary}\n\nContinue naturally from where the story left off for Episode ${episodeNumber}. MINIMUM 2,000 words.`;

    return `${STORY_BIBLE}

---

TASK: Write Episode ${episodeNumber} of Isla Fragmentum.

${context}

---

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (all six section headers required):

HYBRIDS: [Hybrid dinosaur names in this episode, comma-separated]

TITLE: [A dramatic episode title]

IMAGE_PROMPT: [2-3 sentences describing the most cinematic scene from this episode for an AI image generator. Mention specific hybrids, environment details, lighting, mood. Photorealistic cinematic concept art style.]

CONTENT:
[Full episode text, MINIMUM 2,000 words (~10-minute read). Start with **Previously on Isla Fragmentum...** in bold. Third-person narrative. Rich sensory detail, strong action choreography, meaningful dialogue.]

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
