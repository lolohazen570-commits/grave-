// ===============================
// Weather Dashboard Script
// ===============================

// API Configuration
// Get free API key from: https://openweathermap.org/api
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const API_BASE = 'https://api.openweathermap.org/data/2.5';
const GEO_API = 'https://api.openweathermap.org/geo/1.0';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const weatherContainer = document.getElementById('weatherContainer');
const lastUpdate = document.getElementById('lastUpdate');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
locationBtn.addEventListener('click', getLocationWeather);

// ===============================
// Main Functions
// ===============================

async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    await fetchWeatherByCity(city);
}

async function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoordinates(latitude, longitude);
        },
        () => {
            showError('Unable to access your location. Please check permissions.');
            showLoading(false);
        }
    );
}

async function fetchWeatherByCity(city) {
    showLoading(true);
    try {
        // Get coordinates from city name
        const geoResponse = await fetch(
            `${GEO_API}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
        );

        if (!geoResponse.ok) throw new Error('City not found');

        const geoData = await geoResponse.json();
        if (geoData.length === 0) throw new Error('City not found');

        const { lat, lon } = geoData[0];
        await fetchWeatherByCoordinates(lat, lon);
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
        showLoading(false);
    }
}

async function fetchWeatherByCoordinates(lat, lon) {
    try {
        // Fetch current weather and forecast
        const response = await fetch(
            `${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Failed to fetch weather');

        const data = await response.json();
        displayWeather(data);
        updateLastUpdate();
        showLoading(false);
        hideError();
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
        showLoading(false);
    }
}

// ===============================
// Display Functions
// ===============================

function displayWeather(data) {
    const { city, list } = data;

    // Current Weather (first item in list)
    const current = list[0];
    const main = current.main;
    const weather = current.weather[0];

    // Display current weather
    document.getElementById('cityName').textContent = `${city.name}, ${city.country}`;
    document.getElementById('weatherDate').textContent = formatDate(new Date());
    document.getElementById('temperature').textContent = `${Math.round(main.temp)}°C`;
    document.getElementById('weatherDescription').textContent = weather.main;
    document.getElementById('weatherIcon').src = getWeatherIcon(weather.icon);
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${main.pressure} mb`;
    document.getElementById('uvIndex').textContent = 'N/A'; // UV index requires separate API call
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;

    // Display 5-Day Forecast (one per day at noon)
    displayForecast(list);

    // Display Hourly Forecast (next 24 hours)
    displayHourly(list.slice(0, 8));

    // Show weather container
    weatherContainer.classList.remove('hidden');
}

function displayForecast(list) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (at 12:00)
    const dailyForecasts = {};

    list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = item;
        }
    });

    // Display first 5 days
    Object.entries(dailyForecasts).slice(0, 5).forEach(([day, item]) => {
        const card = document.createElement('div');
        card.className = 'forecast-card';

        const maxTemp = Math.round(item.main.temp_max);
        const minTemp = Math.round(item.main.temp_min);
        const description = item.weather[0].main;
        const icon = getWeatherIcon(item.weather[0].icon);

        card.innerHTML = `
            <div class="date">${day}</div>
            <img src="${icon}" alt="weather" class="icon">
            <div class="temp-range">
                <span class="max">${maxTemp}°</span> / 
                <span class="min">${minTemp}°</span>
            </div>
            <div class="description">${description}</div>
        `;

        forecastContainer.appendChild(card);
    });
}

function displayHourly(hourlyList) {
    const hourlyContainer = document.getElementById('hourlyContainer');
    hourlyContainer.innerHTML = '';

    hourlyList.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const hour = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const description = item.weather[0].main;
        const icon = getWeatherIcon(item.weather[0].icon);

        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="time">${hour}</div>
            <img src="${icon}" alt="weather" class="icon">
            <div class="temp">${temp}°</div>
            <div class="description">${description}</div>
        `;

        hourlyContainer.appendChild(card);
    });
}

// ===============================
// Utility Functions
// ===============================

function getWeatherIcon(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateLastUpdate() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    lastUpdate.textContent = time;
}

function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// ===============================
// API Key Setup Guide
// ===============================

console.log(`
===============================================
    WEATHER DASHBOARD SETUP GUIDE
===============================================

To use this weather dashboard, you need an API key:

1. Go to: https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key from the API keys section
4. Replace 'YOUR_API_KEY_HERE' in weather-script.js

Free tier includes:
- Current weather data
- 5-day forecast
- Unlimited API calls

===============================================
`);

// Initialize
console.log('Weather Dashboard loaded. Ready to fetch weather data!');
