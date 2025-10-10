const { spawn } = require('child_process');
const path = require('path');

/**
 * CNN+RNN Steganography Detection Service
 * Integrates with friend's trained CNN+RNN model
 * This is a NEW service that works alongside your existing stegoDetectionService
 */
class CNNRNNDetectionService {
  constructor() {
    // Path to the ML folder mounted in Docker (or local development)
    this.mlPath = path.join(__dirname, '../../../ML');
    this.modelPath = path.join(this.mlPath, 'models/stegosense_cnn_rnn/stegosense');
    
    // Use system python3 in Docker, or Windows path for local development
    if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
      // Local Windows development
      this.pythonExe = path.join(this.mlPath, 'environment/stegosense_ml_env/Scripts/python.exe');
    } else {
      // Docker environment - ML directory is mounted at /app/ML
      this.pythonExe = 'python3';
      this.mlPath = '/app/ML';
      this.modelPath = path.join(this.mlPath, 'models/stegosense_cnn_rnn/stegosense');
    }
    
    this.scriptPath = path.join(this.modelPath, 'live_steganalysis.py');
    this.cnnModel = path.join(this.modelPath, 'cnn_encoder_epoch101.pth');
    this.rnnModel = path.join(this.modelPath, 'rnn_decoder_epoch101 (1).pth');
    
