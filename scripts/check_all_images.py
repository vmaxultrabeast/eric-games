import json
import re
import os

app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

match = re.search(r'const GENERAL_TRIVIA = (\[.*?\]);', code, re.DOTALL)
trivia = json.loads(match.group(1))

print(f"Total Trivia Questions: {len(trivia)}")
for idx, q in enumerate(trivia):
    img = q.get('image')
    full_p = os.path.join(r'c:\Users\freit\src\eric-website\games\dino-quiz', img)
    exists = os.path.exists(full_p)
    q_short = q['question'][:35]
    print(f"Q{idx+1}: {q_short}... -> {img} (Exists: {exists})")
