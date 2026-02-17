// Todo List Application - Vanilla JavaScript with Local Storage

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const pendingCount = document.getElementById('pending-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Local Storage key
const STORAGE_KEY = 'todo-list-items';

// Initialize app
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadTodos();
    updatePendingCount();
}

// Load todos from Local Storage
function loadTodos() {
    const todos = getTodosFromStorage();
    
    if (todos.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    todos.forEach(todo => {
        addTodoToDOM(todo);
    });
}

// Get todos from Local Storage
function getTodosFromStorage() {
    const todos = localStorage.getItem(STORAGE_KEY);
    return todos ? JSON.parse(todos) : [];
}

// Save todos to Local Storage
function saveTodosToStorage(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Add todo to DOM
function addTodoToDOM(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    
    li.innerHTML = `
        <div class="checkbox-wrapper">
            <input type="checkbox" ${todo.completed ? 'checked' : ''}>
        </div>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" title="Delete task">✕</button>
    `;
    
    todoList.appendChild(li);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add new todo
function addTodo(text) {
    const todos = getTodosFromStorage();
    
    const newTodo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodosToStorage(todos);
    
    addTodoToDOM(newTodo);
    hideEmptyState();
    updatePendingCount();
    
    return newTodo;
}

// Delete todo
function deleteTodo(id) {
    let todos = getTodosFromStorage();
    todos = todos.filter(todo => todo.id !== id);
    saveTodosToStorage(todos);
    
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.remove();
    }
    
    if (todos.length === 0) {
        showEmptyState();
    }
    
    updatePendingCount();
}

// Toggle todo completion
function toggleTodo(id) {
    const todos = getTodosFromStorage();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        saveTodosToStorage(todos);
        
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        if (todoItem) {
            todoItem.classList.toggle('completed');
        }
        
        updatePendingCount();
    }
}

// Clear all completed todos
function clearCompletedTodos() {
    let todos = getTodosFromStorage();
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
        return;
    }
    
    todos = todos.filter(todo => !todo.completed);
    saveTodosToStorage(todos);
    
    // Remove completed items from DOM
    const todoItems = document.querySelectorAll('.todo-item.completed');
    todoItems.forEach(item => item.remove());
    
    if (todos.length === 0) {
        showEmptyState();
    }
    
    updatePendingCount();
}

// Update pending count
function updatePendingCount() {
    const todos = getTodosFromStorage();
    const pending = todos.filter(todo => !todo.completed).length;
    pendingCount.textContent = `${pending} pending`;
}

// Show empty state
function showEmptyState() {
    emptyState.classList.add('visible');
}

// Hide empty state
function hideEmptyState() {
    emptyState.classList.remove('visible');
}

// Event Listeners

// Form submit - Add new todo
todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const text = todoInput.value;
    
    if (text.trim() === '') {
        todoInput.focus();
        return;
    }
    
    addTodo(text);
    todoInput.value = '';
    todoInput.focus();
});

// Event delegation for checkbox and delete buttons
todoList.addEventListener('click', function(e) {
    const target = e.target;
    
    // Handle delete button click
    if (target.classList.contains('delete-btn')) {
        const todoItem = target.closest('.todo-item');
        const id = todoItem.dataset.id;
        deleteTodo(id);
    }
    
    // Handle checkbox change
    if (target.type === 'checkbox') {
        const todoItem = target.closest('.todo-item');
        const id = todoItem.dataset.id;
        toggleTodo(id);
    }
});

// Clear completed button
clearCompletedBtn.addEventListener('click', clearCompletedTodos);
