// Global Variables
let currentRole = '';
let hostName = '';
let playerName = '';
let currentQuizCode = '';
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 30;
let selectedAnswer = null;

// Utility Functions
function generateQuizCode() {
    const prefix = 'AI';
    const chars = '0123456789';
    let code = prefix;
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = '';
    element.style.display = 'none';
}

// Role Selection
function showRoleSelection() {
    currentRole = '';
    hostName = '';
    playerName = '';
    currentQuizCode = '';
    currentQuiz = null;
    showScreen('role-selection');
}

function showHostLogin() {
    currentRole = 'host';
    showScreen('host-login');
}

function showUserLogin() {
    currentRole = 'user';
    showScreen('user-login');
}

// Host Functions
function loginAsHost() {
    const nameInput = document.getElementById('host-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        showError('host-name-error', 'Please enter your name');
        return;
    }
    
    hostName = name;
    document.getElementById('host-display-name').textContent = hostName;
    loadHostQuizzes();
    showScreen('host-dashboard');
}

function loadHostQuizzes() {
    const quizzesList = document.getElementById('host-quizzes-list');
    const allQuizzes = getFromLocalStorage('allQuizzes') || [];
    const hostQuizzes = allQuizzes.filter(q => q.createdBy === hostName);
    
    if (hostQuizzes.length === 0) {
        quizzesList.innerHTML = '<p class="empty-message">No quizzes created yet</p>';
        return;
    }
    
    quizzesList.innerHTML = hostQuizzes.map(quiz => `
        <div class="quiz-item" onclick="viewQuizDetails('${quiz.code}')">
            <div class="quiz-item-info">
                <h4>${quiz.title}</h4>
                <p>${quiz.questions.length} questions</p>
            </div>
            <div class="quiz-item-code">${quiz.code}</div>
        </div>
    `).join('');
}

function showQuizCreation() {
    document.getElementById('quiz-title').value = '';
    document.getElementById('questions-container').innerHTML = '';
    addQuestion(); // Add first question by default
    showScreen('quiz-creation');
}

function showHostDashboard() {
    loadHostQuizzes();
    showScreen('host-dashboard');
}

