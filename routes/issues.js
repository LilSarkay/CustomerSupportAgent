const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

router.post('/', async (req, res) => {
  const { ticketId, issue_description } = req.body;
  try {
    const issue = new Issue({
      ticketId,
      description: issue_description,
      assignedAgent: 'support@phronetic.ai'
    });
    await issue.save();
    res.json({
      ticket_id: issue._id,
      status: issue.status,
      assigned_agent: issue.assignedAgent,
      estimated_resolution_time: '24 hours'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

router.get('/:ticketId', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.ticketId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json({
      ticket_id: issue._id,
      status: issue.status,
      last_updated: issue.updatedAt,
      summary: issue.description
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:ticketId/agent', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.ticketId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json({
      assigned_agent: {
        name: "Support Agent",
        email: issue.assignedAgent,
        role: "support_specialist"
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
