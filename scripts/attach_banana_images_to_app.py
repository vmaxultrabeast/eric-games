import re
import json

app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Parse GENERAL_TRIVIA array
match = re.search(r'const GENERAL_TRIVIA = (\[.*?\]);', code, re.DOTALL)
if not match:
    print("GENERAL_TRIVIA not found!")
    exit(1)

trivia_data = json.loads(match.group(1))

# Attach image path to each item
for idx, item in enumerate(trivia_data):
    item['image'] = f"images/gen_{idx + 1}.png"

new_trivia_json = json.dumps(trivia_data, indent=4)
new_code = code.replace(match.group(0), f"const GENERAL_TRIVIA = {new_trivia_json};")

# Update startNewRound for trivia mode to set image: item.image
new_code = new_code.replace(
    "image: null,\n            options:",
    "image: item.image,\n            options:"
)

# Update loadQuestion to show dinoVisual image for BOTH photo and trivia mode if image exists!
old_load_vis = """    if (currentQ.type === 'photo') {
        dinoVisual.style.display = 'flex';
        dinoVisual.innerHTML = `<img src="${currentQ.image}" alt="${currentQ.correctAnswer}" class="dino-activewild-img">`;
        document.querySelector('.question-prompt h3').textContent = 'WHICH DINOSAUR IS THIS?';
        document.querySelector('.question-prompt h3').className = '';
    } else {
        dinoVisual.style.display = 'none';
        document.querySelector('.question-prompt h3').textContent = currentQ.questionText;
        document.querySelector('.question-prompt h3').className = 'question-text-heading';
    }"""

new_load_vis = """    dinoVisual.style.display = 'flex';
    if (currentQ.image) {
        dinoVisual.innerHTML = `<img src="${currentQ.image}" alt="Nano Banana Dinosaur Trivia" class="dino-activewild-img">`;
    } else {
        dinoVisual.innerHTML = '';
    }

    if (currentQ.type === 'photo') {
        document.querySelector('.question-prompt h3').textContent = 'WHICH DINOSAUR IS THIS?';
        document.querySelector('.question-prompt h3').className = '';
    } else {
        document.querySelector('.question-prompt h3').textContent = currentQ.questionText;
        document.querySelector('.question-prompt h3').className = 'question-text-heading';
    }"""

new_code = new_code.replace(old_load_vis, new_load_vis)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Attached Nano Banana images to all 20 trivia questions in app.js!")
