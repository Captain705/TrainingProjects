/**
 * Chat UI Simulator - JavaScript
 * A modern chat interface with auto-reply simulation
 */

// ========================================
// Configuration & Data
// ========================================

// Predefined contacts
const contacts = [
    {
        id: 1,
        name: "Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        online: true,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 2,
        name: "Mike Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        online: true,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 3,
        name: "Emma Watson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        online: false,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 4,
        name: "David Kim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        online: true,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 5,
        name: "Lisa Anderson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        online: false,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 6,
        name: "James Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        online: true,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 7,
        name: "Amy Taylor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amy",
        online: false,
        lastMessage: "",
        lastTime: "",
        unread: 0
    },
    {
        id: 8,
        name: "Robert Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
        online: true,
        lastMessage: "",
        lastTime: "",
        unread: 0
    }
];

// Auto-reply messages
const autoReplies = [
    "Hello! How can I help you today?",
    "That's interesting! Tell me more.",
    "I see what you mean. Can you elaborate?",
    "Great point! I hadn't thought of that.",
    "That's a great question! Let me think...",
    "Interesting! What makes you say that?",
    "I'm not sure I understand. Could you explain?",
    "That sounds amazing! How did that happen?",
    "I agree with you on that.",
    "Thanks for sharing that with me!",
    "That's really thoughtful of you!",
    "Could you tell me more about that?",
    "I'm listening. Continue please.",
    "That makes sense to me.",
    "Let me think about that for a moment..."
];

// ========================================
// State Management
// ========================================

