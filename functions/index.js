// ==========================================================================
// Eric's Arcade — DinoIsland Daily Story Generator
// Cloud Function: generateStoryEpisode
// Triggered every day at 6 PM Pacific via Cloud Scheduler
// ==========================================================================

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require("firebase-functions/params");

initializeApp();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// ==========================================================================
// Story Bible — permanent context fed to Gemini every day
// ==========================================================================
const STORY_BIBLE = `
You are the author of an ongoing serialized adventure story called "ISLA FRAGMENTUM".

SETTING:
A remote volcanic island in the Pacific called Isla Fragmentum. Hidden beneath its jungle canopy is a state-of-the-art genetic research facility called HELIX CORP. Scientists at Helix Corp splice dinosaur DNA from multiple species to create powerful hybrid creatures. These hybrids are labeled and catalogued: D-Rex, Sauronix, Aquafang, etc.

KEY CHARACTERS:
- D-REX (Distortus Rex): The primary protagonist — a massive hybrid dinosaur created by fusing T-Rex, Spinosaurus, and Velociraptor DNA. He has a twisted, asymmetrical body with one arm longer than the other, razor-sharp spinal fins, and glowing amber eyes. He is cunning, fierce, and surprisingly intelligent. He escaped from Lab 7 containment in Episode 1.
- DR. VERA OSEI: Lead geneticist at Helix Corp. Brilliant but haunted by the ethical weight of what she's creating. She secretly admires D-Rex's will to survive.
- CHIEF REYES: Head of island security. Cold, tactical, wants all escaped hybrids recaptured or eliminated.
- SAURONIX: A hybrid fused from Ankylosaurus and Carnotaurus DNA. Built like a tank with bone-plate armor and twin horn-charges. Territorial and aggressive. Currently rules the eastern jungle.
- AQUAFANG: A water-bound hybrid fused from Mosasaurus and Kronosaurus. Controls the island's coastal waterways. Cunning and ambush-oriented.
- THE ARCHITECT: A mysterious shadowy figure pulling strings behind Helix Corp's experiments. Unknown motivations.

TONE: Cinematic, action-packed, with moments of tension and wonder. Think Jurassic Park meets Pacific Rim. Age range: 10+.

EPISODE STRUCTURE:
Each episode MUST be a 10-minute read (approximately 2,000–2,500 words). No exceptions — longer is better than shorter.
It must have:
- A vivid episode title
- A one-sentence "Previously on Isla Fragmentum..." hook
- 4-5 distinct scenes that advance the plot with rich descriptive detail
- At least one tense action sequence or confrontation with detailed choreography
- Atmospheric world-building that makes the island feel alive and dangerous
- Dialogue that reveals character (at least 8–10 lines of spoken dialogue)
- A cliffhanger or unresolved tension at the end to propel the reader to the next episode
- Feature the name of the key hybrid(s) appearing in this episode as metadata on the first line in the exact format: HYBRIDS: [comma-separated hybrid names]

CONTINUITY: Always honor what happened in previous episodes. Characters remember events. Wounds persist. Alliances shift.
`;

// ==========================================================================
// Scheduled Function — fires every day at 6 PM Pacific
// ==========================================================================
exports.generateStoryEpisode = onSchedule(
    {
        schedule: "0 18 * * *",
        timeZone: "America/Los_Angeles",
        secrets: [GEMINI_API_KEY],
        memory: "1GiB",
        timeoutSeconds: 300,
    },
    async (event) => {
        await generateAndSaveEpisode();
    }
);

// ==========================================================================
// Manual Trigger (callable from admin panel or seed script)
// ==========================================================================
exports.triggerStoryEpisode = onCall(
    {
        secrets: [GEMINI_API_KEY],
        memory: "1GiB",
        timeoutSeconds: 300,
    },
    async (request) => {
        if (!request.data || request.data.adminKey !== "drex-escaped") {
            throw new HttpsError("permission-denied", "Not authorized.");
        }
        const result = await generateAndSaveEpisode();
        return result;
    }
);

