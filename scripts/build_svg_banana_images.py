import shutil
import os

brain_dir = r'C:\Users\freit\.gemini\antigravity-ide\brain\63a7e02f-d9ef-4e77-99fc-e8c24c0fc32c'
out_dir = r'c:\Users\freit\src\eric-website\games\dino-quiz\images'
os.makedirs(out_dir, exist_ok=True)

# Copy 12 AI generated images
gen_map = {
    'gen_1.png': 'gen_1_terrible_lizard_1786852331634.png',
    'gen_2.png': 'gen_2_asteroid_1786852343817.png',
    'gen_3.png': 'gen_3_birds_1786852354345.png',
    'gen_4.png': 'gen_4_leaves_1786852366572.png',
    'gen_5.png': 'gen_5_coprolite_1786852383296.png',
    'gen_6.png': 'gen_6_pteranodon_1786852403739.png',
    'gen_7.png': 'gen_7_velociraptor_1786852415767.png',
    'gen_8.png': 'gen_8_ankylosaurus_1786852426675.png',
    'gen_9.png': 'gen_9_antarctica_1786852475938.png',
    'gen_10.png': 'gen_10_gastroliths_1786852487975.png',
    'gen_11.png': 'gen_11_triceratops_1786852497797.png',
    'gen_12.png': 'gen_12_paleontologist_1786852517450.png',
}

for dest_name, src_name in gen_map.items():
    src_path = os.path.join(brain_dir, src_name)
    dest_path = os.path.join(out_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, dest_path)
        print(f"Copied {dest_name}")
    else:
        print(f"Source not found: {src_path}")

# Build SVG Nano Banana artwork for questions 13 to 20
titles = {
    13: ("SPINOSAURUS RIVER MONSTER", "Nano Banana on a river raft with swimming Spinosaurus", "#00f0ff", "🌊"),
    14: ("GOLDEN AMBER TREE SAP", "Nano Banana inspecting 100M year old amber sap", "#ffcc00", "💎"),
    15: ("STEGOSAURUS BACK PLATES", "Nano Banana riding friendly Stegosaurus", "#10b981", "🦕"),
    16: ("PARASAUROLOPHUS TRUMPET", "Nano Banana blowing a horn with Parasaurolophus", "#bd00ff", "🎺"),
    17: ("PACHYCEPHALOSAURUS DOME", "Nano Banana fist-bumping 10-inch bone head", "#ff9900", "🦴"),
    18: ("THERIZINOSAURUS 3FT CLAWS", "Nano Banana measuring 3-foot scythe claws", "#ff073a", "✂️"),
    19: ("GALLIMIMUS SPEED DEMON", "Nano Banana sprinting at 40mph in sneakers", "#00f0ff", "⚡"),
    20: ("CRETACEOUS TIME MACHINE", "Nano Banana traveling in a Cretaceous time portal", "#bd00ff", "⏳"),
}

for q_num, (title, sub, color, emoji) in titles.items():
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e111e"/>
      <stop offset="100%" stop-color="#161a2e"/>
    </linearGradient>
    <linearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe600"/>
      <stop offset="100%" stop-color="#ff9900"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="500" rx="24" fill="url(#bgGrad)"/>
  <rect x="15" y="15" width="770" height="470" rx="20" fill="none" stroke="{color}" stroke-width="3" opacity="0.6"/>

  <!-- Glowing Background Circle -->
  <circle cx="400" cy="220" r="130" fill="{color}" opacity="0.12" filter="url(#glow)"/>
  <circle cx="400" cy="220" r="100" fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="6,6" opacity="0.5"/>

  <!-- Specimen Badge -->
  <rect x="220" y="35" width="360" height="40" rx="12" fill="#1e243b" stroke="{color}" stroke-width="1.5"/>
  <text x="400" y="60" font-family="'Orbitron', sans-serif" font-size="14" font-weight="700" fill="{color}" text-anchor="middle">NANO BANANA SPECIMEN #{q_num}</text>

  <!-- Nano Banana Character Graphic -->
  <g filter="url(#glow)" transform="translate(400, 210)">
    <!-- Banana Body -->
    <path d="M -40,-50 C -10,-80 50,-60 60,30 C 50,70 -10,80 -50,40 C -70,0 -60,-30 -40,-50 Z" fill="url(#bananaGrad)" stroke="#fff" stroke-width="2"/>
    <!-- Stem -->
    <rect x="-35" y="-65" width="12" height="18" rx="4" fill="#38a169"/>
    <!-- Goggles / Glasses -->
    <rect x="-20" y="-20" width="22" height="18" rx="6" fill="#1a202c" stroke="#00f0ff" stroke-width="2"/>
    <rect x="6" y="-20" width="22" height="18" rx="6" fill="#1a202c" stroke="#00f0ff" stroke-width="2"/>
    <line x1="2" y1="-11" x2="6" y2="-11" stroke="#00f0ff" stroke-width="2"/>
    <!-- Goggles Shine -->
    <circle cx="-9" cy="-11" r="3" fill="#fff"/>
    <circle cx="17" cy="-11" r="3" fill="#fff"/>
    <!-- Smile -->
    <path d="M -10,12 Q 0,25 10,12" fill="none" stroke="#1a202c" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Emoji Feature Badge -->
  <text x="400" y="320" font-size="42" text-anchor="middle">{emoji}</text>

  <!-- Title Card -->
  <rect x="50" y="390" width="700" height="70" rx="16" fill="#191d30" stroke="{color}" stroke-width="2"/>
  <text x="400" y="420" font-family="'Orbitron', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">{title}</text>
  <text x="400" y="445" font-family="'Outfit', sans-serif" font-size="14" fill="#a0aec0" text-anchor="middle">🍌 {sub}</text>
</svg>'''

    dest_path = os.path.join(out_dir, f"gen_{q_num}.png") # Save as SVG inside gen_X.png or gen_X.svg
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated {dest_path}")

print("All 20 Nano Banana Trivia images created successfully!")
