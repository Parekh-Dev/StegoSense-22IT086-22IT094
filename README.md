# StegoSense - Advanced Steganography Detection System

**Team**: 22IT086 & 22IT094  
**Project**: Intelligent steganography detection web application with advanced machine learning capabilities

## 🎯 Overview

StegoSense is a cutting-edge web application designed to detect hidden steganographic content in images and videos. Using state-of-the-art machine learning algorithms, it provides users with powerful tools to analyze multimedia files for concealed data, making it an essential tool for cybersecurity professionals, digital forensics experts, and researchers.

## ✨ Key Features

### 🔍 **Advanced Detection Engine**
- **Multi-Format Support**: Analyze images (PNG, JPEG, GIF, BMP) and videos (MP4, AVI, MOV, MKV)
- **Real-Time Analysis**: Fast processing with detailed result reporting
- **Binary Classification**: Clear YES/NO detection results with detailed analysis
- **Batch Processing**: Handle multiple files efficiently

### 🔐 **Secure Authentication System**
- **Multi-Authentication**: Traditional email/password and Google OAuth integration
- **Session Management**: Secure JWT-based authentication with automatic session handling
- **User Profiles**: Personal dashboards with customizable settings

### 📊 **Comprehensive Analytics**
- **Analysis History**: Complete tracking of all detection activities
- **Statistical Insights**: Performance metrics and usage analytics
- **Export Capabilities**: Download analysis reports and results
- **Real-Time Monitoring**: Live status updates during processing

### 🎨 **Modern User Interface**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Real-Time Preview**: Instant file previews and progress indicators
- **Dark/Light Theme**: Customizable interface themes

## 🛠️ Technology Stack

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM for data persistence
- **Authentication**: JWT tokens with Passport.js for OAuth integration
- **File Processing**: Multer for secure file handling and storage
- **Security**: bcryptjs for password hashing and data protection
- **API Design**: RESTful API with comprehensive error handling

### Frontend Framework
- **Core**: React 19 with modern hooks and functional components
- **Build Tool**: Vite for lightning-fast development and optimized builds
- **Styling**: Tailwind CSS for responsive and modern UI design
- **Routing**: React Router for seamless single-page application navigation
- **HTTP Client**: Axios for efficient API communication
- **State Management**: React Context and hooks for application state

### Development & Deployment
- **Containerization**: Docker with docker-compose for consistent environments
- **Environment Management**: Secure environment variable handling
- **CORS Configuration**: Properly configured for secure cross-origin requests
- **Production Ready**: Optimized builds with security headers and performance tuning

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: Version 18+ recommended
- **MongoDB**: Local installation or cloud instance (MongoDB Atlas)
- **Docker**: For containerized deployment (optional)
- **Google Cloud Console**: For OAuth integration

### Installation Methods

#### Method 1: Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/Parekh-Dev/StegoSense-22IT086-22IT094.git
cd StegoSense-22IT086-22IT094/stegosense

# Start with Docker
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001
```

#### Method 2: Manual Setup
```bash
# Clone and navigate to project
git clone https://github.com/Parekh-Dev/StegoSense-22IT086-22IT094.git
cd StegoSense-22IT086-22IT094/stegosense

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/stegosense

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### Running the Application

**Development Mode:**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build and start
npm run build
npm start
```

## 📁 Project Architecture

```
stegosense/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Database & authentication config
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── passport.js    # OAuth configuration
│   │   ├── controllers/       # Business logic controllers
│   │   │   ├── authController.js
│   │   │   └── historyController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   └── authMiddleware.js
│   │   ├── models/            # Database models
│   │   │   ├── User.js
│   │   │   └── History.js
│   │   ├── routes/            # API route definitions
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   └── history.js
│   │   ├── services/          # Detection services
│   │   │   └── stegoDetectionService.js
│   │   └── index.js           # Server entry point
│   ├── uploads/               # Temporary file storage
│   ├── Dockerfile            # Backend container config
│   └── package.json
├── frontend/                  # React Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ConfirmationModal.jsx
│   │   ├── config/          # Configuration files
│   │   │   └── api.js       # API endpoints
│   │   ├── pages/           # Main page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── MainApp.jsx
│   │   │   └── History.jsx
│   │   ├── assets/          # Images and static files
│   │   └── main.jsx         # React entry point
│   ├── Dockerfile           # Frontend container config
│   ├── nginx.conf           # Production web server config
│   └── package.json
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Project documentation
```

## 🔧 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register              # User registration
POST   /api/auth/login                 # User login
POST   /api/auth/logout                # User logout
GET    /api/auth/google                # Initiate Google OAuth
GET    /api/auth/google/callback       # Handle OAuth callback
```

