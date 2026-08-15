// ==========================================================================
// Isla Fragmentum — Daily Dino Chronicles
// Front-End App: Reads episodes from Firestore, handles 1-5 star ratings
// ==========================================================================

import { initializeApp }      from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore,
         collection, doc,
         onSnapshot, getDoc, setDoc,
         runTransaction, increment }
                               from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, onAuthStateChanged }
                               from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// ── Firebase Config (same project as arcade) ──────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyDnZOwSu_5hqAuzAqgd3gNimWcQg1IuyIc",
    authDomain:        "eric-arcade.firebaseapp.com",
    projectId:         "eric-arcade",
    storageBucket:     "eric-arcade.firebasestorage.app",
    messagingSenderId: "933974427341",
    appId:             "1:933974427341:web:12c8a56664acf9e9c60b84"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── State ──────────────────────────────────────────────────────────────────
let episodes        = [];      // sorted ascending by episodeNumber
let currentEpIndex  = -1;      // index into episodes[]
let currentUser     = null;    // Firebase Auth user (or null)
let hoverValue      = 0;       // currently hovered star
let myRatings       = {};      // { episodeId: starValue } — loaded from localStorage
let savedUserProgress = null;

// ── DOM refs ──────────────────────────────────────────────────────────────
const sidebarLoading     = document.getElementById('sidebarLoading');
const episodeList        = document.getElementById('episodeList');
const noEpisodes         = document.getElementById('noEpisodes');
const episodeCountBadge  = document.getElementById('episodeCountBadge');
const countdownTime      = document.getElementById('countdownTime');

const welcomeState       = document.getElementById('welcomeState');
const episodeReader      = document.getElementById('episodeReader');

const episodeImage       = document.getElementById('episodeImage');
const episodeImageCont   = document.getElementById('episodeImageContainer');
const episodeNumberBadge = document.getElementById('episodeNumberBadge');
const hybridTags         = document.getElementById('hybridTags');
const episodeTitle       = document.getElementById('episodeTitle');
const episodeDate        = document.getElementById('episodeDate');
const episodeReadTime    = document.getElementById('episodeReadTime');
const storyContent       = document.getElementById('storyContent');
const readProgressFill   = document.getElementById('readProgressFill');

const starBtns           = document.querySelectorAll('.star-btn');
const ratingLabel        = document.getElementById('ratingLabel');
const avgStarsDisplay    = document.getElementById('avgStarsDisplay');
const avgScoreDisplay    = document.getElementById('avgScoreDisplay');
const ratingCountEl      = document.getElementById('ratingCount');
const alreadyRatedMsg    = document.getElementById('alreadyRatedMsg');
const yourRatingDisplay  = document.getElementById('yourRatingDisplay');

const prevEpBtn          = document.getElementById('prevEpBtn');
const nextEpBtn          = document.getElementById('nextEpBtn');

const sidebarToggle      = document.getElementById('sidebarToggle');
const sidebar            = document.getElementById('sidebar');
const sidebarOverlay     = document.getElementById('sidebarOverlay');

const toast              = document.getElementById('toast');
const toastMessage       = document.getElementById('toastMessage');

// TTS
const listenBtn          = document.getElementById('listenBtn');
const ttsBar             = document.getElementById('ttsBar');
const ttsWaveform        = document.getElementById('ttsWaveform');
const ttsSentenceCounter = document.getElementById('ttsSentenceCounter');
const ttsPlayPauseBtn    = document.getElementById('ttsPlayPauseBtn');
const ttsPlayPauseIcon   = document.getElementById('ttsPlayPauseIcon');
const ttsRestartBtn      = document.getElementById('ttsRestartBtn');
const ttsStopBtn         = document.getElementById('ttsStopBtn');
const ttsCloseBtn        = document.getElementById('ttsCloseBtn');
const ttsSpeedBtns       = document.querySelectorAll('.tts-speed-btn');
const ttsVoiceSelect     = document.getElementById('ttsVoiceSelect');
const readerPanel        = document.getElementById('readerPanel');

// ── TTS State ─────────────────────────────────────────────────────────────
const TTS = {
    sentences:      [],   // array of plain-text sentences
    currentIdx:     -1,   // sentence currently being spoken
    rate:           1.0,  // playback rate
    pitch:          0.92, // storytelling pitch (slightly deeper, dramatic)
    selectedVoice:  null,
    voices:         [],
    isPlaying:      false,
    isPaused:       false,
    utterance:      null,
    studioAudioUrl: null, // MP3 URL if episode has pre-rendered studio audio
    audioEl:        null, // HTMLAudioElement for studio MP3
    usingStudioAudio: false,
};

const FALLBACK_EPISODES = [
    {
        id: 'ep1-static',
        episodeNumber: 1,
        title: 'The Breaking of Lab 7',
        content: `**Previously on The Hybrid Dinosaur Experiment...** There is no "previously." This is where it begins.

The storm hit Isla Fragmentum at 11:43 PM. It came without warning — a wall of black cloud that swallowed the stars and turned the Pacific into a boiling sheet of foam. Lightning split the sky in three-second intervals, each flash illuminating the jagged volcanic peaks at the island's center. In the jungle below, creatures that had never known fear shrank into the undergrowth and did not move.

Dr. Vera Osei barely noticed. She was four levels underground, standing in front of a reinforced observation window the size of a school bus, staring at the thing they had made. Lab 7 smelled of ozone and old blood.

The habitat was enormous — a concrete cavern the size of an aircraft hangar, fitted with drainage channels, feeding troughs, and reinforced walls embedded with impact-absorbing gel panels. They'd had to rebuild it three times in the past eighteen months. Each time, the creature inside had found a new way to test its limits.

The creature they called D-Rex. Distortus Rex. Subject Alpha-7. Four years, two months, and eleven days of development, splicing the genetic material of three apex predators into a single living body. T-Rex for raw power. Spinosaurus for aquatic adaptability and spine structure. Velociraptor for neural density, problem-solving, and speed.

The result stood twelve meters tall at the shoulder. One arm was longer than the other — a developmental asymmetry they hadn't intended and couldn't explain — ending in six-fingered hands with claws that could rend quarter-inch steel plate like cardboard. A ridge of bony fins ran down its spine, each one edged with keratin so dense the electron microscopes had bounced off it. Its eyes burned amber, like old embers refusing to die.

It hit the eastern wall with both hands. The gel panels absorbed the first impact. The second fractured them. The third punched straight through into the darkness of the island. D-Rex had broken free.`,
        summary: 'D-Rex breaches containment at Lab 7 during a powerful Pacific storm, escaping into the uncharted jungles of Isla Fragmentum.',
        audioUrl: 'audio/episode-001.mp3',
        imageUrl: 'images/hybrid-dino-cover.png',
        publishedAt: '2026-08-14T18:00:00Z',
        ratingCount: 1,
        hybrids: ['D-Rex (Alpha-7)']
    }
];

