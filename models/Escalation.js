const mongoose = require('mongoose');

const EscalationSchema = new mongoose.Schema({
  userEmail: String,
  ticketId: String,
  escalationReason: String,
  assignedEmployee: String,
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Escalation', EscalationSchema);
