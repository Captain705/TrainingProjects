/**
 * Habit Tracker - JavaScript
 * Handles habits, calendar heatmap, statistics, and localStorage
 */

// ========================================
// Constants
// ========================================
const STORAGE_KEYS = {
    HABITS: 'habitTrackerHabits',
    COMPLETIONS: 'habitTrackerCompletions',
    THEME: 'habitTrackerTheme'
};

const DAYS_TO_SHOW = 365;
const DAYS_IN_WEEK = 7;

// ========================================
// State Variables
// ========================================
let habits = [];
let completions = {};
let activeHabitId = null;
let currentTheme = 'dark';

// ========================================
// DOM Elements
// ========================================
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitsList = document.getElementById('habitsList');
const emptyHabits = document.getElementById('emptyHabits');
const heatmapGrid = document.getElementById('heatmapGrid');
const heatmapTitle = document.getElementById('heatmapTitle');
const monthLabels = document.getElementById('monthLabels');
const noHabitMessage = document.getElementById('noHabitMessage');
const tooltip = document.getElementById('tooltip');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');

// Stats elements
const totalDaysEl = document.getElementById('totalDays');
const currentStreakEl = document.getElementById('currentStreak');
const longestStreakEl = document.getElementById('longestStreak');
const completionRateEl = document.getElementById('completionRate');

// ========================================
// Initialization
// ========================================
function init() {
    loadFromStorage();
    setupEventListeners();
    renderHabits();
    
    if (habits.length > 0) {
        activeHabitId = habits[0].id;
        renderHabits();
        renderHeatmap();
    } else {
        showNoHabitSelected();
    }
    
    updateStats();
}

// ========================================
// Local Storage Functions
// ========================================
function loadFromStorage() {
    // Load theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
    }

    // Load habits
    const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (savedHabits) {
        try {
            habits = JSON.parse(savedHabits);
        } catch (e) {
            habits = [];
        }
    }

    // Load completions
    const savedCompletions = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (savedCompletions) {
        try {
            completions = JSON.parse(savedCompletions);
        } catch (e) {
            completions = {};
        }
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
    localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Add habit
    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Export data
    exportBtn.addEventListener('click', exportData);
}

// ========================================
// Habit Management
// ========================================
function addHabit() {
    const name = habitInput.value.trim();
    
    if (!name) return;
    
    const habit = {
        id: Date.now(),
        name: name,
        createdAt: new Date().toISOString()
    };
    
    habits.push(habit);
    completions[habit.id] = {};
    
    habitInput.value = '';
    saveToStorage();
    renderHabits();
    
    // Select the newly added habit
    activeHabitId = habit.id;
    renderHabits();
    renderHeatmap();
    hideNoHabitSelected();
    updateStats();
}

function deleteHabit(habitId) {
    habits = habits.filter(h => h.id !== habitId);
    delete completions[habitId];
    
    if (activeHabitId === habitId) {
        activeHabitId = habits.length > 0 ? habits[0].id : null;
    }
    
    saveToStorage();
    renderHabits();
    
    if (activeHabitId) {
        renderHeatmap();
    } else {
        showNoHabitSelected();
    }
    
    updateStats();
}

function selectHabit(habitId) {
    activeHabitId = habitId;
    renderHabits();
    renderHeatmap();
    updateStats();
}

