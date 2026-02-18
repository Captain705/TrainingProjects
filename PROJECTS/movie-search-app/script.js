// API Configuration
const API_KEY = 'a51a46ae';
const BASE_URL = 'https://www.omdbapi.com/';

// Famous movies to display on page load
const FAMOUS_MOVIES = [
    'Avengers', 'Batman', 'Harry Potter', 'Spider Man',
    'Star Wars', 'Titanic', 'Inception', 'Interstellar',
    'Jurassic Park', 'The Matrix'
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const pagination = document.getElementById('pagination');
const resultsTitle = document.getElementById('resultsTitle');
const resultsCount = document.getElementById('resultsCount');
const movieModal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesBody = document.getElementById('favoritesBody');
const favoritesClose = document.getElementById('favoritesClose');
const favoritesBtn = document.getElementById('favoritesBtn');
const homeBtn = document.getElementById('homeBtn');
const typeFilter = document.getElementById('typeFilter');
const yearFilter = document.getElementById('yearFilter');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let currentPage = 1;
let currentSearch = '';
let currentType = '';
let currentYear = '';
let totalResults = 0;
let favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFamousMovies();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Search
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Filters
    typeFilter.addEventListener('change', handleFilterChange);
    yearFilter.addEventListener('change', handleFilterChange);

    // Modal
    modalClose.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });

    // Favorites Modal
    favoritesClose.addEventListener('click', closeFavoritesModal);
    favoritesModal.addEventListener('click', (e) => {
        if (e.target === favoritesModal) closeFavoritesModal();
    });

    favoritesBtn.addEventListener('click', showFavorites);
    homeBtn.addEventListener('click', () => {
        loadFamousMovies();
        clearFilters();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeFavoritesModal();
        }
    });
}

// Load Famous Movies on Page Load
async function loadFamousMovies() {
    // Randomly select one famous movie
    const randomMovie = FAMOUS_MOVIES[Math.floor(Math.random() * FAMOUS_MOVIES.length)];
    currentSearch = randomMovie;
    resultsTitle.textContent = 'Popular Movies';
    await searchMovies(randomMovie, currentPage);
}

// Handle Search
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showToast('Please enter a movie name');
        return;
    }
    currentSearch = query;
    currentPage = 1;
    resultsTitle.textContent = `Search Results: "${query}"`;
    await searchMovies(query, currentPage);
}

// Handle Filter Change
async function handleFilterChange() {
    currentType = typeFilter.value;
    currentYear = yearFilter.value.trim();
    currentPage = 1;
    if (currentSearch) {
        await searchMovies(currentSearch, currentPage);
    }
}

// Clear Filters
function clearFilters() {
    typeFilter.value = '';
    yearFilter.value = '';
    searchInput.value = '';
    currentType = '';
    currentYear = '';
    currentPage = 1;
    currentSearch = '';
    resultsTitle.textContent = 'Popular Movies';
}

// Search Movies
async function searchMovies(query, page) {
    showLoader();
    hideError();
    hideNoResults();

    try {
        let url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`;
        
        if (currentType) {
            url += `&type=${currentType}`;
        }
        if (currentYear) {
            url += `&y=${currentYear}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'True') {
            totalResults = parseInt(data.totalResults);
            displayMovies(data.Search);
            displayPagination();
            updateResultsCount();
        } else {
            showNoResults();
            clearMovies();
            clearPagination();
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError();
    } finally {
        hideLoader();
    }
}

// Display Movies
function displayMovies(movies) {
    clearMovies();
    
    if (!movies || movies.length === 0) {
        showNoResults();
        return;
    }

    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        moviesGrid.appendChild(card);
    });
}

// Create Movie Card
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;

    const isFavorite = favorites.some(f => f.imdbID === movie.imdbID);

    card.innerHTML = `
        <div class="movie-poster-container">
            ${movie.Poster !== 'N/A' 
                ? `<img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster" loading="lazy">`
                : `<div class="no-poster"><span>🎬</span></div>`
            }
            <div class="movie-poster-overlay"></div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${movie.imdbID}">
                ${isFavorite ? '❤️' : '🤍'}
            </button>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${movie.Year !== 'N/A' ? movie.Year : 'N/A'}</span>
                <span class="movie-type">${movie.Type}</span>
            </div>
            <button class="view-btn" data-id="${movie.imdbID}">View Details</button>
        </div>
    `;

    // Event Listeners
    const viewBtn = card.querySelector('.view-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');

    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openMovieDetails(movie.imdbID);
    });

    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(movie);
    });

    card.addEventListener('click', () => {
        openMovieDetails(movie.imdbID);
    });

    return card;
}

// Open Movie Details Modal
async function openMovieDetails(imdbId) {
    showLoader();
    movieModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbId}&plot=full`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovieDetails(data);
        } else {
            modalBody.innerHTML = '<p>Failed to load movie details</p>';
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        modalBody.innerHTML = '<p>Error loading movie details</p>';
    } finally {
        hideLoader();
    }
}

