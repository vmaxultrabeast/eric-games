/**
 * InputHandler - Unified keyboard + touch input system.
 *
 * Tank-style movement:
 *   Up/Down arrows = move forward/backward relative to facing angle
 *   Left/Right arrows = turn left/right (rotate facing)
 *
 * Abilities: K (hide), L (force-hide), H (force-unhide), J (jump attack).
 * Target selection: 1/2/3 keys to pick a target for L/H abilities.
 */
class InputHandler {
  static TURN_SPEED = 3.5; // radians per second

  constructor() {
    this.keys = {};
    this.justPressed = {};

    // Continuous facing angle in radians (0 = north/-Z, increases clockwise)
    this.facingAngle = 0;

    // Touch state
    this.touchForward = false;
    this.touchBackward = false;
    this.touchTurnLeft = false;
    this.touchTurnRight = false;
    this.touchAbility = null;

    this._bindKeyboard();
    this._bindTouch();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys[e.key] = true;
      this.justPressed[e.key] = true;

      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  _bindTouch() {
    // Touch D-pad
    const dpad = document.getElementById('touch-dpad');
    if (!dpad) return;

    // Up = forward
    const btnUp = document.getElementById('touch-up');
    if (btnUp) {
      btnUp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchForward = true;
      });
      btnUp.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchForward = false;
      });
    }

    // Down = backward
    const btnDown = document.getElementById('touch-down');
    if (btnDown) {
      btnDown.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchBackward = true;
      });
      btnDown.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchBackward = false;
      });
    }

    // Left = turn left
    const btnLeft = document.getElementById('touch-left');
    if (btnLeft) {
      btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchTurnLeft = true;
      });
      btnLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchTurnLeft = false;
      });
    }

    // Right = turn right
    const btnRight = document.getElementById('touch-right');
    if (btnRight) {
      btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchTurnRight = true;
      });
      btnRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.touchTurnRight = false;
      });
    }

    // Touch ability buttons
    ['k', 'l', 'h', 'j'].forEach((key) => {
      const btn = document.getElementById(`touch-${key}`);
      if (!btn) return;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.justPressed[key] = true;
      });
    });

    // Touch target selection
    [1, 2, 3].forEach((num) => {
      const btn = document.getElementById(`touch-target-${num}`);
      if (!btn) return;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.justPressed[String(num)] = true;
      });
    });
  }

  /**
   * Update turning based on held keys. Must be called each frame with dt.
   * @param {number} dt - Delta time in seconds
   */
  updateTurning(dt) {
    let turnAmount = 0;

    // Keyboard turning
    if (this.keys['ArrowLeft']) turnAmount -= 1;
    if (this.keys['ArrowRight']) turnAmount += 1;

    // Touch turning
    if (this.touchTurnLeft) turnAmount -= 1;
    if (this.touchTurnRight) turnAmount += 1;

    if (turnAmount !== 0) {
      this.facingAngle += turnAmount * InputHandler.TURN_SPEED * dt;
      // Normalize to [-PI, PI]
      while (this.facingAngle > Math.PI) this.facingAngle -= Math.PI * 2;
      while (this.facingAngle < -Math.PI) this.facingAngle += Math.PI * 2;
    }
  }

  /**
   * Returns the current movement as {dx, dz} relative to facing direction,
   * or null if not moving forward/backward.
   */
  getMovement() {
    let moveDir = 0; // +1 = forward, -1 = backward

    // Keyboard
    if (this.keys['ArrowUp']) moveDir += 1;
    if (this.keys['ArrowDown']) moveDir -= 1;

    // Touch
    if (this.touchForward) moveDir += 1;
    if (this.touchBackward) moveDir -= 1;

    if (moveDir === 0) return null;

    // Convert facing angle to movement vector
    // facingAngle: 0 = north (−Z), positive = clockwise
    // Forward direction: dx = sin(angle), dz = -cos(angle)
    const dx = Math.sin(this.facingAngle) * moveDir;
    const dz = -Math.cos(this.facingAngle) * moveDir;

    return { dx, dz };
  }

  /**
   * Check if a key was just pressed this frame (consumed on read).
   */
  wasJustPressed(key) {
    if (this.justPressed[key]) {
      this.justPressed[key] = false;
      return true;
    }
    return false;
  }

  /**
   * Check if a key is currently held down.
   */
  isDown(key) {
    return !!this.keys[key];
  }

  /**
   * Clear per-frame state. Call at end of each update.
   */
  endFrame() {
    this.touchAbility = null;
  }

  /**
   * Get the facing angle in radians for Three.js camera.
   * Our convention: 0 = north (−Z), positive = clockwise when viewed from above.
   * Three.js Y rotation: 0 = looking along −Z, positive = counter-clockwise.
   * So we negate our angle to get the Three.js rotation.
   */
  getFacingAngle() {
    return -this.facingAngle;
  }

  /**
   * Convert the current facing angle to the nearest cardinal direction string.
   * Used for compatibility with systems that expect 'up'/'down'/'left'/'right'.
   */
  getCardinalFacing() {
    // Normalize angle to [0, 2*PI)
    let a = this.facingAngle;
    while (a < 0) a += Math.PI * 2;
    while (a >= Math.PI * 2) a -= Math.PI * 2;

    // 0 = north, PI/2 = east, PI = south, 3*PI/2 = west
    if (a < Math.PI / 4 || a >= 7 * Math.PI / 4) return 'up';
    if (a < 3 * Math.PI / 4) return 'right';
    if (a < 5 * Math.PI / 4) return 'down';
    return 'left';
  }

  /**
   * Set the facing angle from a cardinal direction string.
   */
  setFacingFromCardinal(facing) {
    const angles = {
      'up':    0,
      'right': Math.PI / 2,
      'down':  Math.PI,
      'left':  -Math.PI / 2,
    };
    this.facingAngle = angles[facing] ?? 0;
  }
}
