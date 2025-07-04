const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'open' },
  assignedAgent: { type: String, default: 'support@phronetic.ai' }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
