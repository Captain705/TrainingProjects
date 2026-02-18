// Global Variables
let allPosts = [];
let currentCategory = 'all';
let isDarkMode = false;

// DOM Elements
const postsGrid = document.getElementById('postsGrid');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchBar = document.getElementById('searchBar');
const categoryFilters = document.getElementById('categoryFilters');
const postDetail = document.getElementById('postDetail');
const fullPost = document.getElementById('fullPost');
const recentPosts = document.getElementById('recentPosts');
const tagsCloud = document.getElementById('tagsCloud');
const footerCategories = document.getElementById('footerCategories');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const themeIcon = document.getElementById('themeIcon');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const footer = document.querySelector('.footer');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    loadTheme();
    setupEventListeners();
});

// Load Posts from JSON
async function loadPosts() {
    try {
        postsGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error('Failed to load posts');
        }
        
        allPosts = await response.json();
        
        // Update stats
        document.getElementById('totalPosts').textContent = allPosts.length;
        
        const categories = [...new Set(allPosts.map(post => post.category))];
        document.getElementById('totalCategories').textContent = categories.length;
        
        // Initialize the app
        displayPosts(allPosts);
        displayCategoryFilters();
        displayRecentPosts();
        displayTags();
        displayFooterCategories();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Posts</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Display Posts
function displayPosts(posts) {
    if (posts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Posts Found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    postsGrid.innerHTML = posts.map((post, index) => `
        <div class="post-card" onclick="viewPost(${post.id})" style="animation-delay: ${index * 0.1}s">
            <div class="post-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <span class="post-card-category">${post.category}</span>
            </div>
            <div class="post-card-content">
                <div class="post-card-meta">
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(post.date)}</span>
                </div>
                <h3 class="post-card-title">${post.title}</h3>
                <p class="post-card-excerpt">${post.excerpt}</p>
                <div class="post-card-footer">
                    <span class="read-more-btn">
                        Read More <i class="fas fa-arrow-right"></i>
                    </span>
                    <span class="read-time"><i class="fas fa-clock"></i> ${post.readTime}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// View Single Post
function viewPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Hide other sections
    document.getElementById('hero').style.display = 'none';
    document.querySelector('.blog-section').style.display = 'none';
    document.querySelector('.category-section').style.display = 'none';
    document.getElementById('about').style.display = 'none';
    document.getElementById('contact').style.display = 'none';
    
    // Show post detail
    postDetail.style.display = 'block';
    
    // Display full post
    fullPost.innerHTML = `
        <div class="full-post-image">
            <img src="${post.image}" alt="${post.title}">
        </div>
        <div class="full-post-content">
            <span class="full-post-category">${post.category}</span>
            <h1 class="full-post-title">${post.title}</h1>
            <div class="full-post-meta">
                <span><i class="fas fa-user"></i> ${post.author}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(post.date)}</span>
                <span><i class="fas fa-clock"></i> ${post.readTime}</span>
            </div>
            <div class="full-post-text">
                ${post.content.split('\n\n').map(para => `<p>${para}</p>`).join('')}
            </div>
            <div class="full-post-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    // Save to localStorage
    saveToLocalStorage('lastViewedPost', post);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update URL
    history.pushState({ postId }, '', `#post-${postId}`);
}

// Show Home Page
function showHome() {
    // Show all sections
    document.getElementById('hero').style.display = 'block';
    document.querySelector('.blog-section').style.display = 'block';
    document.querySelector('.category-section').style.display = 'block';
    document.getElementById('about').style.display = 'none';
    document.getElementById('contact').style.display = 'none';
    
    // Hide post detail
    postDetail.style.display = 'none';
    
    // Reset category filter
    currentCategory = 'all';
    updateCategoryButtons();
    displayPosts(allPosts);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Clear URL
    history.pushState({}, '', window.location.pathname);
}

// Show Categories
function showCategories() {
    document.getElementById('hero').style.display = 'block';
    document.querySelector('.blog-section').style.display = 'block';
    document.querySelector('.category-section').style.display = 'block';
    document.getElementById('about').style.display = 'none';
    document.getElementById('contact').style.display = 'none';
    postDetail.style.display = 'none';
    
    window.scrollTo(0, 300);
}

// Show About
function showAbout() {
    document.getElementById('hero').style.display = 'none';
    document.querySelector('.blog-section').style.display = 'none';
    document.querySelector('.category-section').style.display = 'none';
    document.getElementById('about').style.display = 'block';
    document.getElementById('contact').style.display = 'none';
    postDetail.style.display = 'none';
    
    window.scrollTo(0, 70);
}

// Show Contact
function showContact() {
    document.getElementById('hero').style.display = 'none';
    document.querySelector('.blog-section').style.display = 'none';
    document.querySelector('.category-section').style.display = 'none';
    document.getElementById('about').style.display = 'none';
    document.getElementById('contact').style.display = 'block';
    postDetail.style.display = 'none';
    
    window.scrollTo(0, 70);
}

// Category Filters
function displayCategoryFilters() {
    const categories = ['all', ...new Set(allPosts.map(post => post.category))];
    
    categoryFilters.innerHTML = categories.map(category => `
        <button class="category-btn ${category === 'all' ? 'active' : ''}" 
                data-category="${category}" 
                onclick="filterByCategory('${category}')">
            ${category === 'all' ? 'All Posts' : category}
        </button>
    `).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    
    const filteredPosts = category === 'all' 
        ? allPosts 
        : allPosts.filter(post => post.category === category);
    
    displayPosts(filteredPosts);
    updateCategoryButtons();
}

function updateCategoryButtons() {
    const buttons = categoryFilters.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Search Functionality
function toggleSearch() {
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
}

function searchPosts(query) {
    if (!query.trim()) {
        searchResults.innerHTML = '';
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filteredPosts = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.category.toLowerCase().includes(searchTerm)
    );
    
    if (filteredPosts.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p>No posts found matching "${query}"</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = filteredPosts.map(post => `
        <div class="search-result-item" onclick="viewPost(${post.id}); toggleSearch();">
            <img src="${post.image}" alt="${post.title}">
            <div class="search-result-info">
                <h4>${post.title}</h4>
                <p>${post.category} • ${formatDate(post.date)}</p>
            </div>
        </div>
    `).join('');
}

// Recent Posts in Sidebar
function displayRecentPosts() {
    const recentPostsList = allPosts.slice(0, 5);
    
    recentPosts.innerHTML = recentPostsList.map(post => `
        <div class="recent-post-item" onclick="viewPost(${post.id})">
            <img src="${post.image}" alt="${post.title}">
            <div class="recent-post-info">
                <h4>${post.title}</h4>
                <span>${formatDate(post.date)}</span>
            </div>
        </div>
    `).join('');
}

// Tags Cloud
function displayTags() {
    const allTags = allPosts.flatMap(post => post.tags);
    const uniqueTags = [...new Set(allTags)];
    
    tagsCloud.innerHTML = uniqueTags.map(tag => `
        <span class="tag" onclick="searchPosts('${tag}')">${tag}</span>
    `).join('');
}

// Footer Categories
function displayFooterCategories() {
    const categories = [...new Set(allPosts.map(post => post.category))];
    
    footerCategories.innerHTML = categories.map(category => `
        <li><a href="#" onclick="filterByCategory('${category}'); showCategories();">${category}</a></li>
    `).join('');
}

// Theme Toggle
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('mobile-active');
}

// Toast Notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Contact Form Submit
function handleContactSubmit(event) {
    event.preventDefault();
    showToast('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Newsletter Submit
function handleNewsletterSubmit(event) {
    event.preventDefault();
    showToast('Successfully subscribed to our newsletter!');
    event.target.reset();
}

// Local Storage Functions
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Setup Event Listeners
function setupEventListeners() {
    // Close search on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchBar.classList.contains('active')) {
            toggleSearch();
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navLinks = document.getElementById('navLinks');
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
            navLinks.classList.remove('mobile-active');
        }
    });
    
    // Handle browser back button
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.postId) {
            viewPost(e.state.postId);
        } else {
            showHome();
        }
    });
    
    // Check URL for post ID on load
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
        const postId = parseInt(hash.replace('#post-', ''));
        if (!isNaN(postId)) {
            viewPost(postId);
        }
    }
}
