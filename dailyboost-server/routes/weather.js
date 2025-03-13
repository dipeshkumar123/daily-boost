// routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/weather
// Fetches weather data from OpenWeather API
router.get('/', async (req, res) => {
  try {
    // Get latitude and longitude from query parameters or use defaults
    const lat = req.query.latitude || 40.7128; // Default: New York
    const lon = req.query.longitude || -74.0060;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Weather API key is not configured',
        message: 'Please add OPENWEATHER_API_KEY to your .env file'
      });
    }

    // Fetch data from OpenWeather API
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);
    
    // Extract and format the relevant data
    const currentWeather = response.data.current;
    const dailyForecast = response.data.daily.slice(0, 1)[0]; // Get today's forecast
    
    const weatherData = {
      current: {
        temp: currentWeather.temp,
        feels_like: currentWeather.feels_like,
        humidity: currentWeather.humidity,
        uvi: currentWeather.uvi,
        wind_speed: currentWeather.wind_speed,
        weather_condition: currentWeather.weather[0].description,
        icon: currentWeather.weather[0].icon
      },
      forecast: {
        temp_max: dailyForecast.temp.max,
        temp_min: dailyForecast.temp.min,
        sunrise: new Date(dailyForecast.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(dailyForecast.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      },
      location: response.data.timezone.split('/')[1].replace('_', ' ') // Simple way to get city name from timezone
    };
    
    // Generate actionable insight based on weather conditions
    let insight = '';
    if (currentWeather.uvi > 7) {
      insight = 'UV index is high today. Wear sunscreen!';
    } else if (currentWeather.temp > 30) {
      insight = 'It\'s hot outside! Stay hydrated.';
    } else if (currentWeather.temp < 5) {
      insight = 'It\'s cold today. Dress warmly!';
    } else if (currentWeather.weather[0].main.toLowerCase().includes('rain')) {
      insight = 'Don\'t forget your umbrella!';
    } else if (currentWeather.humidity > 80) {
      insight = 'High humidity today. Stay cool and hydrated.';
    } else if (currentWeather.weather[0].main.toLowerCase().includes('clear')) {
      insight = 'Perfect weather for outdoor activities!';
    } else {
      insight = 'Have a great day!';
    }
    
    weatherData.insight = insight;
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

module.exports = router;