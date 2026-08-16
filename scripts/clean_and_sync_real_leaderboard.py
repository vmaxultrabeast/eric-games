import firebase_admin
from firebase_admin import credentials, firestore
import re

# 1. Update Firestore dino-quiz-leaderboard collection to tag real entries with mode='photo'
cred_path = r'c:\Users\freit\Downloads\eric-arcade-firebase-adminsdk-fbsvc-cafbfa411a.json'
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

real_entries = [
    {"name": "Eric", "score": 3860, "accuracy": 64, "mode": "photo", "date": "Aug 15, 2026", "timestamp": 1786850152921},
    {"name": "Eric", "score": 3280, "accuracy": 52, "mode": "photo", "date": "Aug 15, 2026", "timestamp": 1786850936332},
    {"name": "Henry", "score": 2090, "accuracy": 36, "mode": "photo", "date": "Aug 15, 2026", "timestamp": 1786851227320},
    {"name": "Markus", "score": 1950, "accuracy": 28, "mode": "photo", "date": "Aug 15, 2026", "timestamp": 1786852616260}
]

lb_col = db.collection('dino-quiz-leaderboard')

# Tag real docs in Firestore with mode='photo'
for entry in real_entries:
    # Query matching timestamp
    docs = lb_col.where('timestamp', '==', entry['timestamp']).stream()
    for d in docs:
        lb_col.document(d.id).set({'mode': 'photo'}, merge=True)
        print(f"Updated Firestore doc {d.id} for {entry['name']} with mode='photo'")

# 2. Update app.js code to use ONLY real historical entries and remove fictitious demo names
app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

new_open_lb = """const REAL_HISTORICAL_ENTRIES = [
        { name: "Eric", score: 3860, accuracy: 64, mode: "photo", date: "Aug 15, 2026", timestamp: 1786850152921 },
        { name: "Eric", score: 3280, accuracy: 52, mode: "photo", date: "Aug 15, 2026", timestamp: 1786850936332 },
        { name: "Henry", score: 2090, accuracy: 36, mode: "photo", date: "Aug 15, 2026", timestamp: 1786851227320 },
        { name: "Markus", score: 1950, accuracy: 28, mode: "photo", date: "Aug 15, 2026", timestamp: 1786852616260 }
    ];

    let localLb = JSON.parse(localStorage.getItem('dino_quiz_leaderboard') || '[]');
    let combined = [...allEntries, ...localLb];

    // Seed real historical entries if not already present
    REAL_HISTORICAL_ENTRIES.forEach(real => {
        if (!combined.some(e => e.name === real.name && e.score === real.score && (e.mode || 'photo') === real.mode)) {
            combined.push(real);
        }
    });

    // Filter entries for targetMode (Older entries without mode tag default to 'photo'!)
    const filtered = combined.filter(item => {
        const itemMode = item.mode || 'photo';
        return itemMode === targetMode;
    });"""

code = re.sub(
    r'let localLb = JSON\.parse\(localStorage\.getItem\(\'dino_quiz_leaderboard\'\).*?return itemMode === targetMode;\s*\}\);',
    new_open_lb,
    code,
    flags=re.DOTALL
)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated app.js with ONLY real historical scores for Eric, Henry, and Markus!")
