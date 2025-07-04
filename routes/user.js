const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Issue = require('../models/Issue');

// 🔄 GET user data + recent issues by email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const recentIssues = await Issue.find({ userEmail: req.params.email })
      .sort({ createdAt: -1 })
      .limit(5);

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
    console.error("User lookup error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
