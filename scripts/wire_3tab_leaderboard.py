import re

app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add tab click listeners inside DOMContentLoaded
tab_listeners = """
    let currentLbTab = 'photo';

    document.querySelectorAll('.lb-tab-btn').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            playSound('click');
            document.querySelectorAll('.lb-tab-btn').forEach(b => b.classList.remove('active'));
            tabBtn.classList.add('active');
            currentLbTab = tabBtn.getAttribute('data-lb-mode');
            openLeaderboard(currentLbTab);
        });
    });
"""

if 'lb-tab-btn' not in code:
    code = code.replace("submitScoreBtn.addEventListener('click', handleScoreSubmission);", "submitScoreBtn.addEventListener('click', handleScoreSubmission);\n" + tab_listeners)

# 2. Update handleScoreSubmission entry object to include mode
code = code.replace(
    "accuracy: Math.round((correctCount / totalQInRound) * 100),",
    "accuracy: Math.round((correctCount / totalQInRound) * 100),\n        mode: selectedMode || 'photo',"
)

# 3. Update openLeaderboard function
new_open_lb = """async function openLeaderboard(targetMode = 'photo') {
    leaderboardModal.classList.remove('hidden');

    // Highlight active tab button
    document.querySelectorAll('.lb-tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lb-mode') === targetMode);
    });

    leaderboardTbody.innerHTML = `<tr><td colspan="5" class="lb-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading Leaderboard...</td></tr>`;

    let allEntries = [];

    if (db && firebaseConfig.apiKey !== "AIzaSyD-placeholder") {
        try {
            const q = query(collection(db, 'dino-quiz-leaderboard'), orderBy('score', 'desc'), limit(50));
            const snap = await withTimeout(getDocs(q), 2500);
            snap.forEach(docSnap => {
                allEntries.push(docSnap.data());
            });
        } catch (e) {
            console.warn("Falling back to local leaderboard:", e);
        }
    }

    if (allEntries.length === 0) {
        allEntries = JSON.parse(localStorage.getItem('dino_quiz_leaderboard') || '[]');
    }

    // Default Demo Entries if completely empty
    if (allEntries.length === 0) {
        allEntries = [
            { name: "Dr. Alan Grant", score: 4850, accuracy: 100, mode: "photo", date: "Aug 15, 2026" },
            { name: "Ellie Sattler", score: 4620, accuracy: 96, mode: "photo", date: "Aug 15, 2026" },
            { name: "Ian Malcolm", score: 4100, accuracy: 92, mode: "trivia", date: "Aug 14, 2026" },
            { name: "Eric F.", score: 3950, accuracy: 88, mode: "photo", date: "Aug 14, 2026" },
            { name: "Guest Explorer", score: 3200, accuracy: 80, mode: "mixed", date: "Aug 13, 2026" }
        ];
    }

    // Filter entries for targetMode (Older entries without mode tag default to 'photo'!)
    const filtered = allEntries.filter(item => {
        const itemMode = item.mode || 'photo';
        return itemMode === targetMode;
    });

    filtered.sort((a, b) => b.score - a.score);

    renderLeaderboardRows(filtered);
}"""

code = re.sub(r'async function openLeaderboard\(.*?\)\s*\{.*?renderLeaderboardRows\(entries\);\s*\}', new_open_lb, code, flags=re.DOTALL)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated app.js with 3-tab Leaderboard support and mode filtering!")
