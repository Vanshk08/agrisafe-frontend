import React from 'react';
import {
  calculateSafetyScore,
  getSafetyStatus,
  generateReasons,
  getRecommendation,
  getStorageTips
} from '../utils/safetyCalculator';
import './ResultDetails.css';

const ResultDetails = ({ prediction, confidence, foodType = 'Unknown' }) => {
  if (!prediction) return null;

  const safetyScore = calculateSafetyScore(prediction, confidence);
  const status = getSafetyStatus(safetyScore);
  const reasons = generateReasons(prediction, confidence, foodType);
  const recommendation = getRecommendation(prediction, safetyScore);
  const storageTips = getStorageTips(foodType);

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    if (score >= 30) return '#ef4444';
    return '#991b1b';
  };

  return (
    <div className="result-details">
      {/* Main Result Card */}
      <div className={`result-card result-${prediction}`}>
        <div className="result-header">
          <div className="result-status">
            <div className="status-icon">{status.icon}</div>
            <div className="status-text">
              <h2>
                {prediction.toUpperCase()}
              </h2>
              <p className="status-tag" style={{ backgroundColor: status.color }}>
                {status.status}
              </p>
            </div>
          </div>
          <div className="confidence-display">
            <div className="confidence-value">{(confidence * 100).toFixed(1)}%</div>
            <div className="confidence-label">Confidence</div>
          </div>
        </div>

        {/* Safety Score */}
        <div className="safety-score-section">
          <div className="score-label">Safety Score</div>
          <div className="score-display">
            <div className="score-number" style={{ color: getScoreColor(safetyScore) }}>
              {safetyScore}
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${safetyScore}%`,
                  backgroundColor: getScoreColor(safetyScore)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="reasons-section">
        <h3>Why {status.status.toLowerCase()}?</h3>
        <ul className="reasons-list">
          {reasons.map((reason, index) => (
            <li key={index}>
              <span className="reason-bullet">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className={`recommendation-section recommendation-${recommendation.action.toLowerCase().replace(/\s+/g, '-')}`}>
        <h3>Recommendation</h3>
        <div className="rec-action">{recommendation.action}</div>
        <p className="rec-description">{recommendation.description}</p>
      </div>

      {/* Storage Tips */}
      {storageTips.length > 0 && (
        <div className="storage-tips-section">
          <h3>Storage Tips for {foodType}</h3>
          <ul className="tips-list">
            {storageTips.map((tip, index) => (
              <li key={index}>
                <span className="tip-icon">💾</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Info */}
      <div className="additional-info">
        <div className="info-item">
          <span className="info-label">Food Type:</span>
          <span className="info-value">{foodType}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Prediction Model:</span>
          <span className="info-value">Binary Classifier (RF-100)</span>
        </div>
        <div className="info-item">
          <span className="info-label">Scan Time:</span>
          <span className="info-value">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultDetails;
