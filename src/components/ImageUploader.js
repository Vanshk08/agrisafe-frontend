import React, { useState } from 'react';
import axios from 'axios';
import { calculateSafetyScore } from '../utils/safetyCalculator';
import ResultDetails from './ResultDetails';
import './ImageUploader.css';

/**
 * ImageUploader Component
 * Handles food image upload and classification
 */
const ImageUploader = ({ onPredictionComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Handle file selection
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, or GIF');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle file upload and prediction
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(`${API_BASE_URL}/api/predict-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      setPrediction(result);
      
      // Save scan to localStorage
      saveScanToHistory(result);
      
      if (onPredictionComplete) {
        onPredictionComplete(result);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Prediction failed';
      setError(errorMessage);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save scan to localStorage
   */
  const saveScanToHistory = (result) => {
    try {
      const safetyScore = calculateSafetyScore(
        result.prediction,
        result.confidence
      );

      const scan = {
        id: Date.now().toString(),
        prediction: result.prediction,
        confidence: result.confidence,
        safetyScore: safetyScore,
        timestamp: new Date().toISOString(),
        preview: preview,
        message: result.message,
      };

      // Get existing scans from localStorage
      const existingScans = localStorage.getItem('agrisafe_scans');
      const scans = existingScans ? JSON.parse(existingScans) : [];

      // Add new scan and save
      scans.push(scan);
      localStorage.setItem('agrisafe_scans', JSON.stringify(scans));
    } catch (error) {
      console.error('Error saving scan to history:', error);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="image-uploader-container">
      <div className="uploader-card">
        <h2>📸 Food Image Analysis</h2>
        
        <div className="upload-area">
          {!preview ? (
            <label htmlFor="image-input" className="upload-label">
              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <p>Drag your image here or click to select</p>
                <small>PNG, JPG, GIF (Max 5MB)</small>
              </div>
              <input
                id="image-input"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
            </label>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Food preview" className="preview-image" />
              <button onClick={handleReset} className="btn-remove">
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {prediction && (
          <ResultDetails
            prediction={prediction.prediction}
            confidence={prediction.confidence}
            foodType="Food Item"
          />
        )}

        <div className="button-group">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="btn-primary"
          >
            {loading ? '🔄 Analyzing...' : '🎯 Analyze Image'}
          </button>
          
          {prediction && (
            <button onClick={handleReset} className="btn-secondary">
              Analyze Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
