import zlib
import struct
import os
import math

def generate_rich_png(width, height, title, subtext, color_rgb, filename):
    r, g, b = color_rgb
    
    # 8-bit RGB bytearray
    raw_data = bytearray()
    
    cx, cy = width // 2, 210
    
    for y in range(height):
        raw_data.append(0) # PNG scanline filter 0
        
        fy = y / height
        is_border = (y < 14 or y > height - 14)
        is_badge = (35 <= y <= 75)
        is_title_card = (390 <= y <= 460)
        
        for x in range(width):
            fx = x / width
            is_x_border = (x < 14 or x > width - 14)
            
            # Distance from center for glowing circle
            dist = math.sqrt((x - cx)**2 + (y - cy)**2)
            
            if is_border or is_x_border:
                raw_data.extend([r, g, b])
            elif is_title_card and (40 <= x <= width - 40):
                # Dark title card panel #191d30
                raw_data.extend([25, 29, 48])
            elif is_badge and (200 <= x <= width - 200):
                # Header badge #1e243b
                raw_data.extend([30, 36, 59])
            elif dist < 120:
                # Glowing center aura
                ratio = 1 - (dist / 120)
                pr = int(14 * (1 - ratio) + r * ratio * 0.4)
                pg = int(17 * (1 - ratio) + g * ratio * 0.4)
                pb = int(30 * (1 - ratio) + b * ratio * 0.4)
                raw_data.extend([min(255, pr), min(255, pg), min(255, pb)])
            else:
                # Dark ambient background #0e111e to #161a2e gradient
                bg_r = int(14 + (22 - 14) * fy)
                bg_g = int(17 + (26 - 17) * fy)
                bg_b = int(30 + (46 - 30) * fy)
                raw_data.extend([bg_r, bg_g, bg_b])

    # PNG Format Helper
    def make_chunk(chunk_type, data):
        length = len(data)
        checksum = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I', length) + chunk_type + data + struct.pack('>I', checksum)

    png_sig = b'\x89PNG\r\n\x1a\n'
    ihdr_chunk = make_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    idat_chunk = make_chunk(b'IDAT', zlib.compress(raw_data, level=6))
    iend_chunk = make_chunk(b'IEND', b'')

    out_path = os.path.join(r'c:\Users\freit\src\eric-website\games\dino-quiz\images', filename)
    with open(out_path, 'wb') as f:
        f.write(png_sig + ihdr_chunk + idat_chunk + iend_chunk)
    
    print(f"Generated PNG: {filename} ({os.path.getsize(out_path)} bytes)")

# 20 Question configs
items = {
    13: ("SPINOSAURUS RIVER MONSTER", "Nano Banana on a river raft with swimming Spinosaurus", (0, 240, 255)),
    14: ("GOLDEN AMBER TREE SAP", "Nano Banana inspecting 100M year old amber sap", (255, 204, 0)),
    15: ("STEGOSAURUS BACK PLATES", "Nano Banana riding friendly Stegosaurus", (16, 185, 129)),
    16: ("PARASAUROLOPHUS TRUMPET", "Nano Banana blowing a horn with Parasaurolophus", (189, 0, 255)),
    17: ("PACHYCEPHALOSAURUS DOME", "Nano Banana fist-bumping 10-inch bone head", (255, 153, 0)),
    18: ("THERIZINOSAURUS 3FT CLAWS", "Nano Banana measuring 3-foot scythe claws", (255, 7, 58)),
    19: ("GALLIMIMUS SPEED DEMON", "Nano Banana sprinting at 40mph in sneakers", (0, 240, 255)),
    20: ("CRETACEOUS TIME MACHINE", "Nano Banana traveling in a Cretaceous time portal", (189, 0, 255)),
}

for q_num, (title, sub, color) in items.items():
    generate_rich_png(800, 500, title, sub, color, f"gen_{q_num}.png")

print("All PNG images successfully generated and ready for GitHub Pages!")
