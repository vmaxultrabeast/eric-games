/**
 * AbilitySystem - Manages all player abilities.
 *
 * K: Hide/Unhide     - Toggle invisibility for 10s, 20s cooldown
 * L: Force Hide      - Force a target player hidden for 10s, once per game
 * H: Force Unhide    - Force a target player to unhide, 30s cooldown
 * J: Jump Attack     - Dash to arena edge in facing direction, eliminate players in path
 *
 * Rules:
 * - Hidden players cannot attack (K, L, H, J all blocked while hidden)
 * - Hidden players CAN be hit by jump attacks and bombs
 */
class AbilitySystem {
  constructor() {
    // Timers (in ms)
    this.hideCooldown = 0;        // K cooldown timer
    this.hideTimer = 0;           // Time remaining in hide
    this.isHiding = false;

    this.forceHideUsed = false;   // L - once per game

    this.forceUnhideCooldown = 0; // H cooldown timer

    this.jumpCooldown = 0;        // J cooldown timer
    this.isJumping = false;
    this.jumpStartX = 0;
    this.jumpStartZ = 0;
    this.jumpDx = 0;
    this.jumpDz = 0;
    this.jumpProgress = 0;

    // Target selection state
    this.selectingTarget = false;
    this.selectingAbility = null; // 'forceHide' or 'forceUnhide'

    // Constants
    this.HIDE_DURATION = 10000;
    this.HIDE_COOLDOWN = 20000;
    this.FORCE_HIDE_DURATION = 10000;
    this.FORCE_UNHIDE_COOLDOWN = 30000;
    this.JUMP_COOLDOWN = 15000;
    this.JUMP_SPEED = 80; // units/sec
  }

  /**
   * Update all ability timers.
   * @param {number} dt - Delta time in seconds
   * @returns {Object|null} - Event to send, or null
   */
  update(dt) {
    const dtMs = dt * 1000;
    let event = null;

    // Hide timer
    if (this.isHiding) {
      this.hideTimer -= dtMs;
      if (this.hideTimer <= 0) {
        this.isHiding = false;
        this.hideTimer = 0;
        event = { type: 'unhide' };
      }
    }

    // Cooldowns
    if (this.hideCooldown > 0) this.hideCooldown -= dtMs;
    if (this.forceUnhideCooldown > 0) this.forceUnhideCooldown -= dtMs;
    if (this.jumpCooldown > 0) this.jumpCooldown -= dtMs;

    return event;
  }

  // ─── Hide (K) ──────────────────────────────────────────

  canHide() {
    return !this.isHiding && this.hideCooldown <= 0 && !this.isJumping;
  }

  /**
   * Toggle hide. Returns event to broadcast.
   */
  useHide() {
    if (!this.canHide()) return null;

    this.isHiding = true;
    this.hideTimer = this.HIDE_DURATION;
    this.hideCooldown = this.HIDE_COOLDOWN;

    return { type: 'hide', duration: this.HIDE_DURATION };
  }

  /**
   * Manually unhide (pressing K again).
   */
  useUnhide() {
    if (!this.isHiding) return null;
    this.isHiding = false;
    this.hideTimer = 0;
    // Cooldown still applies from when hide was activated
    return { type: 'unhide' };
  }

  // ─── Force Hide (L) ───────────────────────────────────

  canForceHide() {
    return !this.forceHideUsed && !this.isHiding && !this.isJumping;
  }

  /**
   * Start target selection for Force Hide.
   */
  startForceHide() {
    if (!this.canForceHide()) return false;
    this.selectingTarget = true;
    this.selectingAbility = 'forceHide';
    return true;
  }

  /**
   * Confirm Force Hide on a target. Returns event to broadcast.
   */
  confirmForceHide(targetId) {
    this.forceHideUsed = true;
    this.selectingTarget = false;
    this.selectingAbility = null;
    return {
      type: 'forceHide',
      target: targetId,
      duration: this.FORCE_HIDE_DURATION,
    };
  }

  // ─── Force Unhide (H) ─────────────────────────────────

  canForceUnhide() {
    return this.forceUnhideCooldown <= 0 && !this.isHiding && !this.isJumping;
  }

  /**
   * Start target selection for Force Unhide.
   */
  startForceUnhide() {
    if (!this.canForceUnhide()) return false;
    this.selectingTarget = true;
    this.selectingAbility = 'forceUnhide';
    return true;
  }

  /**
   * Confirm Force Unhide on a target. Returns event to broadcast.
   */
  confirmForceUnhide(targetId) {
    this.forceUnhideCooldown = this.FORCE_UNHIDE_COOLDOWN;
    this.selectingTarget = false;
    this.selectingAbility = null;
    return {
      type: 'forceUnhide',
      target: targetId,
    };
  }

  // ─── Jump Attack (J) ──────────────────────────────────

  canJump() {
    return this.jumpCooldown <= 0 && !this.isJumping && !this.isHiding;
  }

