/**
 * UI - HUD overlay, menus, target selection, kill feed, game over screen.
 *
 * All UI is rendered as HTML overlays on top of the Three.js canvas.
 */
class UI {
  constructor() {
    this.killFeedEntries = [];
    this.killFeedTimeout = null;
  }

  // ─── Menu Screen ───────────────────────────────────────

  showMenu() {
    this._hideAll();
    document.getElementById('menu-screen').classList.add('active');
    const lobbyEntry = document.getElementById('lobby-entry-section');
    const demoBtn = document.getElementById('demo-btn');
    const roomActions = document.getElementById('room-actions');
    if (lobbyEntry) lobbyEntry.style.display = 'block';
    if (demoBtn) demoBtn.style.display = 'block';
    if (roomActions) roomActions.style.display = 'none';
  }

  hideMenu() {
    document.getElementById('menu-screen').classList.remove('active');
  }

  // ─── Lobby Screen ──────────────────────────────────────

  showLobby(roomCode, isHost) {
    this._hideAll();
    document.getElementById('lobby-screen').classList.add('active');
    document.getElementById('room-code-display').textContent = roomCode;
    document.getElementById('start-game-btn').style.display = isHost ? 'block' : 'none';
    document.getElementById('lobby-waiting').style.display = isHost ? 'none' : 'block';
  }

  hideLobby() {
    document.getElementById('lobby-screen').classList.remove('active');
  }