// ==========================================================================
// Core Story Generation Logic
// ==========================================================================
async function generateAndSaveEpisode() {
    const db = getFirestore();
    const storage = getStorage();
    const storyRef = db.collection("dino-island").doc("story");
    const episodesRef = storyRef.collection("episodes");

    // 1. Fetch current story state
    const storySnap = await storyRef.get();
    let episodeNumber = 1;
    let runningSummary = "";

    if (storySnap.exists) {
        const data = storySnap.data();
        episodeNumber = (data.totalEpisodes || 0) + 1;
        runningSummary = data.runningSummary || "";
    }

    console.log(`Generating Episode ${episodeNumber}...`);

    // 2. Build the Gemini prompt
    const prompt = buildPrompt(episodeNumber, runningSummary);

    // 3. Call Gemini for story text
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const textModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.88,
            topP: 0.95,
            maxOutputTokens: 4096,
        },
    });

    const textResult = await textModel.generateContent(prompt);
    const rawText = textResult.response.text();

    // 4. Parse the story response
    const parsed = parseEpisodeResponse(rawText, episodeNumber);

    console.log(`Story generated: "${parsed.title}" (${parsed.content.split(/\s+/).length} words)`);

    // 5. Generate episode image using Imagen 3
    let imageUrl = null;
    try {
        imageUrl = await generateEpisodeImage(genAI, storage, parsed, episodeNumber);
        console.log(`Image generated and uploaded: ${imageUrl}`);
    } catch (imgErr) {
        console.error("Image generation failed (non-fatal):", imgErr.message);
        // Story will still be saved without an image
    }

    // 6. Save episode to Firestore
    const episodeDocRef = episodesRef.doc(`episode-${String(episodeNumber).padStart(3, "0")}`);
    await episodeDocRef.set({
        episodeNumber,
        title: parsed.title,
        hybrids: parsed.hybrids,
        content: parsed.content,
        wordCount: parsed.content.split(/\s+/).length,
        summary: parsed.summary,
        imageUrl: imageUrl || null,
        imagePrompt: parsed.imagePrompt || null,
        generatedAt: FieldValue.serverTimestamp(),
        publishedAt: new Date().toISOString(),
    });

    // 7. Update story meta document
    await storyRef.set({
        totalEpisodes: episodeNumber,
        runningSummary: parsed.newRunningSummary,
        lastGeneratedAt: FieldValue.serverTimestamp(),
        latestEpisodeTitle: parsed.title,
        latestEpisodeNumber: episodeNumber,
    }, { merge: true });

    console.log(`✅ Episode ${episodeNumber} "${parsed.title}" saved.`);
    return { success: true, episodeNumber, title: parsed.title, imageUrl };
}

