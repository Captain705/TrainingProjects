/**
 * Kanban Board - Task Management Application
 * Uses Vanilla JavaScript with Drag and Drop API
 * Local Storage for persistence
 */

// ========================================
// Constants & Configuration
// ========================================
const STORAGE_KEY = 'kanban_board_data';
const DEFAULT_COLUMNS = [
    { id: 'todo', name: 'To Do', color: '#667eea' },
    { id: 'in-progress', name: 'In Progress', color: '#ed8936' },
    { id: 'done', name: 'Done', color: '#48bb78' }
];

// ========================================
// State Management
// ========================================
let boardData = {
    columns: [],
    tasks: []
};

let currentFilters = {
    priority: 'all',
    dueDate: 'all',
    search: ''
};

let draggedTask = null;
let draggedFromColumn = null;

// ========================================
// DOM Elements
// ========================================
const boardEl = document.getElementById('board');
const taskModal = document.getElementById('taskModal');
const columnModal = document.getElementById('columnModal');
const editColumnModal = document.getElementById('editColumnModal');
const filterModal = document.getElementById('filterModal');
const taskForm = document.getElementById('taskForm');
const columnForm = document.getElementById('columnForm');
const editColumnForm = document.getElementById('editColumnForm');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTheme();
    renderBoard();
    attachEventListeners();
});

// ========================================
// Data Management
// ========================================
function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        boardData = JSON.parse(savedData);
    } else {
        // Initialize with default columns
        boardData.columns = DEFAULT_COLUMNS.map(col => ({
            ...col,
            tasks: []
        }));
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boardData));
}

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const savedTheme = localStorage.getItem('kanban_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kanban_theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// ========================================
// Board Rendering
// ========================================
function renderBoard() {
    boardEl.innerHTML = '';
    
    boardData.columns.forEach(column => {
        const columnEl = createColumnElement(column);
        boardEl.appendChild(columnEl);
    });
}

function createColumnElement(column) {
    const columnEl = document.createElement('div');
    columnEl.className = 'column';
    columnEl.dataset.columnId = column.id;
    
    // Column header
    const headerEl = document.createElement('div');
    headerEl.className = 'column-header';
    headerEl.innerHTML = `
        <div class="column-title-wrapper">
            <span class="column-indicator" style="background: ${column.color}"></span>
            <span class="column-title" data-column-id="${column.id}">${column.name}</span>
            <span class="column-count">${getTaskCount(column.id)}</span>
        </div>
        <div class="column-actions">
            <button class="column-action-btn edit-column" data-column-id="${column.id}" title="Edit Column">✏️</button>
            <button class="column-action-btn delete-column" data-column-id="${column.id}" title="Delete Column">🗑️</button>
        </div>
    `;
    
    // Column body (task list)
    const bodyEl = document.createElement('div');
    bodyEl.className = 'column-body';
    bodyEl.dataset.columnId = column.id;
    
    // Add drag and drop events
    bodyEl.addEventListener('dragover', handleDragOver);
    bodyEl.addEventListener('dragenter', handleDragEnter);
    bodyEl.addEventListener('dragleave', handleDragLeave);
    bodyEl.addEventListener('drop', handleDrop);
    
    // Render tasks
    const tasks = getColumnTasks(column.id);
    if (tasks.length === 0) {
        bodyEl.innerHTML = `
            <div class="empty-column">
                <div class="empty-column-icon">📋</div>
                <p class="empty-column-text">No tasks yet</p>
            </div>
        `;
    } else {
        tasks.forEach(task => {
            const taskEl = createTaskElement(task);
            bodyEl.appendChild(taskEl);
        });
    }
    
    // Column footer (add task button)
    const footerEl = document.createElement('div');
    footerEl.className = 'column-footer';
    footerEl.innerHTML = `
        <button class="btn btn-secondary add-task-btn" data-column-id="${column.id}" style="width: 100%;">
            <span>+</span> Add Task
        </button>
    `;
    
    columnEl.appendChild(headerEl);
    columnEl.appendChild(bodyEl);
    columnEl.appendChild(footerEl);
    
    return columnEl;
}

function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = 'task-card';
    taskEl.draggable = true;
    taskEl.dataset.taskId = task.id;
    
    // Apply filters
    if (!passesFilter(task)) {
        taskEl.style.display = 'none';
    }
    
    // Due date styling
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = dueDate && dueDate < today;
    const dueDateStr = dueDate ? formatDate(dueDate) : '';
    
    taskEl.innerHTML = `
        <div class="task-header">
            <span class="task-title">${escapeHtml(task.title)}</span>
            <span class="task-priority ${task.priority}"></span>
        </div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
        <div class="task-meta">
            <div class="task-date ${isOverdue ? 'overdue' : ''}">
                📅 ${dueDateStr || 'No due date'}
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-task" data-task-id="${task.id}" title="Edit">✏️</button>
                <button class="task-action-btn delete delete-task" data-task-id="${task.id}" title="Delete">🗑️</button>
            </div>
        </div>
    `;
    
    // Add drag events
    taskEl.addEventListener('dragstart', handleDragStart);
    taskEl.addEventListener('dragend', handleDragEnd);
    
    return taskEl;
}

