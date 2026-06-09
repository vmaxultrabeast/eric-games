/**
 * Arena - Builds the 3D game arena.
 *
 * A squared playing field (40x40 units) with:
 * - Grid-patterned floor
 * - Boundary walls
 * - Colored corner spawn pads (red, blue, green, yellow)
 * - Decorative pillars for tactical cover
 * - Ambient + directional lighting
 */
class Arena {
  static SIZE = 40;
  static HALF = 20;
  static WALL_HEIGHT = 3;
  static WALL_THICKNESS = 0.5;

  static PLAYER_COLORS = [
    0xff4444, // Red
    0x4488ff, // Blue
    0x44dd44, // Green
    0xffdd44, // Yellow
  ];

  static SPAWN_POSITIONS = [
    { x: -17, z: -17 }, // Top-left (Red)
    { x:  17, z: -17 }, // Top-right (Blue)
    { x: -17, z:  17 }, // Bottom-left (Green)
    { x:  17, z:  17 }, // Bottom-right (Yellow)
  ];

  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.build();
  }

  build() {
    this._buildFloor();
    this._buildWalls();
    this._buildCornerPads();
    this._buildPillars();
    this._buildLighting();
    this._buildSkybox();
  }

  _buildFloor() {
    // Create a canvas texture with grid pattern
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base color - dark arena floor
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 0, 1024, 1024);

    // Grid lines
    ctx.strokeStyle = '#3a3a5e';
    ctx.lineWidth = 2;
    const gridSize = 1024 / Arena.SIZE;
    for (let i = 0; i <= Arena.SIZE; i++) {
      const pos = i * gridSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 1024);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(1024, pos);
      ctx.stroke();
    }

    // Center circle (Pokemon arena style)
    ctx.strokeStyle = '#5a5a8e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 512, 200, 0, Math.PI * 2);
    ctx.stroke();

    // Center line
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(1024, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 1024);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const geometry = new THREE.PlaneGeometry(Arena.SIZE, Arena.SIZE);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
    });

    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.objects.push(floor);
  }

  _buildWalls() {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x555577,
      roughness: 0.6,
      metalness: 0.3,
    });

    const walls = [
      // North wall
      { w: Arena.SIZE + Arena.WALL_THICKNESS * 2, h: Arena.WALL_HEIGHT, d: Arena.WALL_THICKNESS,
        x: 0, y: Arena.WALL_HEIGHT / 2, z: -Arena.HALF - Arena.WALL_THICKNESS / 2 },
      // South wall
      { w: Arena.SIZE + Arena.WALL_THICKNESS * 2, h: Arena.WALL_HEIGHT, d: Arena.WALL_THICKNESS,
        x: 0, y: Arena.WALL_HEIGHT / 2, z: Arena.HALF + Arena.WALL_THICKNESS / 2 },
      // West wall
      { w: Arena.WALL_THICKNESS, h: Arena.WALL_HEIGHT, d: Arena.SIZE,
        x: -Arena.HALF - Arena.WALL_THICKNESS / 2, y: Arena.WALL_HEIGHT / 2, z: 0 },
      // East wall
      { w: Arena.WALL_THICKNESS, h: Arena.WALL_HEIGHT, d: Arena.SIZE,
        x: Arena.HALF + Arena.WALL_THICKNESS / 2, y: Arena.WALL_HEIGHT / 2, z: 0 },
    ];

    walls.forEach((w) => {
      const geo = new THREE.BoxGeometry(w.w, w.h, w.d);
      const mesh = new THREE.Mesh(geo, wallMaterial);
      mesh.position.set(w.x, w.y, w.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.objects.push(mesh);
    });
  }

  _buildCornerPads() {
    const padSize = 4;
    const padGeometry = new THREE.PlaneGeometry(padSize, padSize);

    Arena.SPAWN_POSITIONS.forEach((pos, i) => {
      const material = new THREE.MeshStandardMaterial({
        color: Arena.PLAYER_COLORS[i],
        roughness: 0.5,
        metalness: 0.2,
        transparent: true,
        opacity: 0.6,
      });

      const pad = new THREE.Mesh(padGeometry, material);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(pos.x, 0.01, pos.z); // Slightly above floor
      this.scene.add(pad);
      this.objects.push(pad);
    });
  }

  _buildPillars() {
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x666688,
      roughness: 0.4,
      metalness: 0.5,
    });

    // Place pillars in a symmetric pattern for tactical cover
    const pillarPositions = [
      { x: -8, z: 0 },
      { x:  8, z: 0 },
      { x:  0, z: -8 },
      { x:  0, z:  8 },
      { x: -12, z: -12 },
      { x:  12, z: -12 },
      { x: -12, z:  12 },
      { x:  12, z:  12 },
    ];

    pillarPositions.forEach((pos) => {
      const geo = new THREE.CylinderGeometry(0.5, 0.6, 2.5, 8);
      const pillar = new THREE.Mesh(geo, pillarMaterial);
      pillar.position.set(pos.x, 1.25, pos.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);
      this.objects.push(pillar);

      // Pillar cap
      const capGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.3, 8);
      const cap = new THREE.Mesh(capGeo, pillarMaterial);
      cap.position.set(pos.x, 2.65, pos.z);
      this.scene.add(cap);
      this.objects.push(cap);
    });
  }

  _buildLighting() {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambient);

    // Main directional light (sun-like)
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    this.scene.add(dirLight);

    // Accent light from the opposite side
    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.3);
    fillLight.position.set(-10, 15, -10);
    this.scene.add(fillLight);

    // Point lights at each corner (matching player colors)
    Arena.SPAWN_POSITIONS.forEach((pos, i) => {
      const light = new THREE.PointLight(Arena.PLAYER_COLORS[i], 0.4, 15);
      light.position.set(pos.x, 3, pos.z);
      this.scene.add(light);
    });
  }

  _buildSkybox() {
    // Simple gradient sky using a large sphere
    const skyGeo = new THREE.SphereGeometry(80, 32, 32);
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#1a1a4e');
    gradient.addColorStop(1, '#2a2a5e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add some stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 300;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    const skyMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(skyCanvas),
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  /**
   * Check if a position is within arena bounds.
   * Returns clamped position.
   */
  static clampPosition(x, z, radius = 0.5) {
    const limit = Arena.HALF - radius;
    return {
      x: Math.max(-limit, Math.min(limit, x)),
      z: Math.max(-limit, Math.min(limit, z)),
    };
  }

  /**
   * Check if a position is inside a pillar (for collision).
   */
  isInsidePillar(x, z, radius = 0.5) {
    const pillarPositions = [
      { x: -8, z: 0 }, { x: 8, z: 0 },
      { x: 0, z: -8 }, { x: 0, z: 8 },
      { x: -12, z: -12 }, { x: 12, z: -12 },
      { x: -12, z: 12 }, { x: 12, z: 12 },
    ];

    for (const p of pillarPositions) {
      const dx = x - p.x;
      const dz = z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 0.6 + radius) return true;
    }
    return false;
  }
}
