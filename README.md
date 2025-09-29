# StegoSense - Steganography Detection System

**Team**: 22IT086 & 22IT094  
**Project**: Advanced steganography detection web application with machine learning capabilities

## 🎯 Features

- **🔍 Steganography Detection**: Advanced algorithms to detect hidden content in images
- **🔐 User Authentication**: 
  - Traditional email/password login
  - Google OAuth integration
- **📊 User Dashboard**: Track analysis history and statistics
- **🖼️ Image Preview**: Real-time preview of uploaded images
- **📈 History Tracking**: Complete analysis history with filtering and pagination
- **👤 User Management**: Secure user profiles and session management

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Modern UI components** with responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Parekh-Dev/StegoSense-22IT086-22IT094.git
   cd StegoSense-22IT086-22IT094
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   Create `.env` in the backend directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/stegosense
   JWT_SECRET=your-jwt-secret
   FRONTEND_URL=http://localhost:5173
   SESSION_SECRET=your-session-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Start the Application**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## 📁 Project Structure

```
StegoSense/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Passport configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── index.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── config/         # API configuration
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # React entry point
│   └── package.json
└── uploads/                # User uploaded images (temporary storage)
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### File Upload & Analysis
- `POST /api/upload` - Upload and analyze image

### History Management
- `GET /api/history` - Get user's analysis history
- `GET /api/history/stats` - Get user statistics
- `DELETE /api/history/:id` - Delete specific analysis
- `DELETE /api/history/clear/all` - Clear all history

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: Secure file handling with type validation

## 👥 Team Members

- **22IT086**: [Team Member 1]
- **22IT094**: [Team Member 2]

## 📄 License

This project is developed as part of academic coursework.

## 🤝 Contributing

This is an academic project. For any queries or suggestions, please contact the team members.

---

**StegoSense** - Making hidden content visible through advanced detection algorithms.