function addQuestion() {
    const container = document.getElementById('questions-container');
    const questionNumber = container.children.length + 1;
    
    const questionHTML = `
        <div class="question-block" data-question="${questionNumber}">
            <div class="question-block-header">
                <h4>Question ${questionNumber}</h4>
                <button class="remove-question-btn" onclick="removeQuestion(this)">✕</button>
            </div>
            <input type="text" class="question-input" placeholder="Enter question text" data-type="question">
            <div class="options-grid">
                <div class="option-input-wrapper">
                    <input type="text" class="option-input" placeholder="Option A" data-type="option" data-index="0">
                    <span class="correct-indicator">✓</span>
                </div>
                <div class="option-input-wrapper">
                    <input type="text" class="option-input" placeholder="Option B" data-type="option" data-index="1">
                    <span class="correct-indicator">✓</span>
                </div>
                <div class="option-input-wrapper">
                    <input type="text" class="option-input" placeholder="Option C" data-type="option" data-index="2">
                    <span class="correct-indicator">✓</span>
                </div>
                <div class="option-input-wrapper">
                    <input type="text" class="option-input" placeholder="Option D" data-type="option" data-index="3">
                    <span class="correct-indicator">✓</span>
                </div>
            </div>
            <div class="correct-radio">
                <label>
                    <input type="radio" name="correct-${questionNumber}" value="0" checked> A
                </label>
                <label>
                    <input type="radio" name="correct-${questionNumber}" value="1"> B
                </label>
                <label>
                    <input type="radio" name="correct-${questionNumber}" value="2"> C
                </label>
                <label>
                    <input type="radio" name="correct-${questionNumber}" value="3"> D
                </label>
            </div>
            <div class="timer-input-wrapper" style="margin-top: 15px;">
                <label>Timer (seconds):</label>
                <input type="number" class="question-input timer-input" value="30" min="5" max="120" data-type="timer">
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHTML);
    
    // Add event listeners for correct answer indicators
    const questionBlock = container.lastElementChild;
    const radioButtons = questionBlock.querySelectorAll('input[type="radio"]');
    const indicators = questionBlock.querySelectorAll('.correct-indicator');
    
    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', function() {
            indicators.forEach(ind => ind.classList.remove('active'));
            if (this.checked) {
                indicators[index].classList.add('active');
            }
        });
    });
    
    // Set initial indicator
    indicators[0].classList.add('active');
}

function removeQuestion(btn) {
    const container = document.getElementById('questions-container');
    if (container.children.length > 1) {
        btn.closest('.question-block').remove();
        // Renumber questions
        Array.from(container.children).forEach((block, index) => {
            block.dataset.question = index + 1;
            block.querySelector('h4').textContent = `Question ${index + 1}`;
            block.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.name = `correct-${index + 1}`;
            });
        });
    }
}

function createQuiz() {
    const titleInput = document.getElementById('quiz-title');
    const title = titleInput.value.trim();
    
    if (!title) {
        alert('Please enter a quiz title');
        return;
    }
    
    const questionBlocks = document.querySelectorAll('.question-block');
    const questions = [];
    
    for (let block of questionBlocks) {
        const questionText = block.querySelector('[data-type="question"]').value.trim();
        const options = [];
        block.querySelectorAll('[data-type="option"]').forEach(opt => {
            options.push(opt.value.trim());
        });
        
        if (!questionText || options.some(o => !o)) {
            alert('Please fill in all question fields');
            return;
        }
        
        const correctAnswer = parseInt(block.querySelector('input[type="radio"]:checked').value);
        const timer = parseInt(block.querySelector('[data-type="timer"]').value) || 30;
        
        questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer,
            timer: timer
        });
    }
    
    if (questions.length === 0) {
        alert('Please add at least one question');
        return;
    }
    
    // Generate unique quiz code
    let quizCode = generateQuizCode();
    let allQuizzes = getFromLocalStorage('allQuizzes') || [];
    
    // Ensure unique code
    while (allQuizzes.some(q => q.code === quizCode)) {
        quizCode = generateQuizCode();
    }
    
    const quiz = {
        code: quizCode,
        title: title,
        questions: questions,
        createdBy: hostName,
        createdAt: new Date().toISOString()
    };
    
    allQuizzes.push(quiz);
    saveToLocalStorage('allQuizzes', allQuizzes);
    
    // Initialize leaderboard for this quiz
    const leaderboardKey = `leaderboard_${quizCode}`;
    saveToLocalStorage(leaderboardKey, []);
    
    document.getElementById('generated-quiz-code').textContent = quizCode;
    showScreen('quiz-code-display');
}

function copyQuizCode() {
    const code = document.getElementById('generated-quiz-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Quiz code copied to clipboard!');
    });
}

function viewQuizDetails(quizCode) {
    const allQuizzes = getFromLocalStorage('allQuizzes') || [];
    const quiz = allQuizzes.find(q => q.code === quizCode);
    
    if (!quiz) {
        alert('Quiz not found');
        return;
    }
    
    currentQuizCode = quizCode;
    currentQuiz = quiz;
    
    document.getElementById('detail-quiz-title').textContent = quiz.title;
    document.getElementById('detail-quiz-code').textContent = `Code: ${quiz.code}`;
    document.getElementById('detail-questions-count').textContent = quiz.questions.length;
    
    const leaderboard = getFromLocalStorage(`leaderboard_${quizCode}`) || [];
    document.getElementById('detail-players-count').textContent = leaderboard.length;
    
    showScreen('quiz-details');
}

function showQuizDetailsLeaderboard() {
    showLeaderboardFromDetails(currentQuizCode);
}

function deleteQuiz() {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
        return;
    }
    
    let allQuizzes = getFromLocalStorage('allQuizzes') || [];
    allQuizzes = allQuizzes.filter(q => q.code !== currentQuizCode);
    saveToLocalStorage('allQuizzes', allQuizzes);
    
    // Remove leaderboard
    localStorage.removeItem(`leaderboard_${currentQuizCode}`);
    
    showHostDashboard();
}

// User Functions
function joinQuiz() {
    const nameInput = document.getElementById('player-name');
    const codeInput = document.getElementById('quiz-code-input');
    
    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    
    if (!name) {
        showError('join-error', 'Please enter your name');
        return;
    }
    
    if (!code) {
        showError('join-error', 'Please enter quiz code');
        return;
    }
    
    const allQuizzes = getFromLocalStorage('allQuizzes') || [];
    const quiz = allQuizzes.find(q => q.code === code);
    
    if (!quiz) {
        showError('join-error', 'Quiz not found! Please check the code.');
        return;
    }
    
    playerName = name;
    currentQuizCode = code;
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    
    document.getElementById('game-player-name').textContent = playerName;
    document.getElementById('total-questions').textContent = quiz.questions.length;
    
    showScreen('quiz-game');
    startQuestion();
}

function startQuestion() {
    if (currentQuestionIndex >= currentQuiz.questions.length) {
        endQuiz();
        return;
    }
    
    const question = currentQuiz.questions[currentQuestionIndex];
    
    document.getElementById('current-question-num').textContent = currentQuestionIndex + 1;
    document.getElementById('game-progress-bar').style.width = 
        `${((currentQuestionIndex) / currentQuiz.questions.length) * 100}%`;
    
    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    const letters = ['A', 'B', 'C', 'D'];
    
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <button class="option-btn" onclick="selectOption(${index})" data-index="${index}">
            <span class="option-letter">${letters[index]}</span>
            ${option}
        </button>
    `).join('');
    
    // Start timer
    timeLeft = question.timer;
    document.getElementById('timer-text').textContent = timeLeft;
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    
    const timerProgress = document.getElementById('timer-progress');
    const circumference = 2 * Math.PI * 45;
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = 0;
    
    const question = currentQuiz.questions[currentQuestionIndex];
    const totalTime = question.timer;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-text').textContent = timeLeft;
        
        const progress = (timeLeft / totalTime) * circumference;
        timerProgress.style.strokeDashoffset = circumference - progress;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeUp();
        }
    }, 1000);
}

