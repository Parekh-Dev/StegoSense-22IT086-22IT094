const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const { logHistory } = require('../controllers/historyController');

// Set storage engine with environment-aware path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use consistent relative path for both development and production
    const uploadPath = './uploads/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload route with error handling
router.post('/', auth, (req, res) => {
  const uploadPath = './uploads/';
  console.log('🔧 Upload Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Upload path:', uploadPath);
  console.log('Request headers:', req.headers['content-type']);
  
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'UNEXPECTED_FIELD') {
        return res.status(400).json({ 
          msg: 'Unexpected field. Please use "image" as the field name for file upload.' 
        });
      }
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ msg: err.message });
    }

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ msg: 'No file uploaded. Please select an image file.' });
    }

    console.log('✅ File uploaded successfully:', req.file.filename);

    try {
      // Log file upload activity
      await logHistory(
        req.user.id,
        'FILE_UPLOAD',
        `Uploaded file: ${req.file.originalname}`,
        {
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype
        },
        req
      );

      // Dummy result
      const result = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        isStego: Math.random() < 0.5, // random true/false
        confidence: Math.floor(Math.random() * 100) // random 0-99%
      };

      // Log analysis completion
      await logHistory(
        req.user.id,
        'ANALYSIS_COMPLETE',
        `Analysis completed for: ${req.file.originalname}`,
        {
          filename: req.file.filename,
          originalName: req.file.originalname,
          analysisResult: {
            isStego: result.isStego,
            confidence: result.confidence
          }
        },
        req
      );

      // Save result in user document
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      user.results.push(result);
      await user.save();

      res.json({ msg: 'File uploaded', result });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ msg: 'Server error during upload' });
    }
  });
});

module.exports = router;
