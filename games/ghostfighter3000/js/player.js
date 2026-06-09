/**
 * Player - Represents a player in the 3D arena.
 *
 * Local player: first-person camera (no visible self-model).
 * Remote players: colored capsule body + sphere head with name tag.
 *
 * States: 'alive', 'hidden', 'eliminated'
 * When hidden: invisible to others, screen tint for self.
 */
class Player {
  static SPEED = 8;           // units per second
  static RADIUS = 0.5;        // collision radius
  static EYE_HEIGHT = 1.6;    // camera height for first-person
  static BODY_HEIGHT = 1.4;   // capsule body height
  static HEAD_RADIUS = 0.3;   // sphere head

  constructor(id, index, name, isLocal, scene) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.isLocal = isLocal;
    this.scene = scene;

    // Position & facing
    const spawn = Arena.SPAWN_POSITIONS[index];
    this.x = spawn.x;
    this.z = spawn.z;
    this.facing = 'up';           // Cardinal direction (for remote/bot compatibility)
    this.facingAngle = 0;         // Continuous angle in radians (0 = north/-Z)
    this.targetAngle = 0;
    this.currentAngle = 0;

    // State
    this.state = 'alive';    // 'alive' | 'hidden' | 'eliminated'
    this.eliminatedBy = null;
    this.eliminationRank = -1;

    // 3D representation (only for remote players)
    this.group = null;
    this.bodyMesh = null;
    this.headMesh = null;
    this.nameSprite = null;
    this.color = Arena.PLAYER_COLORS[index];

