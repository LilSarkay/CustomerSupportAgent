const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Escalation = require('../models/Escalation');
const nodemailer = require('nodemailer');

// List of employee support emails (update this list as needed)
const employeeEmails = [
  "saanvi.ravikiran@gmail.com",
  "ananya.jason.rajput@gmail.com",
  "saanvi.mitmpl2022@learner.manipal.edu"
];

// Optional: email transporter (use real creds if available)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ESCALATION_EMAIL, // Your support Gmail
    pass: process.env.ESCALATION_PASS   // App password or real pass
  }
});

router.post('/', async (req, res) => {
  const { user_id, ticket_id, escalation_reason, user_email } = req.body;

  try {
    const issue = await Issue.findById(ticket_id);
    if (!issue) return res.status(404).json({ error: 'Ticket not found' });

    // Pick a random employee
    const assignedEmployee = employeeEmails[Math.floor(Math.random() * employeeEmails.length)];

    // Save escalation info
    const record = await Escalation.create({
      userId: user_id,
      userEmail: user_email,
      ticketId: ticket_id,
      escalationReason: escalation_reason,
      assignedEmployee,
      status: "open"
    });

    // Optional: send email to the employee
    await transporter.sendMail({
      from: process.env.ESCALATION_EMAIL,
      to: assignedEmployee,
      subject: `🚨 New Escalated Ticket #${ticket_id}`,
      text: `
        A new issue has been escalated:
        Ticket ID: ${ticket_id}
        User Email: ${user_email}
        Reason: ${escalation_reason}

        Please follow up directly with the user.
      `
    });

    // Respond to GPT agent
    res.json({
      case_id: record._id,
      assigned_agent: assignedEmployee,
      follow_up_instructions: `The issue has been escalated to ${assignedEmployee}. They will follow up with the user via email.`
    });

  } catch (err) {
    console.error("Escalation error:", err);
    res.status(500).json({ error: 'Escalation failed' });
  }
});

module.exports = router;
