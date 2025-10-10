/**
 * Mock CNN+RNN Detection Service for Docker Development
 * Provides realistic mock responses when the actual ML environment is not available
 */
class MockCNNRNNDetectionService {
  constructor() {
    console.log('🎭 Mock CNN+RNN Service initialized for Docker development');
  }

  /**
   * Mock steganography detection
   * @param {string} filePath - Path to the uploaded file
   * @returns {Promise} Mock detection result
   */
  async detectSteganography(filePath) {
    console.log('🎭 Mock CNN+RNN detection for:', filePath);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Generate realistic mock results
    const isStego = Math.random() < 0.3; // 30% chance of detecting steganography
    const confidence = isStego 
      ? Math.floor(65 + Math.random() * 25) // 65-90% confidence for stego
      : Math.floor(70 + Math.random() * 25); // 70-95% confidence for clean
    
    const severity = confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low';
    
    let message = '';
    if (isStego) {
      if (confidence > 80) {
        message = `Strong steganographic signature detected! High confidence (${confidence}%) that this file contains hidden data.`;
      } else if (confidence > 60) {
        message = `Potential steganographic content detected with ${confidence}% confidence.`;
      } else {
        message = `Weak steganographic signals detected with ${confidence}% confidence.`;
      }
    } else {
      if (confidence > 80) {
        message = `File appears clean with high confidence (${confidence}%). No steganographic content detected.`;
      } else if (confidence > 60) {
        message = `Likely clean file with ${confidence}% confidence.`;
      } else {
        message = `File analysis completed with ${confidence}% confidence of being clean.`;
      }
    }

    const result = {
      isStego,
      confidence: Math.round(confidence),
      severity,
      message,
      status: isStego ? 'STEGANOGRAPHY_DETECTED' : 'APPEARS_CLEAN',
      detection_method: 'MOCK_CNN_RNN_TEMPORAL',
      model_type: 'Mock CNN+RNN Video Steganography Detection (Docker Mode)',
      technical_details: {
        raw_prediction: isStego ? 'STEGO' : 'COVER',
        raw_confidence: confidence,
        model_architecture: 'Mock ResNet152 CNN + LSTM RNN',
        training_epochs: 101,
        note: 'This is a mock result for Docker development'
      }
    };

    console.log('🎭 Mock CNN+RNN result:', result);
    return result;
  }

  /**
   * Mock health check
   * @returns {Promise} Health status
   */
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'Mock CNN+RNN Detection Service',
      model_path: '/mock/models/cnn-rnn',
      python_env: '/mock/python/env',
      note: 'Mock service for Docker development',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = MockCNNRNNDetectionService;