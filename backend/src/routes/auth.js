const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, googleAuthSuccess } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Debug route to check token contents
router.get('/debug-token', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ decoded });
  } catch (error) {
    res.json({ error: 'Invalid token', details: error.message });
  }
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  googleAuthSuccess
);

module.exports = router;
