import os
import re
import json

out_dir = r'c:\Users\freit\src\eric-website\games\dino-quiz\images'

# 1. Build SVG files with .svg extension for 13 to 20
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
    <linearGradient id="bgGrad{q_num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e111e"/>
      <stop offset="100%" stop-color="#161a2e"/>
    </linearGradient>
    <linearGradient id="bananaGrad{q_num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe600"/>
      <stop offset="100%" stop-color="#ff9900"/>
    </linearGradient>
    <filter id="glow{q_num}">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="500" rx="24" fill="url(#bgGrad{q_num})"/>
  <rect x="15" y="15" width="770" height="470" rx="20" fill="none" stroke="{color}" stroke-width="3" opacity="0.6"/>

  <!-- Glowing Background Circle -->
  <circle cx="400" cy="220" r="130" fill="{color}" opacity="0.12" filter="url(#glow{q_num})"/>
  <circle cx="400" cy="220" r="100" fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="6,6" opacity="0.5"/>

  <!-- Specimen Badge -->
  <rect x="220" y="35" width="360" height="40" rx="12" fill="#1e243b" stroke="{color}" stroke-width="1.5"/>
  <text x="400" y="60" font-family="'Orbitron', sans-serif" font-size="14" font-weight="700" fill="{color}" text-anchor="middle">NANO BANANA SPECIMEN #{q_num}</text>

  <!-- Nano Banana Character Graphic -->
  <g filter="url(#glow{q_num})" transform="translate(400, 210)">
    <!-- Banana Body -->
    <path d="M -40,-50 C -10,-80 50,-60 60,30 C 50,70 -10,80 -50,40 C -70,0 -60,-30 -40,-50 Z" fill="url(#bananaGrad{q_num})" stroke="#fff" stroke-width="2"/>
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

    svg_path = os.path.join(out_dir, f"gen_{q_num}.svg")
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Written valid SVG: {svg_path}")

# Update app.js GENERAL_TRIVIA image paths and advanceToNextQuestion logic
app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Fix advanceToNextQuestion: check against currentRoundQuestions.length instead of TOTAL_QUESTIONS
old_advance = """function advanceToNextQuestion() {
    if (currentQuestionIndex + 1 < TOTAL_QUESTIONS) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        endRound();
    }
}"""

new_advance = """function advanceToNextQuestion() {
    const totalQInRound = currentRoundQuestions.length || TOTAL_QUESTIONS;
    if (currentQuestionIndex + 1 < totalQInRound) {
        loadQuestion(currentQuestionIndex + 1);
    } else {
        endRound();
    }
}"""

code = code.replace(old_advance, new_advance)

# Parse & update GENERAL_TRIVIA images
match = re.search(r'const GENERAL_TRIVIA = (\[.*?\]);', code, re.DOTALL)
if match:
    trivia_data = json.loads(match.group(1))
    for idx, item in enumerate(trivia_data):
        q_num = idx + 1
        if q_num <= 12:
            item['image'] = f"images/gen_{q_num}.png"
        else:
            item['image'] = f"images/gen_{q_num}.svg"
    
    new_json = json.dumps(trivia_data, indent=4)
    code = code.replace(match.group(0), f"const GENERAL_TRIVIA = {new_json};")

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated app.js with advanceToNextQuestion fix and .svg image paths!")
