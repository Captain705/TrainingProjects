/**
 * Markdown Editor - JavaScript
 * A modern Markdown Editor with live preview
 */

// DOM Elements
const markdownInput = document.getElementById('markdownInput');
const previewOutput = document.getElementById('previewOutput');
const editorPanel = document.getElementById('editorPanel');
const previewPanel = document.getElementById('previewPanel');
const themeToggle = document.getElementById('themeToggle');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const downloadBtn = document.getElementById('downloadBtn');
const exportBtn = document.getElementById('exportBtn');
const wordCountEl = document.getElementById('wordCount');
const charCountEl = document.getElementById('charCount');
const saveStatus = document.getElementById('saveStatus');
const appContainer = document.querySelector('.app-container');
const toolbarBtns = document.querySelectorAll('.toolbar-btn');

// Local Storage Keys
const STORAGE_KEY = 'markdown-editor-content';
const THEME_KEY = 'markdown-editor-theme';

// Default Markdown Content
const defaultContent = `# Welcome to Markdown Editor

A modern, minimal, and powerful Markdown editor with live preview.

## Features

- **Live Preview**: See your formatted text as you type
- **Toolbar**: Quick formatting buttons
- **Local Storage**: Your content is auto-saved
- **Dark/Light Mode**: Toggle themes
- **Export Options**: Download .md or export as HTML

## Supported Syntax

### Text Formatting

**Bold text** and *italic text*

~~Strikethrough text~~

### Lists

#### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

#### Ordered List
1. First item
2. Second item
3. Third item

### Code

Inline \`code\` example.

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Links and Images

[Visit GitHub](https://github.com)

---

*Start editing to see the magic happen!*
`;

// Initialize marked.js
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
});

/**
 * Initialize the application
 */
function init() {
    loadContent();
    loadTheme();
    updatePreview();
    updateStats();
    setupEventListeners();
    setupToolbarActions();
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Input event for live preview
    markdownInput.addEventListener('input', () => {
        updatePreview();
        updateStats();
        saveContent();
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Fullscreen toggle
    fullscreenToggle.addEventListener('click', toggleFullscreen);

    // Download button
    downloadBtn.addEventListener('click', downloadMarkdown);

    // Export button
    exportBtn.addEventListener('click', exportHTML);

    // Panel click to highlight
    editorPanel.addEventListener('click', () => {
        editorPanel.classList.add('active');
        previewPanel.classList.remove('active');
    });

    previewPanel.addEventListener('click', () => {
        previewPanel.classList.add('active');
        editorPanel.classList.remove('active');
    });

    // Keyboard shortcuts
    markdownInput.addEventListener('keydown', handleKeyboardShortcuts);

    // Handle visibility change for auto-save
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadContent();
        }
    });
}

/**
 * Update Preview
 */
function updatePreview() {
    const markdown = markdownInput.value;
    const html = marked.parse(markdown);
    previewOutput.innerHTML = html;
}

/**
 * Update Word and Character Count
 */
function updateStats() {
    const text = markdownInput.value;
    const trimmedText = text.trim();
    
    // Character count
    charCountEl.textContent = text.length;
    
    // Word count
    if (trimmedText === '') {
        wordCountEl.textContent = '0';
    } else {
        const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
        wordCountEl.textContent = words.length;
    }
}

/**
 * Save Content to Local Storage
 */
function saveContent() {
    const content = markdownInput.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    
    // Show save indicator
    saveStatus.textContent = 'Saving...';
    setTimeout(() => {
        saveStatus.textContent = 'Saved';
    }, 500);
}

/**
 * Load Content from Local Storage
 */
function loadContent() {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    
    if (savedContent) {
        try {
            const content = JSON.parse(savedContent);
            markdownInput.value = content;
        } catch (e) {
            markdownInput.value = defaultContent;
        }
    } else {
        markdownInput.value = defaultContent;
    }
}

/**
 * Toggle Theme (Dark/Light Mode)
 */
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    
    // Update theme icon
    const icon = themeToggle.querySelector('.icon');
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

/**
 * Load Theme from Local Storage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.body.setAttribute('data-theme', theme);
    
    const icon = themeToggle.querySelector('.icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Toggle Fullscreen Mode
 */
function toggleFullscreen() {
    appContainer.classList.toggle('fullscreen');
    
    const icon = fullscreenToggle.querySelector('.icon');
    icon.textContent = appContainer.classList.contains('fullscreen') ? '⛶' : '⛶';
    
    if (appContainer.classList.contains('fullscreen')) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
                console.log('Exit fullscreen error:', err);
            });
        }
    }
}

/**
 * Download Markdown File
 */
function downloadMarkdown() {
    const content = markdownInput.value;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export Preview as HTML
 */
function exportHTML() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
        h2 { border-bottom: 1px solid #eee; padding-bottom: 0.375rem; }
        code {
            background: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Consolas', monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
        }
        pre code {
            background: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #6366f1;
            margin: 1em 0;
            padding: 0.5em 1em;
            background: #f9f9f9;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        a { color: #6366f1; }
    </style>
</head>
<body>
${previewOutput.innerHTML}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Setup Toolbar Actions
 */
function setupToolbarActions() {
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            insertMarkdown(action);
        });
    });
}

/**
 * Insert Markdown Syntax at Cursor Position
 */
function insertMarkdown(action) {
    const textarea = markdownInput;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let insertion = '';
    let cursorOffset = 0;
    
    switch (action) {
        case 'bold':
            insertion = `**${selectedText || 'bold text'}**`;
            cursorOffset = selectedText ? insertion.length : 2;
            break;
            
        case 'italic':
            insertion = `*${selectedText || 'italic text'}*`;
            cursorOffset = selectedText ? insertion.length : 1;
            break;
            
        case 'heading':
            insertion = `## ${selectedText || 'Heading'}`;
            cursorOffset = insertion.length;
            break;
            
        case 'list-ul':
            insertion = `\n- ${selectedText || 'List item'}`;
            cursorOffset = insertion.length;
            break;
            
        case 'list-ol':
            insertion = `\n1. ${selectedText || 'List item'}`;
            cursorOffset = insertion.length;
            break;
            
        case 'link':
            insertion = `[${selectedText || 'link text'}](url)`;
            cursorOffset = selectedText ? insertion.length - 5 : insertion.length - 1;
            break;
            
        case 'image':
            insertion = `![${selectedText || 'alt text'}](image-url)`;
            cursorOffset = selectedText ? insertion.length - 11 : insertion.length - 1;
            break;
            
        case 'code':
            insertion = `\`${selectedText || 'code'}\``;
            cursorOffset = selectedText ? insertion.length : 1;
            break;
            
        case 'codeblock':
            insertion = `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n`;
            cursorOffset = selectedText ? insertion.length : 5;
            break;
            
        case 'quote':
            insertion = `\n> ${selectedText || 'Quote'}`;
            cursorOffset = insertion.length;
            break;
            
        case 'strikethrough':
            insertion = `~~${selectedText || 'strikethrough'}~~`;
            cursorOffset = selectedText ? insertion.length : 2;
            break;
            
        default:
            return;
    }
    
    // Insert the text
    const newText = text.substring(0, start) + insertion + text.substring(end);
    textarea.value = newText;
    
    // Set cursor position
    const newCursorPos = start + cursorOffset;
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Trigger update
    updatePreview();
    updateStats();
    saveContent();
}

/**
 * Handle Keyboard Shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + B for Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('bold');
    }
    
    // Ctrl/Cmd + I for Italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('italic');
    }
    
    // Ctrl/Cmd + S for Save (prevent default and show saved status)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
