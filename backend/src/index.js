// Force environment logging before anything else
console.log('🔧 ENVIRONMENT DEBUG START:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('PORT:', process.env.PORT || 'undefined');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('🔧 ENVIRONMENT DEBUG END');

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Loading .env file for development...');
  require('dotenv').config();
} else {
  console.log('Production mode - skipping .env file');
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
app.use(helmet());
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
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/history', historyRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('StegoSense Backend Running 🚀');
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
