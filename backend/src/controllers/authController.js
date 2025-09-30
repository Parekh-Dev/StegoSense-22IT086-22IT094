const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logHistory } = require('./historyController');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'All fields required' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hash });
    await user.save();

    // Log signup activity
    await logHistory(
      user._id,
      'SIGNUP',
      `New user registered: ${name}`,
      { email, registrationMethod: 'email' },
      req
    );

    const token = jwt.sign({ 
      id: user._id, 
      name: user.name, 
      email: user.email 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Log login activity
    await logHistory(
      user._id,
      'LOGIN',
      `User logged in: ${user.name}`,
      { email, loginMethod: 'email' },
      req
    );

    const token = jwt.sign({ 
      id: user._id, 
      name: user.name, 
      email: user.email 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Google OAuth success callback
exports.googleAuthSuccess = async (req, res) => {
  try {
    if (req.user) {
      // Log Google login activity
      await logHistory(
        req.user._id,
        'LOGIN',
        `User logged in with Google: ${req.user.name}`,
        { email: req.user.email, loginMethod: 'google' },
        req
      );

      const token = jwt.sign({ 
        id: req.user._id, 
        name: req.user.name, 
        email: req.user.email 
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  } catch (err) {
    console.error('Google auth success error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
