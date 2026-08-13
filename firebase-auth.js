// ==========================================================================
// Firebase Auth — Eric's Arcade
// Handles sign-up, sign-in, sign-out, and auth state changes.
// ==========================================================================
import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export { updateProfile };

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Update current user email address.
 */
export async function updateUserEmail(newEmail) {
    if (!auth.currentUser) throw new Error('No user logged in.');
    await updateEmail(auth.currentUser, newEmail);
    return auth.currentUser;
}

/**
 * Create a new account. Optionally sets a display name.
 * @returns {Promise<firebase.User>}
 */
export async function signUpWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    return cred.user;
}

/**
 * Sign in with email & password.
 * @returns {Promise<firebase.User>}
 */
export async function signInWithEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
}

/**
 * Sign out the current user.
 */
export async function signOutUser() {
    await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * @param {function} callback — called with (user | null)
 * @returns unsubscribe function
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get the currently signed-in user (or null).
 */
export function getCurrentUser() {
    return auth.currentUser;
}

// ── Friendly error messages ─────────────────────────────────────────────────
export function getFriendlyError(code) {
    const map = {
        'auth/email-already-in-use':   'That email is already registered. Try signing in.',
        'auth/invalid-email':          'Please enter a valid email address.',
        'auth/weak-password':          'Password must be at least 6 characters.',
        'auth/user-not-found':         'No account found with that email.',
        'auth/wrong-password':         'Incorrect password. Please try again.',
        'auth/invalid-credential':     'Incorrect email or password.',
        'auth/too-many-requests':      'Too many attempts. Please wait a moment.',
        'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}
