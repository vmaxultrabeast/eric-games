/**
 * Main entry point for Arena Battle.
 *
 * ─────────────────────────────────────────────────────
 * FIREBASE SETUP INSTRUCTIONS:
 *
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Enable Authentication:
 *    - Go to Authentication → Sign-in method
 *    - Enable "Anonymous" provider
 *    - (Optional) Enable "Email/Password" provider
 * 4. Create a Realtime Database:
 *    - Go to Realtime Database → Create Database
 *    - Choose your region
 *    - Start in TEST MODE (for development)
 * 5. Get your config:
 *    - Go to Project Settings (gear icon)
 *    - Scroll to "Your apps" → Add web app
 *    - Copy the firebaseConfig object
 * 6. Paste the config below
 * ─────────────────────────────────────────────────────
 */

// ─── Initialize ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed:', err);
    });
  }

  // Create and initialize the game
  const game = new Game();
  game.init();

  // Expose for debugging
  window.game = game;
});
