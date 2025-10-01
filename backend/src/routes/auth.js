const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, googleAuthSuccess } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL_PROD || 'https://stegosense.vercel.app'
      : process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed` 
  }),
  googleAuthSuccess
);

module.exports = router;