// Display Movie Details in Modal
function displayMovieDetails(movie) {
    const isFavorite = favorites.some(f => f.imdbID === movie.imdbID);

    modalBody.innerHTML = `
        <div class="movie-details">
            <div class="movie-details-image">
                ${movie.Poster !== 'N/A'
                    ? `<img src="${movie.Poster}" alt="${movie.Title}" class="movie-details-poster">`
                    : `<div class="no-poster" style="height: 400px;"><span>🎬</span></div>`
                }
            </div>
            <div class="movie-details-info">
                <h2>${movie.Title}</h2>
                <div class="movie-details-meta">
                    <span>📅 ${movie.Year !== 'N/A' ? movie.Year : 'N/A'}</span>
                    <span>⏱️ ${movie.Runtime !== 'N/A' ? movie.Runtime : 'N/A'}</span>
                    <span>🌐 ${movie.Language !== 'N/A' ? movie.Language : 'N/A'}</span>
                </div>
                <div class="movie-details-genre">
                    ${movie.Genre !== 'N/A' ? movie.Genre.split(', ').map(g => `<span class="genre-tag">${g}</span>`).join('') : ''}
                </div>
                ${movie.imdbRating !== 'N/A' ? `<div class="imdb-rating">⭐ ${movie.imdbRating}/10</div>` : ''}
                <p class="movie-details-plot">${movie.Plot !== 'N/A' ? movie.Plot : 'No plot available'}</p>
                
                <div class="movie-details-section">
                    <h4>Director</h4>
                    <p>${movie.Director !== 'N/A' ? movie.Director : 'N/A'}</p>
                </div>
                
                <div class="movie-details-section">
                    <h4>Cast</h4>
                    <p>${movie.Actors !== 'N/A' ? movie.Actors : 'N/A'}</p>
                </div>
                
                <div class="movie-details-section">
                    <h4>Writer</h4>
                    <p>${movie.Writer !== 'N/A' ? movie.Writer : 'N/A'}</p>
                </div>
                
                <div class="modal-actions">
                    <button class="modal-action-btn" id="modalFavoriteBtn" data-movie='${JSON.stringify(movie)}'>
                        ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add favorite button event listener
    document.getElementById('modalFavoriteBtn').addEventListener('click', (e) => {
        const movieData = JSON.parse(e.target.dataset.movie);
        toggleFavorite(movieData);
        // Update button text
        const newIsFavorite = favorites.some(f => f.imdbID === movieData.imdbID);
        e.target.innerHTML = newIsFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
    });
}

// Close Modal
function closeModal() {
    movieModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Toggle Favorite
function toggleFavorite(movie) {
    const index = favorites.findIndex(f => f.imdbID === movie.imdbID);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites');
    } else {
        favorites.push(movie);
        showToast('Added to favorites');
    }
    
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
    
    // Update current view if on favorites or search
    if (favoritesModal.classList.contains('show')) {
        displayFavorites();
    } else if (currentSearch) {
        searchMovies(currentSearch, currentPage);
    }
}

// Show Favorites Modal
function showFavorites() {
    favoritesModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    displayFavorites();
}

// Display Favorites
function displayFavorites() {
    if (favorites.length === 0) {
        favoritesBody.innerHTML = `
            <div class="favorites-empty">
                <span>❤️</span>
                <h3>No favorites yet</h3>
                <p>Start adding movies to your favorites!</p>
            </div>
        `;
        return;
    }

    favoritesBody.innerHTML = `
        <div class="favorites-grid">
            ${favorites.map((movie, index) => createFavoriteCard(movie, index)).join('')}
        </div>
    `;

    // Add event listeners
    favoritesBody.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeFavoritesModal();
            openMovieDetails(btn.dataset.id);
        });
    });

    favoritesBody.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const movie = favorites.find(f => f.imdbID === btn.dataset.id);
            if (movie) {
                toggleFavorite(movie);
                displayFavorites();
            }
        });
    });
}

// Create Favorite Card
function createFavoriteCard(movie, index) {
    return `
        <div class="movie-card" style="opacity: 1; animation-delay: ${index * 0.05}s;">
            <div class="movie-poster-container">
                ${movie.Poster !== 'N/A'
                    ? `<img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">`
                    : `<div class="no-poster"><span>🎬</span></div>`
                }
                <div class="movie-poster-overlay"></div>
                <button class="favorite-btn active" data-id="${movie.imdbID}">❤️</button>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${movie.Year !== 'N/A' ? movie.Year : 'N/A'}</span>
                    <span class="movie-type">${movie.Type}</span>
                </div>
                <button class="view-btn" data-id="${movie.imdbID}">View Details</button>
            </div>
        </div>
    `;
}

// Close Favorites Modal
function closeFavoritesModal() {
    favoritesModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Display Pagination
function displayPagination() {
    clearPagination();
    
    const totalPages = Math.ceil(totalResults / 10);
    
    if (totalPages <= 1) return;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="prev">
            ← Prev
        </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="next">
            Next →
        </button>
    `;

    pagination.innerHTML = paginationHTML;

    // Add click listeners
    pagination.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', handlePageClick);
    });
}

// Handle Page Click
async function handlePageClick(e) {
    const page = e.target.dataset.page;
    
    if (page === 'prev') {
        currentPage--;
    } else if (page === 'next') {
        currentPage++;
    } else {
        currentPage = parseInt(page);
    }

    await searchMovies(currentSearch, currentPage);
    
    // Scroll to top of movies section
    document.querySelector('.movies-section').scrollIntoView({ behavior: 'smooth' });
}

// Update Results Count
function updateResultsCount() {
    resultsCount.textContent = `Total results: ${totalResults}`;
}

// Clear Movies
function clearMovies() {
    moviesGrid.innerHTML = '';
}

// Clear Pagination
function clearPagination() {
    pagination.innerHTML = '';
}

// Show Loader
function showLoader() {
    loader.classList.remove('hidden');
}

// Hide Loader
function hideLoader() {
    loader.classList.add('hidden');
}

// Show Error
function showError() {
    errorMessage.classList.remove('hidden');
    clearMovies();
    clearPagination();
}

// Hide Error
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show No Results
function showNoResults() {
    noResults.classList.remove('hidden');
    clearMovies();
    clearPagination();
}

// Hide No Results
function hideNoResults() {
    noResults.classList.add('hidden');
}

// Show Toast
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
