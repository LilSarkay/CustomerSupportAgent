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

router.post('/', async (req, res) => {
  const sessionEmail = req.session?.user?.email;
  const userEmail = sessionEmail || req.body.userEmail;
  const { issue_description } = req.body;

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
        text: `New ticket escalated.\n\nTicket ID: ${newIssue._id}\nUser: ${userEmail}\nDescription: ${issue_description}`
      });

      await transporter.sendMail({
        from: process.env.ESCALATION_EMAIL,
        to: userEmail,
        subject: `Your Rediff Ticket Was Escalated: ${newIssue._id}`,
        text: `Your issue was escalated to a human agent.\n\nTicket ID: ${newIssue._id}\nStatus: escalated\nAssigned: ${assignedEmployee}`
      });

      return res.json({
        ticket_id: newIssue._id,
        status: "escalated",
        assigned_employee: assignedEmployee
      });
    }

    await transporter.sendMail({
      from: process.env.ESCALATION_EMAIL,
      to: userEmail,
      subject: `Your Rediff Ticket Was Created: ${newIssue._id}`,
      text: `We have created your support ticket.\n\nTicket ID: ${newIssue._id}\nStatus: open\nAssigned: support@phronetic.ai`
    });

    res.json({
      ticket_id: newIssue._id,
      status: "open",
      assigned_agent: "support@phronetic.ai"
    });

  } catch (err) {
    console.error("❌ Issue creation failed:", err.message);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// PATCH and DELETE routes remain unchanged
