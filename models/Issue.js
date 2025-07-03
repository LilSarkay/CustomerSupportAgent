const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  userId: String,
  description: String,
  status: { type: String, default: 'open' },
  assignedAgent: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);
