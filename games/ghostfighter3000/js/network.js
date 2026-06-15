/**
 * Network - Firebase Authentication + Realtime Database sync layer.
 *
 * Handles:
 * - Anonymous & email/password authentication
 * - Room creation & joining (4-letter room codes)
 * - Player position syncing (~15 Hz)
 * - Game events (abilities, eliminations)
 * - Bomb syncing (host only spawns bombs)
 *
 * Database structure:
 *   rooms/{code}/
 *     host: "userId"
 *     state: "waiting" | "countdown" | "playing" | "ended"
 *     gameStartTime: timestamp
 *     players/{userId}/
 *       name, index, x, z, facing, state, ready
 *     events/{pushId}/
 *       type, from, target, data, timestamp
 *     bombs/{pushId}/
 *       x, z, timestamp
 *     rankings: [{id, name, rank}]
 */
class Network {
  constructor() {
    this.db = null;
    this.auth = null;
    this.userId = null;
    this.userName = null;
    this.roomCode = null;
    this.roomRef = null;
    this.isHost = false;

    // Callbacks
    this.onPlayerJoined = null;    // (playerData) => {}
    this.onPlayerLeft = null;      // (playerId) => {}
    this.onPlayerUpdated = null;   // (playerId, data) => {}
    this.onGameStateChanged = null; // (state) => {}
    this.onEvent = null;           // (event) => {}
    this.onBomb = null;            // (bombData) => {}
    this.onRankings = null;        // (rankings) => {}

    // Position sync throttle
    this._lastSyncTime = 0;
    this._syncInterval = 66; // ~15 Hz
    this._listeners = [];
  }

  /**
   * Initialize Firebase.
   */
  init(config) {
    if (!firebase) {
      console.error('Firebase SDK not loaded');
      return false;
    }

    try {
      firebase.initializeApp(config);
      this.db = firebase.database();
      this.auth = firebase.auth();
      return true;
    } catch (e) {
      console.error('Firebase init error:', e);
      return false;
    }
  }

  // ─── Authentication ────────────────────────────────────

  async signInAnonymously(displayName) {
    const cred = await this.auth.signInAnonymously();
    this.userId = cred.user.uid;
    this.userName = displayName || `Player_${this.userId.slice(0, 4)}`;
    return this.userId;
  }

  async signInWithEmail(email, password) {
    const cred = await this.auth.signInWithEmailAndPassword(email, password);
    this.userId = cred.user.uid;
    this.userName = cred.user.displayName || email.split('@')[0];
    return this.userId;
  }

  async createAccount(email, password, displayName) {
    const cred = await this.auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    this.userId = cred.user.uid;
    this.userName = displayName;
    return this.userId;
  }

  async signOut() {
    await this.auth.signOut();
    this.userId = null;
    this.userName = null;
  }

  // ─── Room Management ───────────────────────────────────

  /**
   * Create a new room. Returns the room code.
   */
  async createRoom() {
    const code = this._generateRoomCode();
    this.roomCode = code;
    this.roomRef = this.db.ref(`rooms/${code}`);
    this.isHost = true;

    await this.roomRef.set({
      host: this.userId,
      state: 'waiting',
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      gameStartTime: null,
    });

    // Add self as first player
    await this._addPlayerToRoom(0);
    this._listenToRoom();

    return code;
  }

  /**
   * Join an existing room. Returns player index (0-3).
   */
  async joinRoom(code) {
    code = code.toUpperCase();
    this.roomCode = code;
    this.roomRef = this.db.ref(`rooms/${code}`);

    // Check room exists
    const snapshot = await this.roomRef.once('value');
    if (!snapshot.exists()) {
      throw new Error('Room not found');
    }

    const roomData = snapshot.val();
    if (roomData.state !== 'waiting') {
      throw new Error('Game already in progress');
    }

    // Find next available player index
    const players = roomData.players || {};
    const usedIndices = Object.values(players).map((p) => p.index);
    let nextIndex = -1;
    for (let i = 0; i < 4; i++) {
      if (!usedIndices.includes(i)) {
        nextIndex = i;
        break;
      }
    }

    if (nextIndex === -1) {
      throw new Error('Room is full');
    }

    this.isHost = roomData.host === this.userId;
    await this._addPlayerToRoom(nextIndex);
    this._listenToRoom();

    return nextIndex;
  }

  async _addPlayerToRoom(index) {
    const userColor = localStorage.getItem('ghostfight3000_color') || '#ff4444';
    const playerRef = this.roomRef.child(`players/${this.userId}`);
    await playerRef.set({
      name: this.userName,
      index: index,
      color: userColor,
      x: Arena.SPAWN_POSITIONS[index].x,
      z: Arena.SPAWN_POSITIONS[index].z,
      facing: 'up',
      state: 'alive',
      ready: false,
    });

    // Remove player data when they disconnect
    playerRef.onDisconnect().remove();
  }

  /**
   * Set player ready status.
   */
  async setReady(ready) {
    if (!this.roomRef) return;
    await this.roomRef.child(`players/${this.userId}/ready`).set(ready);
  }

