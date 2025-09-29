const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN', 
      'LOGOUT', 
      'SIGNUP', 
      'FILE_UPLOAD', 
      'ANALYSIS_COMPLETE', 
      'PROFILE_UPDATE',
      'PASSWORD_CHANGE',
      'ACCOUNT_DELETE'
    ]
  },
  description: { 
    type: String, 
    required: true 
  },
  metadata: {
    // Flexible object to store additional data
    filename: String,
    fileSize: Number,
    fileType: String,
    analysisResult: {
      isStego: Boolean,
      confidence: Number
    },
    ipAddress: String,
    userAgent: String,
    location: String
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for faster queries
historySchema.index({ userId: 1, timestamp: -1 });
historySchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('History', historySchema);
