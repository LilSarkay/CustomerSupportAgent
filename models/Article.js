const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: String,
  summary: String,
  content: String
});

module.exports = mongoose.model('Article', ArticleSchema);
