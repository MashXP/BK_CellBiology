const appContainer = document.getElementById('app-container');
const dropZoneContainer = document.getElementById('drop-zone-container');
const dropZone = document.getElementById('drop-zone');
const verticalProgressBar = document.getElementById('vertical-progress-bar');
const questionContainer = document.getElementById('question-container');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-btn');
const resultsContainer = document.getElementById('results-container');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('total-questions');
const detailedResultsContainer = document.getElementById('detailed-results');
const restartButton = document.getElementById('restart-btn');
const downloadButton = document.getElementById('download-btn');
const shuffleQuestionsCheckbox = document.getElementById('shuffle-questions-checkbox');
const shuffleChoicesCheckbox = document.getElementById('shuffle-choices-checkbox');
const quizFileNameElement = document.getElementById('quiz-file-name');

let questions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let score = 0;
let answerSelected = false;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeQuiz(quizData) {
    questions = quizData;
    
    if (shuffleQuestionsCheckbox.checked) {
        shuffleArray(questions);
    }

    userAnswers = [];
    currentQuestionIndex = 0;
    score = 0;
    
    dropZoneContainer.classList.add('hide');
    appContainer.classList.remove('hide');
    resultsContainer.classList.add('hide');
    questionContainer.classList.remove('hide');
    detailedResultsContainer.innerHTML = '';

    setupVerticalProgressBar();
    showQuestion();
}

function setupVerticalProgressBar() {
    verticalProgressBar.innerHTML = '';
    questions.forEach((q, index) => {
        const block = document.createElement('div');
        block.id = `progress-block-${index}`;
        block.className = 'progress-block';
        block.textContent = index + 1; // Use sequential numbering
        block.addEventListener('click', () => {
            if (!resultsContainer.classList.contains('hide')) {
                const resultItem = document.getElementById(`result-item-${index}`);
                if (resultItem) {
                    resultItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        verticalProgressBar.appendChild(block);
    });
}

function showQuestion() {
    resetState();
    updateQuestionCounter();
    
    const previousBlock = document.getElementById(`progress-block-${currentQuestionIndex - 1}`);
    if (previousBlock) {
        previousBlock.classList.remove('current');
    }
    const currentBlock = document.getElementById(`progress-block-${currentQuestionIndex}`);
    currentBlock.classList.add('current');
    currentBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const question = questions[currentQuestionIndex];
    questionText.innerText = question.question;

    let options = [...question.options];
    if (shuffleChoicesCheckbox.checked) {
        shuffleArray(options);
    }

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<span style="font-weight: bold; margin-right: 10px;">${String.fromCharCode(65 + index)}</span> ${option}`;
        button.classList.add('option-btn');
        button.dataset.index = index;
        button.addEventListener('click', () => selectAnswer(button, option));
        optionsContainer.appendChild(button);
    });
}

function updateQuestionCounter() {
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
}

function resetState() {
    answerSelected = false;
    while (optionsContainer.firstChild) {
        optionsContainer.removeChild(optionsContainer.firstChild);
    }
    nextButton.classList.add('hide');
}

function selectAnswer(selectedButton, selectedOption) {
    if (answerSelected) return;
    answerSelected = true;

    const correctAnswer = questions[currentQuestionIndex].answer;
    const isCorrect = selectedOption === correctAnswer;

    userAnswers.push({
        question: questions[currentQuestionIndex].question,
        selectedAnswer: selectedOption,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        score++;
    } else {
        selectedButton.classList.add('incorrect'); // Highlight the selected incorrect answer
    }
    
    const currentBlock = document.getElementById(`progress-block-${currentQuestionIndex}`);
    currentBlock.classList.add('answered', isCorrect ? 'correct' : 'incorrect');

    Array.from(optionsContainer.children).forEach(button => {
        if (button.innerText.includes(correctAnswer)) {
            button.classList.add('correct');
        }
        button.disabled = true;
    });

    nextButton.classList.remove('hide');
}

function showResults() {
    questionContainer.classList.add('hide');
    nextButton.classList.add('hide');
    questionCounter.classList.add('hide');
    resultsContainer.classList.remove('hide');
    verticalProgressBar.classList.add('results-active');
    scoreElement.innerText = score;
    totalQuestionsElement.innerText = questions.length;

    detailedResultsContainer.innerHTML = '';
    userAnswers.forEach((answer, index) => {
        const resultItem = document.createElement('div');
        resultItem.id = `result-item-${index}`;
        resultItem.classList.add('result-item', answer.isCorrect ? 'correct' : 'incorrect');
        let innerHTML = `<p><strong>Q ${index + 1}:</strong> ${answer.question}</p>`;
        if (answer.isCorrect) {
            innerHTML += `<p>Your answer: ${answer.selectedAnswer} (Correct)</p>`;
        } else {
            innerHTML += `<p>Your answer: ${answer.selectedAnswer} (Incorrect)</p>`;
            innerHTML += `<p>Correct answer: ${answer.correctAnswer}</p>`;
        }
        resultItem.innerHTML = innerHTML;
        detailedResultsContainer.appendChild(resultItem);
    });
}

function handleNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

nextButton.addEventListener('click', handleNext);

restartButton.addEventListener('click', () => {
    appContainer.classList.add('hide');
    dropZoneContainer.classList.remove('hide');
    questionCounter.classList.remove('hide');
    verticalProgressBar.classList.remove('results-active');
    quizFileNameElement.textContent = ''; // Clear file name on restart
});

downloadButton.addEventListener('click', () => {
    const results = {
        score: score,
        totalQuestions: questions.length,
        percentage: (score / questions.length) * 100,
        timestamp: new Date().toISOString(),
        detailedAnswers: userAnswers
    };
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow drop
});

document.addEventListener('dragleave', (e) => {
    // No visual feedback for now, as it's document-wide
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const quizData = JSON.parse(event.target.result);
                initializeQuiz(quizData);
                quizFileNameElement.textContent = `Loaded: ${file.name}`;
            } catch (error) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please drop a valid .json file.');
    }
});

document.addEventListener('keydown', (e) => {
    if (appContainer.classList.contains('hide')) return;

    if (e.key === 'Enter' || e.key === ' ') {
        if (!nextButton.classList.contains('hide')) {
            e.preventDefault();
            handleNext();
        }
    }

    const key = e.key.toLowerCase();
    let targetIndex = -1;
    if (key >= '1' && key <= '9') { // Allow 1-9 for more options
        targetIndex = parseInt(key) - 1;
    } else if (key >= 'a' && key <= 'i') { // Allow a-i
        targetIndex = key.charCodeAt(0) - 97;
    }

    if (targetIndex !== -1 && !answerSelected) {
        const optionButtons = optionsContainer.querySelectorAll('.option-btn');
        if (optionButtons[targetIndex]) {
            optionButtons[targetIndex].click();
        }
    }
});
