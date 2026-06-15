/**
 * Game - Main game orchestrator.
 *
 * Manages the full game lifecycle:
 * MENU → LOBBY → COUNTDOWN → PLAYING → GAME_OVER
 *
 * Coordinates all subsystems: arena, players, abilities, bombs,
 * input, network, and UI.
 */
class Game {
  constructor() {
    // Three.js
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Subsystems
    this.network = new Network();
    this.input = new InputHandler();
    this.ui = new UI();
    this.arena = null;
    this.abilities = null;
    this.bombs = null;

    // Game state
    this.state = 'menu'; // 'menu' | 'lobby' | 'countdown' | 'playing' | 'gameover'
    this.gameTime = 0;
    this.gameStartTimestamp = null;

    // Players
    this.players = {};       // { id: Player }
    this.localPlayer = null;
    this.localPlayerId = null;
    this.localPlayerIndex = -1;

    // Rankings
    this.rankings = [];
    this.eliminationOrder = []; // Track order of eliminations

    // Camera
    this.cameraAngle = 0;
    this.targetCameraAngle = 0;

    // Jump trail visual
    this.jumpTrail = null;

    // Timing
    this.lastTime = 0;
    this.processedEvents = new Set();

    // Demo mode with bots
    this.isDemo = false;
    this.bots = [];   // BotAI instances
  }

  // ─── Initialization ────────────────────────────────────

  init() {
    this._initThreeJS();
    this._initNetwork();
    this._initColorPicker();
    this._initUsername();
    this._initEventListeners();
    this.ui.showMenu();
    this._animate();
  }

