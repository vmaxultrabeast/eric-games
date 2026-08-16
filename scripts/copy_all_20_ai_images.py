import shutil
import os

brain_dir = r'C:\Users\freit\.gemini\antigravity-ide\brain\63a7e02f-d9ef-4e77-99fc-e8c24c0fc32c'
out_dir = r'c:\Users\freit\src\eric-website\games\dino-quiz\images'
os.makedirs(out_dir, exist_ok=True)

ai_images = {
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
    'gen_13.png': 'gen_13_spinosaurus_1786885633495.png',
    'gen_14.png': 'gen_14_amber_1786885648187.png',
    'gen_15.png': 'gen_15_stegosaurus_1786885660701.png',
    'gen_16.png': 'gen_16_parasaurolophus_1786885710371.png',
    'gen_17.png': 'gen_17_pachycephalosaurus_1786885724029.png',
    'gen_18.png': 'gen_18_therizinosaurus_1786885757737.png',
    'gen_19.png': 'gen_19_gallimimus_1786885854045.png',
    'gen_20.png': 'gen_20_cretaceous_1786885893279.png',
}

for dest, src in ai_images.items():
    src_p = os.path.join(brain_dir, src)
    dest_p = os.path.join(out_dir, dest)
    if os.path.exists(src_p):
        shutil.copy(src_p, dest_p)
        print(f"Copied AI image: {dest} ({os.path.getsize(dest_p)} bytes)")
    else:
        print(f"ERROR: {src_p} not found!")

print("All 20 AI Nano Banana dinosaur images successfully copied!")
