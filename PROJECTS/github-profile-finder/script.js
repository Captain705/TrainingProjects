// GitHub Profile Finder - JavaScript

// DOM Elements
const elements = {
    usernameInput: document.getElementById('usernameInput'),
    searchBtn: document.getElementById('searchBtn'),
    loadingContainer: document.getElementById('loadingContainer'),
    errorContainer: document.getElementById('errorContainer'),
    errorMessage: document.getElementById('errorMessage'),
    profileContent: document.getElementById('profileContent'),
    profileCard: document.getElementById('profileCard'),
    repositoriesSection: document.getElementById('repositoriesSection'),
    repositoriesGrid: document.getElementById('repositoriesGrid'),
    themeToggle: document.getElementById('themeToggle'),
    searchHistory: document.getElementById('searchHistory'),
    historyList: document.getElementById('historyList'),
    clearHistory: document.getElementById('clearHistory'),
    
    // Profile elements
    avatar: document.getElementById('avatar'),
    name: document.getElementById('name'),
    username: document.getElementById('username'),
    bio: document.getElementById('bio'),
    publicRepos: document.getElementById('publicRepos'),
    followers: document.getElementById('followers'),
    following: document.getElementById('following'),
    location: document.getElementById('location'),
    company: document.getElementById('company'),
    joinedDate: document.getElementById('joinedDate'),
    email: document.getElementById('email'),
    blog: document.getElementById('blog'),
    profileLink: document.getElementById('profileLink'),
    githubLink: document.getElementById('githubLink'),
    organizationsContainer: document.getElementById('organizationsContainer'),
    orgList: document.getElementById('orgList'),
    
    // Detail containers
    locationContainer: document.getElementById('locationContainer'),
    companyContainer: document.getElementById('companyContainer'),
    emailContainer: document.getElementById('emailContainer'),
    blogContainer: document.getElementById('blogContainer'),
    
    // Sort buttons
    sortBtns: document.querySelectorAll('.sort-btn')
};

// State
let currentUsername = '';
let currentUserData = null;
let repositories = [];

// Constants
const API_BASE_URL = 'https://api.github.com';
const MAX_REPOS = 10;
const STORAGE_KEY = 'github_finder_history';
const THEME_KEY = 'github_finder_theme';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    loadSearchHistory();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

// Event Listeners
function initEventListeners() {
    // Search events
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    elements.usernameInput.addEventListener('focus', () => {
        if (getSearchHistory().length > 0) {
            elements.searchHistory.classList.add('show');
        }
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Search history
    elements.clearHistory.addEventListener('click', clearSearchHistory);
    document.addEventListener('click', (e) => {
        if (!elements.searchHistory.contains(e.target) && e.target !== elements.usernameInput) {
            elements.searchHistory.classList.remove('show');
        }
    });
    
    // Sort buttons
    elements.sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sortRepositories(btn.dataset.sort);
        });
    });
}

// Search Handler
async function handleSearch() {
    const username = elements.usernameInput.value.trim();
    
    if (!username) {
        showError('Please enter a GitHub username');
        return;
    }
    
    hideError();
    hideProfile();
    showLoading();
    
    try {
        const userData = await fetchUser(username);
        currentUserData = userData;
        currentUsername = username;
        
        // Add to search history
        addToSearchHistory(userData);
        
        // Fetch repositories
        const repos = await fetchRepositories(username);
        repositories = repos;
        
        // Display data
        displayProfile(userData);
        displayRepositories(repos);
        
        hideLoading();
        showProfile();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// API Functions
async function fetchUser(username) {
    const response = await fetch(`${API_BASE_URL}/users/${username}`);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('User not found');
        } else if (response.status === 403) {
            throw new Error('API rate limit exceeded. Please try again later.');
        } else {
            throw new Error('Failed to fetch user data');
        }
    }
    
    return response.json();
}

async function fetchRepositories(username) {
    const response = await fetch(`${API_BASE_URL}/users/${username}/repos?per_page=${MAX_REPOS}&sort=updated`);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('User not found');
        } else if (response.status === 403) {
            throw new Error('API rate limit exceeded. Please try again later.');
        } else {
            throw new Error('Failed to fetch repositories');
        }
    }
    
    return response.json();
}

async function fetchOrganizations(username) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${username}/orgs`);
        
        if (!response.ok) {
            return [];
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

// Display Functions
function displayProfile(user) {
    // Avatar
    elements.avatar.src = user.avatar_url;
    elements.avatar.alt = `${user.login}'s avatar`;
    
    // Basic info
    elements.name.textContent = user.name || user.login;
    elements.username.textContent = user.login;
    elements.bio.textContent = user.bio || 'No bio available';
    
    // Stats
    elements.publicRepos.textContent = formatNumber(user.public_repos);
    elements.followers.textContent = formatNumber(user.followers);
    elements.following.textContent = formatNumber(user.following);
    
    // Details
    if (user.location) {
        elements.location.textContent = user.location;
        elements.locationContainer.classList.remove('hidden');
    } else {
        elements.locationContainer.classList.add('hidden');
    }
    
    if (user.company) {
        elements.company.textContent = user.company;
        elements.companyContainer.classList.remove('hidden');
    } else {
        elements.companyContainer.classList.add('hidden');
    }
    
    if (user.email) {
        elements.email.textContent = user.email;
        elements.emailContainer.classList.remove('hidden');
    } else {
        elements.emailContainer.classList.add('hidden');
    }
    
    if (user.blog) {
        let blogUrl = user.blog;
        if (!blogUrl.startsWith('http')) {
            blogUrl = 'https://' + blogUrl;
        }
        elements.blog.href = blogUrl;
        elements.blog.textContent = blogUrl;
        elements.blogContainer.classList.remove('hidden');
    } else {
        elements.blogContainer.classList.add('hidden');
    }
    
    // Join date
    const joinDate = new Date(user.created_at);
    elements.joinedDate.textContent = `Joined ${formatDate(joinDate)}`;
    
    // Links
    elements.profileLink.href = user.html_url;
    elements.githubLink.href = `${user.html_url}?tab=followers`;
    
    // Fetch and display organizations
    fetchOrganizations(user.login).then(orgs => {
        displayOrganizations(orgs);
    });
}

