/**
 * BombSystem - Bombs drop from the sky after 1 minute.
 *
 * Sequence:
 * 1. A red target circle appears on the ground
 * 2. A 3D bomb falls from high up in the sky
 * 3. Shadow grows as bomb gets closer to ground
 * 4. On impact: explosion visual + kill any player within blast radius
 *
 * Frequency scales with time:
 * - 1:00-2:00 → 1 bomb every 5 seconds
 * - 2:00-3:00 → 1 bomb every 3 seconds
 * - 3:00+     → 1 bomb every 1.5 seconds
 */
class BombSystem {
  static START_TIME = 60000;   // 1 minute in ms
  static FALL_TIME = 2000;     // 2 seconds to fall from sky
  static FALL_HEIGHT = 35;     // Starting height
  static BLAST_RADIUS = 3;     // kill radius
  static VISUAL_RADIUS = 4;    // visual explosion radius

  constructor(scene) {
    this.scene = scene;
    this.bombs = [];
    this.lastSpawnTime = 0;
    this.isHost = false;
    this.onSpawnBomb = null;   // Callback: (x, z) => {} for network sync
    this.onPlayerHit = null;   // Callback: (playerId) => {} for elimination
  }

  /**
   * Update bomb system.
   * @param {number} dt - Delta time in seconds
   * @param {number} gameTime - Total game time in ms
   * @param {Player[]} players - All players (for kill checking)
   */
  update(dt, gameTime, players) {
    if (gameTime < BombSystem.START_TIME) return;

    // One-time activation log
    if (!this._activated) {
      console.log(`[BOMB] System ACTIVATED at gameTime=${Math.floor(gameTime/1000)}s, isHost=${this.isHost}`);
      this._activated = true;
    }

    // Host spawns bombs
    if (this.isHost) {
      const interval = this._getInterval(gameTime);
      if (gameTime - this.lastSpawnTime >= interval) {
        console.log(`[BOMB] Spawning bomb at gameTime=${Math.floor(gameTime/1000)}s, interval=${interval}ms`);
        this._hostSpawnBomb();
        this.lastSpawnTime = gameTime;
      }
    }

    // Update all active bombs
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];

