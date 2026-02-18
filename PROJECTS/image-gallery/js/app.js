/**
 * Image Gallery Application
 * Features: Category filters, Search bar, Modal preview with navigation
 */

// Image data with categories
const galleryData = [
    { id: 1, title: "Mountain Vista", category: "nature", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600" },
    { id: 2, title: "Modern Building", category: "architecture", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600" },
    { id: 3, title: "Golden Retriever", category: "animals", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600" },
    { id: 4, title: "Delicious Pizza", category: "food", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600" },
    { id: 5, title: "Tropical Beach", category: "travel", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600" },
    { id: 6, title: "Forest Path", category: "nature", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600" },
    { id: 7, title: "City Skyline", category: "architecture", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600" },
    { id: 8, title: "Cute Cat", category: "animals", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600" },
    { id: 9, title: "Sushi Platter", category: "food", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600" },
    { id: 10, title: "Paris Eiffel Tower", category: "travel", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=600" },
    { id: 11, title: "Sunset Valley", category: "nature", image: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600" },
    { id: 12, title: "Glass Tower", category: "architecture", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600" },
    { id: 13, title: "Elephant Safari", category: "animals", image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600" },
    { id: 14, title: "Ice Cream Bowl", category: "food", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600" },
    { id: 15, title: "Venice Canals", category: "travel", image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600" },
    { id: 16, title: "Ocean Waves", category: "nature", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600" },
];

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const closeModal = document.getElementById('closeModal');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// State
let currentCategory = 'all';
let currentSearchTerm = '';
let filteredImages = [...galleryData];
let currentImageIndex = 0;

// Initialize gallery
function init() {
    renderGallery(filteredImages);
    setupEventListeners();
}

// Render gallery items
function renderGallery(images) {
    galleryGrid.innerHTML = '';
    
    if (images.length === 0) {
        noResults.classList.add('show');
        return;
    }
    
    noResults.classList.remove('show');
    
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${index * 0.05}s`;
        item.dataset.id = image.id;
        
        item.innerHTML = `
            <div class="image-wrapper">
                <img src="${image.image}" alt="${image.title}" loading="lazy">
                <div class="image-overlay">
                    <h3>${image.title}</h3>
                    <span>${image.category}</span>
                </div>
            </div>
            <div class="gallery-item-info">
                <h3>${image.title}</h3>
                <span>${image.category}</span>
            </div>
        `;
        
        item.addEventListener('click', () => openModal(index));
        galleryGrid.appendChild(item);
    });
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
}

// Search images
function searchImages(term) {
    currentSearchTerm = term.toLowerCase().trim();
    applyFilters();
}

// Apply both filters
function applyFilters() {
    filteredImages = galleryData.filter(image => {
        const matchesCategory = currentCategory === 'all' || image.category === currentCategory;
        const matchesSearch = image.title.toLowerCase().includes(currentSearchTerm);
        return matchesCategory && matchesSearch;
    });
    
    renderGallery(filteredImages);
}

// Open modal
function openModal(index) {
    currentImageIndex = index;
    updateModalContent();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModalHandler() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Update modal content
function updateModalContent() {
    const image = filteredImages[currentImageIndex];
    if (image) {
        modalImage.src = image.image.replace('w=600', 'w=1200');
        modalImage.alt = image.title;
        modalTitle.textContent = image.title;
        modalCategory.textContent = `Category: ${image.category}`;
    }
}

// Navigate to previous image
function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    updateModalContent();
}

// Navigate to next image
function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
    updateModalContent();
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByCategory(btn.dataset.category);
        });
    });
    
    // Search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchImages(e.target.value);
        }, 300);
    });
    
    // Modal events
    closeModal.addEventListener('click', closeModalHandler);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('show')) return;
        
        if (e.key === 'Escape') closeModalHandler();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
