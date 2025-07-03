const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Issue = require('../models/Issue');

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const recentIssues = await Issue.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(5);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      recent_issues: recentIssues.map(issue => ({
        ticket_id: issue._id,
        status: issue.status,
        summary: issue.description
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