function renderHabits() {
    habitsList.innerHTML = '';
    
    if (habits.length === 0) {
        emptyHabits.classList.remove('hidden');
    } else {
        emptyHabits.classList.add('hidden');
        
        habits.forEach(habit => {
            const li = document.createElement('li');
            li.className = `habit-item ${habit.id === activeHabitId ? 'active' : ''}`;
            li.dataset.id = habit.id;
            
            const date = new Date(habit.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            li.innerHTML = `
                <div class="habit-info">
                    <span class="habit-name">${escapeHtml(habit.name)}</span>
                    <span class="habit-date">Since ${date}</span>
                </div>
                <button class="habit-delete" data-id="${habit.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.habit-delete')) {
                    selectHabit(habit.id);
                }
            });
            
            const deleteBtn = li.querySelector('.habit-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHabit(habit.id);
            });
            
            habitsList.appendChild(li);
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Calendar Heatmap
// ========================================
function renderHeatmap() {
    if (!activeHabitId) {
        showNoHabitSelected();
        return;
    }
    
    hideNoHabitSelected();
    
    const habit = habits.find(h => h.id === activeHabitId);
    heatmapTitle.textContent = `${habit.name} - Last 365 Days`;
    
    renderMonthLabels();
    renderHeatmapGrid();
}

function renderMonthLabels() {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - DAYS_TO_SHOW);
    
    monthLabels.innerHTML = '';
    
    let currentMonth = -1;
    const weeks = getWeeksArray();
    
    weeks.forEach(week => {
        const firstDayOfWeek = week[0];
        if (firstDayOfWeek && firstDayOfWeek.getMonth() !== currentMonth) {
            currentMonth = firstDayOfWeek.getMonth();
            const monthName = firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' });
            const span = document.createElement('span');
            span.className = 'month-label';
            span.textContent = monthName;
            monthLabels.appendChild(span);
        }
    });
}

function renderHeatmapGrid() {
    heatmapGrid.innerHTML = '';
    
    const weeks = getWeeksArray();
    const habitCompletions = completions[activeHabitId] || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    weeks.forEach(week => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'heatmap-week';
        
        week.forEach(day => {
            if (!day) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'heatmap-day empty';
                weekDiv.appendChild(emptyDay);
                return;
            }
            
            const dateStr = formatDate(day);
            const isCompleted = habitCompletions[dateStr] === true;
            const isFuture = day > today;
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'heatmap-day';
            
            if (isCompleted) {
                dayDiv.classList.add('level-4');
            } else {
                dayDiv.classList.add('level-0');
            }
            
            if (isFuture) {
                dayDiv.classList.add('future');
            }
            
            // Tooltip
            dayDiv.addEventListener('mouseenter', (e) => showTooltip(e, dateStr, isCompleted));
            dayDiv.addEventListener('mouseleave', hideTooltip);
            
            // Click to toggle completion
            if (!isFuture) {
                dayDiv.addEventListener('click', () => toggleCompletion(dateStr));
            }
            
            weekDiv.appendChild(dayDiv);
        });
        
        heatmapGrid.appendChild(weekDiv);
    });
}

function getWeeksArray() {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - DAYS_TO_SHOW);
    
    // Align to start of week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
        const week = [];
        for (let i = 0; i < DAYS_IN_WEEK; i++) {
            week.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }
    
    return weeks;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toggleCompletion(dateStr) {
    if (!completions[activeHabitId]) {
        completions[activeHabitId] = {};
    }
    
    completions[activeHabitId][dateStr] = !completions[activeHabitId][dateStr];
    
    saveToStorage();
    renderHeatmap();
    updateStats();
}

// ========================================
// Statistics
// ========================================
function updateStats() {
    if (!activeHabitId) {
        totalDaysEl.textContent = '0';
        currentStreakEl.textContent = '0';
        longestStreakEl.textContent = '0';
        completionRateEl.textContent = '0%';
        return;
    }
    
    const habitCompletions = completions[activeHabitId] || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Total completed days
    const completedDays = Object.values(habitCompletions).filter(v => v === true).length;
    totalDaysEl.textContent = completedDays;
    
    // Current streak
    const currentStreak = calculateStreak(habitCompletions, today, false);
    currentStreakEl.textContent = currentStreak;
    
    // Longest streak
    const longestStreak = calculateLongestStreak(habitCompletions);
    longestStreakEl.textContent = longestStreak;
    
    // Completion rate
    const habit = habits.find(h => h.id === activeHabitId);
    const createdDate = new Date(habit.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    
    const daysSinceCreation = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1;
    const rate = daysSinceCreation > 0 ? Math.round((completedDays / daysSinceCreation) * 100) : 0;
    completionRateEl.textContent = `${rate}%`;
}

function calculateStreak(completions, fromDate, backwards = true) {
    let streak = 0;
    let currentDate = new Date(fromDate);
    
    if (!backwards) {
        // Calculate current streak (consecutive days up to today)
        while (true) {
            const dateStr = formatDate(currentDate);
            if (completions[dateStr]) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
    }
    
    return streak;
}

function calculateLongestStreak(completions) {
    const dates = Object.keys(completions).filter(d => completions[d]).sort();
    
    if (dates.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return longestStreak;
}

// ========================================
// Tooltip
// ========================================
function showTooltip(event, dateStr, isCompleted) {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    tooltip.innerHTML = `
        <strong>${formattedDate}</strong><br>
        ${isCompleted ? '✅ Completed' : '❌ Not completed'}
    `;
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 50}px`;
    tooltip.classList.add('visible');
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

// ========================================
// UI Functions
// ========================================
function showNoHabitSelected() {
    noHabitMessage.classList.remove('hidden');
    heatmapGrid.innerHTML = '';
    monthLabels.innerHTML = '';
    heatmapTitle.textContent = 'Select a habit to view progress';
}

function hideNoHabitSelected() {
    noHabitMessage.classList.add('hidden');
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    saveToStorage();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (currentTheme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function exportData() {
    const data = {
        habits: habits,
        completions: completions,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', init);
