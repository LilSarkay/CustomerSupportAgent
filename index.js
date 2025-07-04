const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ✅ app initialized first

const Issue = require('./models/Issue');
const Escalation = require('./models/Escalation');

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ API Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/help', require('./routes/help'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/escalate', require('./routes/escalate'));

// ✅ Dashboard route
app.get('/', async (req, res) => {
  try {
    console.log("🔍 Loading dashboard...");
    const issues = await Issue.find().lean();
    const escalations = await Escalation.find().lean();

    console.log("✅ Loaded", issues.length, "issues");
    console.log("✅ Loaded", escalations.length, "escalations");

    let html = `
      <html>
      <head>
        <title>CustomerSupportAgent Dashboard</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 40px; }
          th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
          th { background-color: #f9f9f9; }
          button { padding: 5px 10px; cursor: pointer; }
        </style>
        <script>
          async function closeTicket(ticketId) {
            const confirmed = confirm("Close ticket " + ticketId + "?");
            if (!confirmed) return;

            const response = await fetch('/api/issues/' + ticketId + '/status', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'closed' })
            });

            const data = await response.json();
            if (response.ok) {
              alert('✅ Ticket closed.');
              location.reload();
            } else {
              alert('❌ Failed to close ticket: ' + (data.error || 'unknown error'));
            }
          }
        </script>
      </head>
      <body>
        <h2>CustomerSupportAgent Dashboard</h2>

        <h3>Open & Active Tickets</h3>
        <table>
          <tr><th>Ticket ID</th><th>User Email</th><th>Status</th><th>Assigned Agent</th><th>Actions</th></tr>
    `;

    issues.forEach(issue => {
      html += `<tr>
        <td>${issue._id}</td>
        <td>${issue.userEmail || '—'}</td>
        <td>${issue.status}</td>
        <td>${issue.assignedAgent || '—'}</td>
        <td>${
          issue.status === 'open'
            ? `<button onclick="closeTicket('${issue._id}')">Close</button>`
            : '—'
        }</td>
      </tr>`;
    });

    html += `
        </table>

        <h3>Escalated Cases</h3>
        <table>
          <tr><th>Ticket ID</th><th>User Email</th><th>Status</th><th>Assigned Employee</th></tr>
    `;

    escalations.forEach(e => {
      html += `<tr>
        <td>${e.ticketId}</td>
        <td>${e.userEmail}</td>
        <td>${e.status}</td>
        <td>${e.assignedEmployee}</td>
      </tr>`;
    });

    html += `
        </table>
        <p style="font-style: italic;">Last updated: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;

    res.send(html);

  } catch (err) {
    console.error("Dashboard render error:", err);
    res.status(500).send("Dashboard unavailable.");
  }
});

// ✅ Launch server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
