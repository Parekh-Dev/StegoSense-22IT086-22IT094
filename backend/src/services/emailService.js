const nodemailer = require('nodemailer');

// Create reusable transporter object using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password for Gmail
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'StegoSense - Password Reset Request',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5;">StegoSense</h1>
        </div>
        
        <h2 style="color: #374151;">Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password for your StegoSense account. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
        
        <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
          This link will expire in 1 hour for security reasons.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        
        <p style="color: #6B7280; font-size: 12px;">
          If you're having trouble with the button above, copy and paste the URL into your web browser.
        </p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};