function getTaskCount(columnId) {
    return boardData.tasks.filter(task => task.columnId === columnId).length;
}

function getColumnTasks(columnId) {
    return boardData.tasks
        .filter(task => task.columnId === columnId)
        .sort((a, b) => a.order - b.order);
}

// ========================================
// Drag and Drop Handlers
// ========================================
function handleDragStart(e) {
    draggedTask = e.target;
    draggedFromColumn = e.target.closest('.column-body').dataset.columnId;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.column').forEach(col => {
        col.classList.remove('drag-over');
    });
    document.querySelectorAll('.task-card').forEach(task => {
        task.classList.remove('drag-over');
    });
    draggedTask = null;
    draggedFromColumn = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    const columnBody = e.target.closest('.column-body');
    if (columnBody) {
        columnBody.closest('.column').classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const columnBody = e.target.closest('.column-body');
    if (columnBody && !columnBody.contains(e.relatedTarget)) {
        columnBody.closest('.column').classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const columnBody = e.target.closest('.column-body');
    if (!columnBody) return;
    
    const targetColumnId = columnBody.dataset.columnId;
    const taskId = e.dataTransfer.getData('text/plain');
    
    // Find the task and update its column
    const taskIndex = boardData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Calculate new order
    const targetTasks = boardData.tasks
        .filter(t => t.columnId === targetColumnId && t.id !== taskId)
        .sort((a, b) => a.order - b.order);
    
    let newOrder = 0;
    const afterElement = getDragAfterElement(columnBody, e.clientY);
    if (afterElement) {
        const afterTaskId = afterElement.dataset.taskId;
        const afterTask = targetTasks.find(t => t.id === afterTaskId);
        if (afterTask) {
            newOrder = afterTask.order - 0.5;
        }
    } else {
        newOrder = targetTasks.length > 0 ? Math.max(...targetTasks.map(t => t.order)) + 1 : 0;
    }
    
    // Update task
    boardData.tasks[taskIndex].columnId = targetColumnId;
    boardData.tasks[taskIndex].order = newOrder;
    
    // Reorder tasks in the target column
    const columnTasks = boardData.tasks
        .filter(t => t.columnId === targetColumnId)
        .sort((a, b) => a.order - b.order);
    
    columnTasks.forEach((task, index) => {
        const taskInArray = boardData.tasks.find(t => t.id === task.id);
        if (taskInArray) {
            taskInArray.order = index;
        }
    });
    
    saveData();
    renderBoard();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ========================================
// Task Management
// ========================================
function addTask(taskData) {
    const columnTasks = boardData.tasks.filter(t => t.columnId === taskData.columnId);
    const maxOrder = columnTasks.length > 0 ? Math.max(...columnTasks.map(t => t.order)) : -1;
    
    const newTask = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description || '',
        columnId: taskData.columnId,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null,
        createdAt: new Date().toISOString(),
        order: maxOrder + 1
    };
    
    boardData.tasks.push(newTask);
    saveData();
    renderBoard();
    showToast('Task added successfully!', 'success');
}

function updateTask(taskId, taskData) {
    const taskIndex = boardData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        boardData.tasks[taskIndex] = {
            ...boardData.tasks[taskIndex],
            ...taskData,
            updatedAt: new Date().toISOString()
        };
        saveData();
        renderBoard();
        showToast('Task updated successfully!', 'success');
    }
}

