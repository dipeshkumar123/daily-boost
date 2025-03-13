const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const weatherRoutes = require('./routes/weather');
const newsRoutes = require('./routes/news');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/news', newsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'DailyBoost API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Weather endpoint: http://localhost:${PORT}/api/weather`);
  console.log(`News endpoint: http://localhost:${PORT}/api/news`);
});