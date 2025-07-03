const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.post('/', async (req, res) => {
  const { user_id, ticket_id, rating, comment } = req.body;
  try {
    const feedback = new Feedback({ userId: user_id, ticketId: ticket_id, rating, comment });
    await feedback.save();
    res.json({ feedback_received: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
