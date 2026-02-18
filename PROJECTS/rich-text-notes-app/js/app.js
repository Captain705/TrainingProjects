// Rich Text Notes App - JavaScript

// App State
let notes = [];
let currentNoteId = null;
let autoSaveTimeout = null;
let searchQuery = '';

// DOM Elements
const notesList = document.getElementById('notesList');
const editor = document.getElementById('editor');
const noteTitle = document.getElementById('noteTitle');
const newNoteBtn = document.getElementById('newNoteBtn');
const searchInput = document.getElementById('searchInput');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const autoSaveStatus = document.getElementById('autoSaveStatus');
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

// Toolbar buttons
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const strikeBtn = document.getElementById('strikeBtn');
const ulBtn = document.getElementById('ulBtn');
const olBtn = document.getElementById('olBtn');
const colorBtn = document.getElementById('colorBtn');
const colorPicker = document.getElementById('colorPicker');
const highlightBtn = document.getElementById('highlightBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

// Initialize App
function init() {
    loadNotesFromStorage();
    renderNotesList();
    
    if (notes.length > 0) {
        selectNote(notes[0].id);
    } else {
        createNewNote();
    }
    
    setupEventListeners();
}

// Local Storage Functions
function loadNotesFromStorage() {
    const storedNotes = localStorage.getItem('richTextNotes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
}

function saveNotesToStorage() {
    localStorage.setItem('richTextNotes', JSON.stringify(notes));
}

// Note CRUD Operations
function createNewNote() {
    const newNote = {
        id: generateId(),
        title: '',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    saveNotesToStorage();
    renderNotesList();
    selectNote(newNote.id);
}

function selectNote(id) {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    
    if (note) {
        noteTitle.value = note.title;
        editor.innerHTML = note.content;
        updateNotesListActiveState();
    }
}

function updateCurrentNote() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        note.title = noteTitle.value;
        note.content = editor.innerHTML;
        note.updatedAt = new Date().toISOString();
        
        saveNotesToStorage();
        renderNotesList();
    }
}

function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotesToStorage();
    
    if (notes.length > 0) {
        selectNote(notes[0].id);
    } else {
        createNewNote();
    }
    
    renderNotesList();
    closeDeleteModal();
}

// Auto Save
function triggerAutoSave() {
    autoSaveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    autoSaveStatus.classList.add('saving');
    
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        updateCurrentNote();
        autoSaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
        autoSaveStatus.classList.remove('saving');
    }, 500);
}

// Search
function filterNotes(query) {
    searchQuery = query.toLowerCase();
    renderNotesList();
}

// Render Notes List
function renderNotesList() {
    const filteredNotes = notes.filter(note => {
        if (!searchQuery) return true;
        
        const title = note.title.toLowerCase();
        const content = note.content.replace(/<[^>]*>/g, '').toLowerCase();
        
        return title.includes(searchQuery) || content.includes(searchQuery);
    });
    
    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <p>${searchQuery ? 'No notes found' : 'No notes yet. Create one!'}</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = filteredNotes.map(note => `
        <div class="note-item ${note.id === currentNoteId ? 'active' : ''}" data-id="${note.id}">
            <div class="note-item-title">${note.title || 'Untitled Note'}</div>
            <div class="note-item-preview">${getPreviewText(note.content)}</div>
            <div class="note-item-date">${formatDate(note.updatedAt)}</div>
        </div>
    `).join('');
    
    // Add click listeners to note items
    document.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', () => {
            selectNote(item.dataset.id);
        });
    });
}

function updateNotesListActiveState() {
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === currentNoteId);
    });
}

function getPreviewText(html) {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text || 'No content';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Rich Text Editor Functions
function execCommand(command, value = null) {
    editor.focus();
    document.execCommand(command, false, value);
    triggerAutoSave();
    updateToolbarState();
}

function setTextColor() {
    const color = colorPicker.value;
    execCommand('foreColor', color);
}

function setHighlight() {
    execCommand('backColor', '#ffeb3b');
}

// Toolbar Button State
function updateToolbarState() {
    boldBtn.classList.toggle('active', document.queryCommandState('bold'));
    italicBtn.classList.toggle('active', document.queryCommandState('italic'));
    underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    strikeBtn.classList.toggle('active', document.queryCommandState('strikeThrough'));
}

// Modal Functions
function showDeleteModal() {
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
}

// Event Listeners Setup
function setupEventListeners() {
    // New note button
    newNoteBtn.addEventListener('click', createNewNote);
    
    // Search
    searchInput.addEventListener('input', (e) => filterNotes(e.target.value));
    
    // Delete note
    deleteNoteBtn.addEventListener('click', showDeleteModal);
    cancelDelete.addEventListener('click', closeDeleteModal);
    confirmDelete.addEventListener('click', deleteCurrentNote);
    
    // Close modal on outside click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
    
    // Editor events
    editor.addEventListener('input', () => {
        triggerAutoSave();
        updateToolbarState();
    });
    
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    
    // Title input
    noteTitle.addEventListener('input', triggerAutoSave);
    
    // Toolbar buttons
    boldBtn.addEventListener('click', () => execCommand('bold'));
    italicBtn.addEventListener('click', () => execCommand('italic'));
    underlineBtn.addEventListener('click', () => execCommand('underline'));
    strikeBtn.addEventListener('click', () => execCommand('strikeThrough'));
    ulBtn.addEventListener('click', () => execCommand('insertUnorderedList'));
    olBtn.addEventListener('click', () => execCommand('insertOrderedList'));
    colorBtn.addEventListener('click', () => colorPicker.click());
    colorPicker.addEventListener('input', setTextColor);
    highlightBtn.addEventListener('click', setHighlight);
    undoBtn.addEventListener('click', () => execCommand('undo'));
    redoBtn.addEventListener('click', () => execCommand('redo'));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    break;
                case 's':
                    e.preventDefault();
                    updateCurrentNote();
                    autoSaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
                    break;
                case 'n':
                    e.preventDefault();
                    createNewNote();
                    break;
            }
        }
    });
}

// Initialize the app
init();
