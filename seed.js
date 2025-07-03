const mongoose = require('mongoose');
require('dotenv').config();

const Article = require('./models/Article');

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  seedArticles();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

async function seedArticles() {
  const articles = [
    {
      title: "How to Reset Your Password",
      summary: "Steps to reset your password if you've forgotten it.",
      content: `
        1. Visit https://rediff.com/login
        2. Click "Forgot Password"
        3. Enter your email address
        4. Follow the reset link sent to your inbox
        5. Choose a new secure password
      `
    },
    {
      title: "Fixing Inbox Not Loading",
      summary: "If your inbox isn't loading, try these steps.",
      content: `
        1. Clear your browser cache and cookies
        2. Disable browser extensions
        3. Try a different browser or device
        4. Check your internet connection
        5. If the issue persists, contact support
      `
    },
    {
      title: "Understanding Spam Filter Settings",
      summary: "Control what gets marked as spam in your Rediff inbox.",
      content: `
        - Go to Settings > Spam Filters
        - Add trusted senders to your whitelist
        - Adjust sensitivity to High, Medium, or Low
        - Review spam folder regularly to catch false positives
      `
    },
    {
      title: "How to Change Your Email Address",
      summary: "Need to update your Rediff account email?",
      content: `
        1. Log into your Rediff account
        2. Go to Profile Settings
        3. Click "Edit Email"
        4. Enter the new email and verify it
        5. Confirm using the OTP sent to your new address
      `
    },
    {
      title: "How to Delete Your Rediff Account",
      summary: "We’re sorry to see you go. Here’s how to delete your account.",
      content: `
        1. Log into your account
        2. Navigate to Account Settings
        3. Scroll to the bottom and click "Delete Account"
        4. Enter your password to confirm
        5. Once deleted, your data is permanently removed
      `
    },
    {
      title: "Enable Two-Factor Authentication (2FA)",
      summary: "Protect your Rediff account with 2FA.",
      content: `
        1. Go to Settings > Security
        2. Enable "Two-Factor Authentication"
        3. Link your mobile number or use an authenticator app
        4. Save backup codes in a safe place
      `
    },
    {
      title: "How to Recover a Hacked Account",
      summary: "If your account is compromised, take action now.",
      content: `
        1. Visit rediff.com/recover
        2. Enter your email and follow the recovery steps
        3. If locked out, contact support with your last login info
        4. Change your password and enable 2FA immediately
      `
    },
    {
      title: "How to Report Phishing or Fraud",
      summary: "Report suspicious activity to keep your account safe.",
      content: `
        - Forward phishing emails to abuse@rediff.com
        - Do not click unknown links or download attachments
        - Report compromised accounts immediately
      `
    }
  ];

  try {
    for (const article of articles) {
      const exists = await Article.findOne({ title: article.title });
      if (!exists) {
        await Article.create(article);
        console.log(`✅ Inserted: ${article.title}`);
      } else {
        console.log(`⚠️ Already exists: ${article.title}`);
      }
    }
    console.log('🌱 Help articles seeded successfully.');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding articles:', err);
    process.exit(1);
  }
}