let activeSeriesId   = 'hybrid-dino-experiment';
let unsubscribeRemoteEps = null;

const FALLBACK_COSMIC_EPISODES = [
    {
        id: 'cosmic-ep1-static',
        seriesId: 'cosmic-treehouse-explorers',
        episodeNumber: 1,
        title: 'The Crystal Nebulae Rescue',
        summary: 'Leo, Maya, and Spark open the treehouse star-portal into Sector 4 — The Crystal Nebulae — where a rare glowing Emberfox is trapped inside an ancient energy grid.',
        audioUrl: 'audio/cosmic-episode-001.mp3',
        imageUrl: 'images/cosmic-episode-001.jpg',
        publishedAt: '2026-08-15T18:00:00Z',
        averageRating: 5.0,
        ratingCount: 1,
        hybrids: ['Spark (Electric Sprite)', 'Crystal Emberfox'],
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

Leo grinned, adjusting his goggles. "Set coordinates for Sector 9. The adventure is just getting started!"`
    }
];

// ── Init ───────────────────────────────────────────────────────────────────
loadMyRatings();
loadAudiobookProgress();
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (currentUser) {
        syncProgressWithCloud();
    }
});
subscribeToEpisodes();
startCountdownTimer();
initSidebarToggle();
initScrollProgress();
initTTS();

// ── Load locally saved ratings ────────────────────────────────────────────
function loadMyRatings() {
    try {
        myRatings = JSON.parse(localStorage.getItem('dino_island_ratings') || '{}');
    } catch { myRatings = {}; }
}

function saveMyRatings() {
    localStorage.setItem('dino_island_ratings', JSON.stringify(myRatings));
}

function applyEpisodes(newEps) {
    if (!newEps || newEps.length === 0) return;
    episodes = newEps;
    if (sidebarLoading) sidebarLoading.classList.add('hidden');
    if (noEpisodes) noEpisodes.classList.add('hidden');
    if (episodeCountBadge) episodeCountBadge.textContent = `${episodes.length} episode${episodes.length !== 1 ? 's' : ''}`;

    const scEpCountIsla = document.getElementById('scEpCountIsla');
    if (scEpCountIsla) {
        scEpCountIsla.textContent = `${episodes.length} Episode${episodes.length !== 1 ? 's' : ''}`;
    }

    renderEpisodeList();

    if (currentEpIndex === -1 && episodes.length > 0) {
        openEpisode(0);
    } else if (currentEpIndex >= 0) {
        const updated = episodes.find(e => e.episodeNumber === episodes[currentEpIndex]?.episodeNumber);
        if (updated) renderRatingStats(updated);
    }
}

// ── Subscribe to episodes for active series in Firestore ──────────────────
function subscribeToEpisodes(seriesId = 'hybrid-dino-experiment') {
    if (unsubscribeRemoteEps) {
        try { unsubscribeRemoteEps(); } catch(e){}
    }

    activeSeriesId = seriesId;
    currentEpIndex = -1;

    const fallbacks = seriesId === 'cosmic-treehouse-explorers' ? FALLBACK_COSMIC_EPISODES : FALLBACK_EPISODES;
    applyEpisodes(fallbacks);

    try {
        const pathCol = seriesId === 'cosmic-treehouse-explorers'
            ? collection(db, 'cosmic-treehouse', 'episodes', 'all')
            : collection(db, 'dino-island', 'story', 'episodes');

        unsubscribeRemoteEps = onSnapshot(pathCol, (snapshot) => {
            if (!snapshot || snapshot.empty) return;
            const remoteEps = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .sort((a, b) => a.episodeNumber - b.episodeNumber);
            if (remoteEps.length > 0) {
                applyEpisodes(remoteEps);
            }
        }, (err) => {
            console.warn('Firestore snapshot notice:', err);
        });
    } catch (e) {
        console.warn('Firestore init notice:', e);
    }
}

// ── Render sidebar episode list ───────────────────────────────────────────
function renderEpisodeList() {
    episodeList.innerHTML = '';

    [...episodes].reverse().forEach((ep) => {
        const idx     = episodes.indexOf(ep);
        const myRate  = myRatings[ep.id];
        const avgText = ep.ratingCount > 0
            ? `★ ${Number(ep.averageRating).toFixed(1)} (${ep.ratingCount})`
            : '';

        const item = document.createElement('div');
        item.className = `episode-item ${idx === currentEpIndex ? 'active' : ''}`;
        item.dataset.idx = idx;

        const date = ep.publishedAt
            ? new Date(ep.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '';

        const hybridHtml = (ep.hybrids || [])
            .slice(0, 2)
            .map(h => `<span class="ep-hybrid-chip">${h}</span>`)
            .join('');

        const defaultCover = activeSeriesId === 'cosmic-treehouse-explorers' ? 'images/cosmic-treehouse-cover.png' : 'images/hybrid-dino-cover.png';
        const epImg = (ep.imageUrl && ep.imageUrl.trim() !== '') ? ep.imageUrl : defaultCover;

        const wc = ep.wordCount || (ep.content || '').split(/\s+/).length;
        const durMins = Math.max(1, Math.round(wc / 150));

        item.innerHTML = `
            <div class="ep-number-col" style="display:flex;flex-direction:column;align-items:center;">
                <img src="${epImg}" alt="${escHtml(ep.title)}" class="ep-list-thumb" style="width:42px;height:42px;border-radius:6px;object-fit:cover;border:1px solid rgba(255,255,255,0.15);">
                <span class="ep-number" style="font-size:0.7rem;margin-top:4px;">EP.${String(ep.episodeNumber).padStart(2, '0')}</span>
            </div>
            <div class="ep-info">
                <div class="ep-title-text">${escHtml(ep.title)}</div>
                <div class="ep-meta-mini" style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--cyan);margin:2px 0;">
                    <span><i class="fa-solid fa-clock"></i> ${durMins} min</span>
                    ${date ? `<span style="color:var(--text-dim);">· ${date}</span>` : ''}
                </div>
                ${avgText ? `<div class="ep-rating-mini">${avgText}</div>` : ''}
                <div class="ep-hybrids-mini">${hybridHtml}</div>
            </div>
        `;

        item.addEventListener('click', () => {
            openEpisode(idx);
            closeSidebar();
        });

        episodeList.appendChild(item);
    });
}

// ── Open an episode ───────────────────────────────────────────────────────
function openEpisode(idx) {
    if (idx < 0 || idx >= episodes.length) return;
    currentEpIndex = idx;
    const ep = episodes[idx];

    // Update sidebar active state
    document.querySelectorAll('.episode-item').forEach(el => {
        el.classList.toggle('active', Number(el.dataset.idx) === idx);
    });

    // Switch panels
    welcomeState.classList.add('hidden');
    episodeReader.classList.remove('hidden');

    // Scroll to top
    document.querySelector('.reader-panel').scrollTo({ top: 0, behavior: 'smooth' });

    // Reset transcript container to hidden by default
    const transcriptContainer  = document.getElementById('transcriptContainer');
    const toggleTranscriptBtn  = document.getElementById('toggleTranscriptBtn');
    const toggleTranscriptText = document.getElementById('toggleTranscriptText');
    if (transcriptContainer) transcriptContainer.classList.add('transcript-hidden');
    if (toggleTranscriptBtn) toggleTranscriptBtn.classList.remove('open');
    if (toggleTranscriptText) toggleTranscriptText.textContent = 'Show Text Transcript';

    // Episode image (fallback to active series cover artwork if null)
    const defaultCover = activeSeriesId === 'cosmic-treehouse-explorers' ? 'images/cosmic-treehouse-cover.png' : 'images/hybrid-dino-cover.png';
    const imgSrc = (ep.imageUrl && ep.imageUrl.trim() !== '') ? ep.imageUrl : defaultCover;
    episodeImage.src = imgSrc;
    episodeImage.alt = `Illustration for Episode ${ep.episodeNumber}: ${ep.title}`;
    episodeImageCont.style.display = '';

    // Badge
    episodeNumberBadge.textContent = `EP. ${String(ep.episodeNumber).padStart(2, '0')}`;

    // Hybrid tags
    hybridTags.innerHTML = (ep.hybrids || [])
        .map(h => `<span class="hybrid-tag">${escHtml(h)}</span>`)
        .join('');

    // Title
    episodeTitle.textContent = ep.title;

    // Date
    const dateStr = ep.publishedAt
        ? new Date(ep.publishedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';
    episodeDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${dateStr}`;

    // Duration (audio narration length)
    const wc = ep.wordCount || (ep.content || '').split(/\s+/).length;
    const mins = Math.max(1, Math.round(wc / 150));
    episodeReadTime.innerHTML = `<i class="fa-solid fa-clock"></i> ${mins} min narration`;

    // Story content — convert markdown-ish to HTML
    storyContent.innerHTML = renderStoryContent(ep.content || '');

    // Episode navigation
    prevEpBtn.disabled = idx === 0;
    nextEpBtn.disabled = idx === episodes.length - 1;

    // Rating
    renderRatingWidget(ep);
    renderRatingStats(ep);

    // Reset progress bar
    readProgressFill.style.width = '0%';
}

