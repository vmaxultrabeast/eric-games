/**
 * Network - WebRTC P2P Multiplayer using PeerJS.
 *
 * Implements a serverless star-topology network layer:
 * - Host acts as the central coordination server.
 * - Clients connect directly to the Host using a prefixed 4-letter room code (e.g. GF3K-ABCD).
 * - All sync traffic, position updates, events, and bomb drops are coordinated by the Host.
 */
class Network {
  constructor() {
    this.peer = null;
    this.connections = {}; // Host: { clientId: connection }
    this.conn = null;      // Client: connection to Host
    
    this.userId = 'p_' + Math.random().toString(36).slice(2, 9);
    this.userName = '';
    this.roomCode = null;
    this.isHost = false;
    
    this.roomPlayers = {}; // local lobby copy: { userId: { name, index, color, x, z, facing, state, ready } }

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
  }

  /**
   * Initialize P2P Client.
   */
  init() {
    console.log('[NETWORK] PeerJS P2P network initialized. Client ID:', this.userId);
    return true;
  }

  // ─── Room Management ───────────────────────────────────

  /**
   * Create a new room as Host.
   */
  createRoom() {
    return new Promise((resolve, reject) => {
      const code = this._generateRoomCode();
      this.roomCode = code;
      this.isHost = true;

      // Initialize host peer with room identifier
      const peerId = 'GF3K-' + code;
      this.peer = new Peer(peerId);

      this.peer.on('open', (id) => {
        console.log('[NETWORK] Host opened P2P room with ID:', id);
        
        // Add host as first player
        const userColor = localStorage.getItem('ghostfight3000_color') || '#ff4444';
        this.roomPlayers[this.userId] = {
          name: this.userName,
          index: 0,
          color: userColor,
          x: Arena.SPAWN_POSITIONS[0].x,
          z: Arena.SPAWN_POSITIONS[0].z,
          facing: 'up',
          state: 'alive',
          ready: true, // Host is always ready
        };

        resolve(code);
      });

      this.peer.on('connection', (conn) => {
        this._handleIncomingConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('[NETWORK] Host PeerJS error:', err);
        if (err.type === 'unavailable-id') {
          // If code is somehow taken, retry once
          this.peer.destroy();
          resolve(this.createRoom());
        } else {
          reject(new Error(err.message || 'PeerJS connection error'));
        }
      });
    });
  }

  /**
   * Join an existing room as Client.
   */
  joinRoom(code) {
    return new Promise((resolve, reject) => {
      code = code.toUpperCase().trim();
      this.roomCode = code;
      this.isHost = false;

      this.peer = new Peer();

      this.peer.on('open', (id) => {
        console.log('[NETWORK] Client registered peer ID:', id);
        
        // Connect to the host peer
        const hostPeerId = 'GF3K-' + code;
        this.conn = this.peer.connect(hostPeerId);

        this.conn.on('open', () => {
          console.log('[NETWORK] Client WebRTC channel connected to host.');
          
          // Send join registration request
          const userColor = localStorage.getItem('ghostfight3000_color') || '#ff4444';
          this.conn.send({
            type: 'join',
            id: this.userId,
            name: this.userName,
            color: userColor
          });
        });

        this.conn.on('data', (data) => {
          this._handleClientMessage(data, resolve, reject);
        });

        this.conn.on('close', () => {
          console.log('[NETWORK] Connection to Host lost.');
          if (this.onGameStateChanged) this.onGameStateChanged('ended');
        });

        this.conn.on('error', (err) => {
          console.error('[NETWORK] Client Connection error:', err);
          reject(new Error('Connection error. Is the host active?'));
        });
      });

      this.peer.on('error', (err) => {
        console.error('[NETWORK] Client PeerJS error:', err);
        reject(new Error('Failed to resolve lobby code: ' + err.type));
      });
    });
  }

  /**
   * Host listener for incoming WebRTC client channels.
   */
  _handleIncomingConnection(conn) {
    conn.on('open', () => {
      console.log('[NETWORK] Host received client connection request.');
    });

    conn.on('data', (data) => {
      this._handleHostMessage(conn, data);
    });

    conn.on('close', () => {
      // Find which client disconnected
      let disconnectedId = null;
      for (const [id, c] of Object.entries(this.connections)) {
        if (c === conn) {
          disconnectedId = id;
          break;
        }
      }

      if (disconnectedId) {
        console.log('[NETWORK] Client disconnected:', disconnectedId);
        delete this.connections[disconnectedId];
        delete this.roomPlayers[disconnectedId];
        
        if (this.onPlayerLeft) this.onPlayerLeft(disconnectedId);
        
        // Broadcast left notification
        this._broadcast({
          type: 'player_left',
          id: disconnectedId,
          players: this.roomPlayers
        });
      }
    });
  }

