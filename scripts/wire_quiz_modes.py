import re

app_js_path = r'c:\Users\freit\src\eric-website\games\dino-quiz\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Add selectedMode variable & mode listeners
mode_listener_code = """
let selectedMode = 'photo'; // 'photo', 'trivia', or 'mixed'

document.querySelectorAll('.mode-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('.mode-card-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.getAttribute('data-mode');
    });
});
"""

# Update startNewRound to build questions according to selectedMode
new_start_round = """
function startNewRound() {
    score = 0;
    streak = 0;
    bestStreak = 0;
    correctCount = 0;
    currentQuestionIndex = 0;

    lifelines = { fifty: 1, hint: 2, freeze: 1 };
    updateLifelineUI();

    let pool = [];

    if (selectedMode === 'photo') {
        const shuffled = [...DINOSAURS].sort(() => 0.5 - Math.random());
        pool = shuffled.slice(0, TOTAL_QUESTIONS).map(dino => ({
            type: 'photo',
            dino: dino,
            questionText: 'WHICH DINOSAUR IS THIS?',
            correctAnswer: dino.name,
            image: dino.image,
            options: generateOptions(dino.name),
            fact: dino.fact,
            era: dino.era,
            diet: dino.diet,
            size: dino.length
        }));
    } else if (selectedMode === 'trivia') {
        const shuffled = [...GENERAL_TRIVIA].sort(() => 0.5 - Math.random());
        pool = shuffled.slice(0, 20).map(item => ({
            type: 'trivia',
            questionText: item.question,
            correctAnswer: item.correct,
            image: null,
            options: [...item.options].sort(() => 0.5 - Math.random()),
            fact: item.fact,
            era: item.era,
            diet: item.diet,
            size: 'Trivia Specimen'
        }));
    } else {
        // Mixed mode: 15 photo questions + 10 general trivia questions
        const shuffledPhotos = [...DINOSAURS].sort(() => 0.5 - Math.random()).slice(0, 15).map(dino => ({
            type: 'photo',
            dino: dino,
            questionText: 'WHICH DINOSAUR IS THIS?',
            correctAnswer: dino.name,
            image: dino.image,
            options: generateOptions(dino.name),
            fact: dino.fact,
            era: dino.era,
            diet: dino.diet,
            size: dino.length
        }));

        const shuffledTrivia = [...GENERAL_TRIVIA].sort(() => 0.5 - Math.random()).slice(0, 10).map(item => ({
            type: 'trivia',
            questionText: item.question,
            correctAnswer: item.correct,
            image: null,
            options: [...item.options].sort(() => 0.5 - Math.random()),
            fact: item.fact,
            era: item.era,
            diet: item.diet,
            size: 'Trivia Specimen'
        }));

        pool = [...shuffledPhotos, ...shuffledTrivia].sort(() => 0.5 - Math.random());
    }

    currentRoundQuestions = pool;

    updateHeaderUI();

    startScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion(0);
}

function generateOptions(correctName) {
    const distractors = DINOSAURS
        .filter(d => d.name !== correctName)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(d => d.name);

    return [correctName, ...distractors].sort(() => 0.5 - Math.random());
}
"""

# Update loadQuestion to support both photo and trivia questions
new_load_question = """
function loadQuestion(index) {
    isAnswered = false;
    currentQuestionIndex = index;
    const currentQ = currentRoundQuestions[index];
    const totalQInRound = currentRoundQuestions.length;

    // Update Progress UI
    questionCounterEl.textContent = index + 1;
    document.querySelector('.progress-info span').innerHTML = `<i class="fa-solid fa-list-check"></i> QUESTION <strong>${index + 1}</strong> / ${totalQInRound}`;
    const pct = ((index + 1) / totalQInRound) * 100;
    progressBarFill.style.width = `${pct}%`;
    const accuracy = index > 0 ? Math.round((correctCount / index) * 100) : 100;
    accuracyTagEl.textContent = `${accuracy}% Accuracy`;

    // Render Dino Visual or Question Text
    if (currentQ.type === 'photo') {
        dinoVisual.style.display = 'flex';
        dinoVisual.innerHTML = `<img src="${currentQ.image}" alt="${currentQ.correctAnswer}" class="dino-activewild-img">`;
        document.querySelector('.question-prompt h3').textContent = 'WHICH DINOSAUR IS THIS?';
        document.querySelector('.question-prompt h3').className = '';
    } else {
        dinoVisual.style.display = 'none';
        document.querySelector('.question-prompt h3').textContent = currentQ.questionText;
        document.querySelector('.question-prompt h3').className = 'question-text-heading';
    }

    hintOverlay.classList.add('hidden');

    // Render Options Grid
    choicesGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    currentQ.options.forEach((optText, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.setAttribute('data-letter', letters[i]);
        btn.setAttribute('data-name', optText);
        btn.textContent = optText;
        btn.addEventListener('click', () => handleAnswerSelect(optText, currentQ.correctAnswer, btn));
        choicesGrid.appendChild(btn);
    });

    startTimer();
}
"""

