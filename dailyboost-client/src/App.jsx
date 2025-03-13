import { useState, useEffect } from 'react';
import Weather from './components/Weather';
import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-container">
      {!isOnline && (
        <div className="offline-banner">
          You are offline. Some features may not be available.
        </div>
      )}
      
      <header className="app-header">
        <h1>DailyBoost Dashboard</h1>
        <p>Your personalized daily digest</p>
      </header>
      
      <main className="dashboard-grid">
        <section className="dashboard-item weather-section">
          <Weather />
        </section>
        
        {/* Other dashboard components will go here */}
        <section className="dashboard-item">
          <div className="placeholder-card">
            <h2>Tasks</h2>
            <p>Your task component will go here</p>
          </div>
        </section>
        
        <section className="dashboard-item">
          <div className="placeholder-card">
            <h2>Health</h2>
            <p>Your health component will go here</p>
          </div>
        </section>
        
        <section className="dashboard-item">
          <div className="placeholder-card">
            <h2>News</h2>
            <p>Your news component will go here</p>
          </div>
        </section>
        
        <section className="dashboard-item">
          <div className="placeholder-card">
            <h2>Motivation</h2>
            <p>Your motivation component will go here</p>
          </div>
        </section>
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} DailyBoost Dashboard</p>
      </footer>
    </div>
  );
}

export default App;