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
    getDocs,
    deleteDoc,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    limit
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
        if (uSnap.exists()) {
            const uData = uSnap.data();
            if (uData.photoURL) localStorage.setItem('arcade_avatar', uData.photoURL);
            if (uData.highResPhotoURL) localStorage.setItem('arcade_avatar_high', uData.highResPhotoURL);
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
        const highResPhotoURL = localStorage.getItem('arcade_avatar_high') || photoURL;

        const payload = {
            displayName: displayName,
            email: user.email,
            lastLogin: new Date().toISOString()
        };

        if (photoURL) payload.photoURL = photoURL;
        if (highResPhotoURL) payload.highResPhotoURL = highResPhotoURL;

        const ref = doc(db, 'users', user.uid);
        await setDoc(ref, payload, { merge: true });
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

// ── Live Online Presence ───────────────────────────────────────────────────
/**
 * Update current user presence timestamp (active within last 5 minutes).
 * Cleans up guest presence records when signing in.
 */
export async function updatePresence(user) {
    try {
        if (user) {
            // Delete any guest session record left over for this device
            const guestUid = localStorage.getItem('arcade_guest_uid');
            if (guestUid) {
                deleteDoc(doc(db, 'presence', guestUid)).catch(() => {});
                localStorage.removeItem('arcade_guest_uid');
            }

            const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Player');
            let photoURL = user.photoURL || localStorage.getItem('arcade_avatar') || '';
            let highResPhotoURL = localStorage.getItem('arcade_avatar_high') || photoURL;

            // If photoURL is not available in local session, fetch from Firestore users doc
            if (!photoURL || !highResPhotoURL) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const uData = userDoc.data();
                        if (uData.photoURL && !photoURL) {
                            photoURL = uData.photoURL;
                            localStorage.setItem('arcade_avatar', photoURL);
                        }
                        if (uData.highResPhotoURL) {
                            highResPhotoURL = uData.highResPhotoURL;
                            localStorage.setItem('arcade_avatar_high', highResPhotoURL);
                        }
                    }
                } catch (err) {}
            }

            const ref = doc(db, 'presence', user.uid);
            await setDoc(ref, {
                displayName: displayName,
                photoURL: photoURL,
                highResPhotoURL: highResPhotoURL || photoURL,
                lastSeen: new Date().toISOString(),
                isGuest: false
            }, { merge: true });
        } else {
            let guestUid = localStorage.getItem('arcade_guest_uid');
            if (!guestUid) {
                guestUid = 'guest_' + Math.random().toString(36).substring(2, 9);
                localStorage.setItem('arcade_guest_uid', guestUid);
            }
            const ref = doc(db, 'presence', guestUid);
            await setDoc(ref, {
                displayName: 'Guest Player',
                photoURL: '',
                highResPhotoURL: '',
                lastSeen: new Date().toISOString(),
                isGuest: true
            }, { merge: true });
        }
    } catch (e) {
        console.warn('[Presence] Update failed:', e.message);
    }
}

/**
 * Fetch list of players active in the last 5 minutes (deduplicated by identity & avatar enriched).
 */
export async function getOnlinePlayers() {
    try {
        const col = collection(db, 'presence');
        const snap = await getDocs(col);
        const now = Date.now();
        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const playerMap = new Map();

        for (const docSnap of snap.docs) {
            const data = docSnap.data();
            if (data.lastSeen) {
                const lastSeenTime = new Date(data.lastSeen).getTime();
                if (now - lastSeenTime <= FIVE_MINUTES_MS) {
                    let photoURL = data.photoURL || '';
                    let highResPhotoURL = data.highResPhotoURL || photoURL;
                    const isGuest = data.isGuest !== undefined ? data.isGuest : true;

                    // If registered user and photoURL is missing in presence record, look up profile
                    if (!isGuest && docSnap.id && !docSnap.id.startsWith('guest_')) {
                        if (!photoURL || !highResPhotoURL) {
                            try {
                                const userDoc = await getDoc(doc(db, 'users', docSnap.id));
                                if (userDoc.exists()) {
                                    const uData = userDoc.data();
                                    if (uData.photoURL) photoURL = uData.photoURL;
                                    if (uData.highResPhotoURL) highResPhotoURL = uData.highResPhotoURL;
                                }
                            } catch (err) {}
                        }
                    }

                    const record = {
                        id: docSnap.id,
                        displayName: data.displayName || 'Guest Player',
                        photoURL: photoURL,
                        highResPhotoURL: highResPhotoURL || photoURL,
                        isGuest: isGuest,
                        lastSeenTime: lastSeenTime
                    };

                    const key = record.isGuest ? record.id : record.displayName.toLowerCase();

                    if (!playerMap.has(key)) {
                        playerMap.set(key, record);
                    } else {
                        const existing = playerMap.get(key);
                        if ((!record.isGuest && existing.isGuest) || (!existing.photoURL && photoURL) || (record.lastSeenTime > existing.lastSeenTime)) {
                            playerMap.set(key, record);
                        }
                    }
                }
            }
        }

        return Array.from(playerMap.values());
    } catch (e) {
        console.warn('[Presence] Fetch online players failed:', e.message);
        return [];
    }
}

// ── Real-time Arcade Chat ──────────────────────────────────────────────────
/**
 * Helper to compute deterministic private room ID between two users
 */
export function getPrivateRoomId(userA, userB) {
    if (!userA || !userB) return 'global';
    const cleanA = String(userA).trim().toLowerCase();
    const cleanB = String(userB).trim().toLowerCase();
    return [cleanA, cleanB].sort().join('_p2p_');
}

/**
 * Send a chat message to Firestore.
 */
export async function sendChatMessage(text, recipient = null) {
    if (!text || !text.trim()) return;

    try {
        const u = auth.currentUser;
        const senderName = u?.displayName || (u?.email ? u.email.split('@')[0] : null) || localStorage.getItem('arcade_username') || 'Guest Player';
        const senderAvatar = u?.photoURL || localStorage.getItem('arcade_avatar') || '';
        const senderId = u?.uid || localStorage.getItem('arcade_guest_uid') || 'guest';

        const recipientName = recipient?.displayName || recipient?.name || (typeof recipient === 'string' ? recipient : null);
        const roomId = recipientName ? getPrivateRoomId(senderName, recipientName) : 'global';

        const col = collection(db, 'chat_messages');
        await addDoc(col, {
            roomId: roomId,
            senderId: senderId,
            senderName: senderName,
            senderAvatar: senderAvatar,
            recipientName: recipientName || null,
            text: text.trim(),
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.warn('[Chat] Send failed:', e.message);
    }
}

/**
 * Subscribe to real-time chat messages.
 */
export function subscribeToChatMessages(callback) {
    try {
        const col = collection(db, 'chat_messages');
        const q = query(col, orderBy('timestamp', 'desc'), limit(50));
        
        return onSnapshot(q, (snapshot) => {
            const messages = [];
            snapshot.forEach(docSnap => {
                messages.push({ id: docSnap.id, ...docSnap.data() });
            });
            messages.reverse();
            callback(messages);
        }, (error) => {
            console.warn('[Chat] Real-time listener error:', error.message);
        });
    } catch (e) {
        console.warn('[Chat] Subscription failed:', e.message);
        return () => {};
    }
}
