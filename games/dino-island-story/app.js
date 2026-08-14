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

// ── Init ───────────────────────────────────────────────────────────────────
loadMyRatings();
onAuthStateChanged(auth, (user) => { currentUser = user; });
subscribeToEpisodes();
startCountdownTimer();
initSidebarToggle();
initScrollProgress();

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

    // Episode image
    if (ep.imageUrl) {
        episodeImage.src = ep.imageUrl;
        episodeImage.alt = `Illustration for Episode ${ep.episodeNumber}: ${ep.title}`;
        episodeImageCont.style.display = '';
    } else {
        episodeImageCont.style.display = 'none';
    }

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

// ── Convert plain story text to readable HTML ─────────────────────────────
function renderStoryContent(raw) {
    return raw
        .split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';
            // Bold: **text** or __text__
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            line = line.replace(/__(.+?)__/g, '<strong>$1</strong>');
            // Italic: *text* or _text_
            line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            line = line.replace(/_([^_]+)_/g, '<em>$1</em>');
            // HR
            if (line === '---') return '<hr>';
            return `<p>${line}</p>`;
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
