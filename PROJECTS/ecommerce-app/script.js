// ============================================
// ShopEase - E-Commerce Application
// ============================================

// ============================================
// Product Data
// ============================================
const products = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "Premium sound quality with active noise cancellation",
        price: 149.99,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        name: "Smart Watch Pro",
        description: "Advanced fitness tracking and notifications",
        price: 299.99,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        name: "Classic Denim Jacket",
        description: "Timeless style meets modern comfort",
        price: 89.99,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        name: "Leather Crossbody Bag",
        description: "Genuine leather with adjustable strap",
        price: 79.99,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        name: "Minimalist Desk Lamp",
        description: "Adjustable brightness with USB charging",
        price: 59.99,
        category: "home",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        name: "Running Shoes Elite",
        description: "Lightweight with superior cushioning",
        price: 129.99,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
    },
    {
        id: 7,
        name: "Portable Bluetooth Speaker",
        description: "360-degree sound with waterproof design",
        price: 79.99,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop"
    },
    {
        id: 8,
        name: "Sunglasses Classic",
        description: "UV400 protection with polarized lenses",
        price: 49.99,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"
    },
    {
        id: 9,
        name: "Ceramic Plant Pot Set",
        description: "Set of 3 modern minimalist planters",
        price: 34.99,
        category: "home",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop"
    },
    {
        id: 10,
        name: "Wireless Gaming Mouse",
        description: "High-precision sensor with RGB lighting",
        price: 69.99,
        category: "electronics",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
    },
    {
        id: 11,
        name: "Cotton Hoodie",
        description: "Premium cotton blend for maximum comfort",
        price: 64.99,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"
    },
    {
        id: 12,
        name: "Wall Clock Modern",
        description: "Silent movement with wooden frame",
        price: 44.99,
        category: "home",
        image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop"
    }
];

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Navigation
    navHome: document.getElementById('nav-home'),
    navProducts: document.getElementById('nav-products'),
    navCart: document.getElementById('nav-cart'),
    navUser: document.getElementById('nav-user'),
    cartCount: document.getElementById('cart-count'),
    
    // Sections
    authSection: document.getElementById('auth-section'),
    productsSection: document.getElementById('products-section'),
    cartSection: document.getElementById('cart-section'),
    homeSection: document.getElementById('home-section'),
    
    // Auth
    loginContainer: document.getElementById('login-container'),
    registerContainer: document.getElementById('register-container'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    showRegister: document.getElementById('show-register'),
    showLogin: document.getElementById('show-login'),
    
    // Login Form
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    rememberMe: document.getElementById('remember-me'),
    loginEmailError: document.getElementById('login-email-error'),
    loginPasswordError: document.getElementById('login-password-error'),
    
    // Register Form
    registerUsername: document.getElementById('register-username'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerConfirmPassword: document.getElementById('register-confirm-password'),
    registerUsernameError: document.getElementById('register-username-error'),
    registerEmailError: document.getElementById('register-email-error'),
    registerPasswordError: document.getElementById('register-password-error'),
    registerConfirmPasswordError: document.getElementById('register-confirm-password-error'),
    
    // Products
    productsGrid: document.getElementById('products-grid'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    priceFilter: document.getElementById('price-filter'),
    sortFilter: document.getElementById('sort-filter'),
    noProducts: document.getElementById('no-products'),
    featuredGrid: document.getElementById('featured-grid'),
    
    // Cart
    cartItems: document.getElementById('cart-items'),
    cartSummary: document.getElementById('cart-summary'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartTax: document.getElementById('cart-tax'),
    cartTotal: document.getElementById('cart-total'),
    emptyCart: document.getElementById('empty-cart'),
    checkoutBtn: document.getElementById('checkout-btn'),
    continueShoppingBtn: document.getElementById('continue-shopping-btn'),
    startShoppingBtn: document.getElementById('start-shopping-btn'),
    
    // Home
    heroShopNow: document.getElementById('hero-shop-now'),
    heroLearnMore: document.getElementById('hero-learn-more'),
    
    // Other
    toastContainer: document.getElementById('toast-container'),
    darkModeToggle: document.getElementById('dark-mode-toggle')
};

// ============================================
// State Management
// ============================================
let state = {
    currentUser: null,
    cart: [],
    users: [],
    filteredProducts: [...products],
    currentPage: 'home'
};

// ============================================
// Local Storage Functions
// ============================================
const storage = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// ============================================
// Initialize Application
// ============================================
function init() {
    loadState();
    setupEventListeners();
    checkAuthStatus();
    renderFeaturedProducts();
    updateCartCount();
    
    // Check for dark mode preference
    if (storage.get('darkMode') === true) {
        document.body.classList.add('dark-mode');
    }
}

function loadState() {
    state.users = storage.get('users') || [];
    state.currentUser = storage.get('currentUser') || null;
    state.cart = storage.get('cart') || [];
}

function saveState() {
    storage.set('users', state.users);
    storage.set('currentUser', state.currentUser);
    storage.set('cart', state.cart);
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Auth Events
    elements.showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    elements.showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    
    // Navigation Events
    elements.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });
    
    elements.navProducts.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('products');
    });
    
    elements.navCart.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('cart');
    });
    
    // Product Filters
    elements.searchInput.addEventListener('input', handleSearch);
    elements.categoryFilter.addEventListener('change', handleFilter);
    elements.priceFilter.addEventListener('change', handleFilter);
    elements.sortFilter.addEventListener('change', handleFilter);
    
    // Cart Events
    elements.checkoutBtn.addEventListener('click', handleCheckout);
    elements.continueShoppingBtn.addEventListener('click', () => navigateTo('products'));
    elements.startShoppingBtn.addEventListener('click', () => navigateTo('products'));
    
    // Home Events
    elements.heroShopNow.addEventListener('click', () => navigateTo('products'));
    
    // Dark Mode Toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
}