# Update showFactModal
new_show_fact_modal = """
function showFactModal(qObj, isCorrect, isTimeout = false) {
    if (isCorrect) {
        factStatusBadge.className = 'fact-status-badge correct-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> CORRECT!';
    } else if (isTimeout) {
        factStatusBadge.className = 'fact-status-badge incorrect-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-hourglass-end"></i> TIME EXPIRED!';
    } else {
        factStatusBadge.className = 'fact-status-badge incorrect-bg';
        factStatusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> INCORRECT!';
    }

    factDinoName.textContent = qObj.correctAnswer;
    factEra.textContent = qObj.era || 'Mesozoic Era';
    factDiet.textContent = qObj.diet || 'Dino Fact';
    factSize.textContent = qObj.size || 'Prehistoric Specimen';
    factTextEl.textContent = qObj.fact || 'Great job testing your dinosaur knowledge!';

    factModal.classList.remove('hidden');
}
"""

# Add mode listener code after DOMContentLoaded
code = code.replace("submitScoreBtn.addEventListener('click', handleScoreSubmission);", "submitScoreBtn.addEventListener('click', handleScoreSubmission);\n" + mode_listener_code)

# Replace startNewRound
code = re.sub(r'function startNewRound\(\) \{.*?function loadQuestion', new_start_round + '\n\nfunction loadQuestion', code, flags=re.DOTALL)

# Replace loadQuestion
code = re.sub(r'function loadQuestion\(index\) \{.*?function startTimer', new_load_question + '\n\nfunction startTimer', code, flags=re.DOTALL)

# Replace showFactModal
code = re.sub(r'function showFactModal\(dino, isCorrect, isTimeout = false\) \{.*?function advanceToNextQuestion', new_show_fact_modal + '\n\nfunction advanceToNextQuestion', code, flags=re.DOTALL)

# Replace dino reference in handleTimeOut
code = code.replace("const currentDino = currentRoundQuestions[currentQuestionIndex];", "const currentQ = currentRoundQuestions[currentQuestionIndex];")
code = code.replace("if (b.getAttribute('data-name') === currentDino.name)", "if (b.getAttribute('data-name') === currentQ.correctAnswer)")
code = code.replace("showFactModal(currentDino, false, true);", "showFactModal(currentQ, false, true);")
code = code.replace("showFactModal(currentRoundQuestions[currentQuestionIndex], isCorrect);", "showFactModal(currentRoundQuestions[currentQuestionIndex], isCorrect);")

# Replace hint lifeline implementation
code = code.replace(
    "const currentDino = currentRoundQuestions[currentQuestionIndex];\n    hintText.textContent = `HINT — ERA: ${currentDino.era} | DIET: ${currentDino.diet}`;",
    "const currentQ = currentRoundQuestions[currentQuestionIndex];\n    hintText.textContent = `HINT — ERA: ${currentQ.era} | DIET: ${currentQ.diet}`;"
)
code = code.replace(
    "const incorrectBtns = allBtns.filter(b => b.getAttribute('data-name') !== currentDino.name);",
    "const currentQ = currentRoundQuestions[currentQuestionIndex];\n    const incorrectBtns = allBtns.filter(b => b.getAttribute('data-name') !== currentQ.correctAnswer);"
)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Wired quiz modes and general trivia into app.js successfully!")
