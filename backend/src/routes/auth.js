const router = require('express').Router();
const passport = require('passport');
const { register, login, googleAuthSuccess } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  googleAuthSuccess
);

module.exports = router;
