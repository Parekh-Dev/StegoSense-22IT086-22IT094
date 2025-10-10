const { spawn } = require('child_process');
const path = require('path');

/**
 * Steganography Detection Service
 * Integrates with the optimized StegoSense ML system
 */
class StegoDetectionService {
  constructor() {
    // Path to the ML detection script
    this.mlPath = path.join(__dirname, '../../../StegoSense-ML');
    this.apiScript = path.join(this.mlPath, 'stegosense_api.py');
  }

  /**
   * Detect steganography in uploaded image
   * @param {string} imagePath - Path to the uploaded image
   * @returns {Promise} Detection result
   */
  async detectSteganography(imagePath) {
    return new Promise((resolve, reject) => {
      console.log('🔍 Starting steganography detection...');
      console.log('Image path:', imagePath);
      console.log('ML path:', this.mlPath);

      // Python command to run detection
      const pythonProcess = spawn('python', [
        '-c',
        `
from stegosense_api import StegoSenseAPI
import sys
import json

try:
    api = StegoSenseAPI()
    result = api.detect('${imagePath}')
    print(json.dumps(result, indent=2))
except Exception as e:
    print(json.dumps({'error': str(e)}, indent=2))
    sys.exit(1)
        `
      ], {
        cwd: this.mlPath,
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
          console.error('❌ Python process failed');
          console.error('STDERR:', stderr);
          console.error('STDOUT:', stdout);
          reject(new Error(`Detection failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          
          if (result.error) {
            reject(new Error(result.error));
            return;
          }

          console.log('✅ Detection completed successfully');
          console.log('Result:', result);
          
          // Transform ML result to web format
          const webResult = this.transformResult(result);
          resolve(webResult);
          
        } catch (parseError) {
          console.error('❌ Failed to parse ML result');
          console.error('Parse error:', parseError);
          console.error('Raw output:', stdout);
          reject(new Error(`Failed to parse detection result: ${parseError.message}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('❌ Failed to start Python process');
        console.error('Error:', error);
        reject(new Error(`Failed to start detection process: ${error.message}`));
      });
    });
  }

  /**
   * Transform ML API result to web-friendly format
   * @param {Object} mlResult - Result from StegoSense ML API
   * @returns {Object} Web-formatted result
   */
  transformResult(mlResult) {
    const { status, confidence, detection_method } = mlResult;
    
    // Map ML statuses to web responses
    let isStego = false;
    let severity = 'low';
    let message = '';
    
    switch (status) {
      case 'OBVIOUS_TAMPERING_DETECTED':
        isStego = true;
        severity = 'high';
        message = 'Obvious steganographic tampering detected! This image has been significantly modified.';
        break;
        
      case 'STEGANOGRAPHY_SUSPECTED':
        isStego = true;
        severity = 'medium';
        message = 'Hidden data suspected. This image may contain steganographic content.';
        break;
        
      case 'APPEARS_CLEAN':
        isStego = false;
        severity = 'low';
        message = 'No steganographic content detected. Image appears clean.';
        break;
        
      default:
        isStego = false;
        severity = 'unknown';
        message = 'Analysis completed with uncertain results.';
    }

    return {
      isStego,
      confidence: Math.round(confidence),
      severity,
      message,
      status,
      detection_method,
      technical_details: {
        ensemble_confidence: mlResult.ensemble_confidence,
        lsb_confidence: mlResult.lsb_confidence,
        composite_score: mlResult.composite_score || null
      }
    };
  }

  /**
   * Get service health status
   * @returns {Promise} Health check result
   */
  async healthCheck() {
    try {
      // Quick test with a simple Python command
      return new Promise((resolve, reject) => {
        const testProcess = spawn('python', ['-c', 'print("OK")'], {
          cwd: this.mlPath,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        testProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ status: 'healthy', ml_path: this.mlPath });
          } else {
            reject(new Error('Python environment not available'));
          }
        });

        testProcess.on('error', (error) => {
          reject(new Error(`Python not found: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}

module.exports = new StegoDetectionService();