// ==========================================================================
// Generate Episode Image using Nano Banana / Gemini Image Models
// ==========================================================================
async function generateEpisodeImage(genAI, storage, parsed, episodeNumber) {
    const rawPrompt = parsed.imagePrompt ||
        `A dramatic scene from a dinosaur island adventure story. ` +
        `Episode "${parsed.title}". Featured hybrids: ${parsed.hybrids.join(", ")}. ` +
        `Dense tropical jungle, volcanic peaks in background, stormy atmosphere, bioluminescent plants.`;

    const nanoBanaPrompt = `Cinematic 8K masterpiece movie still, photorealistic concept art, high definition hyper-detailed 3D render, ` +
        `Jurassic Park apex hybrid dinosaur aesthetic, dramatic volumetric storm lighting, bioluminescent volcanic jungle fog, ` +
        `epic 16:9 widescreen composition, ultra-sharp focus, vivid color grade: ${rawPrompt}`;

    const candidateModels = [
        "nano-banana-pro-preview",
        "gemini-2.5-flash-image",
        "imagen-3.0-generate-002",
        "imagen-3.0-generate-001"
    ];

    let imageBytes = null;

    for (const mName of candidateModels) {
        try {
            const imageModel = genAI.getGenerativeModel({ model: mName });
            const imageResult = await imageModel.generateImages({
                prompt: nanoBanaPrompt,
                number_of_images: 1,
                aspect_ratio: "16:9",
                safety_filter_level: "block_only_high",
                person_generation: "dont_allow",
            });

            if (imageResult && imageResult.images && imageResult.images.length > 0) {
                const imageData = imageResult.images[0];
                imageBytes = Buffer.from(imageData.bytesBase64Encoded, "base64");
                console.log(`✨ Nano Bana / Gemini Image success using model "${mName}"`);
                break;
            }
        } catch (e) {
            console.warn(`Model "${mName}" image note:`, e.message);
        }
    }

    if (!imageBytes) {
        throw new Error("Nano Bana / Imagen image generation returned no images across candidate models");
    }

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `dino-island/episodes/episode-${String(episodeNumber).padStart(3, "0")}.jpg`;
    const file = bucket.file(fileName);

    await file.save(imageBytes, {
        metadata: {
            contentType: "image/jpeg",
            metadata: {
                episodeNumber: String(episodeNumber),
                episodeTitle: parsed.title,
                generator: "nano-bana-gemini-hd"
            },
        },
    });

    // Make the file publicly readable
    await file.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// ==========================================================================
// Build the Gemini prompt
// ==========================================================================
function buildPrompt(episodeNumber, runningSummary) {
    const isFirstEpisode = episodeNumber === 1;

    const summarySection = isFirstEpisode
        ? `This is the FIRST EPISODE. Introduce D-Rex escaping from Lab 7 containment during a storm. 
Show the chaos in vivid detail — the containment breach, Dr. Vera Osei's conflicted reaction as she watches her creation break free, Chief Reyes mobilizing security forces, the terror and awe of the researchers who witness D-Rex's raw power. 
End with D-Rex vanishing into the jungle, leaving only crushed undergrowth and silence.
IMPORTANT: Write at least 2,000 words for a proper 10-minute read.`
        : `STORY SO FAR (running summary of all previous episodes):
${runningSummary}

Continue the story naturally from where it left off. Episode ${episodeNumber} should introduce new complications and advance D-Rex's journey across Isla Fragmentum.
IMPORTANT: Write at least 2,000 words for a proper 10-minute read.`;

    return `${STORY_BIBLE}

---

TASK: Write Episode ${episodeNumber} of Isla Fragmentum.

${summarySection}

---

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (include all six section headers):

HYBRIDS: [List the hybrid dinosaur names featured in this episode, comma-separated]

TITLE: [A dramatic episode title]

IMAGE_PROMPT: [A detailed, vivid image generation prompt (2-3 sentences) describing the most cinematic scene from this episode. Include the specific hybrid dinosaurs, setting details, lighting, mood. Style should be photorealistic cinematic concept art.]

CONTENT:
[The full episode text, MINIMUM 2,000 words — approximately a 10-minute read. Include a "Previously on Isla Fragmentum..." one-liner at the very start in bold. Write in third-person. Use vivid sensory details, strong verbs, and fast pacing for action scenes. Slow down for emotional and atmospheric moments.]

EPISODE_SUMMARY:
[A brief 4-6 sentence summary of THIS episode's key events — what happened, who was involved, what changed, any new hybrids or characters introduced.]

UPDATED_RUNNING_SUMMARY:
[The complete updated running story summary including all events up to and including this episode. Keep it under 1,000 words. This is the only context future episodes will receive, so include all important plot points, character developments, and world-building details.]
`;
}

// ==========================================================================
// Parse Gemini's response into structured data
// ==========================================================================
function parseEpisodeResponse(rawText, episodeNumber) {
    const extract = (label, nextLabel) => {
        const regex = new RegExp(`${label}:[\\s]*([\\s\\S]*?)(?=\\n${nextLabel}:|$)`, "i");
        const match = rawText.match(regex);
        return match ? match[1].trim() : "";
    };

    const hybridsRaw = extract("HYBRIDS", "TITLE");
    const title = extract("TITLE", "IMAGE_PROMPT");
    const imagePrompt = extract("IMAGE_PROMPT", "CONTENT");
    const content = extract("CONTENT", "EPISODE_SUMMARY");
    const summary = extract("EPISODE_SUMMARY", "UPDATED_RUNNING_SUMMARY");
    const newRunningSummary = extract("UPDATED_RUNNING_SUMMARY", "ZZZNOMATCH");

    const hybrids = hybridsRaw
        ? hybridsRaw.split(",").map((h) => h.trim()).filter(Boolean)
        : ["D-Rex"];

    return {
        title: title || `Episode ${episodeNumber}`,
        hybrids,
        imagePrompt: imagePrompt || null,
        content: content || rawText,
        summary: summary || "",
        newRunningSummary: newRunningSummary || summary || "",
    };
}
