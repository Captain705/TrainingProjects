// Get elements
const display = document.getElementById('display');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const darkModeToggle = document.getElementById('darkModeToggle');
const historyToggle = document.getElementById('historyToggle');
const body = document.body;

// State variables
let history = [];
let memory = 0;
let isDarkMode = false;
let isHistoryVisible = false;

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    body.classList.toggle('dark', isDarkMode);
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    darkModeToggle.classList.toggle('active', isDarkMode);
});

// History toggle
historyToggle.addEventListener('click', () => {
    isHistoryVisible = !isHistoryVisible;
    historyPanel.classList.toggle('show', isHistoryVisible);
    historyToggle.classList.toggle('active', isHistoryVisible);
});

// Function to append value to display
function appendToDisplay(value) {
    display.textContent += value;
}

// Function to clear the display
function clearDisplay() {
    display.textContent = '';
}

// Function to backspace
function backspace() {
    display.textContent = display.textContent.slice(0, -1);
}

// Function to calculate factorial
function factorial() {
    const num = parseFloat(display.textContent);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
        display.textContent = 'Error';
        return;
    }
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    display.textContent = result;
}

// Memory functions
function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    display.textContent = memory;
}

function memoryStore() {
    const value = parseFloat(display.textContent);
    if (!isNaN(value)) {
        memory = value;
    }
}

function memoryAdd() {
    const value = parseFloat(display.textContent);
    if (!isNaN(value)) {
        memory += value;
    }
}

// Function to calculate the result
function calculate() {
    try {
        let expression = display.textContent
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');

        // Evaluate the expression
        let result = eval(expression);

        // Handle special cases
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid operation');
        }

        // Add to history
        history.unshift(`${display.textContent} = ${result}`);
        if (history.length > 10) {
            history.pop();
        }
        updateHistory();

        // Display the result
        display.textContent = result;
    } catch (error) {
        display.textContent = 'Error: ' + error.message;
    }
}

// Update history display
function updateHistory() {
    historyList.innerHTML = '';
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = item;
        div.onclick = () => {
            const result = item.split(' = ')[1];
            display.textContent = result;
        };
        historyList.appendChild(div);
    });
}

// Clear history
function clearHistory() {
    history = [];
    updateHistory();
}

// Add keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '.' || key === '(' || key === ')') {
        appendToDisplay(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'c' || key === 'C') {
        clearDisplay();
    }
});