  _handleHostMessage(conn, data) {
    switch (data.type) {
      case 'join':
        // Determine next slot index (1 to 3)
        const usedIndices = Object.values(this.roomPlayers).map((p) => p.index);
        let nextIndex = -1;
        for (let i = 1; i < 4; i++) {
          if (!usedIndices.includes(i)) {
            nextIndex = i;
            break;
          }
        }

        if (nextIndex === -1) {
          conn.send({ type: 'join_denied', reason: 'Room is full' });
          conn.close();
          return;
        }

        // Store client connection and register player state
        const clientId = data.id;
        this.connections[clientId] = conn;
        
        this.roomPlayers[clientId] = {
          name: data.name,
          index: nextIndex,
          color: data.color,
          x: Arena.SPAWN_POSITIONS[nextIndex].x,
          z: Arena.SPAWN_POSITIONS[nextIndex].z,
          facing: 'up',
          state: 'alive',
          ready: false,
        };

        console.log(`[NETWORK] Joined player ${data.name} in slot ${nextIndex}`);

        // Send welcome payload with assigned index and all current players
        conn.send({
          type: 'welcome',
          id: clientId,
          index: nextIndex,
          players: this.roomPlayers
        });

        // Notify other players
        this._broadcast({
          type: 'player_joined',
          id: clientId,
          playerData: this.roomPlayers[clientId],
          players: this.roomPlayers
        }, clientId);

        if (this.onPlayerJoined) {
          this.onPlayerJoined({ id: clientId, ...this.roomPlayers[clientId] });
        }
        break;

      case 'ready':
        if (this.roomPlayers[data.id]) {
          this.roomPlayers[data.id].ready = data.ready;
          this._broadcast({
            type: 'players_list',
            players: this.roomPlayers
          });
          if (this.onPlayerUpdated) {
            this.onPlayerUpdated(data.id, this.roomPlayers[data.id]);
          }
        }
        break;

      case 'sync_position':
        if (this.roomPlayers[data.id]) {
          this.roomPlayers[data.id].x = data.x;
          this.roomPlayers[data.id].z = data.z;
          this.roomPlayers[data.id].facing = data.facing;
          if (data.facingAngle !== undefined) {
            this.roomPlayers[data.id].facingAngle = data.facingAngle;
          }
          
          // Relay position updates to all other clients
          this._broadcast({
            type: 'sync_position',
            id: data.id,
            x: data.x,
            z: data.z,
            facing: data.facing,
            facingAngle: data.facingAngle
          }, data.id);

          if (this.onPlayerUpdated) {
            this.onPlayerUpdated(data.id, this.roomPlayers[data.id]);
          }
        }
        break;

      case 'state_update':
        if (this.roomPlayers[data.id]) {
          this.roomPlayers[data.id].state = data.state;
          
          this._broadcast({
            type: 'state_update',
            id: data.id,
            state: data.state
          }, data.id);

          if (this.onPlayerUpdated) {
            this.onPlayerUpdated(data.id, this.roomPlayers[data.id]);
          }
        }
        break;

      case 'game_event':
        // Relay event to other clients
        this._broadcast({
          type: 'game_event',
          event: data.event
        }, data.event.from);

        if (this.onEvent) {
          this.onEvent(data.event);
        }
        break;
    }
  }

  _handleClientMessage(data, resolve, reject) {
    switch (data.type) {
      case 'welcome':
        // Initialize client session attributes
        this.userId = data.id;
        this.roomPlayers = data.players;
        resolve(data.index); // Resolves Promise.joinRoom
        break;

      case 'join_denied':
        reject(new Error(data.reason));
        break;

      case 'player_joined':
        this.roomPlayers = data.players;
        if (this.onPlayerJoined) {
          this.onPlayerJoined({ id: data.id, ...data.playerData });
        }
        break;

      case 'player_left':
        this.roomPlayers = data.players;
        if (this.onPlayerLeft) {
          this.onPlayerLeft(data.id);
        }
        break;

      case 'players_list':
        this.roomPlayers = data.players;
        // Trigger generic updates for each player
        for (const [id, pData] of Object.entries(this.roomPlayers)) {
          if (this.onPlayerUpdated) this.onPlayerUpdated(id, pData);
        }
        break;

      case 'game_state':
        if (this.onGameStateChanged) {
          this.onGameStateChanged(data.state);
        }
        break;

      case 'sync_position':
        if (this.roomPlayers[data.id]) {
          this.roomPlayers[data.id].x = data.x;
          this.roomPlayers[data.id].z = data.z;
          this.roomPlayers[data.id].facing = data.facing;
          if (data.facingAngle !== undefined) {
            this.roomPlayers[data.id].facingAngle = data.facingAngle;
          }
          if (this.onPlayerUpdated) {
            this.onPlayerUpdated(data.id, this.roomPlayers[data.id]);
          }
        }
        break;

      case 'state_update':
        if (this.roomPlayers[data.id]) {
          this.roomPlayers[data.id].state = data.state;
          if (this.onPlayerUpdated) {
            this.onPlayerUpdated(data.id, this.roomPlayers[data.id]);
          }
        }
        break;

      case 'game_event':
        if (this.onEvent) {
          this.onEvent(data.event);
        }
        break;

      case 'bomb_spawn':
        if (this.onBomb) {
          this.onBomb(data.bomb);
        }
        break;

      case 'rankings':
        if (this.onRankings) {
          this.onRankings(data.rankings);
        }
        break;
    }
  }

