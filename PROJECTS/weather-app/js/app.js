// OpenWeatherMap API Configuration
const API_KEY = '18862e08c5a3caba0bea2b7f67f4d812';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loading = document.getElementById('loading');
const weatherInfo = document.getElementById('weather-info');

// Weather Display Elements
const cityName = document.getElementById('city-name');
const country = document.getElementById('country');
const temperature = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const feelsLike = document.getElementById('feels-like');
const visibility = document.getElementById('visibility');
const dateTime = document.getElementById('date-time');

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Also trigger search on input change (debounced)
let debounceTimer;
cityInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (cityInput.value.trim().length >= 3) {
            searchWeather();
        }
    }, 500);
});

// Main Search Function
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    // Show loading, hide previous content
    hideError();
    weatherInfo.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const weatherData = await fetchWeatherData(city);
        displayWeatherData(weatherData);
    } catch (error) {
        showError(error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

// Fetch Weather Data from API
async function fetchWeatherData(city) {
    const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling.');
        } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your configuration.');
        } else if (response.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else {
            throw new Error('Failed to fetch weather data. Please try again.');
        }
    }

    const data = await response.json();
    return data;
}

// Display Weather Data in DOM
function displayWeatherData(data) {
    // City and Country
    cityName.textContent = data.name;
    country.textContent = data.sys.country;

    // Temperature (Celsius)
    temperature.textContent = `${Math.round(data.main.temp)}°C`;

    // Weather Condition
    weatherCondition.textContent = data.weather[0].description;

    // Weather Icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;

    // Humidity
    humidity.textContent = `${data.main.humidity}%`;

    // Wind Speed
    windSpeed.textContent = `${data.wind.speed} m/s`;

    // Feels Like
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    // Visibility (convert meters to km)
    const visibilityKm = (data.visibility / 1000).toFixed(1);
    visibility.textContent = `${visibilityKm} km`;

    // Date and Time
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);

    // Show weather info
    weatherInfo.classList.remove('hidden');
}

// Error Handling
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Initialize with default city (London)
window.addEventListener('load', () => {
    cityInput.value = 'London';
    searchWeather();
});
