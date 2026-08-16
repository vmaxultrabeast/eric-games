import json

path = r'c:\Users\freit\src\eric-website\games\dino-quiz\dinos_dataset.json'
with open(path, 'r', encoding='utf-8') as f:
    dinos = json.load(f)

# Filter out non-dinosaurs
ignore_names = [
    'Active Wild', 'Categories', 'Thank You For Visiting Active Wild!',
    'Love Natural History? Subscribe To Our FREE Newsletter', 'Dinosaur Index'
]

valid_dinos = []
for d in dinos:
    name = d['name']
    if any(ign.lower() in name.lower() for ign in ignore_names):
        continue
    valid_dinos.append(d)

print(f"Valid Dinosaurs Count: {len(valid_dinos)}")
for d in valid_dinos:
    print(f" - {d['name']}: {d['image']}")

with open(path, 'w', encoding='utf-8') as f:
    json.dump(valid_dinos, f, indent=2)

print("Cleaned dinos_dataset.json successfully!")
