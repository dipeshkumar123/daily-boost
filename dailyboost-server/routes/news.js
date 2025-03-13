// routes/news.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/news
// Fetches top headlines from NewsAPI
router.get('/', async (req, res) => {
  try {
    // Get category from query parameter or use default
    const category = req.query.category || 'general';
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'News API key is not configured',
        message: 'Please add NEWS_API_KEY to your .env file'
      });
    }

    // List of valid categories for NewsAPI
    const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Fetch data from NewsAPI
    const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=3&apiKey=${apiKey}`;
    const response = await axios.get(url);
    
    // Format the response to include only what we need
    const articles = response.data.articles.map(article => ({
      title: article.title,
      source: article.source.name,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toLocaleString(),
      // Limit description to 100 characters
      description: article.description ? 
        (article.description.length > 100 ? 
          article.description.substring(0, 100) + '...' : 
          article.description) : 
        'No description available'
    }));
    
    res.json({
      category,
      articles
    });
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news data',
      message: error.message
    });
  }
});

module.exports = router;