### File Analysis Endpoints
```
POST   /api/upload                     # Upload and analyze files
GET    /api/upload/status              # Check analysis status
```

### History Management Endpoints
```
GET    /api/history                    # Retrieve analysis history
GET    /api/history/stats              # Get user statistics
DELETE /api/history/:id                # Delete specific analysis
DELETE /api/history/clear/all          # Clear all user history
```

### Health Check Endpoints
```
GET    /api/health                     # System health status
GET    /api/version                    # Application version info
```

## 🔐 Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication with configurable expiration
- **OAuth Integration**: Google OAuth 2.0 for seamless third-party authentication
- **Password Security**: bcrypt hashing with salt rounds for maximum security
- **Session Management**: Secure session handling with automatic cleanup

### Data Protection
- **Input Validation**: Comprehensive sanitization of all user inputs
- **File Upload Security**: Type validation, size limits, and secure storage
- **CORS Configuration**: Properly configured cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Error Handling**: Sanitized error messages to prevent information leakage

### Infrastructure Security
- **Docker Security**: Multi-stage builds and minimal attack surface
- **Database Security**: Connection string encryption and query sanitization
- **HTTP Headers**: Security headers for XSS and clickjacking protection

## 📊 Performance & Scalability

### Optimization Features
- **Lazy Loading**: Dynamic component loading for faster initial page loads
- **Image Optimization**: Automatic compression and format conversion
- **Caching Strategy**: Intelligent caching for frequently accessed data
- **Database Indexing**: Optimized database queries with proper indexing

### Monitoring & Analytics
- **Performance Metrics**: Real-time monitoring of application performance
- **Error Tracking**: Comprehensive error logging and reporting
- **Usage Analytics**: Detailed insights into user behavior and system usage

## 🧪 Testing & Quality Assurance

### Testing Framework
- **Unit Tests**: Comprehensive component and function testing
- **Integration Tests**: End-to-end API testing
- **Security Testing**: Vulnerability scanning and penetration testing
- **Performance Testing**: Load testing and bottleneck identification

### Code Quality
- **ESLint**: Consistent code formatting and error detection
- **Prettier**: Automatic code formatting
- **Git Hooks**: Pre-commit validation and testing

## 🚀 Deployment Options

### Development Environment
- Local development with hot reloading
- Docker development containers
- Environment-specific configurations

### Production Deployment
- **Docker Production**: Multi-stage builds with optimized images
- **Cloud Deployment**: Compatible with AWS, Google Cloud, Azure
- **CDN Integration**: Static asset optimization and delivery
- **SSL/TLS**: HTTPS encryption for secure communications

## 👥 Team Information

**Development Team:**
- **22IT086**: Lead Full-Stack Developer
- **22IT094**: Backend Specialist & DevOps Engineer

**Project Scope**: Advanced steganography detection system with machine learning integration

## � License & Usage

This project is developed as part of academic coursework and is available for educational purposes. For commercial usage or contributions, please contact the development team.

## 🤝 Support & Contribution

### Getting Help
- **Documentation**: Comprehensive guides and API documentation
- **Issue Tracking**: GitHub issues for bug reports and feature requests
- **Community**: Active development team for support and guidance

### Contributing Guidelines
- Follow established coding standards and practices
- Include comprehensive tests for new features
- Update documentation for any API changes
- Submit pull requests with detailed descriptions

---

**StegoSense** - Empowering digital security through advanced steganography detection technology.

*Developed with ❤️ by Team 22IT086 & 22IT094*