    console.log('🔧 CNN+RNN Service Configuration:');
    console.log('Platform:', process.platform);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('ML Path:', this.mlPath);
    console.log('Python Executable:', this.pythonExe);
    console.log('Script Path:', this.scriptPath);
    console.log('CNN Model:', this.cnnModel);
    console.log('RNN Model:', this.rnnModel);
  }

  /**
   * Detect steganography using CNN+RNN model
   * @param {string} imagePath - Path to the uploaded image
   * @returns {Promise} Detection result
   */
  async detectSteganography(filePath) {
    return new Promise((resolve, reject) => {
      console.log('🧠 Starting CNN+RNN steganography detection...');
      console.log('File path:', filePath);
      console.log('Model path:', this.modelPath);

      // Detect if file is image or video based on extension
      const path = require('path');
      const fileExt = path.extname(filePath).toLowerCase();
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
      const isVideo = videoExtensions.includes(fileExt);
      
      console.log('File type:', isVideo ? 'Video' : 'Image');

      // Choose the appropriate parameter based on file type
      const fileParam = isVideo ? '--video' : '--image';
      
      // Run the friend's model
      const pythonProcess = spawn(this.pythonExe, [
        this.scriptPath,
        fileParam, filePath,
        '--cnn_model', this.cnnModel,
        '--rnn_model', this.rnnModel
      ], {
        cwd: this.modelPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONPATH: this.modelPath }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ CNN+RNN detection failed');
          console.error('STDERR:', stderr);
          console.error('STDOUT:', stdout);
          reject(new Error(`CNN+RNN Detection failed: ${stderr}`));
          return;
        }

        try {
          // Parse the output from live_steganalysis.py
          // Expected format: "Prediction: STEGO (68.68%)" or "Prediction: COVER (95.99%)"
          const result = this.parseModelOutput(stdout);
          
          console.log('✅ CNN+RNN Detection completed successfully');
          console.log('Result:', result);
          
          resolve(result);
          
        } catch (parseError) {
          console.error('❌ Failed to parse CNN+RNN result');
          console.error('Parse error:', parseError);
          console.error('Raw output:', stdout);
          reject(new Error(`Failed to parse CNN+RNN result: ${parseError.message}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start CNN+RNN process');
        console.error('Error:', error);
        reject(new Error(`Failed to start CNN+RNN process: ${error.message}`));
      });
    });
  }

  /**
   * Parse output from live_steganalysis.py
   * @param {string} output - Raw output from Python script
   * @returns {Object} Parsed result
   */
  parseModelOutput(output) {
    console.log('🔍 Parsing model output...');
    console.log('Raw output:', output);
    
    // Look for the prediction line
    // Format: "Prediction: STEGO (68.68%)" or "Prediction: COVER (95.99%)"
    const predictionMatch = output.match(/Prediction:\s*(STEGO|COVER)\s*\((\d+\.?\d*)%\)/);
    
    if (!predictionMatch) {
      console.error('❌ Failed to match prediction pattern');
      console.error('Looking for pattern: Prediction: STEGO|COVER (XX.XX%)');
      console.error('Available output lines:');
      output.split('\n').forEach((line, index) => {
        console.error(`Line ${index}: "${line}"`);
      });
      throw new Error('Could not parse model prediction from output');
    }

    const prediction = predictionMatch[1];
    const confidence = parseFloat(predictionMatch[2]);
    
    console.log('✅ Successfully parsed prediction:', prediction);
    console.log('✅ Successfully parsed confidence:', confidence);
    
    const isStego = prediction === 'STEGO';
    
    // Determine severity based on confidence
    let severity = 'low';
    if (confidence > 80) {
      severity = 'high';
    } else if (confidence > 60) {
      severity = 'medium';
    }

    // Generate appropriate message
    let message = '';
    if (isStego) {
      if (confidence > 80) {
        message = `Strong steganographic signature detected! High confidence (${confidence}%) that this image contains hidden data.`;
      } else if (confidence > 60) {
        message = `Potential steganographic content detected with ${confidence}% confidence.`;
      } else {
        message = `Weak steganographic signals detected with ${confidence}% confidence.`;
      }
    } else {
      if (confidence > 80) {
        message = `Image appears clean with high confidence (${confidence}%). No steganographic content detected.`;
      } else if (confidence > 60) {
        message = `Likely clean image with ${confidence}% confidence.`;
      } else {
        message = `Image analysis completed with ${confidence}% confidence of being clean.`;
      }
    }

    return {
      isStego,
      confidence: Math.round(confidence),
      severity,
      message,
      status: isStego ? 'STEGANOGRAPHY_DETECTED' : 'APPEARS_CLEAN',
      detection_method: 'CNN_RNN_TEMPORAL',
      model_type: 'CNN+RNN Video Steganography Detection',
      technical_details: {
        raw_prediction: prediction,
        raw_confidence: confidence,
        model_architecture: 'ResNet152 CNN + LSTM RNN',
        training_epochs: 101
      }
    };
  }

  /**
   * Detect steganography in video (future feature)
   * @param {string} videoPath - Path to the uploaded video
   * @returns {Promise} Detection result
   */
  async detectVideoSteganography(videoPath) {
    return new Promise((resolve, reject) => {
      console.log('🎬 Starting CNN+RNN video steganography detection...');
      
      const pythonProcess = spawn(this.pythonEnv, [
        this.scriptPath,
        '--video', videoPath,
        '--cnn_model', this.cnnModel,
        '--rnn_model', this.rnnModel
      ], {
        cwd: this.modelPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Video detection failed: ${stderr}`));
          return;
        }

        // For video, we might need different parsing logic
        // Since the current model shows GUI, we'll return a basic result
        resolve({
          isStego: false,
          confidence: 0,
          severity: 'low',
          message: 'Video processing completed. Check logs for frame-by-frame analysis.',
          status: 'VIDEO_PROCESSED',
          detection_method: 'CNN_RNN_VIDEO_TEMPORAL',
          model_type: 'CNN+RNN Video Steganography Detection',
          technical_details: {
            processing_note: 'Video analysis requires GUI mode modification for web integration'
          }
        });
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start video detection: ${error.message}`));
      });
    });
  }

  /**
   * Get CNN+RNN service health status
   * @returns {Promise} Health check result
   */
  async healthCheck() {
    try {
      return new Promise((resolve, reject) => {
        const testProcess = spawn(this.pythonExe, ['-c', 'import torch; print("CNN+RNN service OK")'], {
          cwd: this.modelPath,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONPATH: this.modelPath }
        });

        let stdout = '';
        let stderr = '';

        testProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        testProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        testProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ 
              status: 'healthy', 
              service: 'CNN+RNN Detection Service',
              model_path: this.modelPath,
              python_env: this.pythonExe,
              message: stdout.trim()
            });
          } else {
            reject(new Error(`CNN+RNN environment not available: ${stderr}`));
          }
        });

        testProcess.on('error', (error) => {
          reject(new Error(`CNN+RNN Python environment not found: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`CNN+RNN health check failed: ${error.message}`);
    }
  }
}

module.exports = new CNNRNNDetectionService();