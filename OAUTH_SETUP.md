# Google OAuth & Password Reset Setup

## 🎉 Features Added

✅ **Google OAuth Login** - Users can sign in with their Google account
✅ **Password Reset via Email** - Forgot password functionality with email notifications
✅ **Enhanced Security** - Session management and secure authentication flows
✅ **Preserved Existing Features** - All current functionality remains intact

## 🚀 Setup Instructions

### Backend Configuration

1. **Environment Variables** (`.env` file):
   ```env
   # Google OAuth (Get from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   
   # Email Settings (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   EMAIL_FROM=StegoSense <your-email@gmail.com>
   ```

2. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5001/api/auth/google/callback`

3. **Gmail App Password** (for password reset emails):
   - Enable 2-Factor Authentication on your Gmail
   - Generate App Password in Google Account settings
   - Use the app password in `EMAIL_PASS` environment variable

### Frontend URLs

- **Main App**: http://localhost:5174/
- **Login**: http://localhost:5174/login
- **Forgot Password**: http://localhost:5174/forgot-password
- **Reset Password**: http://localhost:5174/reset-password/[token]

### Backend API Endpoints

- **Google OAuth Start**: `GET /api/auth/google`
- **Google OAuth Callback**: `GET /api/auth/google/callback`
- **Forgot Password**: `POST /api/auth/forgot-password`
- **Reset Password**: `POST /api/auth/reset-password/:token`

## 🔐 Security Features

- **Password Reset Tokens**: 10-minute expiration
- **Secure Sessions**: HTTP-only cookies with proper CORS
- **Email Security**: No user enumeration (same response for existing/non-existing emails)
- **Google OAuth**: Secure third-party authentication

## 📱 User Experience

### Google Login Flow:
1. User clicks "Continue with Google" on login page
2. Redirected to Google OAuth consent screen
3. After authorization, redirected back to app with JWT token
4. Automatically signed in to main application

### Password Reset Flow:
1. User clicks "Forgot Password" on login page
2. Enters email address and submits
3. Receives email with reset link (if account exists)
4. Clicks link to access secure reset page
5. Sets new password and redirected to login

## 🛡️ Safety Measures

- ✅ **No Breaking Changes**: Existing login/signup functionality unchanged
- ✅ **Database Safe**: New optional fields added to User model
- ✅ **Error Handling**: Comprehensive error management
- ✅ **User Privacy**: Secure token handling and email practices

## 🔧 Development Notes

- **MongoDB**: User model extended with optional Google ID and reset token fields
- **History Tracking**: Login methods (email/google) and password reset events logged
- **JWT Integration**: Both traditional and Google OAuth generate same token format
- **Frontend Routing**: New pages for forgot password, reset password, and OAuth callback

## 🎯 Next Steps

1. Configure Google Cloud OAuth credentials
2. Set up email service (Gmail or other SMTP)
3. Update environment variables
4. Test Google login and password reset flows
5. Deploy to production with proper HTTPS and security headers

---

**Note**: All existing features (file upload, steganography detection, user history) remain fully functional. The new authentication features are additive enhancements.
