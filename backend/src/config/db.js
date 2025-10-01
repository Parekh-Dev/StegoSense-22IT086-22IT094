const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Support both MONGO_URI (local) and MONGODB_URI (Railway)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection failed ❌', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
