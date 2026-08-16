import zlib
import struct
import os

def create_png(width, height, text_label, color_rgb, out_path):
    # RGB pixel array
    r, g, b = color_rgb
    
    # Header & canvas background #0e111e (14, 17, 30)
    bg_r, bg_g, bg_b = 14, 17, 30
    
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        is_border = (y < 12 or y > height - 12)
        is_badge = (40 <= y <= 80)
        is_title = (400 <= y <= 460)
        
        for x in range(width):
            is_x_border = (x < 12 or x > width - 12)
            
            if is_border or is_x_border:
                raw_data.extend([r, g, b])
            elif is_title and (40 <= x <= width - 40):
                raw_data.extend([r // 2, g // 2, b // 2])
            elif is_badge and (220 <= x <= width - 220):
                raw_data.extend([25, 29, 48])
            else:
                # Gradient background
                fy = y / height
                pr = int(bg_r * (1 - fy * 0.3))
                pg = int(bg_g * (1 - fy * 0.3))
                pb = int(bg_b * (1 - fy * 0.3))
                raw_data.extend([pr, pg, pb])

    # PNG File Format Chunks
    def make_chunk(chunk_type, data):
        length = len(data)
        checksum = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I', length) + chunk_type + data + struct.pack('>I', checksum)

    # PNG Signature
    png_sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR Chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_chunk = make_chunk(b'IHDR', ihdr_data)
    
    # IDAT Chunk (zlib compressed)
    compressed_data = zlib.compress(raw_data, level=6)
    idat_chunk = make_chunk(b'IDAT', compressed_data)
    
    # IEND Chunk
    iend_chunk = make_chunk(b'IEND', b'')
    
    with open(out_path, 'wb') as f:
        f.write(png_sig + ihdr_chunk + idat_chunk + iend_chunk)
    
    print(f"Created TRUE PNG: {out_path} ({os.path.getsize(out_path)} bytes)")

out_dir = r'c:\Users\freit\src\eric-website\games\dino-quiz\images'
os.makedirs(out_dir, exist_ok=True)

configs = {
    13: ("SPINOSAURUS RIVER", (0, 240, 255)),
    14: ("GOLDEN AMBER", (255, 204, 0)),
    15: ("STEGOSAURUS PLATES", (16, 185, 129)),
    16: ("PARASAUROLOPHUS HORN", (189, 0, 255)),
    17: ("PACHYCEPHALOSAURUS", (255, 153, 0)),
    18: ("THERIZINOSAURUS CLAWS", (255, 7, 58)),
    19: ("GALLIMIMUS SPEED", (0, 240, 255)),
    20: ("CRETACEOUS TIME", (189, 0, 255)),
}

for q_num, (label, color) in configs.items():
    png_path = os.path.join(out_dir, f"gen_{q_num}.png")
    create_png(800, 500, label, color, png_path)

print("All TRUE PNG files successfully written!")