  // ─── Real-time Sync ────────────────────────────────────

  /**
   * Sync local player position (throttled).
   */
  syncPosition(x, z, facing, facingAngle) {
    const now = Date.now();
    if (now - this._lastSyncTime < this._syncInterval) return;
    this._lastSyncTime = now;

    // Update local dictionary
    if (this.roomPlayers[this.userId]) {
      this.roomPlayers[this.userId].x = x;
      this.roomPlayers[this.userId].z = z;
      this.roomPlayers[this.userId].facing = facing;
      this.roomPlayers[this.userId].facingAngle = facingAngle;
    }

    if (this.isHost) {
      // Host broadcasts directly
      this._broadcast({
        type: 'sync_position',
        id: this.userId,
        x: Math.round(x * 100) / 100,
        z: Math.round(z * 100) / 100,
        facing: facing,
        facingAngle: facingAngle !== undefined ? Math.round(facingAngle * 1000) / 1000 : undefined
      });
    } else if (this.conn && this.conn.open) {
      // Client sends to Host
      this.conn.send({
        type: 'sync_position',
        id: this.userId,
        x: Math.round(x * 100) / 100,
        z: Math.round(z * 100) / 100,
        facing: facing,
        facingAngle: facingAngle !== undefined ? Math.round(facingAngle * 1000) / 1000 : undefined
      });
    }
  }

  /**
   * Set local player ready status.
   */
  setReady(ready) {
    if (this.roomPlayers[this.userId]) {
      this.roomPlayers[this.userId].ready = ready;
    }

    if (this.isHost) {
      this._broadcast({
        type: 'players_list',
        players: this.roomPlayers
      });
    } else if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'ready',
        id: this.userId,
        ready: ready
      });
    }
  }

  /**
   * Start the game (host only).
   */
  startGame() {
    if (!this.isHost) return;

    this._broadcast({
      type: 'game_state',
      state: 'countdown'
    });
    if (this.onGameStateChanged) this.onGameStateChanged('countdown');

    setTimeout(() => {
      this._broadcast({
        type: 'game_state',
        state: 'playing'
      });
      if (this.onGameStateChanged) this.onGameStateChanged('playing');
    }, 3000);
  }

  /**
   * End the game (host only).
   */
  endGame(rankings) {
    if (!this.isHost) return;
    this._broadcast({
      type: 'game_state',
      state: 'ended'
    });
  }

  /**
   * Update player state.
   */
  updatePlayerState(state) {
    if (this.roomPlayers[this.userId]) {
      this.roomPlayers[this.userId].state = state;
    }

    if (this.isHost) {
      this._broadcast({
        type: 'state_update',
        id: this.userId,
        state: state
      });
    } else if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'state_update',
        id: this.userId,
        state: state
      });
    }
  }

  /**
   * Broadcast a gameplay event.
   */
  sendEvent(event) {
    if (this.isHost) {
      this._broadcast({
        type: 'game_event',
        event: event
      });
    } else if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'game_event',
        event: event
      });
    }
  }

  /**
   * Spawn a bomb (host only).
   */
  spawnBomb(x, z) {
    if (!this.isHost) return;
    this._broadcast({
      type: 'bomb_spawn',
      bomb: { x, z }
    });
  }

  /**
   * Set rankings list.
   */
  setRankings(rankings) {
    if (!this.isHost) return;
    this._broadcast({
      type: 'rankings',
      rankings: rankings
    });
  }

  // ─── Relaying / Broadcasting Helpers ───────────────────

  /**
   * Broadcast payload to all connected clients (Host only).
   */
  _broadcast(data, excludeClientId = null) {
    if (!this.isHost) return;
    
    for (const [id, conn] of Object.entries(this.connections)) {
      if (id !== excludeClientId && conn.open) {
        conn.send(data);
      }
    }
  }

  // ─── Cleanup ───────────────────────────────────────────

  leaveRoom() {
    if (this.isHost) {
      // Disconnect all clients
      this._broadcast({ type: 'game_state', state: 'ended' });
      for (const conn of Object.values(this.connections)) {
        conn.close();
      }
      this.connections = {};
    } else if (this.conn) {
      this.conn.close();
      this.conn = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.roomCode = null;
    this.isHost = false;
    this.roomPlayers = {};
  }

  // ─── Helpers ───────────────────────────────────────────

  _generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  getRoomPlayers() {
    return Promise.resolve(this.roomPlayers);
  }

  getGameStartTime() {
    // Standardized relative timestamp fallback
    return Promise.resolve(Date.now());
  }
}
