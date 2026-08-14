// ==========================================================================
// Isla Fragmentum — Daily Dino Chronicles
// Front-End App: Reads episodes from Firestore, handles 1-5 star ratings
// ==========================================================================

import { initializeApp }      from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore,
         collection, doc,
         onSnapshot, getDoc,
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

// ── Init ───────────────────────────────────────────────────────────────────
loadMyRatings();
onAuthStateChanged(auth, (user) => { currentUser = user; });
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

// ── Subscribe to all episodes in Firestore ────────────────────────────────
function subscribeToEpisodes() {
    const episodesRef = collection(db, 'dino-island', 'story', 'episodes');

    onSnapshot(episodesRef, (snapshot) => {
        if (snapshot.empty) {
            sidebarLoading.classList.add('hidden');
            noEpisodes.classList.remove('hidden');
            episodeCountBadge.textContent = '0 episodes';
            return;
        }

        // Sort by episodeNumber ascending
        episodes = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => a.episodeNumber - b.episodeNumber);

        sidebarLoading.classList.add('hidden');
        noEpisodes.classList.add('hidden');
        episodeCountBadge.textContent = `${episodes.length} episode${episodes.length !== 1 ? 's' : ''}`;

        renderEpisodeList();

        // Auto-open latest episode if nothing selected
        if (currentEpIndex === -1 && episodes.length > 0) {
            openEpisode(episodes.length - 1);
        } else if (currentEpIndex >= 0) {
            // Re-render current episode in case rating data changed
            const updated = episodes.find(e => e.episodeNumber === episodes[currentEpIndex]?.episodeNumber);
            if (updated) renderRatingStats(updated);
        }
    });
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

        item.innerHTML = `
            <div class="ep-number-col">
                <span class="ep-number">${String(ep.episodeNumber).padStart(2, '0')}</span>
            </div>
            <div class="ep-info">
                <div class="ep-title-text">${escHtml(ep.title)}</div>
                ${date ? `<div class="ep-date-text">${date}</div>` : ''}
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

    // Episode image (fallback to cover.png if null)
    const imgSrc = ep.imageUrl || 'cover.png';
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

    // Read time (avg 220 wpm)
    const wc = ep.wordCount || (ep.content || '').split(/\s+/).length;
    const mins = Math.ceil(wc / 220);
    episodeReadTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${mins} min read`;

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
prevEpBtn.addEventListener('click', () => openEpisode(currentEpIndex - 1));
nextEpBtn.addEventListener('click', () => openEpisode(currentEpIndex + 1));

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
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('hidden');
    });
    sidebarOverlay.addEventListener('click', closeSidebar);
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.add('hidden');
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

// ==========================================================================
// TTS — Web Speech API & Studio Narration Reader
// ==========================================================================

