const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: String,
  ticketId: String,
  rating: Number,
  comment: String,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
