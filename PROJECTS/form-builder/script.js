/**
 * FORM BUILDER - Modern Drag & Drop Application
 * Pure Vanilla JavaScript
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    formFields: [],
    selectedField: null,
    undoStack: [],
    redoStack: [],
    maxHistory: 50,
    isDarkMode: false,
    currentExportType: 'json'
};

// Field type configurations
const FIELD_TYPES = {
    text: {
        label: 'Text Input',
        icon: 'text',
        hasOptions: false,
        hasPlaceholder: true,
        hasDefault: true
    },
    textarea: {
        label: 'Textarea',
        icon: 'textarea',
        hasOptions: false,
        hasPlaceholder: true,
        hasDefault: false
    },
    number: {
        label: 'Number',
        icon: 'number',
        hasOptions: false,
        hasPlaceholder: true,
        hasDefault: true
    },
    email: {
        label: 'Email',
        icon: 'email',
        hasOptions: false,
        hasPlaceholder: true,
        hasDefault: false
    },
    password: {
        label: 'Password',
        icon: 'password',
        hasOptions: false,
        hasPlaceholder: true,
        hasDefault: false
    },
    select: {
        label: 'Dropdown',
        icon: 'select',
        hasOptions: true,
        hasPlaceholder: true,
        hasDefault: false
    },
    checkbox: {
        label: 'Checkbox',
        icon: 'checkbox',
        hasOptions: true,
        hasPlaceholder: false,
        hasDefault: false
    },
    radio: {
        label: 'Radio Button',
        icon: 'radio',
        hasOptions: true,
        hasPlaceholder: false,
        hasDefault: false
    },
    date: {
        label: 'Date Picker',
        icon: 'date',
        hasOptions: false,
        hasPlaceholder: false,
        hasDefault: true
    },
    button: {
        label: 'Button',
        icon: 'button',
        hasOptions: false,
        hasPlaceholder: false,
        hasDefault: true
    }
};

// DOM Elements
const DOM = {
    // Toolbox
    fieldItems: document.querySelectorAll('.field-item'),
    formCanvas: document.getElementById('formCanvas'),
    emptyState: document.getElementById('emptyState'),
    formFieldCount: document.getElementById('formFieldCount'),
    
    // Buttons
    saveBtn: document.getElementById('saveBtn'),
    clearBtn: document.getElementById('clearBtn'),
    exportBtn: document.getElementById('exportBtn'),
    undoBtn: document.getElementById('undoBtn'),
    redoBtn: document.getElementById('redoBtn'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Field Editor Modal
    fieldEditorModal: document.getElementById('fieldEditorModal'),
    closeModal: document.getElementById('closeModal'),
    fieldLabel: document.getElementById('fieldLabel'),
    fieldPlaceholder: document.getElementById('fieldPlaceholder'),
    fieldDefault: document.getElementById('fieldDefault'),
    fieldRequired: document.getElementById('fieldRequired'),
    optionsGroup: document.getElementById('optionsGroup'),
    optionsList: document.getElementById('optionsList'),
    addOptionBtn: document.getElementById('addOptionBtn'),
    cancelEdit: document.getElementById('cancelEdit'),
    saveField: document.getElementById('saveField'),
    
    // Export Modal
    exportModal: document.getElementById('exportModal'),
    closeExportModal: document.getElementById('closeExportModal'),
    exportPreview: document.getElementById('exportPreview'),
    exportTabs: document.querySelectorAll('.export-tab'),
    copyExportBtn: document.getElementById('copyExportBtn'),
    downloadExportBtn: document.getElementById('downloadExportBtn'),
    
    // Import Modal
    importModal: document.getElementById('importModal'),
    closeImportModal: document.getElementById('closeImportModal'),
    importJson: document.getElementById('importJson'),
    cancelImport: document.getElementById('cancelImport'),
    importFormBtn: document.getElementById('importFormBtn'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    loadFromStorage();
    setupEventListeners();
    loadTheme();
    updateFieldCount();
    renderFormFields();
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Drag and Drop - Field Items
    DOM.fieldItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Drag and Drop - Canvas
    DOM.formCanvas.addEventListener('dragover', handleDragOver);
    DOM.formCanvas.addEventListener('drop', handleDrop);
    DOM.formCanvas.addEventListener('dragleave', handleDragLeave);

    // Buttons
    DOM.saveBtn.addEventListener('click', saveToStorage);
    DOM.clearBtn.addEventListener('click', clearForm);
    DOM.exportBtn.addEventListener('click', openExportModal);
    DOM.undoBtn.addEventListener('click', undo);
    DOM.redoBtn.addEventListener('click', redo);
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // Field Editor Modal
    DOM.closeModal.addEventListener('click', closeFieldEditor);
    DOM.cancelEdit.addEventListener('click', closeFieldEditor);
    DOM.saveField.addEventListener('click', saveFieldChanges);
    DOM.addOptionBtn.addEventListener('click', addOption);
    DOM.fieldEditorModal.addEventListener('click', (e) => {
        if (e.target === DOM.fieldEditorModal) closeFieldEditor();
    });

    // Export Modal
    DOM.closeExportModal.addEventListener('click', closeExportModal);
    DOM.exportModal.addEventListener('click', (e) => {
        if (e.target === DOM.exportModal) closeExportModal();
    });
    DOM.exportTabs.forEach(tab => {
        tab.addEventListener('click', () => switchExportTab(tab.dataset.tab));
    });
    DOM.copyExportBtn.addEventListener('click', copyExportCode);
    DOM.downloadExportBtn.addEventListener('click', downloadExportCode);

    // Import Modal
    DOM.closeImportModal.addEventListener('click', closeImportModal);
    DOM.cancelImport.addEventListener('click', closeImportModal);
    DOM.importFormBtn.addEventListener('click', importForm);
    DOM.importModal.addEventListener('click', (e) => {
        if (e.target === DOM.importModal) closeImportModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ============================================
// DRAG AND DROP HANDLERS
// ============================================

let draggedFieldType = null;
let draggedFieldId = null;

function handleDragStart(e) {
    draggedFieldType = e.target.dataset.fieldType;
    draggedFieldId = null;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', draggedFieldType);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedFieldType = null;
    draggedFieldId = null;
    DOM.formCanvas.classList.remove('drag-over');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    DOM.formCanvas.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!DOM.formCanvas.contains(e.relatedTarget)) {
        DOM.formCanvas.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    DOM.formCanvas.classList.remove('drag-over');

    if (draggedFieldType) {
        // Add new field from toolbox
        addField(draggedFieldType);
    } else if (draggedFieldId) {
        // Reorder existing field - handled in field rendering
        showToast('Field reordered', 'info');
    }
}

// ============================================
// FIELD MANAGEMENT
// ============================================

function generateFieldId() {
    return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function addField(fieldType) {
    saveToHistory();
    
    const fieldConfig = FIELD_TYPES[fieldType];
    const newField = {
        id: generateFieldId(),
        type: fieldType,
        label: fieldConfig.label,
        placeholder: '',
        required: false,
        defaultValue: '',
        options: fieldConfig.hasOptions ? ['Option 1', 'Option 2'] : []
    };

    AppState.formFields.push(newField);
    updateFieldCount();
    renderFormFields();
    saveToStorage();
    showToast(`${fieldConfig.label} field added`, 'success');
}

function deleteField(fieldId) {
    saveToHistory();
    AppState.formFields = AppState.formFields.filter(f => f.id !== fieldId);
    if (AppState.selectedField === fieldId) {
        AppState.selectedField = null;
    }
    updateFieldCount();
    renderFormFields();
    saveToStorage();
    showToast('Field deleted', 'info');
}

function duplicateField(fieldId) {
    saveToHistory();
    const fieldIndex = AppState.formFields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const originalField = AppState.formFields[fieldIndex];
    const duplicatedField = {
        ...originalField,
        id: generateFieldId(),
        label: originalField.label + ' (Copy)',
        options: originalField.options ? [...originalField.options] : []
    };

    AppState.formFields.splice(fieldIndex + 1, 0, duplicatedField);
    updateFieldCount();
    renderFormFields();
    saveToStorage();
    showToast('Field duplicated', 'success');
}

function updateFieldCount() {
    const count = AppState.formFields.length;
    DOM.formFieldCount.textContent = `${count} field${count !== 1 ? 's' : ''}`;
}

// ============================================
// RENDER FORM FIELDS
// ============================================

function renderFormFields() {
    // Clear existing rendered fields (keep empty state)
    const existingFields = DOM.formCanvas.querySelectorAll('.form-field');
    existingFields.forEach(f => f.remove());

    if (AppState.formFields.length === 0) {
        DOM.emptyState.classList.remove('hidden');
    } else {
        DOM.emptyState.classList.add('hidden');
        
        AppState.formFields.forEach((field, index) => {
            const fieldElement = createFieldElement(field, index);
            DOM.formCanvas.appendChild(fieldElement);
        });
    }
}

function createFieldElement(field, index) {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.dataset.fieldId = field.id;
    div.draggable = true;
    
    if (AppState.selectedField === field.id) {
        div.classList.add('selected');
    }

    // Drag handling for reordering
    div.addEventListener('dragstart', (e) => {
        draggedFieldId = field.id;
        draggedFieldType = null;
        div.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        draggedFieldId = null;
    });

    div.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedFieldId && draggedFieldId !== field.id) {
            // Reorder logic
            const rect = div.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                div.parentNode.insertBefore(div, div.previousElementSibling);
            } else {
                div.parentNode.insertBefore(div.nextElementSibling, div);
            }
        }
    });

    div.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedFieldId && draggedFieldId !== field.id) {
            saveToHistory();
            // Reorder fields in array
            const fromIndex = AppState.formFields.findIndex(f => f.id === draggedFieldId);
            const toIndex = AppState.formFields.findIndex(f => f.id === field.id);
            
            const [movedField] = AppState.formFields.splice(fromIndex, 1);
            const newToIndex = AppState.formFields.findIndex(f => f.id === field.id);
            AppState.formFields.splice(newToIndex, 0, movedField);
            
            renderFormFields();
            saveToStorage();
        }
    });

    div.addEventListener('click', (e) => {
        if (!e.target.closest('.field-action-btn')) {
            selectField(field.id);
        }
    });

    const fieldConfig = FIELD_TYPES[field.type];
    
    div.innerHTML = `
        <div class="field-header">
            <div class="field-label-group">
                <span class="field-label">${field.label}</span>
                ${field.required ? '<span class="required-star">*</span>' : ''}
            </div>
            <div class="field-actions">
                <button class="field-action-btn duplicate" title="Duplicate" onclick="duplicateField('${field.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
                <button class="field-action-btn delete" title="Delete" onclick="deleteField('${field.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="field-preview">
            ${renderFieldPreview(field)}
        </div>
    `;

    return div;
}

function renderFieldPreview(field) {
    const placeholder = field.placeholder || 'Enter value...';
    
    switch (field.type) {
        case 'text':
            return `<input type="text" placeholder="${placeholder}" value="${field.defaultValue || ''}" disabled>`;
        
        case 'textarea':
            return `<textarea placeholder="${placeholder}" disabled></textarea>`;
        
        case 'number':
            return `<input type="number" placeholder="${placeholder}" value="${field.defaultValue || ''}" disabled>`;
        
        case 'email':
            return `<input type="email" placeholder="${placeholder}" disabled>`;
        
        case 'password':
            return `<input type="password" placeholder="${placeholder}" disabled>`;
        
        case 'select':
            const options = field.options.map(opt => `<option value="${opt.toLowerCase().replace(/\s+/g, '_')}">${opt}</option>`).join('');
            return `<select disabled>
                <option>${placeholder}</option>
                ${options}
            </select>`;
        
        case 'checkbox':
            return `<div class="checkbox-group">
                ${field.options.map(opt => `
                    <label class="checkbox-item">
                        <input type="checkbox" disabled>
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>`;
        
        case 'radio':
            return `<div class="radio-group">
                ${field.options.map(opt => `
                    <label class="radio-item">
                        <input type="radio" disabled>
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>`;
        
        case 'date':
            return `<input type="date" value="${field.defaultValue || ''}" disabled>`;
        
        case 'button':
            return `<button class="button-preview">${field.label}</button>`;
        
        default:
            return `<input type="text" disabled>`;
    }
}

// ============================================
// FIELD SELECTION & EDITING
// ============================================

function selectField(fieldId) {
    AppState.selectedField = fieldId;
    
    // Update visual selection
    document.querySelectorAll('.form-field').forEach(f => {
        f.classList.toggle('selected', f.dataset.fieldId === fieldId);
    });

    openFieldEditor(fieldId);
}

function openFieldEditor(fieldId) {
    const field = AppState.formFields.find(f => f.id === fieldId);
    if (!field) return;

    const fieldConfig = FIELD_TYPES[field.type];
    
    // Set field values
    DOM.fieldLabel.value = field.label;
    DOM.fieldPlaceholder.value = field.placeholder || '';
    DOM.fieldDefault.value = field.defaultValue || '';
    DOM.fieldRequired.checked = field.required;

    // Show/hide appropriate inputs
    DOM.fieldPlaceholder.closest('.form-group').style.display = fieldConfig.hasPlaceholder ? 'block' : 'none';
    DOM.fieldDefault.closest('.form-group').style.display = fieldConfig.hasDefault ? 'block' : 'none';
    DOM.optionsGroup.style.display = fieldConfig.hasOptions ? 'block' : 'none';

    // Render options
    DOM.optionsList.innerHTML = '';
    if (fieldConfig.hasOptions && field.options) {
        field.options.forEach((option, index) => {
            addOptionItem(option, index);
        });
    }

    DOM.fieldEditorModal.classList.add('active');
    DOM.fieldLabel.focus();
}

function closeFieldEditor() {
    DOM.fieldEditorModal.classList.remove('active');
    AppState.selectedField = null;
    
    // Remove selection visual
    document.querySelectorAll('.form-field').forEach(f => {
        f.classList.remove('selected');
    });
}

function saveFieldChanges() {
    if (!AppState.selectedField) return;

    const field = AppState.formFields.find(f => f.id === AppState.selectedField);
    if (!field) return;

    saveToHistory();

    field.label = DOM.fieldLabel.value.trim() || field.label;
    field.placeholder = DOM.fieldPlaceholder.value.trim();
    field.defaultValue = DOM.fieldDefault.value.trim();
    field.required = DOM.fieldRequired.checked;

    // Save options
    if (FIELD_TYPES[field.type].hasOptions) {
        const optionInputs = DOM.optionsList.querySelectorAll('input');
        field.options = Array.from(optionInputs).map(input => input.value.trim()).filter(v => v);
    }

    closeFieldEditor();
    renderFormFields();
    saveToStorage();
    showToast('Field updated', 'success');
}

function addOption() {
    addOptionItem('', AppState.formFields.find(f => f.id === AppState.selectedField)?.options.length || 0);
}

function addOptionItem(value = '', index = 0) {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
        <input type="text" class="form-input" placeholder="Option ${index + 1}" value="${value}">
        <button class="option-remove" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    div.querySelector('.option-remove').addEventListener('click', () => {
        div.remove();
    });

    DOM.optionsList.appendChild(div);
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveToStorage() {
    try {
        localStorage.setItem('formBuilderFields', JSON.stringify(AppState.formFields));
        localStorage.setItem('formBuilderTheme', AppState.isDarkMode ? 'dark' : 'light');
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadFromStorage() {
    try {
        const savedFields = localStorage.getItem('formBuilderFields');
        if (savedFields) {
            AppState.formFields = JSON.parse(savedFields);
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function loadTheme() {
    const savedTheme = localStorage.getItem('formBuilderTheme');
    if (savedTheme === 'dark') {
        AppState.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    document.documentElement.setAttribute('data-theme', AppState.isDarkMode ? 'dark' : 'light');
    saveToStorage();
    showToast(`Switched to ${AppState.isDarkMode ? 'dark' : 'light'} mode`, 'info');
}

// ============================================
// UNDO / REDO
// ============================================

function saveToHistory() {
    AppState.undoStack.push(JSON.stringify(AppState.formFields));
    if (AppState.undoStack.length > AppState.maxHistory) {
        AppState.undoStack.shift();
    }
    AppState.redoStack = [];
    updateUndoRedoButtons();
}

function undo() {
    if (AppState.undoStack.length === 0) return;
    
    AppState.redoStack.push(JSON.stringify(AppState.formFields));
    const previousState = AppState.undoStack.pop();
    AppState.formFields = JSON.parse(previousState);
    
    updateFieldCount();
    renderFormFields();
    saveToStorage();
    updateUndoRedoButtons();
    showToast('Undo', 'info');
}

function redo() {
    if (AppState.redoStack.length === 0) return;
    
    AppState.undoStack.push(JSON.stringify(AppState.formFields));
    const nextState = AppState.redoStack.pop();
    AppState.formFields = JSON.parse(nextState);
    
    updateFieldCount();
    renderFormFields();
    saveToStorage();
    updateUndoRedoButtons();
    showToast('Redo', 'info');
}

function updateUndoRedoButtons() {
    DOM.undoBtn.disabled = AppState.undoStack.length === 0;
    DOM.redoBtn.disabled = AppState.redoStack.length === 0;
    DOM.undoBtn.style.opacity = AppState.undoStack.length === 0 ? '0.5' : '1';
    DOM.redoBtn.style.opacity = AppState.redoStack.length === 0 ? '0.5' : '1';
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function openExportModal() {
    if (AppState.formFields.length === 0) {
        showToast('No fields to export', 'error');
        return;
    }
    updateExportPreview();
    DOM.exportModal.classList.add('active');
}

function closeExportModal() {
    DOM.exportModal.classList.remove('active');
}

function switchExportTab(type) {
    AppState.currentExportType = type;
    DOM.exportTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === type);
    });
    updateExportPreview();
}

function updateExportPreview() {
    if (AppState.currentExportType === 'json') {
        const jsonOutput = JSON.stringify(AppState.formFields, null, 2);
        DOM.exportPreview.textContent = jsonOutput;
    } else {
        const htmlOutput = generateHTML();
        DOM.exportPreview.textContent = htmlOutput;
    }
}

function generateHTML() {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Form</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 6px; font-weight: 500; }
        input, textarea, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        button { background: #6366f1; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        button:hover { background: #4f46e5; }
    </style>
</head>
<body>
    <h1>Form</h1>
    <form>
`;

    AppState.formFields.forEach(field => {
        const requiredAttr = field.required ? ' required' : '';
        
        html += `        <div class="form-group">\n`;
        html += `            <label>${field.label}${field.required ? ' *' : ''}</label>\n`;
        
        switch (field.type) {
            case 'text':
                html += `            <input type="text" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" placeholder="${field.placeholder || ''}"${requiredAttr}>\n`;
                break;
            case 'textarea':
                html += `            <textarea name="${field.label.toLowerCase().replace(/\s+/g, '_')}" placeholder="${field.placeholder || ''}"${requiredAttr}></textarea>\n`;
                break;
            case 'number':
                html += `            <input type="number" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" placeholder="${field.placeholder || ''}"${requiredAttr}>\n`;
                break;
            case 'email':
                html += `            <input type="email" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" placeholder="${field.placeholder || ''}"${requiredAttr}>\n`;
                break;
            case 'password':
                html += `            <input type="password" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" placeholder="${field.placeholder || ''}"${requiredAttr}>\n`;
                break;
            case 'date':
                html += `            <input type="date" name="${field.label.toLowerCase().replace(/\s+/g, '_')}"${requiredAttr}>\n`;
                break;
            case 'select':
                html += `            <select name="${field.label.toLowerCase().replace(/\s+/g, '_')}"${requiredAttr}>\n`;
                html += `                <option value="">${field.placeholder || 'Select an option'}</option>\n`;
                field.options.forEach(opt => {
                    html += `                <option value="${opt.toLowerCase().replace(/\s+/g, '_')}">${opt}</option>\n`;
                });
                html += `            </select>\n`;
                break;
            case 'checkbox':
                field.options.forEach(opt => {
                    html += `            <label><input type="checkbox" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" value="${opt.toLowerCase().replace(/\s+/g, '_')}"> ${opt}</label>\n`;
                });
                break;
            case 'radio':
                field.options.forEach(opt => {
                    html += `            <label><input type="radio" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" value="${opt.toLowerCase().replace(/\s+/g, '_')}"> ${opt}</label>\n`;
                });
                break;
            case 'button':
                html += `            <button type="submit">${field.label}</button>\n`;
                break;
        }
        
        html += `        </div>\n`;
    });

    html += `        <button type="submit">Submit</button>
    </form>
</body>
</html>`;

    return html;
}

function copyExportCode() {
    const code = DOM.exportPreview.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function downloadExportCode() {
    const code = DOM.exportPreview.textContent;
    const filename = AppState.currentExportType === 'json' ? 'form-schema.json' : 'form.html';
    const mimeType = AppState.currentExportType === 'json' ? 'application/json' : 'text/html';
    
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded ${filename}`, 'success');
}

// ============================================
// IMPORT FUNCTIONALITY
// ============================================

function openImportModal() {
    DOM.importModal.classList.add('active');
}

function closeImportModal() {
    DOM.importModal.classList.remove('active');
    DOM.importJson.value = '';
}

function importForm() {
    const jsonString = DOM.importJson.value.trim();
    
    if (!jsonString) {
        showToast('Please paste JSON', 'error');
        return;
    }

    try {
        const importedFields = JSON.parse(jsonString);
        
        if (!Array.isArray(importedFields)) {
            throw new Error('Invalid format');
        }

        // Validate fields
        importedFields.forEach(field => {
            if (!field.type || !field.label) {
                throw new Error('Invalid field format');
            }
        });

        saveToHistory();
        AppState.formFields = importedFields;
        
        updateFieldCount();
        renderFormFields();
        saveToStorage();
        closeImportModal();
        
        showToast(`Imported ${importedFields.length} fields`, 'success');
    } catch (e) {
        showToast('Invalid JSON format', 'error');
    }
}

// ============================================
// CLEAR FORM
// ============================================

function clearForm() {
    if (AppState.formFields.length === 0) {
        showToast('Form is already empty', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear all fields?')) {
        saveToHistory();
        AppState.formFields = [];
        AppState.selectedField = null;
        
        updateFieldCount();
        renderFormFields();
        saveToStorage();
        
        showToast('Form cleared', 'info');
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Z = Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }
    
    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
    }
    
    // Escape = Close modals
    if (e.key === 'Escape') {
        closeFieldEditor();
        closeExportModal();
        closeImportModal();
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
        ${icons[type] || icons.info}
        <span class="toast-message">${message}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// INITIALIZE APP
// ============================================

// Make functions globally available for onclick handlers
window.deleteField = deleteField;
window.duplicateField = duplicateField;

// Initialize
document.addEventListener('DOMContentLoaded', init);