let state = {
    currentContactId: null,
    contacts: [],
    messages: {},
    theme: 'light'
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    // Sidebar elements
    contactsList: document.getElementById('contactsList'),
    searchContacts: document.getElementById('searchContacts'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Chat area elements
    chatHeader: document.getElementById('chatHeader'),
    currentChatName: document.getElementById('currentChatName'),
    currentChatAvatar: document.getElementById('currentChatAvatar'),
    currentChatStatus: document.getElementById('currentChatStatus'),
    currentChatStatusText: document.getElementById('currentChatStatusText'),
    messagesContainer: document.getElementById('messagesContainer'),
    messages: document.getElementById('messages'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    typingIndicator: document.getElementById('typingIndicator'),
    
    // Input elements
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    messageInputArea: document.getElementById('messageInputArea'),
    
    // Context menu
    contextMenu: document.getElementById('contextMenu')
};

// ========================================
// Initialization
// ========================================

function init() {
    loadState();
    renderContacts();
    setupEventListeners();
    applyTheme();
}

// Load state from localStorage
function loadState() {
    try {
        const savedState = localStorage.getItem('chatAppState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            state.messages = parsed.messages || {};
            state.theme = parsed.theme || 'light';
            // Merge saved messages with contacts
            contacts.forEach(contact => {
                if (!state.messages[contact.id]) {
                    state.messages[contact.id] = [];
                }
                // Update contact last message
                const msgs = state.messages[contact.id];
                if (msgs.length > 0) {
                    const lastMsg = msgs[msgs.length - 1];
                    contact.lastMessage = lastMsg.text;
                    contact.lastTime = lastMsg.timestamp;
                }
            });
        }
        state.contacts = contacts;
    } catch (e) {
        console.error('Error loading state:', e);
        state.contacts = contacts;
    }
}

// Save state to localStorage
function saveState() {
    try {
        localStorage.setItem('chatAppState', JSON.stringify({
            messages: state.messages,
            theme: state.theme
        }));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

// ========================================
// Theme Management
// ========================================

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveState();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    if (state.theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// ========================================
// Contact Rendering
// ========================================

function renderContacts(filter = '') {
    const filteredContacts = state.contacts.filter(contact =>
        contact.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    elements.contactsList.innerHTML = filteredContacts.map(contact => `
        <div class="contact-item ${state.currentContactId === contact.id ? 'active' : ''}" 
             data-id="${contact.id}">
            <div class="contact-avatar">
                <img src="${contact.avatar}" alt="${contact.name}">
                ${contact.online ? '<span class="online-indicator"></span>' : ''}
            </div>
            <div class="contact-info">
                <div class="contact-header">
                    <span class="contact-name">${contact.name}</span>
                    ${contact.lastTime ? `<span class="contact-time">${formatTime(contact.lastTime)}</span>` : ''}
                </div>
                <div class="contact-preview">
                    <span class="contact-message">${contact.lastMessage || 'No messages yet'}</span>
                    ${contact.unread > 0 ? `<span class="contact-unread">${contact.unread}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', () => {
            const contactId = parseInt(item.dataset.id);
            selectContact(contactId);
        });
    });
}

// ========================================
// Contact Selection
// ========================================

function selectContact(contactId) {
    state.currentContactId = contactId;
    const contact = state.contacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    // Update header
    elements.currentChatName.textContent = contact.name;
    elements.currentChatAvatar.src = contact.avatar;
    elements.currentChatStatus.className = `online-indicator ${contact.online ? '' : 'offline'}`;
    elements.currentChatStatus.style.background = contact.online ? 'var(--accent-success)' : 'var(--text-muted)';
    elements.currentChatStatusText.textContent = contact.online ? 'Online' : 'Offline';
    
    // Update typing indicator avatar
    elements.typingIndicator.querySelector('.typing-avatar img').src = contact.avatar;
    
    // Enable input
    elements.messageInput.disabled = false;
    elements.sendBtn.disabled = false;
    elements.messageInput.focus();
    
    // Render messages
    renderMessages();
    
    // Update contact list
    renderContacts(elements.searchContacts.value);
    
    // Hide welcome screen
    elements.welcomeScreen.style.display = 'none';
}

// ========================================
// Message Rendering
// ========================================

function renderMessages() {
    if (!state.currentContactId) return;
    
    const messages = state.messages[state.currentContactId] || [];
    
    elements.messages.innerHTML = messages.map((msg, index) => `
        <div class="message ${msg.sender}" data-index="${index}">
            ${msg.sender === 'received' ? `
                <div class="message-avatar">
                    <img src="${state.contacts.find(c => c.id === state.currentContactId)?.avatar || ''}" alt="Avatar">
                </div>
            ` : ''}
            <div class="message-bubble">
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-meta">
                    <span class="message-time">${formatTime(msg.timestamp)}</span>
                    ${msg.sender === 'sent' ? `
                        <span class="message-status ${msg.read ? 'read' : ''}">
                            ${msg.read ? '<i class="fas fa-check-double"></i>' : '<i class="fas fa-check"></i>'}
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    scrollToBottom();
}

// ========================================
// Message Sending
// ========================================

function sendMessage() {
    const text = elements.messageInput.value.trim();
    if (!text || !state.currentContactId) return;
    
    // Add sent message
    addMessage(text, 'sent');
    
    // Clear input
    elements.messageInput.value = '';
    
    // Show typing indicator and simulate reply
    showTypingIndicator();
}

function addMessage(text, sender) {
    if (!state.currentContactId) return;
    
    const message = {
        text: text,
        sender: sender,
        timestamp: new Date().toISOString(),
        read: sender === 'received'
    };
    
    // Add to messages array
    if (!state.messages[state.currentContactId]) {
        state.messages[state.currentContactId] = [];
    }
    state.messages[state.currentContactId].push(message);
    
    // Update contact's last message
    const contact = state.contacts.find(c => c.id === state.currentContactId);
    if (contact) {
        contact.lastMessage = text;
        contact.lastTime = message.timestamp;
        if (sender === 'received') {
            contact.unread++;
        }
    }
    
    // Save to localStorage
    saveState();
    
    // Re-render
    if (sender === 'sent') {
        renderMessages();
        renderContacts(elements.searchContacts.value);
    }
}

// ========================================
// Auto-Reply Simulation
// ========================================

function showTypingIndicator() {
    const contact = state.contacts.find(c => c.id === state.currentContactId);
    if (!contact) return;
    
    // Update typing indicator avatar
    elements.typingIndicator.querySelector('.typing-avatar img').src = contact.avatar;
    elements.typingIndicator.classList.add('show');
    
    // Scroll to show typing indicator
    scrollToBottom();
    
    // Random delay between 1-2 seconds
    const delay = 1000 + Math.random() * 1000;
    
    setTimeout(() => {
        elements.typingIndicator.classList.remove('show');
        
        // Select random reply
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        
        // Add received message
        addMessage(reply, 'received');
        
        // Render messages
        renderMessages();
        renderContacts(elements.searchContacts.value);
    }, delay);
}

// ========================================
// Utility Functions
// ========================================

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Search contacts
    elements.searchContacts.addEventListener('input', (e) => {
        renderContacts(e.target.value);
    });
    
    // Send message on button click
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Enable/disable send button based on input
    elements.messageInput.addEventListener('input', () => {
        const hasText = elements.messageInput.value.trim().length > 0;
        elements.sendBtn.disabled = !hasText || !state.currentContactId;
    });
    
    // Context menu handling
    document.addEventListener('contextmenu', (e) => {
        const messageEl = e.target.closest('.message');
        if (messageEl && messageEl.classList.contains('sent')) {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, parseInt(messageEl.dataset.index));
        }
    });
    
    // Hide context menu on click elsewhere
    document.addEventListener('click', () => {
        elements.contextMenu.classList.remove('show');
    });
    
    // Context menu actions
    elements.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleContextMenuAction(action);
            elements.contextMenu.classList.remove('show');
        });
    });
}

// Context menu
let currentMessageIndex = null;

function showContextMenu(x, y, index) {
    currentMessageIndex = index;
    elements.contextMenu.style.left = `${x}px`;
    elements.contextMenu.style.top = `${y}px`;
    elements.contextMenu.classList.add('show');
}

function handleContextMenuAction(action) {
    if (!state.currentContactId || currentMessageIndex === null) return;
    
    const messages = state.messages[state.currentContactId];
    if (!messages || !messages[currentMessageIndex]) return;
    
    switch (action) {
        case 'copy':
            navigator.clipboard.writeText(messages[currentMessageIndex].text);
            break;
        case 'delete':
            messages.splice(currentMessageIndex, 1);
            saveState();
            renderMessages();
            break;
    }
    
    currentMessageIndex = null;
}

// ========================================
// Initialize App
// ========================================

document.addEventListener('DOMContentLoaded', init);
