// routes/feedback.js
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { userEmail, rating, comments } = req.body;
  if (!userEmail || !rating) {
    return res.status(400).json({ error: 'userEmail and rating are required' });
  }

  console.log(`✅ Feedback received: ${userEmail} → ${rating} stars`);
  // Optional: Save to MongoDB later
  res.json({ message: 'Feedback received. Thank you!' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Feedback route is working!' });
});

module.exports = router;
