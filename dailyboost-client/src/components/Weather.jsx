import { useState, useEffect } from 'react';
import axios from 'axios';
// Import weather icons
import { WiDaySunny, WiNightClear, WiDayCloudy, WiNightCloudy, 
         WiCloud, WiCloudy, WiRain, WiDayRain, WiNightRain, 
         WiThunderstorm, WiSnow, WiDayFog, WiNightFog } from 'react-icons/wi';
import './Weather.css'; // You'll need to create this CSS file

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');

  useEffect(() => {
    // Try to load cached weather data from localStorage first
    const cachedWeather = localStorage.getItem('weatherData');
    if (cachedWeather) {
      try {
        const parsedData = JSON.parse(cachedWeather);
        const cacheTime = new Date(parsedData.timestamp);
        const now = new Date();
        
        // Only use cache if it's less than 30 minutes old
        if ((now - cacheTime) < 30 * 60 * 1000) {
          setWeatherData(parsedData);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error parsing cached weather data', e);
        // If there's an error with the cache, we'll just fetch fresh data
      }
    }
    
    // Get user's location and fetch weather data
    getUserLocationAndWeather();
  }, []);

  const getUserLocationAndWeather = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      fetchWeatherData(null, null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission('granted');
        fetchWeatherData(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationPermission('denied');
        setError('Unable to get your location. Using default location.');
        // Fetch with default location (handled by backend)
        fetchWeatherData(null, null);
      }
    );
  };

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // Build the query string with location parameters if available
      let url = '/api/weather';
      if (latitude && longitude) {
        url += `?latitude=${latitude}&longitude=${longitude}`;
      }

      const response = await axios.get(url);
      
      // Add timestamp to know when the data was fetched
      const weatherWithTimestamp = {
        ...response.data,
        timestamp: new Date().toISOString()
      };
      
      // Update state with fetched data
      setWeatherData(weatherWithTimestamp);
      setError(null);
      
      // Cache the weather data in localStorage
      localStorage.setItem('weatherData', JSON.stringify(weatherWithTimestamp));
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get weather icon based on weather condition and time
  const getWeatherIcon = () => {
    if (!weatherData) return <WiDaySunny size={64} />;
    
    const condition = weatherData.current.weather_condition.toLowerCase();
    const iconCode = weatherData.current.icon;
    const isDay = iconCode.includes('d');
    
    // Map weather conditions to appropriate icons
    if (condition.includes('clear') || condition.includes('sunny')) {
      return isDay ? <WiDaySunny size={64} /> : <WiNightClear size={64} />;
    } else if (condition.includes('few clouds') || condition.includes('partly cloudy')) {
      return isDay ? <WiDayCloudy size={64} /> : <WiNightCloudy size={64} />;
    } else if (condition.includes('scattered clouds')) {
      return <WiCloud size={64} />;
    } else if (condition.includes('clouds') || condition.includes('overcast')) {
      return <WiCloudy size={64} />;
    } else if (condition.includes('thunderstorm')) {
      return <WiThunderstorm size={64} />;
    } else if (condition.includes('drizzle') || condition.includes('rain')) {
      return isDay ? <WiDayRain size={64} /> : <WiNightRain size={64} />;
    } else if (condition.includes('snow')) {
      return <WiSnow size={64} />;
    } else if (condition.includes('mist') || condition.includes('fog')) {
      return isDay ? <WiDayFog size={64} /> : <WiNightFog size={64} />;
    }
    
    return <WiDaySunny size={64} />; // Default fallback
  };

  // Refresh weather data when the user clicks the refresh button
  const handleRefresh = () => {
    getUserLocationAndWeather();
  };

  if (loading && !weatherData) {
    return (
      <div className="weather-card loading">
        <div className="loading-spinner"></div>
        <p>Getting your weather information...</p>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="weather-card error">
        <h2>Weather</h2>
        <p>{error}</p>
        <button onClick={handleRefresh} className="refresh-button">Try Again</button>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2>Weather</h2>
        <div className="location-info">
          <span>{weatherData?.location || 'Your Location'}</span>
          {locationPermission !== 'granted' && (
            <button onClick={getUserLocationAndWeather} className="location-button">
              Use My Location
            </button>
          )}
        </div>
        <button onClick={handleRefresh} className="refresh-button" title="Refresh weather data">
          ↻
        </button>
      </div>
      
      <div className="weather-content">
        <div className="weather-main">
          <div className="weather-icon">{getWeatherIcon()}</div>
          <div className="weather-temp">
            <span className="temp-value">{Math.round(weatherData?.current.temp || 0)}°C</span>
            <span className="condition">{weatherData?.current.weather_condition || ''}</span>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-label">Feels Like:</span>
            <span className="detail-value">{Math.round(weatherData?.current.feels_like || 0)}°C</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">High/Low:</span>
            <span className="detail-value">
              {Math.round(weatherData?.forecast.temp_max || 0)}°/
              {Math.round(weatherData?.forecast.temp_min || 0)}°
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{weatherData?.current.humidity || 0}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">UV Index:</span>
            <span className="detail-value">{weatherData?.current.uvi || 0}</span>
          </div>
        </div>
      </div>
      
      <div className="insight-container">
        <div className="insight-box">
          <p className="insight-text">
            <span className="insight-icon">💡</span>
            {weatherData?.insight || 'Have a great day!'}
          </p>
        </div>
      </div>
      
      <div className="weather-footer">
        <div className="sun-times">
          <div className="sun-item">
            <span className="sun-label">Sunrise:</span>
            <span className="sun-value">{weatherData?.forecast.sunrise || '6:00 AM'}</span>
          </div>
          <div className="sun-item">
            <span className="sun-label">Sunset:</span>
            <span className="sun-value">{weatherData?.forecast.sunset || '6:00 PM'}</span>
          </div>
        </div>
        <div className="update-time">
          {weatherData?.timestamp ? 
            `Updated: ${new Date(weatherData.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
            ''}
        </div>
      </div>
    </div>
  );
};

export default Weather;