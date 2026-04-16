import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RiskPredictor.css';

/**
 * RiskPredictor Component
 * Estimates contamination risk based on food properties
 */
const RiskPredictor = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    food_type: 'dairy',
    storage_time_hours: 0,
    temperature: 20,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [foodTypes, setFoodTypes] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Fetch available food types on mount
   */
  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/metadata`);
        setFoodTypes(response.data.food_types);
      } catch (err) {
        console.error('Error fetching food types:', err);
        // Fallback
        setFoodTypes(['dairy', 'meat', 'seafood', 'produce', 'other']);
      }
    };

    fetchFoodTypes();
  }, [API_BASE_URL]);

  /**
   * Handle input change
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'food_type' ? value : Number(value) || 0,
    }));
  };

  /**
   * Handle form submission
   */
  const handlePredict = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (formData.storage_time_hours < 0 || formData.storage_time_hours > 240) {
      setError('Storage time must be between 0-240 hours');
      return;
    }

    if (formData.temperature < -20 || formData.temperature > 50) {
      setError('Temperature must be between -20°C to 50°C');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/predict-risk`,
        formData
      );

      const result = response.data;
      setPrediction(result);

      if (onPredictionComplete) {
        onPredictionComplete(result);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Prediction failed';
      setError(errorMessage);
      console.error('Risk prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get risk color based on percentage
   */
  const getRiskColor = (riskPercentage) => {
    if (riskPercentage < 30) return '#4CAF50'; // Green - Low
    if (riskPercentage < 70) return '#FF9800'; // Orange - Medium
    return '#F44336'; // Red - High
  };

  /**
   * Get risk level emoji
   */
  const getRiskEmoji = (riskLevel) => {
    const emojis = {
      low: '✓',
      medium: '⚠',
      high: '🚫',
    };
    return emojis[riskLevel] || '?';
  };

  return (
    <div className="risk-predictor-container">
      <div className="predictor-card">
        <h2>⚠️ Risk Assessment</h2>

        <form onSubmit={handlePredict} className="risk-form">
          {/* Food Type Dropdown */}
          <div className="form-group">
            <label htmlFor="food-type">Food Type</label>
            <select
              id="food-type"
              name="food_type"
              value={formData.food_type}
              onChange={handleInputChange}
              className="form-select"
            >
              {foodTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Storage Time Input */}
          <div className="form-group">
            <label htmlFor="storage-time">
              Storage Time (hours)
              <span className="input-value">{formData.storage_time_hours}</span>
            </label>
            <input
              id="storage-time"
              type="range"
              name="storage_time_hours"
              min="0"
              max="240"
              step="1"
              value={formData.storage_time_hours}
              onChange={handleInputChange}
              className="form-range"
            />
            <div className="range-labels">
              <span>0</span>
              <span>120 hours</span>
              <span>240 hours</span>
            </div>
          </div>

          {/* Temperature Input */}
          <div className="form-group">
            <label htmlFor="temperature">
              Temperature (°C)
              <span className="input-value">{formData.temperature}°C</span>
            </label>
            <input
              id="temperature"
              type="range"
              name="temperature"
              min="-20"
              max="50"
              step="1"
              value={formData.temperature}
              onChange={handleInputChange}
              className="form-range"
            />
            <div className="range-labels">
              <span>-20°C</span>
              <span>15°C</span>
              <span>50°C</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '🔄 Calculating...' : '📊 Assess Risk'}
          </button>
        </form>

        {prediction && (
          <div
            className={`risk-result ${prediction.risk_level}`}
            style={{
              borderLeftColor: getRiskColor(prediction.risk_percentage),
            }}
          >
            <div className="risk-header">
              <span className="risk-emoji">
                {getRiskEmoji(prediction.risk_level)}
              </span>
              <span className="risk-label">
                {prediction.risk_level.toUpperCase()}
              </span>
              <span className="safe-badge">
                {prediction.safe_to_eat ? '✓ Safe' : '✕ Not Safe'}
              </span>
            </div>

            <div className="risk-percentage">
              <div className="percentage-number">
                {prediction.risk_percentage.toFixed(1)}%
              </div>
              <div className="percentage-bar">
                <div
                  className="percentage-fill"
                  style={{
                    width: `${prediction.risk_percentage}%`,
                    backgroundColor: getRiskColor(prediction.risk_percentage),
                  }}
                ></div>
              </div>
            </div>

            <div className="risk-details">
              <div className="detail-row">
                <span className="detail-label">Food Type:</span>
                <span className="detail-value">
                  {prediction.food_type.charAt(0).toUpperCase() + prediction.food_type.slice(1)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Storage Time:</span>
                <span className="detail-value">{prediction.storage_time_hours} hours</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Temperature:</span>
                <span className="detail-value">{prediction.temperature}°C</span>
              </div>
            </div>

            <p className="risk-message">{prediction.message}</p>

            <div className="risk-info">
              {prediction.risk_level === 'low' && (
                <p>✓ This food appears to be safe for consumption.</p>
              )}
              {prediction.risk_level === 'medium' && (
                <p>⚠ Consider consuming this food soon or storing properly.</p>
              )}
              {prediction.risk_level === 'high' && (
                <p>🚫 This food is likely contaminated. Do not consume.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskPredictor;