      if (bomb.exploded) {
        // Post-explosion animation
        bomb.removeTimer -= dt * 1000;
        if (bomb.removeTimer <= 0) {
          this._removeBomb(bomb, i);
        } else {
          this._animateExplosion(bomb, dt);
        }
      } else {
        // Falling phase
        bomb.fallTimer -= dt * 1000;

        if (bomb.fallTimer <= 0) {
          // Hit the ground - EXPLODE
          bomb.exploded = true;
          bomb.removeTimer = 600;
          this._explode(bomb, players);
        } else {
          // Animate falling
          this._animateFalling(bomb, dt);
        }
      }
    }
  }

  /**
   * Spawn a bomb at the given position (called by both host and from network).
   */
  addBomb(x, z) {
    const bomb = {
      x, z,
      fallTimer: BombSystem.FALL_TIME,
      exploded: false,
      removeTimer: 0,
      // 3D objects
      bombMesh: null,
      targetMesh: null,
      trailParticles: [],
      explosionMesh: null,
    };

    // Create the 3D bomb falling from sky
    bomb.bombMesh = this._createBombMesh(x, z);
    // Create ground target shadow
    bomb.targetMesh = this._createGroundTarget(x, z);

    this.bombs.push(bomb);
  }

  _hostSpawnBomb() {
    const margin = 2;
    const range = Arena.SIZE - margin * 2;
    const x = (Math.random() - 0.5) * range;
    const z = (Math.random() - 0.5) * range;

    this.addBomb(x, z);

    // Sync to network
    if (this.onSpawnBomb) {
      this.onSpawnBomb(x, z);
    }
  }

  // ── 3D Bomb Mesh (sphere body + cylinder fuse + cone tip) ──

  _createBombMesh(x, z) {
    const group = new THREE.Group();

    // Bomb body (dark sphere)
    const bodyGeo = new THREE.SphereGeometry(0.45, 12, 10);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.3,
      metalness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Fuse nub on top (small cylinder)
    const fuseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8);
    const fuseMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.4,
      metalness: 0.5,
    });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.y = 0.5;
    group.add(fuse);

    // Fuse spark (glowing point)
    const sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
    });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    spark.position.y = 0.65;
    group.add(spark);

    // Spark light
    const sparkLight = new THREE.PointLight(0xff4400, 1, 4);
    sparkLight.position.y = 0.65;
    group.add(sparkLight);

    // Red danger stripe around the middle
    const stripeGeo = new THREE.TorusGeometry(0.46, 0.04, 6, 16);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.x = Math.PI / 2;
    group.add(stripe);

    // Position: start high in the sky
    group.position.set(x, BombSystem.FALL_HEIGHT, z);

    this.scene.add(group);
    return group;
  }

  // ── Ground Target (red pulsing circle showing where bomb will land) ──

  _createGroundTarget(x, z) {
    const group = new THREE.Group();

    // Outer danger ring
    const ringGeo = new THREE.RingGeometry(
      BombSystem.BLAST_RADIUS * 0.85,
      BombSystem.BLAST_RADIUS,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    group.add(ring);

    // Inner crosshair - two thin bars forming +
    const barGeo = new THREE.PlaneGeometry(1.8, 0.15);
    const barMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const bar1 = new THREE.Mesh(barGeo, barMat.clone());
    bar1.rotation.x = -Math.PI / 2;
    bar1.position.y = 0.02;
    group.add(bar1);

    const bar2 = new THREE.Mesh(barGeo, barMat.clone());
    bar2.rotation.x = -Math.PI / 2;
    bar2.rotation.z = Math.PI / 2;
    bar2.position.y = 0.02;
    group.add(bar2);

    // Center dot
    const dotGeo = new THREE.CircleGeometry(0.2, 12);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.rotation.x = -Math.PI / 2;
    dot.position.y = 0.03;
    group.add(dot);

    group.position.set(x, 0, z);
    // Start small and grow as bomb approaches
    group.scale.set(0.3, 1, 0.3);

    this.scene.add(group);
    return group;
  }

  // ── Falling Animation ──

  _animateFalling(bomb, dt) {
    if (!bomb.bombMesh) return;

    // Calculate fall progress (0 = just spawned, 1 = about to hit)
    const progress = 1 - (bomb.fallTimer / BombSystem.FALL_TIME);

    // Ease-in for accelerating fall (gravity feel)
    const eased = progress * progress;

    // Update bomb Y position
    const currentY = BombSystem.FALL_HEIGHT * (1 - eased);
    bomb.bombMesh.position.y = currentY;

    // Spin/tumble the bomb as it falls
    bomb.bombMesh.rotation.x += dt * 5;
    bomb.bombMesh.rotation.z += dt * 3;

    // Spark flicker
    const spark = bomb.bombMesh.children[2]; // sparkMesh
    if (spark) {
      spark.material.color.setHex(
        Math.random() > 0.3 ? 0xff6600 : 0xffcc00
      );
    }
    const sparkLight = bomb.bombMesh.children[3]; // sparkLight
    if (sparkLight) {
      sparkLight.intensity = 0.5 + Math.random() * 1.5;
    }

    // Grow the ground target as bomb gets closer
    if (bomb.targetMesh) {
      const targetScale = 0.3 + progress * 0.7;
      bomb.targetMesh.scale.set(targetScale, 1, targetScale);

      // Increase target opacity as bomb approaches
      bomb.targetMesh.children.forEach((child) => {
        if (child.material && child.material.opacity !== undefined) {
          const baseOpacity = child === bomb.targetMesh.children[0] ? 0.15 : 0.3;
          child.material.opacity = baseOpacity + progress * 0.4;
        }
      });

      // Pulse the target faster as bomb gets closer
      const pulseSpeed = 5 + progress * 20;
      const pulse = 0.85 + 0.15 * Math.sin(Date.now() * pulseSpeed / 1000);
      bomb.targetMesh.children.forEach((child) => {
        if (child.material) {
          child.material.opacity *= pulse;
        }
      });
    }

    // Spawn smoke trail particles behind the bomb
    if (Math.random() < 0.4) {
      this._spawnTrailParticle(bomb);
    }

    // Update trail particles
    for (let i = bomb.trailParticles.length - 1; i >= 0; i--) {
      const p = bomb.trailParticles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        bomb.trailParticles.splice(i, 1);
      } else {
        p.mesh.position.y += dt * 1.5; // drift upward
        p.mesh.position.x += (Math.random() - 0.5) * dt * 2;
        p.mesh.position.z += (Math.random() - 0.5) * dt * 2;
        const s = p.mesh.scale.x + dt * 0.8;
        p.mesh.scale.set(s, s, s);
        p.mesh.material.opacity = p.life / p.maxLife * 0.5;
      }
    }
  }

  _spawnTrailParticle(bomb) {
    const geo = new THREE.SphereGeometry(0.12, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x555555 : 0x888888,
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(bomb.bombMesh.position);
    mesh.position.x += (Math.random() - 0.5) * 0.3;
    mesh.position.z += (Math.random() - 0.5) * 0.3;
    this.scene.add(mesh);

    const maxLife = 0.4 + Math.random() * 0.3;
    bomb.trailParticles.push({ mesh, life: maxLife, maxLife });
  }

  // ── Explosion ──

  _explode(bomb, players) {
    // Remove falling bomb mesh
    if (bomb.bombMesh) {
      this.scene.remove(bomb.bombMesh);
      bomb.bombMesh = null;
    }

    // Remove ground target
    if (bomb.targetMesh) {
      this.scene.remove(bomb.targetMesh);
      bomb.targetMesh = null;
    }

    // Clean up trail particles
    for (const p of bomb.trailParticles) {
      this.scene.remove(p.mesh);
    }
    bomb.trailParticles = [];

    // Create explosion visual
    bomb.explosionMesh = this._createExplosion(bomb.x, bomb.z);

    // Check for player kills
    if (players) {
      for (const player of players) {
        if (player.state === 'eliminated') continue;
        const dx = player.x - bomb.x;
        const dz = player.z - bomb.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= BombSystem.BLAST_RADIUS) {
          if (this.onPlayerHit) {
            this.onPlayerHit(player.id);
          }
        }
      }
    }
  }

  _createExplosion(x, z) {
    const group = new THREE.Group();

    // Central flash (big bright sphere)
    const flashGeo = new THREE.SphereGeometry(1.2, 16, 8);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 1,
    });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.y = 1;
    group.add(flash);

    // Inner fireball
    const fireGeo = new THREE.SphereGeometry(0.8, 12, 8);
    const fireMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.9,
    });
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.position.y = 1.5;
    group.add(fire);

    // Shockwave ring on ground
    const ringGeo = new THREE.RingGeometry(0.5, 1, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    // Explosion light
    const expLight = new THREE.PointLight(0xff6600, 3, 15);
    expLight.position.y = 2;
    group.add(expLight);

    // Debris particles
    for (let i = 0; i < 20; i++) {
      const pGeo = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4);
      const isEmber = Math.random() > 0.4;
      const pMat = new THREE.MeshBasicMaterial({
        color: isEmber ? (Math.random() > 0.5 ? 0xff6600 : 0xffaa00) : 0x333333,
        transparent: true,
        opacity: 1,
      });
      const particle = new THREE.Mesh(pGeo, pMat);
      particle.position.set(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 1.5 + 0.5,
        (Math.random() - 0.5) * 1.5
      );
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 3,
        (Math.random() - 0.5) * 10
      );
      group.add(particle);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    return group;
  }

  _animateExplosion(bomb, dt) {
    if (!bomb.explosionMesh) return;

    const progress = 1 - (bomb.removeTimer / 600);

    bomb.explosionMesh.children.forEach((child, i) => {
      if (i === 0) {
        // Flash - expand and fade
        child.scale.setScalar(1 + progress * 4);
        child.material.opacity = 1 - progress;
      } else if (i === 1) {
        // Fireball - rise and expand
        child.position.y = 1.5 + progress * 2;
        child.scale.setScalar(1 + progress * 2);
        child.material.opacity = 0.9 * (1 - progress);
      } else if (i === 2) {
        // Shockwave ring - expand
        child.scale.setScalar(1 + progress * BombSystem.VISUAL_RADIUS * 1.5);
        child.material.opacity = 0.8 * (1 - progress);
      } else if (i === 3) {
        // Light - fade out
        child.intensity = 3 * (1 - progress);
      } else {
        // Debris particles - move with velocity and gravity
        if (child.userData.velocity) {
          child.position.x += child.userData.velocity.x * dt;
          child.position.y += child.userData.velocity.y * dt;
          child.position.z += child.userData.velocity.z * dt;
          child.userData.velocity.y -= 18 * dt; // gravity
          child.material.opacity = 1 - progress;
          // Shrink particles
          const s = Math.max(0, 1 - progress * 0.5);
          child.scale.setScalar(s);
        }
      }
    });
  }

  // ── Cleanup ──

  _removeBomb(bomb, index) {
    if (bomb.bombMesh) {
      this.scene.remove(bomb.bombMesh);
    }
    if (bomb.targetMesh) {
      this.scene.remove(bomb.targetMesh);
    }
    if (bomb.explosionMesh) {
      this.scene.remove(bomb.explosionMesh);
    }
    for (const p of bomb.trailParticles) {
      this.scene.remove(p.mesh);
    }
    this.bombs.splice(index, 1);
  }

  _getInterval(gameTime) {
    if (gameTime < 120000) return 5000;  // 1:00-2:00
    if (gameTime < 180000) return 3000;  // 2:00-3:00
    return 1500;                          // 3:00+
  }

  /**
   * Clean up all bombs.
   */
  clear() {
    for (const bomb of this.bombs) {
      if (bomb.bombMesh) this.scene.remove(bomb.bombMesh);
      if (bomb.targetMesh) this.scene.remove(bomb.targetMesh);
      if (bomb.explosionMesh) this.scene.remove(bomb.explosionMesh);
      for (const p of bomb.trailParticles) {
        this.scene.remove(p.mesh);
      }
    }
    this.bombs = [];
    this.lastSpawnTime = 0;
  }
}
