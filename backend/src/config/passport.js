const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
const callbackURL = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_CALLBACK_URL_PROD || "https://stegosense.vercel.app/api/auth/google/callback"
  : process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback";

console.log('🔧 Google OAuth Callback URL:', callbackURL);
console.log('🔧 Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('🔧 Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      return done(null, existingUser);
    }
    
    // Check if user exists with same email (link accounts)
    existingUser = await User.findOne({ email: profile.emails[0].value });
    
    if (existingUser) {
      // Link Google account to existing user
      existingUser.googleId = profile.id;
      await existingUser.save();
      return done(null, existingUser);
    }
    
    // Create new user
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      // No password needed for Google users
    });
    
    await newUser.save();
    done(null, newUser);
    
  } catch (error) {
    console.error('Google OAuth Error:', error);
    done(error, null);
  }
}));

module.exports = passport;
