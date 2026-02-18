/**
 * File Uploader - Drag & Drop
 * A modern file uploader with drag and drop functionality
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB in bytes
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    uploadSpeed: 50, // ms per progress update
    progressIncrement: 5, // percentage increase per update
    storageKey: 'uploadedFiles'
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    browseBtn: document.getElementById('browseBtn'),
    fileList: document.getElementById('fileList'),
    actionsBar: document.getElementById('actionsBar'),
    fileCount: document.getElementById('fileCount'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    errorContainer: document.getElementById('errorContainer'),
    themeToggle: document.getElementById('themeToggle'),
    imageModal: document.getElementById('imageModal'),
    modalImage: document.getElementById('modalImage'),
    modalClose: document.getElementById('modalClose')
};

// ============================================
// State
// ============================================
let files = [];
let uploadedFiles = [];

// ============================================
// Initialize Application
// ============================================
function init() {
    loadTheme();
    loadFilesFromStorage();
    setupEventListeners();
    updateFileCount();
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Drag and Drop Events
    elements.dropZone.addEventListener('dragenter', handleDragEnter);
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);
    
    // Click to Upload
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.fileInput.click();
    });
    
    // File Input Change
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Clear All Button
    elements.clearAllBtn.addEventListener('click', clearAllFiles);
    
    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Modal Close
    elements.modalClose.addEventListener('click', closeModal);
    elements.imageModal.addEventListener('click', (e) => {
        if (e.target === elements.imageModal) closeModal();
    });
    
    // Prevent default drag behaviors on document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// Drag and Drop Handlers
// ============================================
function handleDragEnter(e) {
    elements.dropZone.classList.add('drag-over');
}

function handleDragOver(e) {
    elements.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    // Check if we're leaving the drop zone entirely
    const rect = elements.dropZone.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        elements.dropZone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    elements.dropZone.classList.remove('drag-over');
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
    }
}

// ============================================
// File Selection Handler
// ============================================
function handleFileSelect(e) {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
        processFiles(selectedFiles);
    }
    // Reset input to allow selecting same file again
    elements.fileInput.value = '';
}

// ============================================
// Process Files
// ============================================
function processFiles(fileList) {
    clearErrors();
    
    const newFiles = Array.from(fileList);
    let hasValidFiles = false;
    
    newFiles.forEach(file => {
        // Validate file
        const validation = validateFile(file);
        
        if (validation.valid) {
            const fileId = generateFileId();
            const fileData = {
                id: fileId,
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                uploaded: false
            };
            
            files.push(fileData);
            hasValidFiles = true;
            
            // Simulate upload
            simulateUpload(fileData);
        } else {
            showError(validation.message);
        }
    });
    
    if (hasValidFiles) {
        renderFiles();
        updateFileCount();
        saveToStorage();
    }
}

// ============================================
// File Validation
// ============================================
function validateFile(file) {
    // Check file type
    if (!CONFIG.allowedTypes.includes(file.type)) {
        return {
            valid: false,
            message: `Invalid file type: ${file.name}. Only images are allowed (JPG, PNG, GIF, WEBP).`
        };
    }
    
    // Check file size
    if (file.size > CONFIG.maxFileSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (CONFIG.maxFileSize / (1024 * 1024)).toFixed(0);
        return {
            valid: false,
            message: `File too large: ${file.name} (${sizeMB}MB). Maximum size is ${maxSizeMB}MB.`
        };
    }
    
    return { valid: true };
}

// ============================================
// Simulate Upload
// ============================================
function simulateUpload(fileData) {
    const interval = setInterval(() => {
        const file = files.find(f => f.id === fileData.id);
        
        if (file) {
            file.progress += CONFIG.progressIncrement;
            
            if (file.progress >= 100) {
                file.progress = 100;
                file.uploaded = true;
                clearInterval(interval);
                
                // Update uploaded files list
                const existingIndex = uploadedFiles.findIndex(f => f.name === file.name);
                if (existingIndex === -1) {
                    uploadedFiles.push({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        uploadedAt: new Date().toISOString()
                    });
                    saveToStorage();
                }
            }
            
            updateFileProgress(file.id, file.progress);
        } else {
            clearInterval(interval);
        }
    }, CONFIG.uploadSpeed);
}

// ============================================
// Render Files
// ============================================
function renderFiles() {
    elements.fileList.innerHTML = '';
    
    files.forEach(fileData => {
        const fileCard = createFileCard(fileData);
        elements.fileList.appendChild(fileCard);
    });
}

function createFileCard(fileData) {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.id = `file-${fileData.id}`;
    
    const isImage = fileData.type.startsWith('image/');
    
    card.innerHTML = `
        <div class="file-preview">
            ${isImage ? 
                `<img src="${URL.createObjectURL(fileData.file)}" alt="${fileData.name}" id="preview-${fileData.id}">` :
                `<i class="fas fa-file"></i>`
            }
        </div>
        <div class="file-info">
            <div class="file-name" title="${fileData.name}">${fileData.name}</div>
            <div class="file-size">${formatFileSize(fileData.size)}</div>
            <div class="file-progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-${fileData.id}" style="width: ${fileData.progress}%"></div>
                </div>
                <div class="progress-text">
                    <span>${fileData.uploaded ? 'Uploaded' : 'Uploading...'}</span>
                    <span id="percent-${fileData.id}">${fileData.progress}%</span>
                </div>
            </div>
        </div>
        <div class="file-actions">
            ${isImage ? `
                <button class="file-action-btn view" onclick="viewImage('${fileData.id}')" title="View Image">
                    <i class="fas fa-eye"></i>
                </button>
            ` : ''}
            <button class="file-action-btn remove" onclick="removeFile('${fileData.id}')" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    return card;
}

function updateFileProgress(fileId, progress) {
    const progressBar = document.getElementById(`progress-${fileId}`);
    const percentText = document.getElementById(`percent-${fileId}`);
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (percentText) {
        percentText.textContent = `${progress}%`;
        
        if (progress >= 100) {
            const progressText = percentText.previousElementSibling;
            if (progressText) {
                progressText.textContent = 'Uploaded';
            }
        }
    }
}

// ============================================
// File Actions
// ============================================
function removeFile(fileId) {
    const index = files.findIndex(f => f.id === fileId);
    if (index !== -1) {
        files.splice(index, 1);
        renderFiles();
        updateFileCount();
        saveToStorage();
    }
}

function clearAllFiles() {
    if (files.length === 0) return;
    
    if (confirm('Are you sure you want to remove all files?')) {
        files = [];
        renderFiles();
        updateFileCount();
        saveToStorage();
    }
}

function viewImage(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file && file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file.file);
        elements.modalImage.src = imageUrl;
        elements.imageModal.classList.add('active');
    }
}

function closeModal() {
    elements.imageModal.classList.remove('active');
    // Clean up blob URL
    if (elements.modalImage.src) {
        URL.revokeObjectURL(elements.modalImage.src);
    }
}

// ============================================
// UI Updates
// ============================================
function updateFileCount() {
    const count = files.length;
    elements.fileCount.textContent = count === 0 
        ? 'No files selected' 
        : `${count} file${count !== 1 ? 's' : ''} selected`;
    
    // Show/hide actions bar
    if (count > 0) {
        elements.actionsBar.classList.add('visible');
    } else {
        elements.actionsBar.classList.remove('visible');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    elements.errorContainer.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function clearErrors() {
    elements.errorContainer.innerHTML = '';
}

// ============================================
// Theme Toggle
// ============================================
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const icon = elements.themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = elements.themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================
// Local Storage
// ============================================
function saveToStorage() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(uploadedFiles));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFilesFromStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            uploadedFiles = JSON.parse(saved);
            // Note: We can't restore actual files, just their names
            // In a real app, you'd handle file persistence differently
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

// ============================================
// Utility Functions
// ============================================
function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', init);
