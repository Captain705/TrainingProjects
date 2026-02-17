// AI Expense Tracker - JavaScript Application

// Application State
let transactions = [];
let pieChart = null;
let barChart = null;
let currentFilter = 'all';

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const transactionsList = document.getElementById('transactionsList');
const clearDataBtn = document.getElementById('clearDataBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// Balance Elements
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

// Category Icons Mapping
const categoryIcons = {
    // Income categories
    salary: 'fa-briefcase',
    freelance: 'fa-laptop',
    investment: 'fa-chart-line',
    gift: 'fa-gift',
    'other-income': 'fa-plus-circle',
    // Expense categories
    food: 'fa-utensils',
    transport: 'fa-car',
    shopping: 'fa-shopping-bag',
    bills: 'fa-file-invoice-dollar',
    entertainment: 'fa-gamepad',
    health: 'fa-heartbeat',
    education: 'fa-graduation-cap',
    'other-expense': 'fa-ellipsis-h'
};

// Category Colors
const categoryColors = {
    food: '#ff6b6b',
    transport: '#4ecdc4',
    shopping: '#45b7d1',
    bills: '#96ceb4',
    entertainment: '#ffeaa7',
    health: '#dfe6e9',
    education: '#a29bfe',
    'other-expense': '#636e72'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    updateBalanceCards();
    updateCharts();
    renderTransactions();
    setDefaultDate();
    setupEventListeners();
});

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    transactionForm.addEventListener('submit', handleFormSubmit);
    
    // Type change - update category options
    typeSelect.addEventListener('change', updateCategoryOptions);
    
    // Clear data button
    clearDataBtn.addEventListener('click', clearAllData);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
}

// Update category options based on transaction type
function updateCategoryOptions() {
    const type = typeSelect.value;
    const incomeCategories = document.getElementById('incomeCategories');
    const expenseCategories = document.getElementById('expenseCategories');
    
    if (type === 'income') {
        incomeCategories.style.display = 'block';
        expenseCategories.style.display = 'none';
        // Select first income category
        categorySelect.value = 'salary';
    } else {
        incomeCategories.style.display = 'none';
        expenseCategories.style.display = 'block';
        // Select first expense category
        categorySelect.value = 'food';
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const transaction = {
        id: generateId(),
        type: typeSelect.value,
        amount: parseFloat(amountInput.value),
        category: categorySelect.value,
        description: descriptionInput.value,
        date: dateInput.value,
        timestamp: new Date().getTime()
    };
    
    transactions.push(transaction);
    saveTransactions();
    updateBalanceCards();
    updateCharts();
    renderTransactions();
    
    // Reset form
    transactionForm.reset();
    setDefaultDate();
    updateCategoryOptions();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Load transactions from local storage
function loadTransactions() {
    const stored = localStorage.getItem('aiExpenseTracker');
    if (stored) {
        transactions = JSON.parse(stored);
    }
}

// Save transactions to local storage
function saveTransactions() {
    localStorage.setItem('aiExpenseTracker', JSON.stringify(transactions));
}

// Update balance cards
function updateBalanceCards() {
    const { income, expense } = calculateTotals();
    const balance = income - expense;
    
    totalBalanceEl.textContent = formatCurrency(balance);
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
    
    // Update balance card color based on value
    if (balance >= 0) {
        totalBalanceEl.style.color = '#a78bfa';
    } else {
        totalBalanceEl.style.color = '#f87171';
    }
}

// Calculate totals
function calculateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense };
}

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get category display name
function getCategoryName(category) {
    const names = {
        salary: 'Salary',
        freelance: 'Freelance',
        investment: 'Investment',
        gift: 'Gift',
        'other-income': 'Other Income',
        food: 'Food & Dining',
        transport: 'Transportation',
        shopping: 'Shopping',
        bills: 'Bills & Utilities',
        entertainment: 'Entertainment',
        health: 'Health & Medical',
        education: 'Education',
        'other-expense': 'Other Expense'
    };
    return names[category] || category;
}

// Render transactions
function renderTransactions() {
    let filteredTransactions = [...transactions];
    
    // Apply filter
    if (currentFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === currentFilter);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet. Add your first transaction above!</p>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas ${categoryIcons[transaction.category] || 'fa-wallet'}"></i>
                </div>
                <div class="transaction-details">
                    <span class="transaction-description">${transaction.description}</span>
                    <span class="transaction-category">${getCategoryName(transaction.category)}</span>
                </div>
            </div>
            <div class="transaction-amount">
                <span class="transaction-date">${formatDate(transaction.date)}</span>
                <span class="amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </span>
            </div>
            <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateBalanceCards();
    updateCharts();
    renderTransactions();
}

// Handle filter click
function handleFilterClick(btn) {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTransactions();
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        transactions = [];
        saveTransactions();
        updateBalanceCards();
        updateCharts();
        renderTransactions();
    }
}

// Update Charts
function updateCharts() {
    updatePieChart();
    updateBarChart();
}

// Update Pie Chart (Expense by Category)
function updatePieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    // Calculate expenses by category
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenseTransactions.forEach(t => {
        if (categoryTotals[t.category]) {
            categoryTotals[t.category] += t.amount;
        } else {
            categoryTotals[t.category] = t.amount;
        }
    });
    
    const labels = Object.keys(categoryTotals).map(cat => getCategoryName(cat));
    const data = Object.values(categoryTotals);
    const colors = Object.keys(categoryTotals).map(cat => categoryColors[cat] || '#636e72');
    
    // Destroy existing chart
    if (pieChart) {
        pieChart.destroy();
    }
    
    // Create new chart
    if (expenseTransactions.length > 0) {
        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    } else {
        // Show empty chart
        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '60%'
            }
        });
    }
}

// Update Bar Chart (Income vs Expense)
function updateBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    // Calculate totals
    const { income, expense } = calculateTotals();
    
    // Destroy existing chart
    if (barChart) {
        barChart.destroy();
    }
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                label: 'Amount',
                data: [income, expense],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.8)',
                    'rgba(248, 113, 113, 0.8)'
                ],
                borderColor: [
                    'rgba(74, 222, 128, 1)',
                    'rgba(248, 113, 113, 1)'
                ],
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}
