import urllib.request
import re
import os
import json

url = 'https://www.activewild.com/list-of-dinosaurs-names-with-pictures/'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')

img_dir = r'c:\Users\freit\src\eric-website\games\dino-quiz\images'
os.makedirs(img_dir, exist_ok=True)

# Split by h2 headings
sections = re.split(r'<h2[^>]*>', html)

dinos = []

for sec in sections[1:]:
    # Extract title
    h2_match = re.match(r'^(.*?)(?:<a[^>]*>.*?</a>)?</h2>', sec, re.DOTALL | re.IGNORECASE)
    if not h2_match:
        title_end = sec.find('</h2>')
        if title_end == -1: 
            continue
        title_raw = sec[:title_end]
    else:
        title_raw = h2_match.group(1)
    
    name = re.sub(r'<[^>]+>', '', title_raw).strip()
    if not name or any(bad in name.lower() for bad in ['list of dinosaurs', 'index', 'contents', 'related pages', 'questions', 'table of contents']):
        continue
    
    # Extract Image URL
    img_match = re.search(r'data-lazy-src=["\'](https://www\.activewild\.com/wp-content/uploads/[^"\']+)["\']', sec)
    if not img_match:
        img_match = re.search(r'src=["\'](https://www\.activewild\.com/wp-content/uploads/[^"\']+\.(?:jpg|png|webp|jpeg))["\']', sec)
    
    if not img_match:
        continue
    
    img_url = img_match.group(1)
    
    # Extract bullet points
    bullets = {}
    for li in re.findall(r'<li>(.*?)</li>', sec, re.DOTALL):
        clean_li = re.sub(r'<[^>]+>', '', li).strip()
        if ':' in clean_li:
            k, v = clean_li.split(':', 1)
            bullets[k.strip().lower()] = re.sub(r'\s+', ' ', v).strip()
    
    # Extract short fact/paragraph
    paras = re.findall(r'<p[^>]*>(.*?)</p>', sec, re.DOTALL)
    clean_paras = []
    for p in paras:
        clean_p = re.sub(r'<[^>]+>', '', p).strip()
        clean_p = re.sub(r'\s+', ' ', clean_p)
        if clean_p and not clean_p.startswith('Designed to be') and not clean_p.startswith('Find out more') and len(clean_p) > 20:
            clean_paras.append(clean_p)
    
    fact = clean_paras[0] if clean_paras else ''
    
    # Download image
    ext = os.path.splitext(img_url)[1].split('?')[0]
    if not ext or len(ext) > 5:
        ext = '.jpg'
    
    safe_slug = re.sub(r'[^a-z0-9]', '_', name.lower()).strip('_')
    filename = f'{safe_slug}{ext}'
    local_path = os.path.join(img_dir, filename)
    
    try:
        if not os.path.exists(local_path) or os.path.getsize(local_path) < 1000:
            img_req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(img_req) as resp, open(local_path, 'wb') as f:
                f.write(resp.read())
            print(f'Downloaded: {name} -> {filename}')
        else:
            print(f'Already exists: {name}')
    except Exception as e:
        print(f'Failed to download {name} ({img_url}): {e}')
        continue

    era_val = bullets.get('period', 'Mesozoic Era')
    type_val = bullets.get('type of dinosaur', bullets.get('type', 'Dinosaur'))
    diet_val = 'Carnivore' if 'carnivore' in type_val.lower() or 'theropod' in type_val.lower() else 'Herbivore'
    if 'omnivore' in type_val.lower(): diet_val = 'Omnivore'
    if 'piscivore' in type_val.lower(): diet_val = 'Piscivore'

    dinos.append({
        'name': name,
        'image': f'images/{filename}',
        'type': type_val,
        'era': era_val,
        'diet': diet_val,
        'found': bullets.get('where found', 'Worldwide'),
        'length': bullets.get('length', 'Unknown'),
        'fact': fact or f'{name} was a {type_val} that lived during the {era_val}.'
    })

print(f'\nTOTAL DINOSAURS PROCESSED: {len(dinos)}')

# Write JSON dataset file
dataset_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\dinos_dataset.json'
with open(dataset_path, 'w', encoding='utf-8') as f:
    json.dump(dinos, f, indent=2)

print('Dataset written successfully to dinos_dataset.json')
