const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// 🧠 Default GET handler to prevent "must be a function" crash
router.get('/', (req, res) => {
  res.json({ message: 'Help route is working!' });
});

// 🔍 POST /api/help/search – Search help articles by query
router.post('/search', async (req, res) => {
  const { query } = req.body;
  try {
    const articles = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).limit(1);

    if (articles.length === 0) {
      return res.status(404).json({ error: 'No relevant articles found' });
    }

    const article = articles[0];
    res.json({
      article_title: article.title,
      summary: article.summary,
      link: `https://rediff.com/support/articles/${article._id}`
    });
  } catch (err) {
    console.error('❌ Help search failed:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