function selectOption(index) {
    if (selectedAnswer !== null) return;
    
    selectedAnswer = index;
    
    const options = document.querySelectorAll('.option-btn');
    options.forEach((opt, i) => {
        if (i === index) {
            opt.classList.add('selected');
        }
        opt.style.pointerEvents = 'none';
    });
    
    clearInterval(timer);
    
    const question = currentQuiz.questions[currentQuestionIndex];
    
    setTimeout(() => {
        if (index === question.correctAnswer) {
            options[index].classList.add('correct');
            score += 10; // 10 points per correct answer
        } else {
            options[index].classList.add('incorrect');
            options[question.correctAnswer].classList.add('correct');
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            selectedAnswer = null;
            startQuestion();
        }, 1500);
    }, 500);
}

function handleTimeUp() {
    const question = currentQuiz.questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach((opt, i) => {
        opt.style.pointerEvents = 'none';
        if (i === question.correctAnswer) {
            opt.classList.add('correct');
        }
    });
    
    setTimeout(() => {
        currentQuestionIndex++;
        selectedAnswer = null;
        startQuestion();
    }, 1500);
}

function endQuiz() {
    // Calculate percentage score
    const totalQuestions = currentQuiz.questions.length;
    const percentageScore = (score / (totalQuestions * 10)) * 100;
    
    // Save to leaderboard
    const leaderboardKey = `leaderboard_${currentQuizCode}`;
    let leaderboard = getFromLocalStorage(leaderboardKey) || [];
    
    leaderboard.push({
        name: playerName,
        score: percentageScore,
        timestamp: new Date().toISOString()
    });
    
    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep top 10
    leaderboard = leaderboard.slice(0, 10);
    
    saveToLocalStorage(leaderboardKey, leaderboard);
    
    // Show results
    document.getElementById('final-score').textContent = Math.round(percentageScore);
    
    let intelligenceLevel = 'Beginner Mind';
    if (percentageScore >= 70) {
        intelligenceLevel = 'AI Master';
    } else if (percentageScore >= 40) {
        intelligenceLevel = 'Logical Thinker';
    }
    
    document.getElementById('intelligence-label').textContent = intelligenceLevel;
    
    document.getElementById('game-progress-bar').style.width = '100%';
    
    showScreen('results-screen');
}

function showLeaderboard() {
    showLeaderboardScreen(currentQuizCode);
}

function showLeaderboardScreen(quizCode) {
    const leaderboard = getFromLocalStorage(`leaderboard_${quizCode}`) || [];
    
    document.getElementById('leaderboard-quiz-code').textContent = `Quiz: ${quizCode}`;
    
    if (leaderboard.length === 0) {
        document.getElementById('leaderboard-list').innerHTML = 
            '<p class="empty-message">No players yet</p>';
    } else {
        document.getElementById('leaderboard-list').innerHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-item top-${index + 1}">
                <span class="rank">#${index + 1}</span>
                <span class="player-name">${entry.name}</span>
                <span class="player-score">${Math.round(entry.score)}%</span>
            </div>
        `).join('');
    }
    
    showScreen('leaderboard-screen');
}

function showLeaderboardFromDetails(quizCode) {
    showLeaderboardScreen(quizCode);
}

function goBackFromLeaderboard() {
    if (currentRole === 'host') {
        showQuizDetails(currentQuizCode);
    } else {
        showRoleSelection();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showScreen('role-selection');
});
