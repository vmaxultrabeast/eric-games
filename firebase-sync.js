// ==========================================================================
// Firebase Sync — Eric's Arcade
// Syncs game localStorage saves ↔ Firestore per authenticated user.
// Zero changes required in individual game files.
// ==========================================================================
import { auth, db } from './firebase-config.js';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ── localStorage key registry per game ID ──────────────────────────────────
export const GAME_SAVE_KEYS = {
    'pokegotchi':             ['pokegotchi_state_save'],
    'dino-dna':               ['dino_dna_save'],
    'doggy-run':              ['doggy_run_save'],
    'pokemon-collector':      ['pokemon_collector_state'],
    'pokemon-steal-brainrot': ['pokemon_steal_brainrot_save'],
    'neon-snake':             ['neonSnakeHighScore', 'neonsnake_color'],
    'pixel-studio':           ['pixelStudio'],
    'stickman-ski':           ['stickman-ski-hiscore'],
    'spelling_app':           [
        'dinoscript_progress',
        'dinoscript_current_session',
        'dinoscript_coins',
        'dinoscript_history',
        'dinoscript_mastery',
        'dinoscript_owned_parts',
        'dinoscript_hybrids',
        'dinoscript_user_prefs'
    ],
    'ghostfighter3000':       ['ghostfight3000_username', 'ghostfight3000_color'],
    'pokemon-battle':         [
        'pokemon_p1_name',
        'pokemon_p2_name',
        'pokemon_story_leaderboard',
        'pokemon_pvp_leaderboard',
        'pokemon_1p_leaderboard'
    ],
    'mariokart':              ['mk_racerName'],
    'bomberman':              ['bmb_name'],
    'splatoon':               [],      // no persistent saves yet
};

// ── Push: localStorage → Firestore ─────────────────────────────────────────
/**
 * Read the saved localStorage keys for a game and write them to Firestore.
 * Silently skips if user is not logged in or the game has no save keys.
 */
export async function pushGameSave(uid, gameId) {
    const keys = GAME_SAVE_KEYS[gameId];
    if (!uid || !keys || keys.length === 0) return;

    const saveData = {};
    keys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) saveData[key] = val;
    });

    if (Object.keys(saveData).length === 0) return;

    try {
        const ref = doc(db, 'users', uid, 'saves', gameId);
        await setDoc(ref, saveData, { merge: true });
        console.log(`[Arcade Sync] ✅ Pushed save for "${gameId}"`);

        // Auto-publish hybrids to global community leaderboard if saving DinoScript Lab
        if (gameId === 'spelling_app' && saveData['dinoscript_hybrids']) {
            try {
                const u = auth.currentUser;
                const username = u?.displayName || (u?.email ? u.email.split('@')[0] : null) || localStorage.getItem('arcade_username') || 'Trainer';
                const hybrids = JSON.parse(saveData['dinoscript_hybrids']);
                for (const h of hybrids) {
                    const totalStrength = (h.stats?.power || 0) + (h.stats?.defense || 0) + (h.stats?.speed || 0);
                    const cRef = doc(db, 'community_dinos', h.id);
                    await setDoc(cRef, {
                        name: h.name,
                        avatar: h.avatar,
                        artwork: h.artwork || '',
                        stats: h.stats,
                        totalStrength: totalStrength,
                        geneticTier: h.geneticTier || '',
                        isGen2: h.isGen2 || false,
                        lineage: h.lineage || '',
                        username: username,
                        userId: uid,
                        userAvatar: u?.photoURL || localStorage.getItem('arcade_avatar') || '',
                        date: h.date || new Date().toISOString()
                    }, { merge: true });
                }
            } catch (err) {}
        }

        // Auto-publish high score to global neon-snake leaderboard
        if (gameId === 'neon-snake' && saveData['neonSnakeHighScore']) {
            try {
                const u = auth.currentUser;
                const username = u?.displayName || (u?.email ? u.email.split('@')[0] : null) || localStorage.getItem('arcade_username') || 'Guest Pilot';
                const score = parseInt(saveData['neonSnakeHighScore'], 10);
                const color = saveData['neonsnake_color'] || localStorage.getItem('neonsnake_color') || '#9d4edd';

                if (score > 0) {
                    const cRef = doc(db, 'neonsnake_leaderboard', uid);
                    const docSnap = await getDoc(cRef);
                    if (!docSnap.exists() || (docSnap.data().score || 0) < score) {
                        await setDoc(cRef, {
                            username: username,
                            userId: uid,
                            score: score,
                            color: color,
                            date: new Date().toISOString()
                        }, { merge: true });
                    }
                }
            } catch (err) {}
        }
    } catch (e) {
        console.warn(`[Arcade Sync] ⚠️ Push failed for "${gameId}":`, e.message);
    }
}