// ── Convert plain story text to readable HTML (with TTS sentence spans) ──
function renderStoryContent(raw) {
    let sentenceIdx = 0;

    return raw
        .split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';
            if (line === '---') return '<hr>';

            // Apply markdown-ish formatting to full line first
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            line = line.replace(/__(.+?)__/g, '<strong>$1</strong>');
            line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            line = line.replace(/_([^_]+)_/g, '<em>$1</em>');

            // Split into sentences for TTS targeting
            // Split on sentence-ending punctuation followed by space or end-of-string
            const sentencePattern = /([^.!?]*[.!?]+["']?\s*)/g;
            const plain = line.replace(/<[^>]+>/g, ''); // strip tags for splitting
            const parts = [];
            let lastIdx = 0;
            let m;
            const regex = /([^.!?]*[.!?]+['"']?\s*)/g;
            const sentences = plain.match(regex) || [plain];

            // Re-wrap with spans
            const spanned = sentences
                .filter(s => s.trim())
                .map(s => {
                    const idx = sentenceIdx++;
                    return `<span class="story-sentence" data-si="${idx}">${s}</span>`;
                })
                .join('');

            return `<p>${spanned || line}</p>`;
        })
        .join('');
}


// ── Rating widget ─────────────────────────────────────────────────────────
function renderRatingWidget(ep) {
    const alreadyRated = myRatings[ep.id];

    // Reset stars
    starBtns.forEach(btn => {
        btn.classList.remove('selected', 'hovered');
        btn.querySelector('i').className = alreadyRated ? 'fa-solid fa-star' : 'fa-regular fa-star';
        btn.disabled = !!alreadyRated;
    });

    if (alreadyRated) {
        // Show filled stars up to their rating
        starBtns.forEach(btn => {
            if (Number(btn.dataset.value) <= alreadyRated) {
                btn.classList.add('selected');
                btn.querySelector('i').className = 'fa-solid fa-star';
            }
        });
        ratingLabel.textContent = '';
        alreadyRatedMsg.classList.remove('hidden');
        yourRatingDisplay.textContent = alreadyRated;
    } else {
        ratingLabel.textContent = 'Tap a star to rate';
        alreadyRatedMsg.classList.add('hidden');
        initStarHover(ep);
    }
}