  _initThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a2e, 30, 60);

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 100
    );
    this.camera.position.set(0, 25, 25);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x0a0a2e);

    document.getElementById('game-canvas-container').appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  _initNetwork() {
    this.network.init();
  }

  _initUsername() {
    const savedName = localStorage.getItem('ghostfight3000_username') || '';
    const nameInput = document.getElementById('guest-name');
    if (nameInput && savedName) {
      nameInput.value = savedName;
    }
  }

  _initColorPicker() {
    this.selectedColor = localStorage.getItem('ghostfight3000_color') || '#ff4444';
    
    // Select the active color dot on startup
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach((dot) => {
      if (dot.getAttribute('data-color') === this.selectedColor) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }

      dot.addEventListener('click', (e) => {
        e.preventDefault();
        dots.forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        this.selectedColor = dot.getAttribute('data-color');
        localStorage.setItem('ghostfight3000_color', this.selectedColor);
      });
    });
  }

  _initEventListeners() {
    // Lobby buttons
    document.getElementById('create-room-btn')?.addEventListener('click', () => this._createRoom());
    document.getElementById('join-room-btn')?.addEventListener('click', () => this._joinRoom());
    document.getElementById('start-game-btn')?.addEventListener('click', () => this._startGame());
    document.getElementById('leave-room-btn')?.addEventListener('click', () => this._leaveRoom());

    // Multiplayer transition buttons
    document.getElementById('multiplayer-btn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('guest-name');
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        this.ui.showError('Please enter a display name first');
        return;
      }
      localStorage.setItem('ghostfight3000_username', name);
      const lobbyEntry = document.getElementById('lobby-entry-section');
      const demoBtn = document.getElementById('demo-btn');
      const roomActions = document.getElementById('room-actions');
      if (lobbyEntry) lobbyEntry.style.display = 'none';
      if (demoBtn) demoBtn.style.display = 'none';
      if (roomActions) roomActions.style.display = 'block';
    });

    document.getElementById('back-to-lobby-entry-btn')?.addEventListener('click', () => {
      const lobbyEntry = document.getElementById('lobby-entry-section');
      const demoBtn = document.getElementById('demo-btn');
      const roomActions = document.getElementById('room-actions');
      if (lobbyEntry) lobbyEntry.style.display = 'block';
      if (demoBtn) demoBtn.style.display = 'block';
      if (roomActions) roomActions.style.display = 'none';
    });

    // Demo mode button
    // "Play with Bots" → show difficulty screen
    document.getElementById('demo-btn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('guest-name');
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        this.ui.showError('Please enter a display name first');
        return;
      }
      localStorage.setItem('ghostfight3000_username', name);
      this._demoPlayerName = name;
      this.ui._hideAll();
      document.getElementById('difficulty-screen').classList.add('active');
    });

    // Difficulty choice → start game with that difficulty
    document.querySelectorAll('.difficulty-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedDifficulty = btn.dataset.difficulty;
        this._startDemoMode();
      });
    });

    // Back button on difficulty screen
    document.getElementById('difficulty-back-btn')?.addEventListener('click', () => {
      document.getElementById('difficulty-screen').classList.remove('active');
      this.ui.showMenu();
    });

    this.selectedDifficulty = 'easy'; // Default

    // Game over buttons
    document.getElementById('play-again-btn')?.addEventListener('click', () => this._playAgain());
    document.getElementById('back-to-menu-btn')?.addEventListener('click', () => this._backToMenu());

    // Leave game button (shown when eliminated)
    document.getElementById('leave-game-btn')?.addEventListener('click', () => this._leaveGameEarly());

    // Enter key for join room
    document.getElementById('join-code-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._joinRoom();
    });
  }

  // ─── Room Management ──────────────────────────────────

  async _createRoom() {
    const nameInput = document.getElementById('guest-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      this.ui.showError('Please enter a display name first');
      return;
    }
    localStorage.setItem('ghostfight3000_username', name);

    try {
      this.network.userName = name;
      const code = await this.network.createRoom();
      this.localPlayerId = this.network.userId;
      this.localPlayerIndex = 0;

      this._setupNetworkCallbacks();
      this.state = 'lobby';
      this.ui.showLobby(code, true);
      this.ui.updateLobbyPlayers({
        [this.localPlayerId]: {
          name: this.network.userName,
          index: 0,
          color: this.selectedColor || localStorage.getItem('ghostfight3000_color') || '#ff4444',
        },
      });
    } catch (e) {
      this.ui.showError('Failed to create room: ' + e.message);
    }
  }

  async _joinRoom() {
    const nameInput = document.getElementById('guest-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      this.ui.showError('Please enter a display name first');
      return;
    }
    localStorage.setItem('ghostfight3000_username', name);

    const code = document.getElementById('join-code-input').value.trim().toUpperCase();
    if (!code || code.length !== 4) {
      this.ui.showError('Please enter a 4-letter room code');
      return;
    }

    try {
      this.network.userName = name;
      this.localPlayerIndex = await this.network.joinRoom(code);
      this.localPlayerId = this.network.userId;

      this._setupNetworkCallbacks();
      this.state = 'lobby';
      this.ui.showLobby(code, this.network.isHost);

      // Get existing players
      const players = await this.network.getRoomPlayers();
      this.ui.updateLobbyPlayers(players);
    } catch (e) {
      this.ui.showError(e.message);
    }
  }

  _setupNetworkCallbacks() {
    this.network.onPlayerJoined = (playerData) => {
      if (this.state === 'lobby') {
        // Update lobby display
        this.network.getRoomPlayers().then((players) => {
          this.ui.updateLobbyPlayers(players);
        });
      } else if (this.state === 'playing') {
        // Add player to game
        this._addRemotePlayer(playerData);
      }
    };

    this.network.onPlayerUpdated = (playerId, data) => {
      if (this.state === 'lobby') {
        this.network.getRoomPlayers().then((players) => {
          this.ui.updateLobbyPlayers(players);
        });
      } else if (this.state === 'playing') {
        this._updateRemotePlayer(playerId, data);
      }
    };

    this.network.onPlayerLeft = (playerId) => {
      if (this.state === 'lobby') {
        this.network.getRoomPlayers().then((players) => {
          this.ui.updateLobbyPlayers(players);
        });
      } else if (this.state === 'playing') {
        // Treat as elimination
        if (this.players[playerId]) {
          this.players[playerId].eliminate('disconnect');
          this._checkGameEnd();
        }
      }
    };

    this.network.onGameStateChanged = (newState) => {
      if (newState === 'countdown' && this.state === 'lobby') {
        this._beginCountdown();
      } else if (newState === 'playing' && this.state === 'countdown') {
        this._beginPlaying();
      } else if (newState === 'ended') {
        // Will be handled by onRankings
      }
    };

    this.network.onEvent = (event) => {
      if (this.state === 'playing') {
        this._processNetworkEvent(event);
      }
    };

    this.network.onBomb = (bombData) => {
      if (this.state === 'playing' && this.bombs) {
        // Only add if we're not the host (host already added it locally)
        if (!this.network.isHost) {
          this.bombs.addBomb(bombData.x, bombData.z);
        }
      }
    };

    this.network.onRankings = (rankings) => {
      if (this.state === 'playing' || this.state === 'gameover') {
        this.state = 'gameover';
        this.ui.showGameOver(rankings);
      }
    };
  }

  async _startGame() {
    try {
      await this.network.startGame();
    } catch (e) {
      this.ui.showError('Failed to start game: ' + e.message);
    }
  }

  async _leaveRoom() {
    await this.network.leaveRoom();
    this.state = 'menu';
    this.ui.showMenu();
    // Re-show room actions since we're still logged in
    if (this.network.userId) {
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('room-actions').style.display = 'block';
    }
  }

  // ─── Game Start ────────────────────────────────────────

  _beginCountdown() {
    this.state = 'countdown';
    this._buildGameScene();

    this.ui.showCountdown(() => {
      // Countdown finished
      if (this.isDemo) {
        this._beginPlaying();
      }
      // For online: we wait for the network state to change to 'playing'
    });
  }

  async _beginPlaying() {
    this.state = 'playing';
    this.gameTime = 0;
    this.eliminationOrder = [];
    this.processedEvents = new Set();

    // Get game start time
    if (!this.isDemo) {
      this.gameStartTimestamp = await this.network.getGameStartTime();
    }

    // Initialize abilities
    this.abilities = new AbilitySystem();

    // Initialize bombs
    this.bombs = new BombSystem(this.scene);
    this.bombs.isHost = this.isDemo || this.network.isHost;
    this.bombs.onSpawnBomb = (x, z) => {
      if (!this.isDemo) {
        this.network.spawnBomb(x, z);
      }
    };
    this.bombs.onPlayerHit = (playerId) => {
      this._eliminatePlayer(playerId, 'bomb');
    };

    // Position camera at local player
    this._updateCamera();

    this.ui.showHUD();
    this.lastTime = performance.now();
  }

  // ─── Demo Mode (Play with Bots) ────────────────────────

  _startDemoMode() {
    const name = this._demoPlayerName || 'Player';

    this.isDemo = true;
    this.localPlayerId = 'local_player';
    this.localPlayerIndex = 0;
    this.network.userId = this.localPlayerId;
    this.network.userName = name;

    // Build scene with bots
    this._buildDemoScene(name);

    // Hide difficulty screen, show countdown
    document.getElementById('difficulty-screen').classList.remove('active');
    this.state = 'countdown';
    this.ui.showCountdown(() => {
      this._beginPlaying();
    });
  }

  _buildDemoScene(playerName) {
    // Clear scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // Build arena
    this.arena = new Arena(this.scene);

    // Create players
    this.players = {};
    this.bots = [];

    const botNames = ['AlphaBot', 'BetaBot', 'GammaBot'];

    const localColor = this.selectedColor || localStorage.getItem('ghostfight3000_color') || '#ff4444';
    const presetColors = ['#ff4444', '#4488ff', '#44dd44', '#ffdd44', '#b544ff', '#ff8844', '#44ffff', '#ff44a8'];
    const availableColors = presetColors.filter(c => c !== localColor);

    for (let i = 0; i < 4; i++) {
      const isLocal = (i === 0);
      const id = isLocal ? this.localPlayerId : `bot_${i}`;
      const pName = isLocal ? playerName : botNames[i - 1];
      const pColor = isLocal ? localColor : availableColors[i - 1];

      const player = new Player(id, i, pName, isLocal, this.scene, pColor);

      // Set initial facing toward center
      const spawn = Arena.SPAWN_POSITIONS[i];
      let initFacing = 'left';
      let initAngle = -Math.PI / 2;
      if (spawn.x < 0 && spawn.z < 0) { initFacing = 'right'; initAngle = Math.PI / 2; }
      else if (spawn.x > 0 && spawn.z < 0) { initFacing = 'left'; initAngle = -Math.PI / 2; }
      else if (spawn.x < 0 && spawn.z > 0) { initFacing = 'right'; initAngle = Math.PI / 2; }
      else { initFacing = 'left'; initAngle = -Math.PI / 2; }

      player.setFacing(initFacing);
      player.facingAngle = initAngle;

      if (isLocal) {
        this.localPlayer = player;
        this.input.facingAngle = initAngle;
      } else {
        // Create bot AI
        const bot = new BotAI(player, this.arena, this.selectedDifficulty);
        bot.facing = initFacing;
        this.bots.push(bot);
      }

      this.players[id] = player;
    }
  }

  async _buildGameScene() {
    // Clear existing scene objects (except lights set up by arena)
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // Build arena
    this.arena = new Arena(this.scene);

    // Create players
    this.players = {};
    const allPlayers = await this.network.getRoomPlayers();

    for (const [id, data] of Object.entries(allPlayers)) {
      const isLocal = (id === this.localPlayerId);
      const player = new Player(
        id, data.index, data.name, isLocal, this.scene, data.color
      );

      if (isLocal) {
        this.localPlayer = player;
        this.localPlayerIndex = data.index;

        // Set initial facing toward center
        const spawn = Arena.SPAWN_POSITIONS[data.index];
        let initAngle = 0;
        if (spawn.x < 0 && spawn.z < 0) initAngle = Math.PI / 2;   // face right
        if (spawn.x > 0 && spawn.z < 0) initAngle = -Math.PI / 2;  // face left
        if (spawn.x < 0 && spawn.z > 0) initAngle = Math.PI / 2;   // face right
        if (spawn.x > 0 && spawn.z > 0) initAngle = -Math.PI / 2;  // face left

        this.localPlayer.setFacingAngle(initAngle);
        this.input.facingAngle = initAngle;
      }

      this.players[id] = player;
    }
  }

  _addRemotePlayer(data) {
    if (this.players[data.id]) return;

    const player = new Player(
      data.id, data.index, data.name, false, this.scene, data.color
    );
    this.players[data.id] = player;
  }

  _updateRemotePlayer(playerId, data) {
    const player = this.players[playerId];
    if (!player) return;

    player.setNetworkPosition(data.x, data.z, data.facing, data.facingAngle);

    if (data.state === 'hidden' && player.state !== 'hidden') {
      player.setHidden(true);
    } else if (data.state === 'alive' && player.state === 'hidden') {
      player.setHidden(false);
    } else if (data.state === 'eliminated' && player.state !== 'eliminated') {
      player.eliminate('network');
    }
  }

  // ─── Game Loop ─────────────────────────────────────────

  _animate() {
    requestAnimationFrame(() => this._animate());

    if (this.state !== 'playing') {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = now;

    this.gameTime += dt * 1000;

    // Update systems
    this._handleMovement(dt);
    this._handleAbilities(dt);
    if (this.isDemo) this._updateBots(dt);
    this._updatePlayers(dt);
    this._updateBombs(dt);
    this._updateCamera(dt);
    this._updateHUD();
    if (!this.isDemo) this._syncToNetwork();

    this.input.endFrame();
    this.renderer.render(this.scene, this.camera);
  }

  // ─── Movement ──────────────────────────────────────────

  _handleMovement(dt) {
    if (!this.localPlayer || this.localPlayer.state === 'eliminated') return;
    if (this.abilities && this.abilities.isJumping) return; // No movement during jump
    if (this.abilities && this.abilities.selectingTarget) return; // No movement during target select

    // Update turning (left/right arrow keys rotate the player)
    this.input.updateTurning(dt);
    this.localPlayer.setFacingAngle(this.input.facingAngle);

    // Forward/backward movement
    const movement = this.input.getMovement();
    if (!movement) return;

    this.localPlayer.move(movement.dx, movement.dz, dt, this.arena);
  }

  // ─── Abilities ─────────────────────────────────────────

  _handleAbilities(dt) {
    if (!this.localPlayer || this.localPlayer.state === 'eliminated') return;
    if (!this.abilities) return;

    // Update ability timers
    const autoEvent = this.abilities.update(dt);
    if (autoEvent) {
      // Auto-unhide when timer runs out
      if (autoEvent.type === 'unhide') {
        this.localPlayer.setHidden(false);
        if (!this.isDemo) this.network.updatePlayerState('alive');
        this.ui.showHideOverlay(false);
      }
    }

    // Handle jump animation
    if (this.abilities.isJumping) {
      const otherPlayers = Object.values(this.players).filter(
        (p) => p.id !== this.localPlayerId
      );
      const result = this.abilities.updateJump(dt, otherPlayers);
      if (result) {
        this.localPlayer.x = result.x;
        this.localPlayer.z = result.z;

        // Eliminate hit players
        for (const hitPlayer of result.hitPlayers) {
          if (!hitPlayer._jumpHit) {
            hitPlayer._jumpHit = true;
            this._eliminatePlayer(hitPlayer.id, this.localPlayerId);
          }
        }

        if (result.done) {
          // Clear jump hit flags
          otherPlayers.forEach((p) => delete p._jumpHit);
          this._removeJumpTrail();
        }
      }
    }

    // Check for target selection responses
    if (this.abilities.selectingTarget) {
      // Check for number keys 1-3
      for (let n = 1; n <= 3; n++) {
        if (this.input.wasJustPressed(String(n))) {
          const targets = Object.values(this.players).filter(
            (p) => p.id !== this.localPlayerId && p.state !== 'eliminated'
          );
          const target = targets[n - 1];
          if (target) {
            this._confirmTargetSelection(target.id);
          }
        }
      }

      if (this.input.wasJustPressed('Escape')) {
        this.abilities.cancelTargetSelection();
        this.ui.hideTargetSelector();
      }
      return; // Don't process other abilities during target selection
    }

    // K - Hide/Unhide
    if (this.input.wasJustPressed('k') || this.input.wasJustPressed('K')) {
      if (this.localPlayer.state === 'hidden') {
        // Unhide
        const event = this.abilities.useUnhide();
        if (event) {
          this.localPlayer.setHidden(false);
          if (!this.isDemo) this.network.updatePlayerState('alive');
          if (!this.isDemo) this.network.sendEvent({ type: 'unhide', from: this.localPlayerId });
          this.ui.showHideOverlay(false);
        }
      } else if (this.localPlayer.state === 'alive') {
        const event = this.abilities.useHide();
        if (event) {
          this.localPlayer.setHidden(true);
          if (!this.isDemo) this.network.updatePlayerState('hidden');
          if (!this.isDemo) this.network.sendEvent({ type: 'hide', from: this.localPlayerId });
          this.ui.showHideOverlay(true);
          this.ui.addKillFeedEntry('You are now hidden', '#4488ff');
        }
      }
    }

    // L - Force Hide (can't use while hidden)
    if (this.input.wasJustPressed('l') || this.input.wasJustPressed('L')) {
      if (this.localPlayer.state !== 'hidden' && this.abilities.startForceHide()) {
        this._showTargetSelector('forceHide');
      }
    }

    // H - Force Unhide (can't use while hidden)
    if (this.input.wasJustPressed('h') || this.input.wasJustPressed('H')) {
      if (this.localPlayer.state !== 'hidden' && this.abilities.startForceUnhide()) {
        this._showTargetSelector('forceUnhide');
      }
    }

    // J - Jump Attack (can't use while hidden)
    if (this.input.wasJustPressed('j') || this.input.wasJustPressed('J')) {
      if (this.localPlayer.state !== 'hidden') {
        // Use the continuous facing angle for jump direction
        const facing = this.localPlayer.facing || 'up';
        const event = this.abilities.useJump(facing, this.localPlayer.x, this.localPlayer.z, this.localPlayer.facingAngle);
        if (event) {
          if (!this.isDemo) this.network.sendEvent({ ...event, from: this.localPlayerId });
          this._createJumpTrail(this.localPlayer.x, this.localPlayer.z, null, null, this.localPlayer.facingAngle);
        }
      }
    }
  }

  _showTargetSelector(abilityName) {
    const targets = Object.values(this.players).filter(
      (p) => p.id !== this.localPlayerId && p.state !== 'eliminated'
    );

    this.ui.showTargetSelector(
      targets,
      abilityName,
      (targetId) => this._confirmTargetSelection(targetId),
      () => this.abilities.cancelTargetSelection()
    );
  }

  _confirmTargetSelection(targetId) {
    const ability = this.abilities.selectingAbility;

    if (ability === 'forceHide') {
      const event = this.abilities.confirmForceHide(targetId);
      if (event) {
        if (!this.isDemo) this.network.sendEvent({ ...event, from: this.localPlayerId });
        const targetPlayer = this.players[targetId];
        if (targetPlayer) {
          // In demo mode, directly apply the force-hide
          if (this.isDemo) {
            targetPlayer.setHidden(true);
            const bot = this.bots.find(b => b.player.id === targetId);
            if (bot) bot.abilities.forceHide(event.duration || 10000);
          }
          this.ui.addKillFeedEntry(
            `You forced <b>${targetPlayer.name}</b> to hide!`,
            '#ffdd44'
          );
        }
      }
    } else if (ability === 'forceUnhide') {
      const event = this.abilities.confirmForceUnhide(targetId);
      if (event) {
        if (!this.isDemo) this.network.sendEvent({ ...event, from: this.localPlayerId });
        const targetPlayer = this.players[targetId];
        if (targetPlayer) {
          // In demo mode, directly apply the force-unhide
          if (this.isDemo) {
            targetPlayer.setHidden(false);
            const bot = this.bots.find(b => b.player.id === targetId);
            if (bot) bot.abilities.forceUnhide();
          }
          this.ui.addKillFeedEntry(
            `You forced <b>${targetPlayer.name}</b> to unhide!`,
            '#44dd44'
          );
        }
      }
    }

    this.ui.hideTargetSelector();
  }

  // ─── Network Events ───────────────────────────────────

  _processNetworkEvent(event) {
    if (this.processedEvents.has(event.id)) return;
    this.processedEvents.add(event.id);

    // Don't process our own events
    if (event.from === this.localPlayerId) return;

    const fromPlayer = this.players[event.from];
    const fromName = fromPlayer ? fromPlayer.name : 'Unknown';

    switch (event.type) {
      case 'hide': {
        const p = this.players[event.from];
        if (p) p.setHidden(true);
        this.ui.addKillFeedEntry(`<b>${fromName}</b> is hiding`, '#4488ff');
        break;
      }

      case 'unhide': {
        const p = this.players[event.from];
        if (p) p.setHidden(false);
        break;
      }

      case 'forceHide': {
        if (event.target === this.localPlayerId) {
          // We're being forced to hide!
          this.abilities.forceHide(event.duration || 10000);
          this.localPlayer.setHidden(true);
          this.network.updatePlayerState('hidden');
          this.ui.showHideOverlay(true);
          this.ui.addKillFeedEntry(
            `<b>${fromName}</b> forced you to hide!`, '#e94560'
          );
        } else {
          const target = this.players[event.target];
          if (target) {
            target.setHidden(true);
            this.ui.addKillFeedEntry(
              `<b>${fromName}</b> forced <b>${target.name}</b> to hide`, '#ffdd44'
            );
          }
        }
        break;
      }

      case 'forceUnhide': {
        if (event.target === this.localPlayerId) {
          // We're being forced to unhide!
          this.abilities.forceUnhide();
          this.localPlayer.setHidden(false);
          this.network.updatePlayerState('alive');
          this.ui.showHideOverlay(false);
          this.ui.addKillFeedEntry(
            `<b>${fromName}</b> forced you to unhide!`, '#e94560'
          );
        } else {
          const target = this.players[event.target];
          if (target) {
            target.setHidden(false);
            this.ui.addKillFeedEntry(
              `<b>${fromName}</b> forced <b>${target.name}</b> to unhide`, '#44dd44'
            );
          }
        }
        break;
      }

      case 'jump': {
        // Animate remote player's jump
        const p = this.players[event.from];
        if (p) {
          this._createJumpTrail(event.startX, event.startZ, event.facing, event.from);
          // The actual position update will come through the normal sync
        }
        break;
      }

      case 'eliminate': {
        this._processElimination(event.target, event.by, event.method);
        break;
      }
    }
  }

  // ─── Elimination ───────────────────────────────────────

  _eliminatePlayer(playerId, byId) {
    const player = this.players[playerId];
    if (!player || player.state === 'eliminated') return;

    player.eliminate(byId);
    this.eliminationOrder.push(playerId);

    // Send elimination event
    if (!this.isDemo) {
      this.network.sendEvent({
        type: 'eliminate',
        target: playerId,
        by: byId,
        method: byId === 'bomb' ? 'bomb' : 'jump',
      });
    }

    // Kill feed
    const byName = byId === 'bomb' ? '💣 Bomb' :
                   this.players[byId] ? this.players[byId].name : 'Unknown';
    const playerName = player.name;

    if (playerId === this.localPlayerId) {
      this.ui.addKillFeedEntry(`You were eliminated by <b>${byName}</b>!`, '#e94560');
      this.ui.showEliminated(byName);
    } else {
      this.ui.addKillFeedEntry(
        `<b>${byName}</b> eliminated <b>${playerName}</b>`, '#e94560'
      );
    }

    this._checkGameEnd();
  }

  _processElimination(targetId, byId, method) {
    const player = this.players[targetId];
    if (!player || player.state === 'eliminated') return;

    player.eliminate(byId);
    this.eliminationOrder.push(targetId);

    const byName = method === 'bomb' ? '💣 Bomb' :
                   this.players[byId] ? this.players[byId].name : 'Unknown';

    if (targetId === this.localPlayerId) {
      this.ui.addKillFeedEntry(`You were eliminated by <b>${byName}</b>!`, '#e94560');
      this.ui.showEliminated(byName);
    } else {
      this.ui.addKillFeedEntry(
        `<b>${byName}</b> eliminated <b>${this.players[targetId]?.name}</b>`, '#e94560'
      );
    }

    this._checkGameEnd();
  }

  _checkGameEnd() {
    const alivePlayers = Object.values(this.players).filter(
      (p) => p.state !== 'eliminated'
    );

    if (alivePlayers.length <= 1) {
      // Game over! Build rankings.
      const rankings = [];

      // Winner(s)
      alivePlayers.forEach((p) => {
        rankings.push({ id: p.id, name: p.name, index: p.index, color: p.color });
      });

      // Then eliminated players in reverse order (last eliminated = better rank)
      for (let i = this.eliminationOrder.length - 1; i >= 0; i--) {
        const pid = this.eliminationOrder[i];
        const p = this.players[pid];
        if (p && !rankings.find((r) => r.id === p.id)) {
          rankings.push({ id: p.id, name: p.name, index: p.index, color: p.color });
        }
      }

      // Add any remaining players not in rankings
      Object.values(this.players).forEach((p) => {
        if (!rankings.find((r) => r.id === p.id)) {
          rankings.push({ id: p.id, name: p.name, index: p.index, color: p.color });
        }
      });

      this.rankings = rankings;

      // Host sends rankings
      if (!this.isDemo && this.network.isHost) {
        this.network.setRankings(rankings);
        this.network.endGame(rankings);
      }

      this.state = 'gameover';
      setTimeout(() => {
        this.ui.hideEliminated();
        this.ui.showGameOver(rankings);
      }, 1000); // Short delay for dramatic effect
    }
  }

  // ─── Updates ───────────────────────────────────────────

  _updatePlayers(dt) {
    Object.values(this.players).forEach((p) => p.update(dt));
  }

  _updateBombs(dt) {
    if (!this.bombs) return;

    const allPlayers = Object.values(this.players);
    this.bombs.update(dt, this.gameTime, allPlayers);
  }

  _updateCamera(dt) {
    if (!this.localPlayer) return;

    // First-person camera at player position
    const eyeHeight = Player.EYE_HEIGHT;

    // Use the player's continuous facing angle directly
    // facingAngle convention: 0 = north (−Z), positive = clockwise from above
    const targetAngle = this.localPlayer.facingAngle;

    // Smooth rotation (fast follow so camera feels responsive)
    if (dt) {
      let diff = targetAngle - this.cameraAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.cameraAngle += diff * Math.min(1, (dt || 0.016) * 15);
    } else {
      this.cameraAngle = targetAngle;
    }

    // Position camera
    this.camera.position.set(
      this.localPlayer.x,
      eyeHeight,
      this.localPlayer.z
    );

    // Look direction
    // Our angle convention: 0 = north (−Z), positive = clockwise
    // Forward vector: (sin(angle), 0, -cos(angle))
    const lookDist = 10;
    const lookX = this.localPlayer.x + Math.sin(this.cameraAngle) * lookDist;
    const lookZ = this.localPlayer.z - Math.cos(this.cameraAngle) * lookDist;
    this.camera.lookAt(lookX, eyeHeight * 0.8, lookZ);
  }

  _updateHUD() {
    if (!this.abilities) return;

    this.ui.updateAbilities(this.abilities.getState());
    this.ui.updateTimer(this.gameTime);

    // Update player status
    const statusData = {};
    Object.values(this.players).forEach((p) => {
      statusData[p.id] = { id: p.id, name: p.name, index: p.index, state: p.state, color: p.color };
    });
    this.ui.updatePlayerStatus(statusData, this.localPlayerId);
  }

  _syncToNetwork() {
    if (!this.localPlayer || this.isDemo) return;
    this.network.syncPosition(
      this.localPlayer.x,
      this.localPlayer.z,
      this.localPlayer.facing,
      this.localPlayer.facingAngle
    );
  }

  // ─── Bot Updates (Demo Mode) ──────────────────────────

  _updateBots(dt) {
    if (!this.isDemo) return;

    const allPlayers = Object.values(this.players);

    for (const bot of this.bots) {
      if (bot.player.state === 'eliminated') continue;

      const events = bot.update(dt, allPlayers, this.gameTime);

      // Process bot events
      for (const event of events) {
        this._processBotEvent(event);
      }
    }
  }

  _processBotEvent(event) {
    const fromPlayer = this.players[event.from];
    const fromName = fromPlayer ? fromPlayer.name : 'Bot';

    switch (event.type) {
      case 'hide': {
        const p = this.players[event.from];
        if (p) p.setHidden(true);
        this.ui.addKillFeedEntry(`<b>${fromName}</b> is hiding`, '#4488ff');
        break;
      }

      case 'unhide': {
        const p = this.players[event.from];
        if (p) p.setHidden(false);
        break;
      }

      case 'forceHide': {
        const target = this.players[event.target];
        if (target) {
          target.setHidden(true);
          // If target is local player
          if (event.target === this.localPlayerId) {
            this.abilities.forceHide(event.duration || 10000);
            this.ui.showHideOverlay(true);
            this.ui.addKillFeedEntry(
              `<b>${fromName}</b> forced you to hide!`, '#e94560'
            );
          } else {
            // If target is another bot
            const targetBot = this.bots.find(b => b.player.id === event.target);
            if (targetBot) targetBot.abilities.forceHide(event.duration || 10000);
            this.ui.addKillFeedEntry(
              `<b>${fromName}</b> forced <b>${target.name}</b> to hide`, '#ffdd44'
            );
          }
        }
        break;
      }

      case 'forceUnhide': {
        const target = this.players[event.target];
        if (target) {
          target.setHidden(false);
          if (event.target === this.localPlayerId) {
            this.abilities.forceUnhide();
            this.ui.showHideOverlay(false);
            this.ui.addKillFeedEntry(
              `<b>${fromName}</b> forced you to unhide!`, '#e94560'
            );
          } else {
            const targetBot = this.bots.find(b => b.player.id === event.target);
            if (targetBot) targetBot.abilities.forceUnhide();
            this.ui.addKillFeedEntry(
              `<b>${fromName}</b> forced <b>${target.name}</b> to unhide`, '#44dd44'
            );
          }
        }
        break;
      }

      case 'jump': {
        const p = this.players[event.from];
        if (p) {
          this._createJumpTrail(event.startX, event.startZ, event.facing, event.from);
        }
        break;
      }

      case 'eliminate': {
        this._eliminatePlayer(event.target, event.by);
        break;
      }
    }
  }

  // ─── Jump Trail Visual ────────────────────────────────

  _createJumpTrail(startX, startZ, facing, playerId, angle) {
    let dirX, dirZ;

    if (angle !== undefined && angle !== null) {
      // Use continuous angle: forward = (sin(angle), -cos(angle))
      dirX = Math.sin(angle);
      dirZ = -Math.cos(angle);
    } else {
      // Fallback to cardinal direction (for bots/remote players)
      const dirMap = {
        'up':    { x: 0, z: -1 },
        'down':  { x: 0, z: 1 },
        'left':  { x: -1, z: 0 },
        'right': { x: 1, z: 0 },
      };
      const dir = dirMap[facing] || dirMap['up'];
      dirX = dir.x;
      dirZ = dir.z;
    }

    const halfArena = Arena.HALF;

    // Calculate end point (arena wall)
    let endX = startX + dirX * Arena.SIZE;
    let endZ = startZ + dirZ * Arena.SIZE;
    endX = Math.max(-halfArena, Math.min(halfArena, endX));
    endZ = Math.max(-halfArena, Math.min(halfArena, endZ));

    const length = Math.sqrt(
      (endX - startX) ** 2 + (endZ - startZ) ** 2
    );

    const midX = (startX + endX) / 2;
    const midZ = (startZ + endZ) / 2;

    // Create trail mesh
    const trailGeo = new THREE.PlaneGeometry(0.5, length);
    const color = playerId && this.players[playerId]
      ? this.players[playerId].color
      : (this.localPlayer ? this.localPlayer.color : 0xffffff);

    const trailMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.rotation.x = -Math.PI / 2;
    trail.position.set(midX, 0.05, midZ);

    // Rotate trail to match the jump direction
    // The plane's default "long axis" is along Y (which is Z after the X rotation)
    // We need to rotate it around the (now-vertical) Z axis to match direction
    const trailAngle = Math.atan2(dirX, -dirZ);
    trail.rotation.z = -trailAngle;

    this.scene.add(trail);
    this.jumpTrail = trail;

    // Fade out and remove
    const startTime = Date.now();
    const fadeTrail = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 0.5) {
        this.scene.remove(trail);
        if (this.jumpTrail === trail) this.jumpTrail = null;
        return;
      }
      trail.material.opacity = 0.4 * (1 - elapsed / 0.5);
      requestAnimationFrame(fadeTrail);
    };
    requestAnimationFrame(fadeTrail);
  }

  _removeJumpTrail() {
    if (this.jumpTrail) {
      this.scene.remove(this.jumpTrail);
      this.jumpTrail = null;
    }
  }

  // ─── Post-Game ────────────────────────────────────────

  async _playAgain() {
    this.ui.hideGameOver();
    this._cleanup();

    if (this.isDemo) {
      // Restart demo mode directly
      this._startDemoMode();
      return;
    }

    if (this.network.isHost) {
      // Reset room
      this.state = 'lobby';
      await this.network.roomRef.update({
        state: 'waiting',
        gameStartTime: null,
        events: null,
        bombs: null,
        rankings: null,
      });
      // Reset player state
      const spawn = Arena.SPAWN_POSITIONS[this.localPlayerIndex];
      await this.network.roomRef.child(`players/${this.localPlayerId}`).update({
        x: spawn.x,
        z: spawn.z,
        facing: 'up',
        state: 'alive',
        ready: false,
      });
      this.ui.showLobby(this.network.roomCode, true);
    } else {
      // Non-host: reset own player
      this.state = 'lobby';
      const spawn = Arena.SPAWN_POSITIONS[this.localPlayerIndex];
      await this.network.roomRef.child(`players/${this.localPlayerId}`).update({
        x: spawn.x,
        z: spawn.z,
        facing: 'up',
        state: 'alive',
        ready: false,
      });
      this.ui.showLobby(this.network.roomCode, false);
    }
  }

  async _leaveGameEarly() {
    this.ui.hideEliminated();
    this.ui.hideHUD();
    this._cleanup();
    this.isDemo = false;
    if (this.network.roomRef) {
      await this.network.leaveRoom();
    }
    this.state = 'menu';
    this.ui.showMenu();

    // Reset auth section visibility
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('room-actions').style.display = 'none';
  }

  async _backToMenu() {
    this.ui.hideGameOver();
    this._cleanup();
    this.isDemo = false;
    if (!this.isDemo) {
      await this.network.leaveRoom();
    }
    this.state = 'menu';
    this.ui.showMenu();

    // Reset auth section visibility
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('room-actions').style.display = 'none';
  }

  _cleanup() {
    // Remove all Three.js objects
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // Reset state
    Object.values(this.players).forEach((p) => p.destroy());
    this.players = {};
    this.localPlayer = null;
    this.arena = null;
    this.abilities = null;
    this.bots = [];
    if (this.bombs) this.bombs.clear();
    this.bombs = null;
    this.gameTime = 0;
    this.eliminationOrder = [];
    this.rankings = [];
    this.processedEvents = new Set();
    this.cameraAngle = 0;
    this.ui.hideHUD();
    this.ui.showHideOverlay(false);
  }
}
