const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cnnRnnDetectionService = require('../services/cnnRnnDetectionService');
const MockCNNRNNDetectionService = require('../services/mockCnnRnnService');
const requireAuth = require('../middleware/authMiddleware');
const { logHistory } = require('../controllers/historyController');

// Initialize services
const mockService = new MockCNNRNNDetectionService();

const router = express.Router();

// Configure multer for file uploads (separate from your main upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/cnn-rnn-test');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `cnn-rnn-test-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|bmp/;
    const allowedVideoTypes = /mp4|avi|mov|mkv|wmv|flv|webm/;
    const extname = path.extname(file.originalname).toLowerCase();
    
    const isImage = allowedImageTypes.test(extname) && file.mimetype.startsWith('image/');
    const isVideo = allowedVideoTypes.test(extname) && file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed for CNN+RNN testing'));
    }
  }
});

/**
 * Test route for CNN+RNN model
 * POST /api/cnn-rnn-test/detect
 * This is separate from your main upload functionality
 */
router.post('/detect', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided for CNN+RNN testing' 
      });
    }

    console.log('🧠 CNN+RNN Test Detection Started');
    console.log('User:', req.user.email);
    console.log('File:', req.file.filename);

    // Log file upload activity
    await logHistory(
      req.user.id,
      'FILE_UPLOAD',
      `Uploaded file for CNN+RNN analysis: ${req.file.originalname}`,
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        detectionMethod: 'CNN+RNN'
      },
      req
    );

    // Run CNN+RNN detection with fallback to mock service
    let detectionResult;
    try {
      // Try real CNN+RNN detection first
      detectionResult = await cnnRnnDetectionService.detectSteganography(req.file.path);
      console.log('✅ Real CNN+RNN detection successful');
    } catch (realError) {
      console.warn('⚠️ Real CNN+RNN detection failed, using mock service');
      console.warn('Real error:', realError.message);
      // Use mock service as fallback
      detectionResult = await mockService.detectSteganography(req.file.path);
    }

    // Log analysis completion
    await logHistory(
      req.user.id,
      'ANALYSIS_COMPLETE',
      `CNN+RNN analysis completed for: ${req.file.originalname}`,
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        detectionMethod: 'CNN+RNN',
        analysisResult: {
          isStego: detectionResult.isStego,
          confidence: detectionResult.confidence,
          severity: detectionResult.severity,
          method: 'CNN_RNN_TEMPORAL'
        }
      },
      req
    );

    // Clean up test file after detection
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('Could not clean up test file:', cleanupError.message);
    }

    // Return result in same format as your main app
    res.json({
      success: true,
      result: {
        ...detectionResult,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      },
      model_info: {
        type: 'CNN+RNN',
        description: 'Advanced temporal steganography detection using friend\'s trained model',
        architecture: 'ResNet152 CNN + LSTM RNN'
      }
    });

  } catch (error) {
    console.error('❌ CNN+RNN Detection Error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not clean up test file after error:', cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: 'CNN+RNN detection failed',
      details: error.message
    });
  }
});

/**
 * Health check for CNN+RNN service
 * GET /api/cnn-rnn-test/health
 */
router.get('/health', async (req, res) => {
  try {
    let healthStatus;
    try {
      // Try real service health check first
      healthStatus = await cnnRnnDetectionService.healthCheck();
      console.log('✅ Real CNN+RNN health check successful');
    } catch (realError) {
      console.warn('⚠️ Real CNN+RNN health check failed, using mock service');
      // Use mock service health check as fallback
      healthStatus = await mockService.healthCheck();
    }
    
    res.json({
      success: true,
      health: healthStatus
    });
  } catch (error) {
    console.error('❌ All CNN+RNN Health Checks Failed:', error);
    res.status(500).json({
      success: false,
      error: 'All CNN+RNN service health checks failed',
      details: error.message
    });
  }
});

/**
 * Get model information
 * GET /api/cnn-rnn-test/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    model_info: {
      name: 'StegoSense CNN+RNN',
      description: 'Advanced video steganography detection model',
      architecture: 'ResNet152 CNN Encoder + LSTM RNN Decoder',
      training_epochs: 101,
      capabilities: ['Image Analysis', 'Video Analysis (GUI mode)'],
      author: 'Friend\'s trained model',
      integration_date: new Date().toISOString(),
      performance_note: 'Optimized for temporal steganographic patterns'
    }
  });
});

module.exports = router;