// ============================================
// Navigation
// ============================================
function navigateTo(page) {
    state.currentPage = page;
    
    // Hide all sections
    elements.homeSection.classList.add('hidden');
    elements.authSection.classList.add('hidden');
    elements.productsSection.classList.add('hidden');
    elements.cartSection.classList.add('hidden');
    
    // Remove active class from nav links
    elements.navHome.classList.remove('active');
    elements.navProducts.classList.remove('active');
    elements.navCart.classList.remove('active');
    
    switch(page) {
        case 'home':
            elements.homeSection.classList.remove('hidden');
            elements.navHome.classList.add('active');
            break;
        case 'products':
            if (!state.currentUser) {
                showLoginForm();
                return;
            }
            elements.productsSection.classList.remove('hidden');
            elements.navProducts.classList.add('active');
            renderProducts();
            break;
        case 'cart':
            if (!state.currentUser) {
                showLoginForm();
                return;
            }
            elements.cartSection.classList.remove('hidden');
            elements.navCart.classList.add('active');
            renderCart();
            break;
        case 'login':
            showLoginForm();
            break;
        case 'register':
            showRegisterForm();
            break;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ============================================
// Authentication
// ============================================
function showLoginForm() {
    elements.authSection.classList.remove('hidden');
    elements.homeSection.classList.add('hidden');
    elements.productsSection.classList.add('hidden');
    elements.cartSection.classList.add('hidden');
    
    elements.loginContainer.classList.remove('hidden');
    elements.registerContainer.classList.add('hidden');
    
    clearErrors();
}

function showRegisterForm() {
    elements.authSection.classList.remove('hidden');
    elements.homeSection.classList.add('hidden');
    elements.productsSection.classList.add('hidden');
    elements.cartSection.classList.add('hidden');
    
    elements.loginContainer.classList.add('hidden');
    elements.registerContainer.classList.remove('hidden');
    
    clearErrors();
}

function handleRegister(e) {
    e.preventDefault();
    
    const username = elements.registerUsername.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.registerConfirmPassword.value;
    
    clearErrors();
    
    // Validation
    let isValid = true;
    
    if (!username) {
        showError('register-username', 'Username is required');
        isValid = false;
    }
    
    if (!email) {
        showError('register-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('register-email', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        showError('register-password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('register-password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!confirmPassword) {
        showError('register-confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('register-confirm-password', 'Passwords do not match');
        isValid = false;
    }
    
    // Check if email already exists
    if (state.users.find(u => u.email === email)) {
        showError('register-email', 'Email already registered');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Create new user
    const newUser = {
        username,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    state.users.push(newUser);
    saveState();
    
    // Clear form
    elements.registerForm.reset();
    
    // Show success message
    showToast('Account created successfully! Please login.', 'success');
    
    // Switch to login
    showLoginForm();
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    const rememberMe = elements.rememberMe.checked;
    
    clearErrors();
    
    // Validation
    let isValid = true;
    
    if (!email) {
        showError('login-email', 'Email is required');
        isValid = false;
    }
    
    if (!password) {
        showError('login-password', 'Password is required');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Find user
    const user = state.users.find(u => u.email === email);
    
    if (!user) {
        showError('login-email', 'Email not registered');
        return;
    }
    
    if (user.password !== password) {
        showError('login-password', 'Incorrect password');
        return;
    }
    
    // Login successful
    state.currentUser = user;
    
    // Save session
    if (rememberMe) {
        storage.set('currentUser', user);
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    saveState();
    
    // Clear form
    elements.loginForm.reset();
    
    // Show success message
    showToast(`Welcome back, ${user.username}!`, 'success');
    
    // Navigate to products
    navigateTo('products');
}

function handleLogout() {
    state.currentUser = null;
    storage.remove('currentUser');
    sessionStorage.removeItem('currentUser');
    saveState();
    
    showToast('Logged out successfully', 'success');
    navigateTo('home');
}

function checkAuthStatus() {
    // Check session storage first
    let user = sessionStorage.getItem('currentUser');
    if (user) {
        state.currentUser = JSON.parse(user);
    }
    
    // Then check local storage
    if (!state.currentUser) {
        user = storage.get('currentUser');
        if (user) {
            state.currentUser = user;
        }
    }
    
    updateUserMenu();
}

function updateUserMenu() {
    if (state.currentUser) {
        elements.navUser.innerHTML = `
            <div class="user-menu">
                <div class="user-avatar">${state.currentUser.username.charAt(0).toUpperCase()}</div>
                <span>${state.currentUser.username}</span>
                <div class="user-dropdown">
                    <a href="#" id="my-orders">
                        <i class="fas fa-box"></i> My Orders
                    </a>
                    <button id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        elements.navUser.innerHTML = `
            <a href="#" id="login-btn">Login</a>
        `;
        
        document.getElementById('login-btn').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('login');
        });
    }
}

// ============================================
// Products
// ============================================
function renderProducts() {
    const productsToRender = state.filteredProducts;
    
    if (productsToRender.length === 0) {
        elements.productsGrid.innerHTML = '';
        elements.noProducts.classList.remove('hidden');
        return;
    }
    
    elements.noProducts.classList.add('hidden');
    
    elements.productsGrid.innerHTML = productsToRender.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Product'">
                <span class="product-category-badge">${product.category}</span>
                <div class="product-actions">
                    <button class="product-action-btn" onclick="viewProduct(${product.id})" title="Quick View">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    <span>Add to Cart</span>
                </button>
            </div>
        </div>
    `).join('');
}

function renderFeaturedProducts() {
    const featured = products.slice(0, 4);
    
    elements.featuredGrid.innerHTML = featured.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Product'">
                <span class="product-category-badge">${product.category}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function handleSearch() {
    handleFilter();
}

function handleFilter() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const category = elements.categoryFilter.value;
    const priceRange = elements.priceFilter.value;
    const sortBy = elements.sortFilter.value;
    
    let filtered = [...products];
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // Price filter
    if (priceRange) {
        filtered = filtered.filter(p => {
            if (priceRange === '200+') {
                return p.price >= 200;
            } else {
                const [min, max] = priceRange.split('-').map(Number);
                return p.price >= min && p.price <= max;
            }
        });
    }
    
    // Sort
    switch(sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    state.filteredProducts = filtered;
    renderProducts();
}

function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        showToast(`Viewing: ${product.name}`, 'success');
    }
}

// ============================================
// Shopping Cart
// ============================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveState();
    updateCartCount();
    
    showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    const index = state.cart.findIndex(item => item.id === productId);
    if (index > -1) {
        const item = state.cart[index];
        state.cart.splice(index, 1);
        saveState();
        updateCartCount();
        renderCart();
        showToast(`${item.name} removed from cart`, 'warning');
    }
}

function updateQuantity(productId, change) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveState();
            renderCart();
            updateCartCount();
        }
    }
}

function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = count;
}

function renderCart() {
    if (state.cart.length === 0) {
        elements.cartItems.innerHTML = '';
        elements.cartSummary.classList.add('hidden');
        elements.emptyCart.classList.remove('hidden');
        return;
    }
    
    elements.emptyCart.classList.add('hidden');
    elements.cartSummary.classList.remove('hidden');
    
    elements.cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100x100?text=Product'">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    elements.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    elements.cartTax.textContent = `$${tax.toFixed(2)}`;
    elements.cartTotal.textContent = `$${total.toFixed(2)}`;
}

function handleCheckout() {
    if (state.cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal * 1.1;
    
    // Clear cart
    state.cart = [];
    saveState();
    updateCartCount();
    renderCart();
    
    showToast(`Order placed successfully! Total: $${total.toFixed(2)}`, 'success');
    navigateTo('home');
}

// ============================================
// UI Helpers
// ============================================
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
    }
    
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    storage.set('darkMode', isDark);
}

// ============================================
// Make functions globally available
// ============================================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.viewProduct = viewProduct;

// ============================================
// Initialize on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', init);
