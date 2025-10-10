// Railway might not be using Docker, so let's be more explicit
console.log('🚀 STARTING APPLICATION...');
console.log('🔧 ENVIRONMENT DEBUG START:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('MONGO_URI length:', process.env.MONGO_URI ? process.env.MONGO_URI.length : 0);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('🔧 ENVIRONMENT DEBUG END');

// Try to load dotenv but don't fail if it doesn't work
try {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Loading .env file for development...');
    require('dotenv').config();
  } else {
    console.log('Production mode - Railway should provide env vars');
  }
} catch (err) {
  console.log('Dotenv loading skipped:', err.message);
}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');

// Initialize passport configuration
require('./config/passport');

const app = express();

// Connect to DB first
connectDB();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Other middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"],
      "script-src-attr": ["'unsafe-inline'"]
    }
  }
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://stego-sense.vercel.app'
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const historyRoutes = require('./routes/history');
const cnnRnnTestRoutes = require('./routes/cnnRnnTest'); // New CNN+RNN test route
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/cnn-rnn-test', cnnRnnTestRoutes); // New CNN+RNN testing endpoint

// Basic test route
app.get('/', (req, res) => {
  res.json({
    message: 'StegoSense Backend Running 🚀 - Updated Version 3.0',
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    FRONTEND_URL_PROD_SET: !!process.env.FRONTEND_URL_PROD,
    FRONTEND_URL_PROD_VALUE: process.env.FRONTEND_URL_PROD,
    timestamp: new Date().toISOString()
  });
});

// Serve the test HTML page
app.get('/test', (req, res) => {
  const path = require('path');
  const testFilePath = path.join(__dirname, '../../../test_upload.html');
  res.sendFile(testFilePath);
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