function initStarHover(ep) {
    starBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            hoverValue = Number(btn.dataset.value);
            updateStarDisplay(hoverValue, false);
            const labels = ['', 'Awful 😬', 'Meh 😐', 'Good 👍', 'Great! ⭐', 'Amazing! 🔥'];
            ratingLabel.textContent = labels[hoverValue];
        });
        btn.addEventListener('mouseleave', () => {
            hoverValue = 0;
            updateStarDisplay(0, false);
            ratingLabel.textContent = 'Tap a star to rate';
        });
        btn.addEventListener('click', () => {
            submitRating(ep, Number(btn.dataset.value));
        });
    });
}

function updateStarDisplay(value, isSelected) {
    starBtns.forEach(btn => {
        const v = Number(btn.dataset.value);
        const filled = v <= value;
        btn.querySelector('i').className = filled ? 'fa-solid fa-star' : 'fa-regular fa-star';
        btn.classList.toggle('hovered', filled && !isSelected);
        btn.classList.toggle('selected', filled && isSelected);
    });
}

// ── Submit rating ──────────────────────────────────────────────────────────
async function submitRating(ep, stars) {
    if (myRatings[ep.id]) return; // already rated

    // Optimistic UI
    myRatings[ep.id] = stars;
    saveMyRatings();
    updateStarDisplay(stars, true);
    ratingLabel.textContent = '';
    alreadyRatedMsg.classList.remove('hidden');
    yourRatingDisplay.textContent = stars;
    starBtns.forEach(btn => btn.disabled = true);

    showToast(`You rated Episode ${ep.episodeNumber} ${stars} star${stars !== 1 ? 's' : ''}! ⭐`);

    // Write to Firestore atomically
    try {
        const epRef   = doc(db, 'dino-island', 'story', 'episodes', ep.id);
        const rateRef = doc(db, 'dino-island', 'story', 'episodes', ep.id, 'ratings',
                           currentUser ? currentUser.uid : getAnonymousId());

        await runTransaction(db, async (tx) => {
            const epSnap   = await tx.get(epRef);
            const rateSnap = await tx.get(rateRef);

            // Prevent double-rating (server-side guard)
            if (rateSnap.exists()) return;

            const prev    = epSnap.data() || {};
            const oldSum  = prev.ratingSum   || 0;
            const oldCnt  = prev.ratingCount || 0;
            const newSum  = oldSum + stars;
            const newCnt  = oldCnt + 1;
            const newAvg  = newSum / newCnt;

            tx.set(rateRef, { stars, ratedAt: new Date().toISOString() });
            tx.update(epRef, {
                ratingSum:     newSum,
                ratingCount:   newCnt,
                averageRating: newAvg,
            });
        });
    } catch (err) {
        console.error('Rating write failed:', err);
        // Non-fatal — the localStorage rating is still saved
    }
}

// ── Render rating stats display ───────────────────────────────────────────
function renderRatingStats(ep) {
    const count = ep.ratingCount || 0;
    const avg   = ep.averageRating || 0;

    ratingCountEl.textContent = count === 0 ? 'No ratings yet' : `${count} rating${count !== 1 ? 's' : ''}`;

    if (count === 0) {
        avgScoreDisplay.textContent  = '—';
        avgStarsDisplay.textContent  = '☆☆☆☆☆';
    } else {
        avgScoreDisplay.textContent = avg.toFixed(1);
        const filled  = Math.round(avg);
        avgStarsDisplay.textContent = '★'.repeat(filled) + '☆'.repeat(5 - filled);
    }
}

// ── Episode navigation buttons ────────────────────────────────────────────
if (prevEpBtn) prevEpBtn.addEventListener('click', () => openEpisode(currentEpIndex - 1));
if (nextEpBtn) nextEpBtn.addEventListener('click', () => openEpisode(currentEpIndex + 1));

// ── Scroll progress bar ───────────────────────────────────────────────────
function initScrollProgress() {
    const panel = document.querySelector('.reader-panel');
    if (!panel) return;
    panel.addEventListener('scroll', () => {
        const scrollable = panel.scrollHeight - panel.clientHeight;
        if (scrollable <= 0) return;
        const pct = (panel.scrollTop / scrollable) * 100;
        readProgressFill.style.width = `${Math.min(pct, 100)}%`;
    });
}

// ── Countdown timer ───────────────────────────────────────────────────────
function startCountdownTimer() {
    tick();
    setInterval(tick, 1000);
}
function tick() {
    if (!countdownTime) return;
    const now  = new Date();
    const next = new Date();
    next.setHours(18, 0, 0, 0); // 6 PM local
    if (now >= next) next.setDate(next.getDate() + 1);

    const diff = next - now;
    const h    = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
    const m    = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0');
    const s    = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0');
    countdownTime.textContent = `${h}:${m}:${s}`;
}

