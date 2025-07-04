const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Issue = require('./models/Issue');
const Escalation = require('./models/Escalation');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ ROUTES
app.use('/api/user', require('./routes/user'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/help', require('./routes/help'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/escalate', require('./routes/escalate'));

// ✅ Root route → dashboard
app.get('/', async (req, res) => {
  try {
    const issues = await Issue.find({}, '_id assignedAgent status').lean();
    const escalations = await Escalation.find({}, 'ticketId assignedEmployee status').lean();

    let html = `
      <html><head><title>Customer Support Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h2, h3 { color: #333; }
      </style>
      </head><body>
      <h2>🧠 CustomerSupportAgent Dashboard</h2>

      <h3>Open Tickets</h3>
      <table>
        <tr><th>Ticket ID</th><th>Assigned Agent</th><th>Status</th></tr>
    `;

    issues.forEach(issue => {
      html += `<tr>
        <td>${issue._id}</td>
        <td>${issue.assignedAgent || '—'}</td>
        <td>${issue.status}</td>
      </tr>`;
    });

    html += `
      </table>

      <h3>Escalated Cases</h3>
      <table>
        <tr><th>Ticket ID</th><th>Assigned Employee</th><th>Status</th></tr>
    `;

    escalations.forEach(e => {
      html += `<tr>
        <td>${e.ticketId}</td>
        <td>${e.assignedEmployee}</td>
        <td>${e.status}</td>
      </tr>`;
    });

    html += `
      </table>
      <p style="margin-top:20px;font-style:italic;">Hosted on Render | ${new Date().toLocaleString()}</p>
      </body></html>
    `;

    res.send(html);
  } catch (err) {
    console.error("Dashboard render error:", err);
    res.status(500).send("⚠️ Dashboard unavailable. Please try again later.");
  }
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