function displayOrganizations(orgs) {
    if (orgs && orgs.length > 0) {
        elements.organizationsContainer.classList.remove('hidden');
        elements.orgList.innerHTML = '';
        
        orgs.slice(0, 6).forEach(org => {
            const orgItem = document.createElement('div');
            orgItem.className = 'org-item';
            orgItem.title = org.login;
            
            const img = document.createElement('img');
            img.src = org.avatar_url;
            img.alt = org.login;
            img.loading = 'lazy';
            
            orgItem.appendChild(img);
            elements.orgList.appendChild(orgItem);
        });
    } else {
        elements.organizationsContainer.classList.add('hidden');
    }
}

function displayRepositories(repos) {
    elements.repositoriesGrid.innerHTML = '';
    
    if (repos.length === 0) {
        elements.repositoriesGrid.innerHTML = '<p class="no-repos">No public repositories found</p>';
        return;
    }
    
    repos.forEach(repo => {
        const repoCard = createRepoCard(repo);
        elements.repositoriesGrid.appendChild(repoCard);
    });
}

function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';
    
    const languageColor = getLanguageColor(repo.language);
    
    card.innerHTML = `
        <div class="repo-header">
            <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
            <span class="repo-visibility">${repo.visibility}</span>
        </div>
        <p class="repo-description">${repo.description || 'No description available'}</p>
        <div class="repo-stats">
            <span class="repo-stat stars">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${formatNumber(repo.stargazers_count)}
            </span>
            <span class="repo-stat forks">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="18" r="3"/>
                    <circle cx="6" cy="6" r="3"/>
                    <circle cx="18" cy="6" r="3"/>
                    <path d="M18 9a9 9 0 01-9 9"/>
                    <path d="M6 9a9 9 0 009 9"/>
                </svg>
                ${formatNumber(repo.forks_count)}
            </span>
            ${repo.language ? `
                <span class="repo-stat language">
                    <span class="language-dot" style="background-color: ${languageColor}"></span>
                    ${repo.language}
                </span>
            ` : ''}
        </div>
        ${repo.topics && repo.topics.length > 0 ? `
            <div class="repo-topics">
                ${repo.topics.slice(0, 5).map(topic => `
                    <span class="repo-topic">${topic}</span>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    return card;
}

// Sort Repositories
function sortRepositories(sortBy) {
    let sortedRepos = [...repositories];
    
    switch (sortBy) {
        case 'stars':
            sortedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'updated':
        default:
            sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
    }
    
    displayRepositories(sortedRepos);
}

// Search History
function getSearchHistory() {
    try {
        const history = localStorage.getItem(STORAGE_KEY);
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
}

function addToSearchHistory(user) {
    let history = getSearchHistory();
    
    // Remove existing entry if present
    history = history.filter(item => item.login !== user.login);
    
    // Add to beginning
    history.unshift({
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name || user.login,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10
    history = history.slice(0, 10);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    loadSearchHistory();
}

function loadSearchHistory() {
    const history = getSearchHistory();
    
    if (history.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No recent searches</p>';
        return;
    }
    
    elements.historyList.innerHTML = history.map(item => `
        <div class="history-item" data-username="${item.login}">
            <img src="${item.avatar_url}" alt="${item.login}">
            <div class="history-item-info">
                <div class="history-item-name">${item.name}</div>
                <div class="history-item-date">@${item.login}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.usernameInput.value = item.dataset.username;
            elements.searchHistory.classList.remove('show');
            handleSearch();
        });
    });
}

function clearSearchHistory() {
    localStorage.removeItem(STORAGE_KEY);
    loadSearchHistory();
    elements.searchHistory.classList.remove('show');
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(date) {
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getLanguageColor(language) {
    const colors = {
        JavaScript: '#f1e05a',
        Python: '#3572A5',
        Java: '#b07219',
        TypeScript: '#2b7489',
        HTML: '#e34c26',
        CSS: '#563d7c',
        C: '#555555',
        'C++': '#f34b7d',
        'C#': '#178600',
        Ruby: '#701516',
        Go: '#00ADD8',
        Rust: '#dea584',
        PHP: '#4F5D95',
        Swift: '#ffac45',
        Kotlin: '#A97BFF',
        Dart: '#00B4AB',
        Shell: '#89e051',
        Vue: '#41b883',
        Jupyter: '#DA5B0B',
        SCSS: '#c6538c'
    };
    
    return colors[language] || '#858585';
}

// UI State Functions
function showLoading() {
    elements.loadingContainer.classList.add('show');
}

function hideLoading() {
    elements.loadingContainer.classList.remove('show');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorContainer.classList.add('show');
}

function hideError() {
    elements.errorContainer.classList.remove('show');
}

function showProfile() {
    elements.profileContent.classList.add('show');
}

function hideProfile() {
    elements.profileContent.classList.remove('show');
}
