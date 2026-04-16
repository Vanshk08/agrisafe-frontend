import React, { useState } from 'react';
import axios from 'axios';
import { calculateSafetyScore } from '../utils/safetyCalculator';
import './BatchUpload.css';

const BatchUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} has unsupported format`);
        return false;
      }
      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    const newResults = [];
    const newProgress = {};

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = `file-${i}`;
      newProgress[fileId] = 0;

      try {
        const formData = new FormData();
        formData.append('image', file);

        // Create preview
        const reader = new FileReader();
        const preview = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        newProgress[fileId] = 50;
        setUploadProgress({ ...newProgress });

        const response = await axios.post(`${API_BASE_URL}/api/predict-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const result = response.data;
        const safetyScore = calculateSafetyScore(result.prediction, result.confidence);

        newProgress[fileId] = 100;
        setUploadProgress({ ...newProgress });

        newResults.push({
          fileName: file.name,
          prediction: result.prediction,
          confidence: result.confidence,
          safetyScore: safetyScore,
          preview: preview,
          timestamp: new Date().toISOString(),
          status: 'success',
        });

        // Save to history
        saveScanToHistory(result, preview);
      } catch (err) {
        newProgress[fileId] = 100;
        setUploadProgress({ ...newProgress });

        newResults.push({
          fileName: file.name,
          status: 'error',
          error: err.response?.data?.error || err.message || 'Prediction failed',
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const saveScanToHistory = (result, preview) => {
    try {
      const safetyScore = calculateSafetyScore(result.prediction, result.confidence);
      const scan = {
        id: Date.now().toString(),
        prediction: result.prediction,
        confidence: result.confidence,
        safetyScore: safetyScore,
        timestamp: new Date().toISOString(),
        preview: preview,
        message: result.message,
      };

      const existingScans = localStorage.getItem('agrisafe_scans');
      const scans = existingScans ? JSON.parse(existingScans) : [];
      scans.push(scan);
      localStorage.setItem('agrisafe_scans', JSON.stringify(scans));
    } catch (error) {
      console.error('Error saving scan:', error);
    }
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setResults([]);
    setUploadProgress({});
    setError(null);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="batch-upload-container">
      <div className="batch-upload-card">
        <h2>📦 Batch Upload</h2>
        <p className="subtitle">Upload multiple food images at once for analysis</p>

        {/* File Selection Area */}
        <div className="file-selection-area">
          <label htmlFor="batch-input" className="upload-label">
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <p>Drag files here or click to select multiple images</p>
              <small>PNG, JPG, GIF (Max 5MB each)</small>
            </div>
            <input
              id="batch-input"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="file-input"
            />
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <div className="files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="btn-remove-file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="button-group">
          <button
            onClick={handleUploadAll}
            disabled={selectedFiles.length === 0 || loading}
            className="btn-primary"
          >
            {loading ? '🔄 Processing...' : '🚀 Process All'}
          </button>

          {selectedFiles.length > 0 && (
            <button onClick={handleClearAll} className="btn-secondary">
              Clear All
            </button>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="results-section">
            <div className="results-summary">
              <div className="summary-item success">
                <div className="summary-number">{successCount}</div>
                <div className="summary-label">Processed</div>
              </div>
              <div className="summary-item error">
                <div className="summary-number">{errorCount}</div>
                <div className="summary-label">Failed</div>
              </div>
            </div>

            <div className="results-list">
              <h3>Results</h3>
              {results.map((result, index) => (
                <div key={index} className={`result-item result-${result.status}`}>
                  {result.status === 'success' ? (
                    <>
                      <img src={result.preview} alt={result.fileName} className="result-thumbnail" />
                      <div className="result-info">
                        <div className="result-name">{result.fileName}</div>
                        <div className="result-details">
                          <span className={`prediction-badge ${result.prediction}`}>
                            {result.prediction.toUpperCase()}
                          </span>
                          <span className="confidence">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                          <div className="safety-score">
                            <span className="label">Safety:</span>
                            <span className="score" style={
                              result.safetyScore >= 70 ? { color: '#10b981' } :
                              result.safetyScore >= 50 ? { color: '#f59e0b' } :
                              { color: '#ef4444' }
                            }>
                              {result.safetyScore}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="status-icon">✓</div>
                    </>
                  ) : (
                    <>
                      <div className="error-file-info">
                        <div className="result-name">{result.fileName}</div>
                        <div className="error-message-text">{result.error}</div>
                      </div>
                      <div className="status-icon error">✕</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {loading && Object.keys(uploadProgress).length > 0 && (
          <div className="progress-section">
            <h3>Upload Progress</h3>
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="progress-item">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-percent">{progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchUpload;
