import json
import re

# Read dinos_dataset.json
with open(r'c:\Users\freit\src\eric-website\games\dino-quiz\dinos_dataset.json', 'r', encoding='utf-8') as f:
    dinos = json.load(f)

dinos_js = json.dumps(dinos, indent=4)

# Read app.js
app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace DINOSAURS array using a lambda to avoid backslash escaping issues
new_dinosaurs_code = f"const DINOSAURS = {dinos_js};"
pattern = r'const DINOSAURS = \[\s*\{.*?\}\s*\];'

updated_content = re.sub(pattern, lambda m: new_dinosaurs_code, content, flags=re.DOTALL)

# Replace dinoVisual rendering with actual ActiveWild image rendering
updated_content = updated_content.replace(
    'dinoVisual.innerHTML = renderDinoSVG(currentDino);',
    'dinoVisual.innerHTML = `<img src="${currentDino.image}" alt="${currentDino.name}" class="dino-activewild-img">`;'
)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Updated app.js with 51 ActiveWild Dinosaurs!")