function deleteTask(taskId) {
    boardData.tasks = boardData.tasks.filter(t => t.id !== taskId);
    saveData();
    renderBoard();
    showToast('Task deleted successfully!', 'success');
}

function openTaskModal(columnId = null, taskId = null) {
    const modalTitle = document.getElementById('modalTitle');
    const taskIdInput = document.getElementById('taskId');
    const taskColumnIdInput = document.getElementById('taskColumnId');
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const priorityInput = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');
    
    taskForm.reset();
    
    if (taskId) {
        const task = boardData.tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'Edit Task';
            taskIdInput.value = task.id;
            taskColumnIdInput.value = task.columnId;
            titleInput.value = task.title;
            descriptionInput.value = task.description || '';
            priorityInput.value = task.priority || 'medium';
            dueDateInput.value = task.dueDate || '';
        }
    } else {
        modalTitle.textContent = 'Add New Task';
        taskIdInput.value = '';
        taskColumnIdInput.value = columnId;
    }
    
    taskModal.classList.add('active');
    titleInput.focus();
}

function closeTaskModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
}

// ========================================
// Column Management
// ========================================
function addColumn(columnName) {
    const colors = ['#667eea', '#ed8936', '#48bb78', '#f56565', '#9f7aea', '#38b2ac', '#ed64a6', '#fc8181'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newColumn = {
        id: generateId(),
        name: columnName,
        color: randomColor
    };
    
    boardData.columns.push(newColumn);
    saveData();
    renderBoard();
    showToast('Column added successfully!', 'success');
}

function updateColumn(columnId, columnName) {
    const columnIndex = boardData.columns.findIndex(c => c.id === columnId);
    if (columnIndex !== -1) {
        boardData.columns[columnIndex].name = columnName;
        saveData();
        renderBoard();
        showToast('Column updated successfully!', 'success');
    }
}

function deleteColumn(columnId) {
    if (boardData.columns.length <= 1) {
        showToast('Cannot delete the last column!', 'error');
        return;
    }
    
    // Delete all tasks in this column
    boardData.tasks = boardData.tasks.filter(t => t.columnId !== columnId);
    boardData.columns = boardData.columns.filter(c => c.id !== columnId);
    saveData();
    renderBoard();
    showToast('Column deleted successfully!', 'success');
}

function openColumnModal(columnId = null) {
    const columnNameInput = document.getElementById('editColumnName');
    const editColumnIdInput = document.getElementById('editColumnId');
    
    if (columnId) {
        const column = boardData.columns.find(c => c.id === columnId);
        if (column) {
            columnNameInput.value = column.name;
            editColumnIdInput.value = column.id;
        }
    } else {
        document.getElementById('columnName').value = '';
    }
    
    if (columnId) {
        editColumnModal.classList.add('active');
        columnNameInput.focus();
    } else {
        columnModal.classList.add('active');
        document.getElementById('columnName').focus();
    }
}

function closeColumnModal() {
    columnModal.classList.remove('active');
    columnForm.reset();
}

function closeEditColumnModal() {
    editColumnModal.classList.remove('active');
    editColumnForm.reset();
}

// ========================================
// Search & Filter
// ========================================
function handleSearch(e) {
    currentFilters.search = e.target.value.toLowerCase();
    renderBoard();
}

function openFilterModal() {
    filterModal.classList.add('active');
}

function closeFilterModal() {
    filterModal.classList.remove('active');
}

function applyFilters() {
    currentFilters.priority = document.getElementById('filterPriority').value;
    currentFilters.dueDate = document.getElementById('filterDueDate').value;
    closeFilterModal();
    renderBoard();
    showToast('Filters applied!', 'success');
}

function clearFilters() {
    currentFilters = {
        priority: 'all',
        dueDate: 'all',
        search: searchInput.value.toLowerCase()
    };
    document.getElementById('filterPriority').value = 'all';
    document.getElementById('filterDueDate').value = 'all';
    closeFilterModal();
    renderBoard();
}

function passesFilter(task) {
    // Search filter
    if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) && 
            !task.description.toLowerCase().includes(searchLower)) {
            return false;
        }
    }
    
    // Priority filter
    if (currentFilters.priority !== 'all' && task.priority !== currentFilters.priority) {
        return false;
    }
    
    // Due date filter
    if (currentFilters.dueDate !== 'all' && task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (currentFilters.dueDate === 'today' && dueDate.getTime() !== today.getTime()) {
            return false;
        }
        if (currentFilters.dueDate === 'upcoming' && dueDate <= today) {
            return false;
        }
        if (currentFilters.dueDate === 'overdue' && dueDate >= today) {
            return false;
        }
    }
    
    return true;
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    
    // Add column button
    document.getElementById('addColumnBtn').addEventListener('click', () => openColumnModal());
    
    // Task form
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const taskId = document.getElementById('taskId').value;
        const columnId = document.getElementById('taskColumnId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!title) return;
        
        if (taskId) {
            updateTask(taskId, { title, description, priority, dueDate });
        } else {
            addTask({ title, description, priority, dueDate, columnId });
        }
        
        closeTaskModal();
    });
    
    // Column form
    columnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const columnName = document.getElementById('columnName').value.trim();
        if (columnName) {
            addColumn(columnName);
            closeColumnModal();
        }
    });
    
    // Edit column form
    editColumnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const columnId = document.getElementById('editColumnId').value;
        const columnName = document.getElementById('editColumnName').value.trim();
        if (columnName && columnId) {
            updateColumn(columnId, columnName);
            closeEditColumnModal();
        }
    });
    
    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeTaskModal);
    document.getElementById('cancelTask').addEventListener('click', closeTaskModal);
    document.getElementById('closeColumnModal').addEventListener('click', closeColumnModal);
    document.getElementById('cancelColumn').addEventListener('click', closeColumnModal);
    document.getElementById('closeEditColumnModal').addEventListener('click', closeEditColumnModal);
    document.getElementById('cancelEditColumn').addEventListener('click', closeEditColumnModal);
    document.getElementById('closeFilterModal').addEventListener('click', closeFilterModal);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Close modal on backdrop click
    [taskModal, columnModal, editColumnModal, filterModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Event delegation for dynamic elements
    boardEl.addEventListener('click', (e) => {
        // Add task button
        const addTaskBtn = e.target.closest('.add-task-btn');
        if (addTaskBtn) {
            const columnId = addTaskBtn.dataset.columnId;
            openTaskModal(columnId);
            return;
        }
        
        // Edit task
        const editTaskBtn = e.target.closest('.edit-task');
        if (editTaskBtn) {
            const taskId = editTaskBtn.dataset.taskId;
            openTaskModal(null, taskId);
            return;
        }
        
        // Delete task
        const deleteTaskBtn = e.target.closest('.delete-task');
        if (deleteTaskBtn) {
            const taskId = deleteTaskBtn.dataset.taskId;
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
            }
            return;
        }
        
        // Edit column
        const editColumnBtn = e.target.closest('.edit-column');
        if (editColumnBtn) {
            const columnId = editColumnBtn.dataset.columnId;
            openColumnModal(columnId);
            return;
        }
        
        // Delete column
        const deleteColumnBtn = e.target.closest('.delete-column');
        if (deleteColumnBtn) {
            const columnId = deleteColumnBtn.dataset.columnId;
            if (confirm('Are you sure you want to delete this column? All tasks in this column will be deleted.')) {
                deleteColumn(columnId);
            }
            return;
        }
        
        // Click on task title to edit
        const taskCard = e.target.closest('.task-card');
        if (taskCard && !e.target.closest('.task-actions')) {
            const taskId = taskCard.dataset.taskId;
            openTaskModal(null, taskId);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeTaskModal();
            closeColumnModal();
            closeEditColumnModal();
            closeFilterModal();
        }
    });
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