  /**
   * Start the game (host only).
   */
  async startGame() {
    if (!this.isHost || !this.roomRef) return;
    await this.roomRef.update({
      state: 'countdown',
    });

    // After 3-second countdown, set to playing
    setTimeout(async () => {
      await this.roomRef.update({
        state: 'playing',
        gameStartTime: firebase.database.ServerValue.TIMESTAMP,
      });
    }, 3000);
  }

  /**
   * End the game (host only).
   */
  async endGame(rankings) {
    if (!this.roomRef) return;
    await this.roomRef.update({
      state: 'ended',
      rankings: rankings,
    });
  }

  // ─── Real-time Sync ────────────────────────────────────

  /**
   * Sync local player position (throttled).
   */
  syncPosition(x, z, facing, facingAngle) {
    const now = Date.now();
    if (now - this._lastSyncTime < this._syncInterval) return;
    this._lastSyncTime = now;

    if (!this.roomRef) return;
    const update = {
      x: Math.round(x * 100) / 100,
      z: Math.round(z * 100) / 100,
      facing: facing,
    };
    if (facingAngle !== undefined) {
      update.facingAngle = Math.round(facingAngle * 1000) / 1000;
    }
    this.roomRef.child(`players/${this.userId}`).update(update);
  }

  /**
   * Update player state in database.
   */
  updatePlayerState(state) {
    if (!this.roomRef) return;
    this.roomRef.child(`players/${this.userId}/state`).set(state);
  }

  /**
   * Send a game event (ability use, elimination, etc.).
   */
  sendEvent(event) {
    if (!this.roomRef) return;
    this.roomRef.child('events').push({
      ...event,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  /**
   * Spawn a bomb (host only).
   */
  spawnBomb(x, z) {
    if (!this.roomRef) return;
    this.roomRef.child('bombs').push({
      x: Math.round(x * 100) / 100,
      z: Math.round(z * 100) / 100,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  /**
   * Set rankings.
   */
  setRankings(rankings) {
    if (!this.roomRef) return;
    this.roomRef.child('rankings').set(rankings);
  }

  // ─── Listeners ─────────────────────────────────────────

  _listenToRoom() {
    // Listen for player changes
    const playersRef = this.roomRef.child('players');

    const onAdded = playersRef.on('child_added', (snap) => {
      if (snap.key === this.userId) return;
      if (this.onPlayerJoined) this.onPlayerJoined({ id: snap.key, ...snap.val() });
    });

    const onChanged = playersRef.on('child_changed', (snap) => {
      if (snap.key === this.userId) return;
      if (this.onPlayerUpdated) this.onPlayerUpdated(snap.key, snap.val());
    });

    const onRemoved = playersRef.on('child_removed', (snap) => {
      if (this.onPlayerLeft) this.onPlayerLeft(snap.key);
    });

    // Listen for game state changes
    const stateRef = this.roomRef.child('state');
    stateRef.on('value', (snap) => {
      if (this.onGameStateChanged) this.onGameStateChanged(snap.val());
    });

    // Listen for events
    const eventsRef = this.roomRef.child('events');
    eventsRef.on('child_added', (snap) => {
      if (this.onEvent) this.onEvent({ id: snap.key, ...snap.val() });
    });

    // Listen for bombs
    const bombsRef = this.roomRef.child('bombs');
    bombsRef.on('child_added', (snap) => {
      if (this.onBomb) this.onBomb({ id: snap.key, ...snap.val() });
    });

    // Listen for rankings
    const rankingsRef = this.roomRef.child('rankings');
    rankingsRef.on('value', (snap) => {
      if (snap.val() && this.onRankings) this.onRankings(snap.val());
    });

    this._listeners = [
      { ref: playersRef, event: 'child_added', callback: onAdded },
      { ref: playersRef, event: 'child_changed', callback: onChanged },
      { ref: playersRef, event: 'child_removed', callback: onRemoved },
    ];
  }

  // ─── Cleanup ───────────────────────────────────────────

  async leaveRoom() {
    if (this.roomRef && this.userId) {
      await this.roomRef.child(`players/${this.userId}`).remove();

      // If host leaves, delete the room
      if (this.isHost) {
        await this.roomRef.remove();
      }
    }

    // Remove listeners
    this._listeners.forEach(({ ref, event, callback }) => {
      ref.off(event, callback);
    });
    this._listeners = [];

    this.roomRef = null;
    this.roomCode = null;
    this.isHost = false;
  }

  // ─── Helpers ───────────────────────────────────────────

  _generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I or O to avoid confusion
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Get current room players as a snapshot.
   */
  async getRoomPlayers() {
    if (!this.roomRef) return {};
    const snap = await this.roomRef.child('players').once('value');
    return snap.val() || {};
  }

  /**
   * Get the game start timestamp.
   */
  async getGameStartTime() {
    if (!this.roomRef) return null;
    const snap = await this.roomRef.child('gameStartTime').once('value');
    return snap.val();
  }
}