  updateLobbyPlayers(players) {
    const list = document.getElementById('lobby-player-list');
    list.innerHTML = '';

    const sortedPlayers = Object.values(players).sort((a, b) => a.index - b.index);

    sortedPlayers.forEach((p) => {
      const colorHex = p.color || this._colorHex(Arena.PLAYER_COLORS[p.index]);
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="player-color-dot" style="background: ${colorHex}"></span>
        <span class="player-name">${this._escapeHtml(p.name)}</span>
        <span class="player-team">Player ${p.index + 1}</span>
      `;
      list.appendChild(li);
    });
  }

  // ─── Countdown ─────────────────────────────────────────

  showCountdown(onDone) {
    this._hideAll();
    const el = document.getElementById('countdown-screen');
    el.classList.add('active');

    let count = 3;
    const numEl = document.getElementById('countdown-number');
    numEl.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        numEl.textContent = count;
        numEl.classList.remove('pulse');
        void numEl.offsetWidth; // Trigger reflow
        numEl.classList.add('pulse');
      } else {
        numEl.textContent = 'GO!';
        numEl.classList.remove('pulse');
        void numEl.offsetWidth;
        numEl.classList.add('pulse');

        setTimeout(() => {
          el.classList.remove('active');
          if (onDone) onDone();
        }, 500);
        clearInterval(interval);
      }
    }, 1000);
  }

  // ─── Game HUD ──────────────────────────────────────────

  showHUD() {
    document.getElementById('game-hud').classList.add('active');
    document.getElementById('touch-controls').style.display =
      'ontouchstart' in window ? 'flex' : 'none';
  }

  hideHUD() {
    document.getElementById('game-hud').classList.remove('active');
    document.getElementById('touch-controls').style.display = 'none';
  }

  updateAbilities(abilityState) {
    this._updateAbilityBtn('ability-k', 'K', 'Hide', abilityState.hide);
    this._updateAbilityBtn('ability-l', 'L', 'Force Hide', abilityState.forceHide);
    this._updateAbilityBtn('ability-h', 'H', 'Unhide', abilityState.forceUnhide);
    this._updateAbilityBtn('ability-j', 'J', 'Jump', abilityState.jump);
  }

  _updateAbilityBtn(id, key, name, state) {
    const el = document.getElementById(id);
    if (!el) return;

    const fill = el.querySelector('.ability-cooldown-fill');
    const label = el.querySelector('.ability-label');

    if (state.used) {
      // Force Hide - used up
      el.classList.add('used');
      el.classList.remove('ready', 'active', 'selecting');
      if (label) label.textContent = 'USED';
      if (fill) fill.style.height = '100%';
      return;
    }

    if (state.isActive) {
      el.classList.add('active');
      el.classList.remove('ready', 'used', 'selecting');
      if (label) {
        const remaining = Math.ceil((state.timer || 0) / 1000);
        label.textContent = `${remaining}s`;
      }
      if (fill) {
        const pct = state.timer / (state.maxCooldown || 10000);
        fill.style.height = `${pct * 100}%`;
      }
    } else if (state.isSelecting) {
      el.classList.add('selecting');
      el.classList.remove('ready', 'active', 'used');
      if (label) label.textContent = '...';
    } else if (state.canUse) {
      el.classList.add('ready');
      el.classList.remove('active', 'used', 'selecting');
      if (label) label.textContent = key;
      if (fill) fill.style.height = '0%';
    } else {
      el.classList.remove('ready', 'active', 'used', 'selecting');
      if (label) {
        const remaining = Math.ceil((state.cooldown || 0) / 1000);
        label.textContent = remaining > 0 ? `${remaining}s` : key;
      }
      if (fill) {
        const pct = (state.cooldown || 0) / (state.maxCooldown || 1);
        fill.style.height = `${pct * 100}%`;
      }
    }
  }

  updateTimer(gameTimeMs) {
    const el = document.getElementById('game-timer');
    if (!el) return;

    const totalSeconds = Math.floor(gameTimeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    el.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Turn red when bombs start
    if (gameTimeMs >= BombSystem.START_TIME) {
      el.classList.add('danger');
    } else if (gameTimeMs >= BombSystem.START_TIME - 10000) {
      el.classList.add('warning');
    }
  }

  updatePlayerStatus(players, localPlayerId) {
    const container = document.getElementById('player-status-list');
    if (!container) return;

    container.innerHTML = '';
    const sortedPlayers = Object.values(players).sort((a, b) => a.index - b.index);

    sortedPlayers.forEach((p) => {
      const div = document.createElement('div');
      div.className = `player-status-item ${p.state}`;
      if (p.id === localPlayerId) div.classList.add('self');

      const stateIcon = p.state === 'alive' ? '●' :
                         p.state === 'hidden' ? '◌' : '✕';

      const colorHex = p.color || this._colorHex(Arena.PLAYER_COLORS[p.index]);

      div.innerHTML = `
        <span class="ps-color" style="color: ${colorHex}">${stateIcon}</span>
        <span class="ps-name">${this._escapeHtml(p.name)}</span>
      `;
      container.appendChild(div);
    });
  }

  // Show hide overlay effect on local player's screen
  showHideOverlay(show) {
    const overlay = document.getElementById('hide-overlay');
    if (overlay) {
      overlay.classList.toggle('active', show);
    }
  }

  // ─── Target Selector ──────────────────────────────────

  showTargetSelector(players, abilityName, onSelect, onCancel) {
    const modal = document.getElementById('target-selector');
    const list = document.getElementById('target-list');
    if (!modal || !list) return;

    list.innerHTML = '';
    let targetIndex = 1;
    players.forEach((p) => {
      if (p.state === 'eliminated') return;

      const btn = document.createElement('button');
      btn.className = 'target-btn';
      const keyNum = targetIndex;
      const colorHex = p.color || this._colorHex(Arena.PLAYER_COLORS[p.index]);
      btn.innerHTML = `
        <span class="target-key">${keyNum}</span>
        <span class="target-color" style="background: ${colorHex}"></span>
        <span class="target-name">${this._escapeHtml(p.name)}</span>
      `;
      btn.onclick = () => {
        this.hideTargetSelector();
        if (onSelect) onSelect(p.id);
      };

      // Store keyNum for keyboard selection
      btn.dataset.keyNum = keyNum;

      list.appendChild(btn);
      targetIndex++;
    });

    document.getElementById('target-ability-name').textContent =
      abilityName === 'forceHide' ? 'Force Hide (L)' : 'Force Unhide (H)';

    modal.classList.add('active');

    // Listen for keyboard target selection & escape
    this._targetKeyHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideTargetSelector();
        if (onCancel) onCancel();
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 3) {
        const btn = list.querySelector(`[data-key-num="${num}"]`);
        if (btn) btn.click();
      }
    };
    window.addEventListener('keydown', this._targetKeyHandler);
  }

  hideTargetSelector() {
    const modal = document.getElementById('target-selector');
    if (modal) modal.classList.remove('active');

    if (this._targetKeyHandler) {
      window.removeEventListener('keydown', this._targetKeyHandler);
      this._targetKeyHandler = null;
    }
  }

  // ─── Kill Feed ─────────────────────────────────────────

  addKillFeedEntry(message, color) {
    const feed = document.getElementById('kill-feed');
    if (!feed) return;

    const entry = document.createElement('div');
    entry.className = 'kill-feed-entry';
    entry.innerHTML = message;
    if (color) entry.style.borderLeftColor = color;

    feed.appendChild(entry);
    this.killFeedEntries.push(entry);

    // Fade out after 4 seconds
    setTimeout(() => {
      entry.classList.add('fade-out');
      setTimeout(() => {
        if (entry.parentNode) entry.parentNode.removeChild(entry);
        const idx = this.killFeedEntries.indexOf(entry);
        if (idx >= 0) this.killFeedEntries.splice(idx, 1);
      }, 500);
    }, 4000);
  }

  // ─── Game Over ─────────────────────────────────────────

  showGameOver(rankings) {
    this.hideHUD();
    const screen = document.getElementById('gameover-screen');
    screen.classList.add('active');

    const list = document.getElementById('rankings-list');
    list.innerHTML = '';

    const medals = ['🥇', '🥈', '🥉', '💀'];

    rankings.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = i === 0 ? 'winner' : '';
      const colorHex = r.color || this._colorHex(Arena.PLAYER_COLORS[r.index]);
      li.innerHTML = `
        <span class="rank-medal">${medals[i] || ''}</span>
        <span class="rank-color" style="background: ${colorHex}"></span>
        <span class="rank-name">${this._escapeHtml(r.name)}</span>
      `;
      list.appendChild(li);
    });
  }

  hideGameOver() {
    document.getElementById('gameover-screen').classList.remove('active');
  }

  // ─── Eliminated Overlay ────────────────────────────────

  showEliminated(byName) {
    const overlay = document.getElementById('eliminated-overlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    overlay.style.pointerEvents = 'auto';
    const subtitle = overlay.querySelector('.eliminated-subtitle');
    if (subtitle) {
      subtitle.textContent = byName ? `Eliminated by ${byName} • Spectating...` : 'Spectating...';
    }
  }

  hideEliminated() {
    const overlay = document.getElementById('eliminated-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
    }
  }

  // ─── Helpers ───────────────────────────────────────────

  _hideAll() {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    this.hideHUD();
    this.hideTargetSelector();
    this.hideEliminated();
  }

  _colorHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Show an error toast.
   */
  showError(message) {
    const toast = document.getElementById('error-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
  }

  /**
   * Show an info toast.
   */
  showInfo(message) {
    const toast = document.getElementById('info-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
  }
}
