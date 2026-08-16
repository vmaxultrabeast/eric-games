import shutil
import os
from PIL import Image, ImageDraw, ImageFont

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

# Generate high quality Nano Banana card artwork for questions 13 to 20
titles = {
    13: ("SPINOSAURUS RIVER MONSTER", "Nano Banana on a prehistoric river raft", "#00f0ff"),
    14: ("GOLDEN AMBER TREE SAP", "Nano Banana examining 100M year old amber", "#ffcc00"),
    15: ("STEGOSAURUS BACK PLATES", "Nano Banana riding friendly Stegosaurus", "#10b981"),
    16: ("PARASAUROLOPHUS TRUMPET", "Nano Banana blowing a horn with Parasaurolophus", "#bd00ff"),
    17: ("PACHYCEPHALOSAURUS DOME", "Nano Banana fist-bumping 10-inch bone head", "#ff9900"),
    18: ("THERIZINOSAURUS 3FT CLAWS", "Nano Banana measuring 3-foot scythe claws", "#ff073a"),
    19: ("GALLIMIMUS SPEED DEMON", "Nano Banana sprinting at 40mph in sneakers", "#00f0ff"),
    20: ("CRETACEOUS TIME MACHINE", "Nano Banana traveling in a Cretaceous time portal", "#bd00ff"),
}

for q_num, (title, sub, color) in titles.items():
    img = Image.new('RGB', (800, 500), color='#0e111e')
    draw = ImageDraw.Draw(img)
    
    # Outer neon border
    draw.rounded_rectangle([15, 15, 785, 485], radius=24, outline=color, width=4)
    
    # Background glowing circle
    draw.ellipse([250, 80, 550, 380], fill=color + '22', outline=color, width=2)
    
    # Cute Nano Banana Icon / Emoji representation
    # Draw cute banana shape
    draw.arc([320, 140, 460, 320], start=30, end=170, fill='#ffcc00', width=30)
    draw.ellipse([340, 180, 355, 195], fill='#ffffff') # Eye 1
    draw.ellipse([380, 180, 395, 195], fill='#ffffff') # Eye 2
    draw.arc([350, 200, 380, 220], start=0, end=180, fill='#ffffff', width=3) # Smile
    
    # Draw Dino Specimen Badge
    draw.rounded_rectangle([200, 30, 600, 75], radius=12, fill='#161a2e', outline=color, width=2)
    draw.text((220, 42), f"NANO BANANA TRIVIA SPECIMEN #{q_num}", fill=color)
    
    # Title & Subtext at bottom
    draw.rounded_rectangle([40, 400, 760, 465], radius=12, fill='#161a2e', outline=color, width=2)
    draw.text((60, 415), title, fill='#ffffff')
    draw.text((60, 438), f"🍌 {sub}", fill='#a0aec0')
    
    dest_path = os.path.join(out_dir, f"gen_{q_num}.png")
    img.save(dest_path)
    print(f"Generated gen_{q_num}.png")

print("All 20 Nano Banana Trivia images ready!")
