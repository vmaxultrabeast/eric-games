import re
import json

app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

match = re.search(r'const GENERAL_TRIVIA = (\[.*?\]);', code, re.DOTALL)
if match:
    trivia_data = json.loads(match.group(1))
    for idx, item in enumerate(trivia_data):
        item['image'] = f"images/gen_{idx + 1}.png"
    
    new_json = json.dumps(trivia_data, indent=4)
    code = code.replace(match.group(0), f"const GENERAL_TRIVIA = {new_json};")

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated app.js to use .png for all 20 trivia questions!")