    if (!isLocal) {
      this._createModel();
    }
  }

  _createModel() {
    this.group = new THREE.Group();

    // ── Ghost Body (high-detail lathe: rounded dome → organic body → wavy skirt) ──
    const ghostPoints = [];
    const segments = 40;
    const ghostHeight = 2.2;
    const ghostRadius = 0.65;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 (top) → 1 (bottom)
      const y = (1 - t) * ghostHeight;
      let r;

      if (t < 0.25) {
        // Smooth dome top (hemisphere)
        const domeT = t / 0.25;
        r = Math.sin(domeT * Math.PI / 2) * ghostRadius;
      } else if (t < 0.45) {
        // Upper body - slight shoulder bulge
        const bodyT = (t - 0.25) / 0.2;
        r = ghostRadius * (1 + 0.06 * Math.sin(bodyT * Math.PI));
      } else if (t < 0.7) {
        // Mid body - gentle taper inward then outward (waist)
        const midT = (t - 0.45) / 0.25;
        r = ghostRadius * (1 - 0.05 * Math.sin(midT * Math.PI));
      } else {
        // Bottom skirt - flares out then multiple wavy tendrils
        const bottomT = (t - 0.7) / 0.3;
        const flare = 0.12 * Math.sin(bottomT * Math.PI * 0.5);
        const wave = Math.sin(bottomT * Math.PI * 4) * 0.06 * bottomT;
        const taper = 1 - bottomT * 0.5;
        r = ghostRadius * taper + flare + wave;
      }

      ghostPoints.push(new THREE.Vector2(Math.max(0.01, r), y));
    }

    const ghostGeo = new THREE.LatheGeometry(ghostPoints, 32);
    const ghostMat = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 0.7,
      emissive: this.color,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    });
    this.bodyMesh = new THREE.Mesh(ghostGeo, ghostMat);
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // ── Outer Glow Aura (larger transparent shell) ──
    const auraPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = (1 - t) * (ghostHeight * 0.85);
      let r;
      if (t < 0.3) {
        r = Math.sin((t / 0.3) * Math.PI / 2) * (ghostRadius + 0.2);
      } else {
        r = (ghostRadius + 0.2) * (1 - (t - 0.3) * 0.7);
      }
      auraPoints.push(new THREE.Vector2(Math.max(0.01, r), y + ghostHeight * 0.15));
    }
    const auraGeo = new THREE.LatheGeometry(auraPoints, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    this.group.add(aura);
    this._auraMesh = aura;

    // ── Arm Nubs (small rounded bumps on sides) ──
    const armGeo = new THREE.SphereGeometry(0.15, 8, 6);
    const armMat = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.65,
      emissive: this.color,
      emissiveIntensity: 0.15,
    });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.scale.set(1.2, 0.8, 0.7);
    leftArm.position.set(-ghostRadius * 0.9, ghostHeight * 0.5, 0);
    this.group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.scale.set(1.2, 0.8, 0.7);
    rightArm.position.set(ghostRadius * 0.9, ghostHeight * 0.5, 0);
    this.group.add(rightArm);

    this._leftArm = leftArm;
    this._rightArm = rightArm;

    // ── Tail Wisps (5 flowing tendrils at the bottom) ──
    this._wisps = [];
    const wispCount = 5;
    for (let w = 0; w < wispCount; w++) {
      const wispGeo = new THREE.ConeGeometry(0.07, 0.55, 6);
      const wispMat = new THREE.MeshStandardMaterial({
        color: this.color,
        transparent: true,
        opacity: 0.4,
        emissive: this.color,
        emissiveIntensity: 0.25,
      });
      const wisp = new THREE.Mesh(wispGeo, wispMat);
      const angle = (w / wispCount) * Math.PI * 2;
      const dist = ghostRadius * 0.45;
      wisp.position.set(
        Math.cos(angle) * dist,
        -0.2,
        Math.sin(angle) * dist
      );
      wisp.rotation.z = Math.sin(angle) * 0.25;
      wisp.userData = { baseAngle: angle, baseX: wisp.position.x, baseZ: wisp.position.z };
      this.group.add(wisp);
      this._wisps.push(wisp);
    }

    // ── Eyes (detailed with white sclera, colored iris, dark pupil) ──
    const eyeHeight = ghostHeight * 0.6;
    const eyeSpacing = 0.2;
    const eyeForward = -ghostRadius * 0.82;

    // Eye sockets (subtle dark rings behind eyes)
    const socketGeo = new THREE.RingGeometry(0.08, 0.16, 16);
    const socketMat = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    for (let side = -1; side <= 1; side += 2) {
      const socket = new THREE.Mesh(socketGeo, socketMat);
      socket.position.set(side * eyeSpacing, eyeHeight, eyeForward - 0.01);
      socket.lookAt(socket.position.x, socket.position.y, eyeForward - 1);
      this.group.add(socket);
    }

    // Sclera (white of eye - large oval)
    const scleraGeo = new THREE.SphereGeometry(0.13, 12, 10);
    const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftSclera = new THREE.Mesh(scleraGeo, scleraMat);
    leftSclera.scale.set(0.85, 1.15, 0.5);
    leftSclera.position.set(-eyeSpacing, eyeHeight, eyeForward);
    this.group.add(leftSclera);

    const rightSclera = new THREE.Mesh(scleraGeo, scleraMat);
    rightSclera.scale.set(0.85, 1.15, 0.5);
    rightSclera.position.set(eyeSpacing, eyeHeight, eyeForward);
    this.group.add(rightSclera);

    // Iris (colored ring)
    const irisGeo = new THREE.SphereGeometry(0.08, 10, 8);
    const irisColor = new THREE.Color(this.color).lerp(new THREE.Color(0xffffff), 0.3);
    const irisMat = new THREE.MeshBasicMaterial({ color: irisColor });

    const leftIris = new THREE.Mesh(irisGeo, irisMat);
    leftIris.scale.set(0.9, 1.0, 0.4);
    leftIris.position.set(-eyeSpacing, eyeHeight - 0.01, eyeForward - 0.04);
    this.group.add(leftIris);

    const rightIris = new THREE.Mesh(irisGeo, irisMat);
    rightIris.scale.set(0.9, 1.0, 0.4);
    rightIris.position.set(eyeSpacing, eyeHeight - 0.01, eyeForward - 0.04);
    this.group.add(rightIris);

    // Pupils (dark center)
    const pupilGeo = new THREE.SphereGeometry(0.045, 8, 6);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050510 });

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.scale.set(1, 1.1, 0.4);
    leftPupil.position.set(-eyeSpacing, eyeHeight - 0.015, eyeForward - 0.06);
    this.group.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.scale.set(1, 1.1, 0.4);
    rightPupil.position.set(eyeSpacing, eyeHeight - 0.015, eyeForward - 0.06);
    this.group.add(rightPupil);

    // Eye glow (small emissive sphere behind each eye)
    const eyeGlowGeo = new THREE.SphereGeometry(0.18, 8, 6);
    const eyeGlowMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.1,
    });
    for (let side = -1; side <= 1; side += 2) {
      const eg = new THREE.Mesh(eyeGlowGeo, eyeGlowMat);
      eg.position.set(side * eyeSpacing, eyeHeight, eyeForward + 0.05);
      this.group.add(eg);
    }

    // ── Mouth (open "O" shape - spooky!) ──
    const mouthGeo = new THREE.RingGeometry(0.04, 0.1, 12);
    const mouthMat = new THREE.MeshBasicMaterial({
      color: 0x111122,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.scale.set(1, 1.3, 1);
    mouth.position.set(0, eyeHeight - 0.28, eyeForward - 0.02);
    mouth.lookAt(0, eyeHeight - 0.28, eyeForward - 1);
    this.group.add(mouth);

    // Inner mouth darkness
    const mouthInnerGeo = new THREE.CircleGeometry(0.05, 10);
    const mouthInnerMat = new THREE.MeshBasicMaterial({
      color: 0x050510,
      side: THREE.DoubleSide,
    });
    const mouthInner = new THREE.Mesh(mouthInnerGeo, mouthInnerMat);
    mouthInner.position.set(0, eyeHeight - 0.28, eyeForward - 0.01);
    mouthInner.lookAt(0, eyeHeight - 0.28, eyeForward - 1);
    this.group.add(mouthInner);

    // ── Eyebrows (angled lines above eyes for expression) ──
    const browGeo = new THREE.BoxGeometry(0.16, 0.025, 0.02);
    const browMat = new THREE.MeshBasicMaterial({
      color: 0x222233,
      transparent: true,
      opacity: 0.5,
    });

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-eyeSpacing, eyeHeight + 0.16, eyeForward - 0.02);
    leftBrow.rotation.z = -0.2; // angled inward (spooky look)
    this.group.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(eyeSpacing, eyeHeight + 0.16, eyeForward - 0.02);
    rightBrow.rotation.z = 0.2;
    this.group.add(rightBrow);

    // ── Inner Core Glow (pulsating light source inside) ──
    const coreGlowGeo = new THREE.SphereGeometry(ghostRadius * 0.5, 16, 12);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.08,
    });
    const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    coreGlow.position.y = ghostHeight * 0.45;
    this.group.add(coreGlow);
    this._coreGlow = coreGlow;

    // ── Point Light (each ghost emits a subtle colored light) ──
    const ghostLight = new THREE.PointLight(this.color, 0.4, 5);
    ghostLight.position.y = ghostHeight * 0.5;
    this.group.add(ghostLight);
    this._ghostLight = ghostLight;

    // Store head mesh ref for compatibility (used by elimination anim)
    this.headMesh = this.bodyMesh;

    // Store animation start time for floating bob
    this._bobStartTime = Date.now() + Math.random() * 3000;

    // Name tag
    this._createNameTag();

    this.group.position.set(this.x, 0, this.z);
    this.scene.add(this.group);
  }

  _createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    this.nameSprite = new THREE.Sprite(spriteMat);
    this.nameSprite.position.y = Player.BODY_HEIGHT + Player.HEAD_RADIUS * 2 + 0.5;
    this.nameSprite.scale.set(2, 0.5, 1);
    this.group.add(this.nameSprite);
  }

  /**
   * Update the player's 3D representation.
   */
  update(dt) {
    if (this.state === 'eliminated') return;

    if (!this.isLocal && this.group) {
      // Smoothly interpolate remote player position
      this.group.position.x += (this.x - this.group.position.x) * Math.min(1, dt * 10);
      this.group.position.z += (this.z - this.group.position.z) * Math.min(1, dt * 10);

      // Update rotation - use continuous angle if available, else cardinal direction
      // facingAngle convention: 0 = north/-Z, positive = clockwise
      // Three.js Y rotation: 0 = looking along -Z, positive = counter-clockwise
      const targetAngle = this.facingAngle !== undefined && this.facingAngle !== 0
        ? -this.facingAngle
        : this._facingToAngle(this.facing);
      this.group.rotation.y = this._lerpAngle(this.group.rotation.y, targetAngle, dt * 10);

      // Floating bob animation (ghostly hover)
      if (this._bobStartTime !== undefined) {
        const elapsed = (Date.now() - this._bobStartTime) / 1000;
        this.group.position.y = Math.sin(elapsed * 1.8) * 0.18 + 0.25;

        // ── Animated tail wisps (sway independently) ──
        if (this._wisps) {
          for (let i = 0; i < this._wisps.length; i++) {
            const wisp = this._wisps[i];
            const phase = wisp.userData.baseAngle + elapsed * 2.5;
            wisp.rotation.z = Math.sin(phase) * 0.4;
            wisp.rotation.x = Math.cos(phase * 0.7) * 0.25;
            wisp.position.x = wisp.userData.baseX + Math.sin(phase * 1.3) * 0.04;
            wisp.position.z = wisp.userData.baseZ + Math.cos(phase * 0.9) * 0.04;
            wisp.position.y = -0.2 + Math.sin(phase * 1.5) * 0.06;
          }
        }

        // ── Arms gentle wave ──
        if (this._leftArm && this._rightArm) {
          this._leftArm.rotation.z = Math.sin(elapsed * 1.5) * 0.15 - 0.1;
          this._rightArm.rotation.z = Math.sin(elapsed * 1.5 + Math.PI) * 0.15 + 0.1;
          this._leftArm.position.y = 1.1 + Math.sin(elapsed * 2) * 0.03;
          this._rightArm.position.y = 1.1 + Math.sin(elapsed * 2 + 1) * 0.03;
        }

        // ── Core glow pulsating ──
        if (this._coreGlow) {
          const pulse = 0.06 + Math.sin(elapsed * 3) * 0.04;
          this._coreGlow.material.opacity = pulse;
          const s = 1 + Math.sin(elapsed * 3) * 0.08;
          this._coreGlow.scale.set(s, s, s);
        }

        // ── Aura breathing ──
        if (this._auraMesh) {
          const auraScale = 1 + Math.sin(elapsed * 1.2) * 0.05;
          this._auraMesh.scale.set(auraScale, auraScale, auraScale);
          this._auraMesh.material.opacity = 0.04 + Math.sin(elapsed * 2) * 0.02;
        }

        // ── Ghost light flicker ──
        if (this._ghostLight) {
          this._ghostLight.intensity = 0.35 + Math.sin(elapsed * 4) * 0.1 + Math.sin(elapsed * 7) * 0.05;
        }
      }
    }
  }

  /**
   * Move the local player in a direction.
   * Returns the new position (clamped to arena bounds).
   */
  move(dx, dz, dt, arena) {
    if (this.state !== 'alive' && this.state !== 'hidden') return;

    const newX = this.x + dx * Player.SPEED * dt;
    const newZ = this.z + dz * Player.SPEED * dt;

    // Check arena bounds
    const clamped = Arena.clampPosition(newX, newZ, Player.RADIUS);

    // Check pillar collisions
    if (!arena.isInsidePillar(clamped.x, clamped.z, Player.RADIUS)) {
      this.x = clamped.x;
      this.z = clamped.z;
    } else {
      // Try sliding along one axis
      const clampedX = Arena.clampPosition(newX, this.z, Player.RADIUS);
      if (!arena.isInsidePillar(clampedX.x, this.z, Player.RADIUS)) {
        this.x = clampedX.x;
      }
      const clampedZ = Arena.clampPosition(this.x, newZ, Player.RADIUS);
      if (!arena.isInsidePillar(this.x, clampedZ.z, Player.RADIUS)) {
        this.z = clampedZ.z;
      }
    }
  }

  /**
   * Set the player's facing direction (cardinal string).
   */
  setFacing(facing) {
    this.facing = facing;
  }

  /**
   * Set the player's facing angle (continuous, radians).
   * Also updates the cardinal facing string for compatibility.
   */
  setFacingAngle(angle) {
    this.facingAngle = angle;
    // Update cardinal direction
    let a = angle;
    while (a < 0) a += Math.PI * 2;
    while (a >= Math.PI * 2) a -= Math.PI * 2;
    if (a < Math.PI / 4 || a >= 7 * Math.PI / 4) this.facing = 'up';
    else if (a < 3 * Math.PI / 4) this.facing = 'right';
    else if (a < 5 * Math.PI / 4) this.facing = 'down';
    else this.facing = 'left';
  }

  /**
   * Set the player to hidden state.
   */
  setHidden(hidden) {
    if (this.state === 'eliminated') return;

    this.state = hidden ? 'hidden' : 'alive';

    if (this.group) {
      // Make the model invisible/visible
      this.group.visible = !hidden;
    }
  }

  /**
   * Eliminate this player.
   */
  eliminate(byPlayerId) {
    this.state = 'eliminated';
    this.eliminatedBy = byPlayerId;

    if (this.group) {
      // Death animation - fall over and fade
      this._playEliminationAnimation();
    }
  }

  _playEliminationAnimation() {
    if (!this.group) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 1) {
        this.group.visible = false;
        return;
      }

      // Tip over
      this.group.rotation.z = (elapsed / 1) * (Math.PI / 2);
      // Fade out
      this.group.children.forEach((child) => {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = 1 - elapsed;
        }
      });

      requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Set remote player position (from network sync).
   */
  setNetworkPosition(x, z, facing, facingAngle) {
    this.x = x;
    this.z = z;
    this.facing = facing;
    if (facingAngle !== undefined) {
      this.facingAngle = facingAngle;
    }
  }

  /**
   * Convert facing string to Three.js rotation angle.
   */
  _facingToAngle(facing) {
    const angles = {
      'up':    0,
      'right': -Math.PI / 2,
      'down':  Math.PI,
      'left':  Math.PI / 2,
    };
    return angles[facing] ?? 0;
  }

  /**
   * Lerp between two angles (handling wraparound).
   */
  _lerpAngle(current, target, t) {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * Math.min(1, t);
  }

  /**
   * Get distance to another player.
   */
  distanceTo(other) {
    const dx = this.x - other.x;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Clean up Three.js objects.
   */
  destroy() {
    if (this.group) {
      this.scene.remove(this.group);
    }
  }
}
