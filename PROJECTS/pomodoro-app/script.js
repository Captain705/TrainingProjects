/**
 * Pomodoro Productivity App - JavaScript
 * Handles timer, tasks, localStorage, and UI interactions
 */

// ========================================
// Constants
// ========================================
const MODES = {
    focus: {
        id: 'focus',
        label: 'Focus Time',
        duration: 25 * 60, // 25 minutes in seconds
        color: '#ff6b6b'
    },
    shortBreak: {
        id: 'shortBreak',
        label: 'Short Break',
        duration: 5 * 60, // 5 minutes in seconds
        color: '#4ecdc4'
    },
    longBreak: {
        id: 'longBreak',
        label: 'Long Break',
        duration: 15 * 60, // 15 minutes in seconds
        color: '#a29bfe'
    }
};

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }
];

const STORAGE_KEYS = {
    TASKS: 'pomodoroTasks',
    SESSIONS: 'pomodoroSessions',
    MODE: 'pomodoroMode',
    THEME: 'pomodoroTheme',
    STREAK: 'pomodoroStreak',
    LAST_DATE: 'pomodoroLastDate'
};

// ========================================
// State Variables
// ========================================
let currentMode = 'focus';
let timeRemaining = MODES.focus.duration;
let timerInterval = null;
let isRunning = false;
let tasks = [];
let completedSessions = 0;
let currentStreak = 0;

// ========================================
// DOM Elements
// ========================================
const timerDisplay = document.getElementById('timerDisplay');
const modeLabel = document.getElementById('modeLabel');
const progressRing = document.getElementById('progressRing');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const themeToggle = document.getElementById('themeToggle');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const sessionCount = document.getElementById('sessionCount');
const streakCount = document.getElementById('streakCount');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const notificationModal = document.getElementById('notificationModal');
const notificationMessage = document.getElementById('notificationMessage');
const closeModalBtn = document.getElementById('closeModal');

// SVG Circle parameters
const CIRCUMFERENCE = 2 * Math.PI * 90; // radius = 90
progressRing.style.strokeDasharray = CIRCUMFERENCE;

// ========================================
// Initialization
// ========================================
function init() {
    loadFromStorage();
    setupEventListeners();
    displayRandomQuote();
    updateUI();
    checkAndResetDaily();
}

// ========================================
// Local Storage Functions
// ========================================
function loadFromStorage() {
    // Load theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    // Load mode
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE);
    if (savedMode && MODES[savedMode]) {
        currentMode = savedMode;
        timeRemaining = MODES[currentMode].duration;
    }

    // Load tasks
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            tasks = [];
        }
    }

    // Load sessions
    const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (savedSessions) {
        completedSessions = parseInt(savedSessions) || 0;
    }

    // Load streak
    const savedStreak = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (savedStreak) {
        currentStreak = parseInt(savedStreak) || 0;
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, completedSessions.toString());
    localStorage.setItem(STORAGE_KEYS.MODE, currentMode);
    localStorage.setItem(STORAGE_KEYS.STREAK, currentStreak.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_DATE, new Date().toDateString());
}

function checkAndResetDaily() {
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
    const today = new Date().toDateString();
    
    if (lastDate && lastDate !== today) {
        // New day - check if streak continues
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate !== yesterday.toDateString()) {
            // Streak broken
            currentStreak = 0;
            saveToStorage();
        }
    }
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Mode buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchMode(mode);
        });
    });

    // Start/Pause button
    startBtn.addEventListener('click', toggleTimer);

    // Reset button
    resetBtn.addEventListener('click', resetTimer);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Task input
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    addTaskBtn.addEventListener('click', addTask);

    // Modal close
    closeModalBtn.addEventListener('click', closeModal);
    
    notificationModal.addEventListener('click', (e) => {
        if (e.target === notificationModal) {
            closeModal();
        }
    });
}

// ========================================
// Timer Functions
// ========================================
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    isRunning = true;
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    startBtn.classList.add('running');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        updateProgressRing();
        
        if (timeRemaining <= 0) {
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    startBtn.classList.remove('running');
}

function resetTimer() {
    pauseTimer();
    timeRemaining = MODES[currentMode].duration;
    updateTimerDisplay();
    updateProgressRing();
}

function timerComplete() {
    pauseTimer();
    timeRemaining = MODES[currentMode].duration;
    
    // Play notification sound
    playNotificationSound();
    
    // Show notification
    if (currentMode === 'focus') {
        completedSessions++;
        currentStreak++;
        saveToStorage();
        showNotification('Great job!', 'Focus session complete. Time for a break!');
        // Auto-switch to break mode
        if (completedSessions % 4 === 0) {
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        showNotification('Break is over!', 'Ready to focus again?');
        switchMode('focus');
    }
    
    updateUI();
}

function switchMode(mode) {
    if (isRunning) {
        pauseTimer();
    }
    
    currentMode = mode;
    timeRemaining = MODES[mode].duration;
    
    // Update mode buttons
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Update accent color
    document.documentElement.style.setProperty('--accent-primary', MODES[mode].color);
    
    updateTimerDisplay();
    updateProgressRing();
    updateModeLabel();
    saveToStorage();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.title = `${timerDisplay.textContent} - PomoFlow`;
}

function updateProgressRing() {
    const totalDuration = MODES[currentMode].duration;
    const progress = (totalDuration - timeRemaining) / totalDuration;
    const offset = CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
}

function updateModeLabel() {
    modeLabel.textContent = MODES[currentMode].label;
}

// ========================================
// Theme Functions
// ========================================
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ========================================
// Task Functions
// ========================================
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    taskInput.value = '';
    saveToStorage();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveToStorage();
    renderTasks();
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToStorage();
        renderTasks();
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="task-delete" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add event listeners
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
            
            const deleteBtn = li.querySelector('.task-delete');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(li);
        });
    }
    
    // Update task count
    const activeTasks = tasks.filter(t => !t.completed).length;
    taskCount.textContent = activeTasks;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// UI Update Functions
// ========================================
function updateUI() {
    updateTimerDisplay();
    updateProgressRing();
    updateModeLabel();
    sessionCount.textContent = completedSessions;
    streakCount.textContent = currentStreak;
    
    // Update active mode button
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === currentMode) {
            btn.classList.add('active');
        }
    });
    
    // Update accent color
    document.documentElement.style.setProperty('--accent-primary', MODES[currentMode].color);
    
    renderTasks();
}

function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    const quote = QUOTES[randomIndex];
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
}

// ========================================
// Notification Functions
// ========================================
function showNotification(title, message) {
    notificationMessage.textContent = message;
    notificationModal.classList.add('active');
    
    // Also show browser notification if permitted
    if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message });
            }
        });
    }
}

function closeModal() {
    notificationModal.classList.remove('active');
}

function playNotificationSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // Play a second tone
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            
            osc2.frequency.value = 1000;
            osc2.type = 'sine';
            
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 200);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ========================================
// Initialize the App
// ========================================
document.addEventListener('DOMContentLoaded', init);

// Request notification permission on load
if ('Notification' in window) {
    Notification.requestPermission();
}