  /**
   * Start jump attack in the given facing direction.
   * @param {string} facing - 'up', 'down', 'left', 'right' (fallback)
   * @param {number} startX - Player's current X position
   * @param {number} startZ - Player's current Z position
   * @param {number} [angle] - Optional continuous facing angle in radians
   * @returns {Object|null} - Event to broadcast, or null if can't jump
   */
  useJump(facing, startX, startZ, angle) {
    if (!this.canJump()) return null;

    this.isJumping = true;
    this.jumpCooldown = this.JUMP_COOLDOWN;
    this.jumpStartX = startX;
    this.jumpStartZ = startZ;
    this.jumpProgress = 0;

    if (angle !== undefined && angle !== null) {
      // Use continuous angle: forward = (sin(angle), -cos(angle))
      this.jumpDx = Math.sin(angle);
      this.jumpDz = -Math.cos(angle);
    } else {
      // Fallback to cardinal direction
      const dirMap = {
        'up':    { x:  0, z: -1 },
        'down':  { x:  0, z:  1 },
        'left':  { x: -1, z:  0 },
        'right': { x:  1, z:  0 },
      };
      const dir = dirMap[facing] || dirMap['up'];
      this.jumpDx = dir.x;
      this.jumpDz = dir.z;
    }

    return {
      type: 'jump',
      facing: facing,
      startX: startX,
      startZ: startZ,
      angle: angle,
    };
  }

  /**
   * Update jump animation. Returns { x, z, done, hitPlayers[] }.
   * @param {number} dt - Delta time in seconds
   * @param {Player[]} otherPlayers - Other players to check collisions against
   */
  updateJump(dt, otherPlayers) {
    if (!this.isJumping) return null;

    const distance = this.JUMP_SPEED * dt;
    this.jumpProgress += distance;

    // Calculate current position during jump
    const currentX = this.jumpStartX + this.jumpDx * this.jumpProgress;
    const currentZ = this.jumpStartZ + this.jumpDz * this.jumpProgress;

    // Check if we've hit the arena wall
    const limit = Arena.HALF - Player.RADIUS;
    const hitWall = Math.abs(currentX) >= limit || Math.abs(currentZ) >= limit;

    // Clamp to arena
    const clampedX = Math.max(-limit, Math.min(limit, currentX));
    const clampedZ = Math.max(-limit, Math.min(limit, currentZ));

    // Check for player collisions along the path
    const hitPlayers = [];
    const hitWidth = 1.5; // Width of the jump path (total, centered on player)

    for (const player of otherPlayers) {
      if (player.state === 'eliminated') continue;

      // Check if player is within the jump corridor
      // The corridor goes from start to current position
      const perpDist = this._pointToLineDist(
        player.x, player.z,
        this.jumpStartX, this.jumpStartZ,
        clampedX, clampedZ
      );

      if (perpDist < hitWidth) {
        // Check if the player is between start and current position (not behind)
        const alongPath = (player.x - this.jumpStartX) * this.jumpDx +
                          (player.z - this.jumpStartZ) * this.jumpDz;
        if (alongPath >= 0 && alongPath <= this.jumpProgress) {
          hitPlayers.push(player);
        }
      }
    }

    if (hitWall) {
      this.isJumping = false;
    }

    return {
      x: clampedX,
      z: clampedZ,
      done: hitWall,
      hitPlayers: hitPlayers,
    };
  }

  /**
   * Force this player out of hide (from Force Unhide ability).
   */
  forceUnhide() {
    this.isHiding = false;
    this.hideTimer = 0;
  }

  /**
   * Force this player into hide (from Force Hide ability).
   */
  forceHide(duration) {
    this.isHiding = true;
    this.hideTimer = duration;
    // Note: this doesn't trigger the hide cooldown
  }

  /**
   * Cancel target selection.
   */
  cancelTargetSelection() {
    this.selectingTarget = false;
    this.selectingAbility = null;
  }

  // ─── UI State ──────────────────────────────────────────

  /**
   * Get the state of all abilities for HUD display.
   */
  getState() {
    return {
      hide: {
        canUse: this.canHide(),
        isActive: this.isHiding,
        cooldown: Math.max(0, this.hideCooldown),
        maxCooldown: this.HIDE_COOLDOWN,
        timer: Math.max(0, this.hideTimer),
      },
      forceHide: {
        canUse: this.canForceHide(),
        used: this.forceHideUsed,
        isSelecting: this.selectingAbility === 'forceHide',
      },
      forceUnhide: {
        canUse: this.canForceUnhide(),
        cooldown: Math.max(0, this.forceUnhideCooldown),
        maxCooldown: this.FORCE_UNHIDE_COOLDOWN,
        isSelecting: this.selectingAbility === 'forceUnhide',
      },
      jump: {
        canUse: this.canJump(),
        isActive: this.isJumping,
        cooldown: Math.max(0, this.jumpCooldown),
        maxCooldown: this.JUMP_COOLDOWN,
      },
    };
  }

  // ─── Helpers ───────────────────────────────────────────

  /**
   * Distance from a point to a line segment.
   */
  _pointToLineDist(px, pz, x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len2 = dx * dx + dz * dz;

    if (len2 === 0) {
      // Start and end are the same point
      const ddx = px - x1;
      const ddz = pz - z1;
      return Math.sqrt(ddx * ddx + ddz * ddz);
    }

    // Project point onto line, clamped to segment
    let t = ((px - x1) * dx + (pz - z1) * dz) / len2;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestZ = z1 + t * dz;

    const distX = px - closestX;
    const distZ = pz - closestZ;
    return Math.sqrt(distX * distX + distZ * distZ);
  }
}
