const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

router.post('/', async (req, res) => {
  const { user_id, ticket_id, escalation_reason } = req.body;
  try {
    const issue = await Issue.findById(ticket_id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Escalation logic can be customized
    const case_id = `ESCALATE-${Date.now()}`;
    issue.status = 'escalated';
    issue.assignedAgent = 'senior-support@rediff.com';
    await issue.save();

    res.json({
      case_id,
      assigned_agent: issue.assignedAgent,
      follow_up_instructions: "Our senior support agent will contact you within 12 hours."
    });
  } catch (err) {
    res.status(500).json({ error: 'Escalation failed' });
  }
});

module.exports = router;