// ── Pull: Firestore → localStorage ─────────────────────────────────────────
/**
 * Load a single game's cloud save and populate localStorage.
 * Call this just before launching a game.
 */
export async function pullGameSave(uid, gameId) {
    const keys = GAME_SAVE_KEYS[gameId];
    if (!uid || !keys || keys.length === 0) return;

    try {
        const snap = await getDoc(doc(db, 'users', uid, 'saves', gameId));
        if (snap.exists()) {
            const data = snap.data();
            Object.entries(data).forEach(([key, val]) => {
                localStorage.setItem(key, val);
            });
            console.log(`[Arcade Sync] ✅ Pulled save for "${gameId}"`);
        }
    } catch (e) {
        console.warn(`[Arcade Sync] ⚠️ Pull failed for "${gameId}":`, e.message);
    }
}

// ── Pull All: on login, hydrate all saves at once ──────────────────────────
/**
 * Pull all saved games from Firestore into localStorage.
 * Call this once when a user successfully signs in.
 */
export async function pullAllSaves(uid) {
    if (!uid) return;

    try {
        const savesCol = collection(db, 'users', uid, 'saves');
        const snap = await getDocs(savesCol);
        let count = 0;
        snap.forEach(docSnap => {
            const data = docSnap.data();
            Object.entries(data).forEach(([key, val]) => {
                localStorage.setItem(key, val);
            });
            count++;
        });
        // Pull user profile doc for avatar
        const uSnap = await getDoc(doc(db, 'users', uid));
        if (uSnap.exists() && uSnap.data().photoURL) {
            localStorage.setItem('arcade_avatar', uSnap.data().photoURL);
        }
        console.log(`[Arcade Sync] ✅ Pulled all saves (${count} games)`);
    } catch (e) {
        console.warn('[Arcade Sync] ⚠️ Pull all failed:', e.message);
    }
}

// ── Save User Profile: store user displayName & email in Firestore ──────────
export async function saveUserProfile(user) {
    if (!user) return;
    try {
        const displayName = user.displayName || user.email.split('@')[0];
        const photoURL = user.photoURL || localStorage.getItem('arcade_avatar') || '';
        const ref = doc(db, 'users', user.uid);
        await setDoc(ref, {
            displayName: displayName,
            email: user.email,
            photoURL: photoURL,
            lastLogin: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.warn('[Arcade Sync] ⚠️ Profile save failed:', e.message);
    }
}

// ── Push All: on new account creation, upload existing local saves ──────────
/**
 * Push ALL locally-stored game saves to Firestore.
 * Call this once after a brand-new account is created so that
 * existing local progress is carried over to the cloud immediately.
 */
export async function pushAllLocalSaves(uid) {
    if (!uid) return;

    const gameIds = Object.keys(GAME_SAVE_KEYS);
    let count = 0;

    for (const gameId of gameIds) {
        const keys = GAME_SAVE_KEYS[gameId];
        if (!keys || keys.length === 0) continue;

        const saveData = {};
        keys.forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) saveData[key] = val;
        });

        if (Object.keys(saveData).length === 0) continue;

        try {
            const ref = doc(db, 'users', uid, 'saves', gameId);
            await setDoc(ref, saveData, { merge: true });
            count++;
        } catch (e) {
            console.warn(`[Arcade Sync] ⚠️ Push failed for "${gameId}":`, e.message);
        }
    }

    console.log(`[Arcade Sync] ✅ Uploaded local saves for ${count} games to new account`);
}