function initTTS() {
    // 1. Initialize HTML5 Audio Element for studio MP3 narration
    try {
        TTS.audioEl = new Audio();
        TTS.audioEl.addEventListener('ended', ttsStop);
        TTS.audioEl.addEventListener('timeupdate', () => {
            if (!TTS.usingStudioAudio || !TTS.audioEl.duration) return;
            const pct = Math.floor((TTS.audioEl.currentTime / TTS.audioEl.duration) * 100);
            ttsSentenceCounter.textContent = `🎙️ Studio Narration: ${pct}%`;
        });
        TTS.audioEl.addEventListener('error', (e) => {
            console.warn('Studio MP3 playback error, falling back to Web Speech API:', e);
            TTS.usingStudioAudio = false;
            ttsFallbackWebSpeech(TTS.currentIdx >= 0 ? TTS.currentIdx : 0);
        });
    } catch (e) {
        console.warn('Audio element init error:', e);
    }

    // 2. ALWAYS attach listen button click listener
    listenBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Synchronously prime Web Speech API within click callstack
        if ('speechSynthesis' in window && window.speechSynthesis) {
            window.speechSynthesis.resume();
        }

        // 2. Open first episode if none selected
        if (currentEpIndex < 0 && episodes.length > 0) {
            openEpisode(0);
        }

        if (TTS.isPlaying || TTS.isPaused) {
            ttsStop();
        } else {
            ttsStart(0);
        }
    });

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

    // 3. Sentence click delegation: click any sentence to start reading from there
    storyContent.addEventListener('click', (e) => {
        const span = e.target.closest('.story-sentence');
        if (!span) return;
        const si = parseInt(span.dataset.si, 10);
        if (!isNaN(si)) {
            ttsStart(si);
        }
    });

    // 4. Control buttons
    ttsPlayPauseBtn.addEventListener('click', () => {
        if (TTS.isPaused) ttsResume();
        else if (TTS.isPlaying) ttsPause();
    });

    ttsRestartBtn.addEventListener('click', () => ttsStart(0));
    ttsStopBtn.addEventListener('click', ttsStop);
    ttsCloseBtn.addEventListener('click', ttsStop);

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
    prevEpBtn.addEventListener('click', ttsStop);
    nextEpBtn.addEventListener('click', ttsStop);

    // 5. Populate Web Speech voices if supported
    if ('speechSynthesis' in window && window.speechSynthesis) {
        populateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoices;
        }

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

// ── Voice Ranking & Selection ─────────────────────────────────────────────
function scoreVoice(v) {
    let score = 0;
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    if (lang.startsWith('en')) score += 10;
    if (lang === 'en-us') score += 5;

    // Quality keywords
    if (name.includes('natural')) score += 30;
    if (name.includes('online')) score += 20;
    if (name.includes('neural')) score += 25;
    if (name.includes('google')) score += 20;
    if (name.includes('premium')) score += 25;
    if (name.includes('enhanced')) score += 20;
    if (name.includes('studio')) score += 30;

    // Preferred storytelling voices
    if (name.includes('guy') || name.includes('christopher') || name.includes('daniel') || name.includes('evan') || name.includes('ryan')) {
        score += 15;
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

    // Clean up voice names for display, with Studio Narrator option at top
    const studioOption = `<option value="studio">🎙️ Studio Narrator (HD)</option>`;
    const voiceOptions = list.map(v => {
        let label = v.name.replace(/Microsoft |Google |Apple /gi, '').replace(/ (Natural|Online \(Natural\))/gi, ' ✨');
        if (label.length > 22) label = label.substring(0, 20) + '…';
        return `<option value="${escHtml(v.name)}">${escHtml(label)}</option>`;
    }).join('');

    ttsVoiceSelect.innerHTML = studioOption + voiceOptions;
    ttsVoiceSelect.value = 'studio';
}

// ── Prepare sentences from current episode story ───────────────────────────
function ttsPrepare() {
    const spans = storyContent.querySelectorAll('.story-sentence');
    TTS.sentences = Array.from(spans).map(s => s.textContent.trim()).filter(Boolean);
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
    const targetAudioUrl = (currentEp && currentEp.audioUrl) ? currentEp.audioUrl : staticAudioPath;

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
        const voiceContainer = ttsVoiceSelect.closest('.tts-voice');
        if (voiceContainer) voiceContainer.style.display = '';

        TTS.audioEl.src = targetAudioUrl;
        TTS.audioEl.playbackRate = TTS.rate;
        const playPromise = TTS.audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                ttsSentenceCounter.textContent = '🎙️ Studio Narration...';
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
    const voiceContainer = ttsVoiceSelect.closest('.tts-voice');
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
    if (!TTS.isPaused) return;
    if (TTS.usingStudioAudio && TTS.audioEl) {
        TTS.audioEl.play().catch(err => console.warn('Resume failed:', err));
    } else if (window.speechSynthesis) {
        window.speechSynthesis.resume();
    }
    TTS.isPaused  = false;
    TTS.isPlaying = true;
    ttsSetPlayingUI(true);
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

