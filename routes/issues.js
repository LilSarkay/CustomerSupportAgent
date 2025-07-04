const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Escalation = require('../models/Escalation');
const nodemailer = require('nodemailer');

const TRIGGER_WORDS = ["human", "person", "agent", "talk to", "someone", "speak to", "real person"];

const employeeEmails = [
  "saanvi.ravikiran@gmail.com",
  "ananya.jason.rajput@gmail.com",
  "support@phronetic.ai"
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ESCALATION_EMAIL,
    pass: process.env.ESCALATION_PASS
  }
});

// ✅ Create new issue (auto-escalates if needed)
router.post('/', async (req, res) => {
  const { userEmail, issue_description } = req.body;

  if (!userEmail || !issue_description) {
    return res.status(400).json({ error: 'Missing required fields: userEmail or issue_description' });
  }

  try {
    const newIssue = await Issue.create({
      userEmail,
      description: issue_description,
      status: "open",
      assignedAgent: "support@phronetic.ai"
    });

    const lowerDesc = issue_description.toLowerCase();
    const shouldEscalate = TRIGGER_WORDS.some(word => lowerDesc.includes(word));

    if (shouldEscalate) {
      const assignedEmployee = employeeEmails[Math.floor(Math.random() * employeeEmails.length)];

      await Escalation.create({
        userEmail,
        ticketId: newIssue._id,
        escalationReason: issue_description,
        assignedEmployee,
        status: "open"
      });

      await transporter.sendMail({
        from: process.env.ESCALATION_EMAIL,
        to: assignedEmployee,
        subject: `Escalated Ticket: ${newIssue._id}`,
        text: `
A user has requested human support.

Ticket ID: ${newIssue._id}
User Email: ${userEmail}
Issue Description: ${issue_description}

Please reach out to the user as soon as possible.
        `
      });

      return res.json({
        ticket_id: newIssue._id,
        status: "escalated",
        assigned_employee: assignedEmployee,
        follow_up_instructions: `A human agent at ${assignedEmployee} has been assigned to this ticket.`
      });
    }

    res.json({
      ticket_id: newIssue._id,
      status: "open",
      assigned_agent: "support@phronetic.ai",
      estimated_resolution_time: "24 hours"
    });

  } catch (err) {
    console.error("❌ Issue creation failed:", err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// ✅ PATCH: Update ticket status
router.patch('/:ticketId/status', async (req, res) => {
  const { status } = req.body;
  const { ticketId } = req.params;

  if (!["open", "closed", "in_progress", "escalated"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const issue = await Issue.findById(ticketId);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.status = status;
    await issue.save();

    res.json({
      message: `Ticket ${ticketId} status updated to '${status}'`,
      ticket_id: issue._id,
      status: issue.status
    });

  } catch (err) {
    console.error("❌ Status update failed:", err);
    res.status(500).json({ error: "Server error while updating status" });
  }
});

// ✅ DELETE: Delete a ticket
router.delete('/:ticketId', async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.ticketId);
    if (!deleted) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully", ticket_id: deleted._id });

  } catch (err) {
    console.error("❌ Delete failed:", err);
    res.status(500).json({ error: "Server error while deleting ticket" });
  }
});

module.exports = router;