// ── Mobile sidebar ────────────────────────────────────────────────────────
function initSidebarToggle() {
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('hidden');
        });
    }
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
}
function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
}

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ── Anonymous session ID (for guests who aren't logged in) ────────────────
function getAnonymousId() {
    let id = localStorage.getItem('dino_anon_id');
    if (!id) {
        id = 'anon_' + Math.random().toString(36).slice(2, 12);
        localStorage.setItem('dino_anon_id', id);
    }
    return id;
}

// ── HTML escape ───────────────────────────────────────────────────────────
function escHtml(str) {
    return (str || '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

// ── User Audiobook Progress Persistence (Local + Cloud Sync) ───────────────
function loadAudiobookProgress() {
    try {
        const raw = localStorage.getItem('dino_audiobook_progress');
        if (raw) savedUserProgress = JSON.parse(raw);
    } catch (e) {
        savedUserProgress = null;
    }
    updateResumeUI();
}

async function syncProgressWithCloud() {
    if (currentUser) {
        try {
            const userProgressRef = doc(db, 'dino-island', 'users', currentUser.uid, 'progress', 'latest');
            const snap = await getDoc(userProgressRef);
            if (snap.exists()) {
                const cloudProg = snap.data();
                if (cloudProg && cloudProg.episodeNumber) {
                    savedUserProgress = cloudProg;
                    localStorage.setItem('dino_audiobook_progress', JSON.stringify(cloudProg));
                }
            }
        } catch (e) {
            console.warn('Cloud progress sync notice:', e);
        }
    }
    updateResumeUI();
}

let saveProgressTimer = null;
function saveAudiobookProgress(epIndex, pct, currentTime) {
    if (epIndex < 0 || !episodes[epIndex]) return;
    const ep = episodes[epIndex];
    const progressData = {
        seriesId: 'hybrid-dino-experiment',
        episodeNumber: ep.episodeNumber,
        episodeId: ep.id,
        title: ep.title,
        progressPercent: pct || 0,
        currentTime: currentTime || 0,
        updatedAt: new Date().toISOString()
    };

    savedUserProgress = progressData;
    localStorage.setItem('dino_audiobook_progress', JSON.stringify(progressData));

    if (currentUser) {
        if (saveProgressTimer) clearTimeout(saveProgressTimer);
        saveProgressTimer = setTimeout(async () => {
            try {
                const userProgressRef = doc(db, 'dino-island', 'users', currentUser.uid, 'progress', 'latest');
                await setDoc(userProgressRef, progressData, { merge: true });
            } catch (e) {
                console.warn('Firestore progress write failed:', e);
            }
        }, 3000);
    }

    updateResumeUI();
}

function updateResumeUI() {
    if (!savedUserProgress || !savedUserProgress.episodeNumber) return;

    const resumeBtn = document.getElementById('scResumeBtnIsla');
    if (resumeBtn) {
        const epNum = savedUserProgress.episodeNumber;
        const pct   = Math.round(savedUserProgress.progressPercent || 0);
        resumeBtn.style.display = 'inline-flex';
        resumeBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Resume Ep. ${epNum} (${pct}%)`;
    }
}

// ==========================================================================
// TTS — Web Speech API & Studio Narration Reader
// ==========================================================================

function broadcastAudioState() {
    const ep = episodes[currentEpIndex];
    const duration = (TTS.audioEl && TTS.audioEl.duration) ? TTS.audioEl.duration : 1;
    const currentTime = (TTS.audioEl && TTS.audioEl.currentTime) ? TTS.audioEl.currentTime : 0;
    const pct = TTS.usingStudioAudio ? Math.floor((currentTime / duration) * 100) : 50;

    if (currentEpIndex >= 0) {
        saveAudiobookProgress(currentEpIndex, pct, currentTime);
    }

    if (window.parent && window.parent !== window) {
        window.parent.postMessage({
            type: 'AUDIOBOOK_STATE',
            isPlaying: TTS.isPlaying,
            title: ep ? `Ep. ${ep.episodeNumber}: ${ep.title}` : 'The Hybrid Dinosaur Experiment',
            seriesTitle: 'The Hybrid Dinosaur Experiment',
            coverUrl: ep && ep.imageUrl ? ep.imageUrl : 'images/hybrid-dino-cover.png',
            progressPercent: pct
        }, '*');
    }
}

function initTTS() {
    // 1. Initialize HTML5 Audio Element for studio MP3 narration
    try {
        TTS.audioEl = new Audio();
        TTS.audioEl.addEventListener('ended', () => {
            ttsStop();
            broadcastAudioState();

            // Continuous Autoplay next episode
            const autoplayCheck = document.getElementById('autoplayToggleCheck');
            const shouldAutoplay = autoplayCheck ? autoplayCheck.checked : true;
            if (shouldAutoplay && currentEpIndex + 1 < episodes.length) {
                console.log(`🔄 Autoplay: starting Episode ${currentEpIndex + 2}...`);
                setTimeout(() => {
                    openEpisode(currentEpIndex + 1);
                    ttsStart(0);
                }, 800);
            }
        });
        TTS.audioEl.addEventListener('timeupdate', () => {
            if (!TTS.usingStudioAudio || !TTS.audioEl.duration) return;
            const pct = Math.floor((TTS.audioEl.currentTime / TTS.audioEl.duration) * 100);
            const curMins = Math.floor(TTS.audioEl.currentTime / 60);
            const curSecs = Math.floor(TTS.audioEl.currentTime % 60);
            const durMins = Math.floor(TTS.audioEl.duration / 60);
            const durSecs = Math.floor(TTS.audioEl.duration % 60);
            ttsSentenceCounter.textContent = `${curMins}:${String(curSecs).padStart(2, '0')} / ${durMins}:${String(durSecs).padStart(2, '0')}`;
            const ttsProgressFill = document.getElementById('ttsProgressFill');
            if (ttsProgressFill) ttsProgressFill.style.width = `${pct}%`;
            broadcastAudioState();
        });
        TTS.audioEl.addEventListener('play', broadcastAudioState);
        TTS.audioEl.addEventListener('pause', broadcastAudioState);
        TTS.audioEl.addEventListener('error', (e) => {
            console.warn('Studio MP3 playback error, falling back to Web Speech API:', e);
            TTS.usingStudioAudio = false;
            ttsFallbackWebSpeech(TTS.currentIdx >= 0 ? TTS.currentIdx : 0);
        });
    } catch (e) {
        console.warn('Audio element init error:', e);
    }

    // 2. ALWAYS attach listen button click listener
    if (listenBtn) {
        listenBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if ('speechSynthesis' in window && window.speechSynthesis) {
                window.speechSynthesis.resume();
            }

            if (currentEpIndex < 0 && episodes.length > 0) {
                openEpisode(0);
            }

            if (TTS.isPlaying || TTS.isPaused) {
                ttsStop();
            } else {
                ttsStart(0);
            }
        });
    }

    const heroPlayBtn = document.getElementById('heroPlayBtn');
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if ('speechSynthesis' in window && window.speechSynthesis) window.speechSynthesis.resume();
            if (currentEpIndex < 0 && episodes.length > 0) openEpisode(0);
            if (TTS.isPlaying || TTS.isPaused) ttsStop();
            else ttsStart(0);
        });
    }

    const toggleTranscriptBtn  = document.getElementById('toggleTranscriptBtn');
    const toggleTranscriptText = document.getElementById('toggleTranscriptText');
    const transcriptContainer  = document.getElementById('transcriptContainer');

    if (toggleTranscriptBtn && transcriptContainer) {
        toggleTranscriptBtn.addEventListener('click', () => {
            const isHidden = transcriptContainer.classList.contains('transcript-hidden');
            transcriptContainer.classList.toggle('transcript-hidden', !isHidden);
            toggleTranscriptBtn.classList.toggle('open', isHidden);
            if (toggleTranscriptText) {
                toggleTranscriptText.textContent = isHidden ? 'Hide Text Transcript' : 'Show Text Transcript';
            }
        });
    }

    // ── Series Collection Navigation Controllers ──
    const seriesCollectionView = document.getElementById('seriesCollectionView');
    const seriesDetailView     = document.getElementById('seriesDetailView');
    const navCollectionsBtn    = document.getElementById('navCollectionsBtn');
    const headerLogoBtn        = document.getElementById('headerLogoBtn');
    const seriesCardIsla       = document.getElementById('seriesCardIsla');
    const minimizeAppBtn       = document.getElementById('minimizeAppBtn');

    function showCollectionsView() {
        if (seriesCollectionView) seriesCollectionView.classList.remove('hidden');
        if (seriesDetailView) seriesDetailView.classList.add('hidden');
    }

    function showSeriesDetail() {
        if (seriesCollectionView) seriesCollectionView.classList.add('hidden');
        if (seriesDetailView) seriesDetailView.classList.remove('hidden');
    }

    function openSeriesDetail() {
        showSeriesDetail();
        if (episodes.length > 0 && currentEpIndex === -1) {
            openEpisode(0);
        }
    }

    function playSeriesAndStartAudio() {
        showSeriesDetail();
        if (episodes.length > 0) {
            const targetIdx = currentEpIndex >= 0 ? currentEpIndex : 0;
            openEpisode(targetIdx);
            if ('speechSynthesis' in window && window.speechSynthesis) {
                window.speechSynthesis.resume();
            }
            if (TTS.isPlaying || TTS.isPaused) {
                ttsStop();
            }
            setTimeout(() => {
                ttsStart(0);
            }, 100);
        } else {
            const waitCheck = setInterval(() => {
                if (episodes.length > 0) {
                    clearInterval(waitCheck);
                    openEpisode(0);
                    if ('speechSynthesis' in window && window.speechSynthesis) {
                        window.speechSynthesis.resume();
                    }
                    setTimeout(() => ttsStart(0), 100);
                }
            }, 200);
            setTimeout(() => clearInterval(waitCheck), 4000);
        }
    }

    function selectSeries(seriesId) {
        if (activeSeriesId !== seriesId) {
            subscribeToEpisodes(seriesId);
        }
        const cardIsla   = document.getElementById('seriesCardIsla');
        const cardCosmic = document.getElementById('seriesCardCosmic');
        if (cardIsla)   cardIsla.classList.toggle('active-series', seriesId === 'hybrid-dino-experiment');
        if (cardCosmic) cardCosmic.classList.toggle('active-series', seriesId === 'cosmic-treehouse-explorers');
    }

    if (seriesCardIsla) {
        seriesCardIsla.addEventListener('click', (e) => {
            e.preventDefault();
            selectSeries('hybrid-dino-experiment');
            openSeriesDetail();
        });
    }

    const seriesCardCosmic = document.getElementById('seriesCardCosmic');
    if (seriesCardCosmic) {
        seriesCardCosmic.addEventListener('click', (e) => {
            e.preventDefault();
            selectSeries('cosmic-treehouse-explorers');
            openSeriesDetail();
        });
    }

    const scPlayBtnIsla = document.getElementById('scPlayBtnIsla');
    if (scPlayBtnIsla) {
        scPlayBtnIsla.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectSeries('hybrid-dino-experiment');
            playSeriesAndStartAudio();
        });
    }

    const scPlayBtnCosmic = document.getElementById('scPlayBtnCosmic');
    if (scPlayBtnCosmic) {
        scPlayBtnCosmic.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectSeries('cosmic-treehouse-explorers');
            playSeriesAndStartAudio();
        });
    }

    const scResumeBtnIsla = document.getElementById('scResumeBtnIsla');
    if (scResumeBtnIsla) {
        scResumeBtnIsla.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (savedUserProgress && savedUserProgress.episodeNumber) {
                showSeriesDetail();
                const epIdx = episodes.findIndex(ep => ep.episodeNumber === savedUserProgress.episodeNumber);
                const targetIdx = epIdx >= 0 ? epIdx : 0;
                openEpisode(targetIdx);
                if ('speechSynthesis' in window && window.speechSynthesis) window.speechSynthesis.resume();
                setTimeout(() => {
                    ttsStart(0);
                    if (savedUserProgress.progressPercent > 0) {
                        setTimeout(() => seekAudioToPercent(savedUserProgress.progressPercent), 250);
                    }
                }, 150);
            } else {
                playOrOpenSeries();
            }
        });
    }

    if (navCollectionsBtn) navCollectionsBtn.addEventListener('click', showCollectionsView);
    if (headerLogoBtn) headerLogoBtn.addEventListener('click', showCollectionsView);

    if (minimizeAppBtn) {
        minimizeAppBtn.addEventListener('click', () => {
            broadcastAudioState();
            // Request parent arcade modal to minimize / close without stopping audio
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'MINIMIZE_ARCADE_MODAL' }, '*');
            }
        });
    }

    // Parent Command Listener (from root Arcade floating mini player)
    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || data.type !== 'AUDIOBOOK_COMMAND') return;

        if (data.action === 'play') ttsResume();
        else if (data.action === 'pause') ttsPause();
        else if (data.action === 'stop') ttsStop();
        else if (data.action === 'seek') {
            seekAudioToPercent(data.percent);
        } else if (data.action === 'next') {
            if (currentEpIndex + 1 < episodes.length) {
                openEpisode(currentEpIndex + 1);
                ttsStart(0);
            }
        } else if (data.action === 'prev') {
            if (currentEpIndex - 1 >= 0) {
                openEpisode(currentEpIndex - 1);
                ttsStart(0);
            }
        }
    });

    // In-App Progress Track Seeking
    const ttsProgressTrack = document.getElementById('ttsProgressTrack');
    if (ttsProgressTrack) {
        function handleInAppSeek(e) {
            const rect = ttsProgressTrack.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
            seekAudioToPercent(pct);
        }

        let isTrackDragging = false;
        ttsProgressTrack.addEventListener('click', (e) => {
            handleInAppSeek(e);
        });
        ttsProgressTrack.addEventListener('mousedown', (e) => {
            isTrackDragging = true;
            handleInAppSeek(e);
        });
        window.addEventListener('mousemove', (e) => {
            if (isTrackDragging) handleInAppSeek(e);
        });
        window.addEventListener('mouseup', () => {
            isTrackDragging = false;
        });
    }

    // 3. Sentence click delegation
    if (storyContent) {
        storyContent.addEventListener('click', (e) => {
            const span = e.target.closest('.story-sentence');
            if (!span) return;
            const si = parseInt(span.dataset.si, 10);
            if (!isNaN(si)) {
                ttsStart(si);
            }
        });
    }

    // 4. Control buttons
    if (ttsPlayPauseBtn) {
        ttsPlayPauseBtn.addEventListener('click', () => {
            if (TTS.isPaused) ttsResume();
            else if (TTS.isPlaying) ttsPause();
        });
    }

    if (ttsRestartBtn) ttsRestartBtn.addEventListener('click', () => ttsStart(0));
    if (ttsStopBtn) ttsStopBtn.addEventListener('click', ttsStop);
    if (ttsCloseBtn) ttsCloseBtn.addEventListener('click', ttsStop);

    const ttsNextBtn = document.getElementById('ttsNextBtn');
    if (ttsNextBtn) {
        ttsNextBtn.addEventListener('click', () => {
            if (currentEpIndex + 1 < episodes.length) {
                openEpisode(currentEpIndex + 1);
                ttsStart(0);
            }
        });
    }

    ttsSpeedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            TTS.rate = parseFloat(btn.dataset.rate);
            ttsSpeedBtns.forEach(b => b.classList.toggle('active', b === btn));
            if (TTS.audioEl) TTS.audioEl.playbackRate = TTS.rate;

            if (TTS.isPlaying && TTS.currentIdx >= 0 && !TTS.usingStudioAudio) {
                const idx = TTS.currentIdx;
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setTimeout(() => ttsStart(idx), 80);
            }
        });
    });

    // Stop TTS when user switches episodes
    if (prevEpBtn) prevEpBtn.addEventListener('click', ttsStop);
    if (nextEpBtn) nextEpBtn.addEventListener('click', ttsStop);

    // 5. Populate Web Speech voices if supported
    if ('speechSynthesis' in window && window.speechSynthesis) {
        populateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoices;
        }

        if (ttsVoiceSelect) {
            ttsVoiceSelect.addEventListener('change', () => {
                const val = ttsVoiceSelect.value;
                if (val === 'studio') {
                    TTS.selectedVoice = null;
                    ttsStart(0);
                } else {
                    TTS.selectedVoice = TTS.voices.find(v => v.name === val) || null;
                    TTS.usingStudioAudio = false;
                    if (TTS.audioEl) TTS.audioEl.pause();
                    ttsFallbackWebSpeech(TTS.currentIdx >= 0 ? TTS.currentIdx : 0);
                }
            });
        }
    }
}

// ── Voice Ranking & Selection ─────────────────────────────────────────────
function scoreVoice(v) {
    let score = 0;
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    if (lang.startsWith('en')) score += 10;
    if (lang === 'en-us') score += 5;

    // Heavily prioritize male narrator voices matching Andrew Studio Narrator
    if (name.includes('andrew') || name.includes('guy') || name.includes('david') || name.includes('christopher') || name.includes('ryan') || name.includes('george') || name.includes('male') || name.includes('steffan') || name.includes('daniel')) {
        score += 60;
    }

    // Quality keywords
    if (name.includes('natural')) score += 30;
    if (name.includes('online')) score += 20;
    if (name.includes('neural')) score += 25;
    if (name.includes('google')) score += 20;
    if (name.includes('premium')) score += 25;
    if (name.includes('enhanced')) score += 20;
    if (name.includes('studio')) score += 30;

    // Heavily penalize female voices so male narrator is always selected
    if (name.includes('zira') || name.includes('samantha') || name.includes('victoria') || name.includes('karen') || name.includes('female') || name.includes('aria') || name.includes('jenny') || name.includes('michelle') || name.includes('hazel')) {
        score -= 100;
    }

    return score;
}

function populateVoices() {
    const raw = (window.speechSynthesis && window.speechSynthesis.getVoices) ? window.speechSynthesis.getVoices() : [];

    // Filter to English voices & sort by quality score
    const englishVoices = raw.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
    const list = englishVoices.length > 0 ? englishVoices : raw;

    list.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    TTS.voices = list;

    if (ttsVoiceSelect) {
        const studioOption = `<option value="studio">🎙️ Studio Narrator (HD)</option>`;
        const voiceOptions = list.map(v => {
            let label = v.name.replace(/Microsoft |Google |Apple /gi, '').replace(/ (Natural|Online \(Natural\))/gi, ' ✨');
            if (label.length > 22) label = label.substring(0, 20) + '…';
            return `<option value="${escHtml(v.name)}">${escHtml(label)}</option>`;
        }).join('');

        ttsVoiceSelect.innerHTML = studioOption + voiceOptions;
        ttsVoiceSelect.value = 'studio';
    }
}

function seekAudioToPercent(pct) {
    if (pct === undefined || pct < 0 || pct > 100) return;

    if (TTS.usingStudioAudio && TTS.audioEl && TTS.audioEl.duration) {
        TTS.audioEl.currentTime = (pct / 100) * TTS.audioEl.duration;
        const ttsProgressFill = document.getElementById('ttsProgressFill');
        if (ttsProgressFill) ttsProgressFill.style.width = `${pct}%`;
        broadcastAudioState();
    } else if (TTS.sentences && TTS.sentences.length > 0) {
        const targetSentence = Math.floor((pct / 100) * TTS.sentences.length);
        const ttsProgressFill = document.getElementById('ttsProgressFill');
        if (ttsProgressFill) ttsProgressFill.style.width = `${pct}%`;
        ttsStart(targetSentence);
    }
}

// ── Prepare sentences from current episode story ───────────────────────────
function ttsPrepare() {
    const spans = storyContent.querySelectorAll('.story-sentence');
    TTS.sentences = Array.from(spans).map(s => s.textContent.replace(/#+/g, '').replace(/[\*\_\~]/g, '').trim()).filter(Boolean);
}

// ── Start reading from a given sentence index ──────────────────────────────
function ttsStart(fromIdx) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (TTS.audioEl) {
        TTS.audioEl.pause();
        TTS.audioEl.currentTime = 0;
    }
    ttsHighlightClear();

    const currentEp = episodes[currentEpIndex];
    const epNum = currentEp ? currentEp.episodeNumber : 1;
    const staticAudioPath = `audio/episode-${String(epNum).padStart(3, '0')}.mp3`;
    const targetAudioUrl = (currentEp && currentEp.audioUrl && currentEp.audioUrl.trim()) ? currentEp.audioUrl : staticAudioPath;

    TTS.isPlaying = true;
    TTS.isPaused  = false;
    TTS.currentIdx = fromIdx;

    // UI: show bar, animate listen button
    listenBtn.classList.add('listening');
    ttsBar.classList.remove('hidden');
    readerPanel.classList.add('tts-open');
    ttsSetPlayingUI(true);

    if (targetAudioUrl && TTS.audioEl && (!TTS.selectedVoice)) {
        // Attempt Studio MP3 Mode
        TTS.usingStudioAudio = true;
        const voiceContainer = ttsVoiceSelect ? ttsVoiceSelect.closest('.tts-voice') : null;
        if (voiceContainer) voiceContainer.style.display = '';

        TTS.audioEl.src = targetAudioUrl;
        TTS.audioEl.playbackRate = TTS.rate;
        const playPromise = TTS.audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                ttsSentenceCounter.textContent = '0:00';
            }).catch(err => {
                console.warn('Studio MP3 play rejected, executing Web Speech fallback:', err);
                TTS.usingStudioAudio = false;
                ttsFallbackWebSpeech(fromIdx);
            });
        }
    } else {
        ttsFallbackWebSpeech(fromIdx);
    }
}

function ttsFallbackWebSpeech(fromIdx) {
    TTS.usingStudioAudio = false;
    const voiceContainer = ttsVoiceSelect ? ttsVoiceSelect.closest('.tts-voice') : null;
    if (voiceContainer) voiceContainer.style.display = '';

    ttsPrepare();
    if (TTS.sentences.length === 0) return;
    ttsSpeak(fromIdx);
}

// ── Speak a single sentence, then chain to next ────────────────────────────
function ttsSpeak(idx) {
    if (idx >= TTS.sentences.length) {
        ttsStop();
        return;
    }

    TTS.currentIdx = idx;
    ttsHighlightSentence(idx);
    ttsSentenceCounter.textContent = `${idx + 1} / ${TTS.sentences.length}`;

    const utt = new SpeechSynthesisUtterance(TTS.sentences[idx]);
    utt.rate = TTS.rate;
    utt.pitch = TTS.pitch;
    if (TTS.selectedVoice) {
        utt.voice = TTS.selectedVoice;
    } else {
        utt.lang = 'en-US';
    }

    utt.onend = () => {
        if (!TTS.isPlaying && !TTS.isPaused) return;
        ttsSpeak(idx + 1);
    };
    utt.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        console.warn('TTS voice error:', e.error, 'Selected voice:', TTS.selectedVoice ? TTS.selectedVoice.name : 'default');
        
        // If the selected voice failed to speak, clear selectedVoice to fallback to default system voice
        if (TTS.selectedVoice) {
            console.warn('Falling back to default system voice due to voice error');
            TTS.selectedVoice = null;
            if (ttsVoiceSelect) ttsVoiceSelect.value = 'studio';
            setTimeout(() => ttsSpeak(idx), 50);
            return;
        }

        ttsSpeak(idx + 1);
    };

    TTS.utterance = utt;
    window.speechSynthesis.speak(utt);
}

// ── Pause ──────────────────────────────────────────────────────────────────
function ttsPause() {
    if (!TTS.isPlaying && !TTS.usingStudioAudio) return;
    if (TTS.usingStudioAudio && TTS.audioEl) {
        TTS.audioEl.pause();
    } else if (window.speechSynthesis) {
        window.speechSynthesis.pause();
    }
    TTS.isPaused  = true;
    TTS.isPlaying = false;
    ttsSetPlayingUI(false);
}

// ── Resume ─────────────────────────────────────────────────────────────────
function ttsResume() {
    if (TTS.usingStudioAudio && TTS.audioEl) {
        if (TTS.audioEl.paused) {
            TTS.audioEl.play().catch(err => console.warn('Resume failed:', err));
        }
    } else if (TTS.isPaused && window.speechSynthesis) {
        window.speechSynthesis.resume();
    } else if (!TTS.isPlaying) {
        ttsStart(TTS.currentIdx >= 0 ? TTS.currentIdx : 0);
        return;
    }
    TTS.isPaused  = false;
    TTS.isPlaying = true;
    ttsSetPlayingUI(true);
    broadcastAudioState();
}

// ── Stop completely ────────────────────────────────────────────────────────
function ttsStop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (TTS.audioEl) {
        TTS.audioEl.pause();
        TTS.audioEl.currentTime = 0;
    }
    TTS.isPlaying  = false;
    TTS.isPaused   = false;
    TTS.currentIdx = -1;

    ttsHighlightClear();
    listenBtn.classList.remove('listening');
    ttsBar.classList.add('hidden');
    readerPanel.classList.remove('tts-open');
    ttsSentenceCounter.textContent = '— / —';
    ttsSetPlayingUI(false);
}

// ── Update play/pause button icon and waveform ─────────────────────────────
function ttsSetPlayingUI(playing) {
    ttsPlayPauseIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    ttsWaveform.classList.toggle('playing', playing);
}

// ── Highlight a sentence span ──────────────────────────────────────────────
function ttsHighlightSentence(idx) {
    ttsHighlightClear();
    const spans = storyContent.querySelectorAll('.story-sentence');
    if (spans[idx]) {
        spans[idx].classList.add('tts-active');
        // Auto-scroll: keep highlighted sentence in view
        spans[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function ttsHighlightClear() {
    storyContent.querySelectorAll('.tts-active').forEach(el => el.classList.remove('tts-active'));
}

