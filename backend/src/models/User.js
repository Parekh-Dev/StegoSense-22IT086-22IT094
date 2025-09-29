const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false }, // Made optional for Google users
  createdAt: { type: Date, default: Date.now },
  
  // Google OAuth fields (optional)
  googleId: { type: String, sparse: true }, // sparse allows multiple null values
  
  // Optional: array to store analysis results later
  results: [
    {
      filename: String,
      isStego: Boolean,
      confidence: Number,
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
