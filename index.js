const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/escalate', require('./routes/escalate'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/help', require('./routes/help'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
