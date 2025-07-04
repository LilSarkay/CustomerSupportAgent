const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Escalation = require('../models/Escalation');
const nodemailer = require('nodemailer');

// 🧑‍💼 Employee emails to assign escalated tickets
const employeeEmails = [
  "saanvi.ravikiran@gmail.com",
  "ananya.jason.rajput@gmail.com",
  "saanvi.mitmpl2022@learner.manipal.edu"
];

// 📧 Setup email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ESCALATION_EMAIL,
    pass: process.env.ESCALATION_PASS
  }
});

// ✅ POST /api/escalate – Escalate a ticket
router.post('/', async (req, res) => {
  const { ticket_id, escalation_reason, user_email } = req.body;

  try {
    const issue = await Issue.findById(ticket_id);
    if (!issue) return res.status(404).json({ error: 'Ticket not found' });

    const assignedEmployee = employeeEmails[Math.floor(Math.random() * employeeEmails.length)];

    const record = await Escalation.create({
      userEmail: user_email,
      ticketId: ticket_id,
      escalationReason: escalation_reason,
      assignedEmployee,
      status: "open"
    });

    await transporter.sendMail({
      from: process.env.ESCALATION_EMAIL,
      to: assignedEmployee,
      subject: `New Escalated Ticket #${ticket_id}`,
      text: `
A new issue has been escalated:

Ticket ID: ${ticket_id}
User Email: ${user_email}
Reason: ${escalation_reason}

Please follow up directly with the user.
      `
    });

    res.json({
      case_id: record._id,
      assigned_agent: assignedEmployee,
      follow_up_instructions: `The issue has been escalated to ${assignedEmployee}. They will follow up with the user via email.`
    });

  } catch (err) {
    console.error("❌ Escalation error:", err.message);
    res.status(500).json({ error: 'Escalation failed' });
  }
});

// 🛡️ Safe default GET route
router.get('/', (req, res) => {
  res.json({ message: 'Escalation route is working.' });
});

module.exports = router;
