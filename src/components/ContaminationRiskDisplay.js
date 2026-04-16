import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContaminationRiskDisplay.css';

/**
 * ContaminationRiskDisplay Component
 * Displays agricultural contamination risks and safety assessment
 */
const ContaminationRiskDisplay = ({ batchId }) => {
  const [risks, setRisks] = useState(null);
  const [safetyScore, setSafetyScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Fetch risk data when batch ID changes
   */
  useEffect(() => {
    if (batchId) {
      fetchRisksAndScore();
    }
  }, [batchId, API_BASE_URL]);

  /**
   * Fetch contamination risks and safety score
   */
  const fetchRisksAndScore = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch risks
      const riskResponse = await axios.get(
        `${API_BASE_URL}/api/batch/${batchId}`
      );
      
      setRisks(riskResponse.data.risks);

      // Fetch safety score
      const scoreResponse = await axios.post(
        `${API_BASE_URL}/api/batch/${batchId}`,
        {}
      );
      
      setSafetyScore(scoreResponse.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch risk data';
      setError(errorMessage);
      console.error('Error fetching risks:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get color for risk level
   */
  const getRiskColor = (level) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
    };
    return colors[level] || '#999';
  };

  /**
   * Get emoji for risk type
   */
  const getRiskEmoji = (type) => {
    const emojis = {
      chemical: '⚗️',
      biological: '🦠',
      environmental: '🌤️',
    };
    return emojis[type] || '⚠️';
  };

  /**
   * Render risk card
   */
  const renderRiskCard = (riskData, type) => {
    if (!riskData) return null;

    const color = getRiskColor(riskData.risk_level);
    const percentage = riskData.risk_score;

    return (
      <div key={type} className="risk-card">
        <div className="risk-header">
          <span className="risk-emoji">{getRiskEmoji(type)}</span>
          <span className="risk-type">
            {type.charAt(0).toUpperCase() + type.slice(1)} Risk
          </span>
        </div>

        <div className="risk-score-container">
          <div className="risk-score-value" style={{ color }}>
            {Math.round(percentage)}
          </div>
          <div className="risk-score-label">/ 100</div>
        </div>

        <div className="risk-level-badge" style={{ backgroundColor: color }}>
          {riskData.risk_level.toUpperCase()}
        </div>

        <div className="risk-progress">
          <div
            className="risk-progress-bar"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>

        <div className="risk-probability">
          Probability: {(riskData.probability_score * 100).toFixed(1)}%
        </div>

        <div className="risk-cause">
          <strong>Primary Cause:</strong>
          <p>{riskData.primary_cause}</p>
        </div>
      </div>
    );
  };

  if (!batchId) {
    return (
      <div className="contamination-risk-container">
        <div className="empty-state">
          <p>📋 Select or create a batch to view contamination risks</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="contamination-risk-container">
        <div className="loading-state">
          <p>⏳ Loading risk assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contamination-risk-container">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchRisksAndScore} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!risks) {
    return (
      <div className="contamination-risk-container">
        <div className="empty-state">
          <p>No risk data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contamination-risk-container">
      <div className="risk-display-card">
        <div className="card-header">
          <h2>🔍 Agricultural Contamination Risk Assessment</h2>
          <button
            onClick={fetchRisksAndScore}
            className="btn-refresh"
            disabled={loading}
          >
            ⟳ Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'chemical' ? 'active' : ''}`}
            onClick={() => setActiveTab('chemical')}
          >
            Chemical Risk
          </button>
          <button
            className={`tab-btn ${activeTab === 'biological' ? 'active' : ''}`}
            onClick={() => setActiveTab('biological')}
          >
            Biological Risk
          </button>
          <button
            className={`tab-btn ${activeTab === 'environmental' ? 'active' : ''}`}
            onClick={() => setActiveTab('environmental')}
          >
            Environmental Risk
          </button>
          {safetyScore && (
            <button
              className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveTab('safety')}
            >
              Safety Score
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="overall-risk">
                <div className="overall-label">Overall Risk Level</div>
                <div
                  className="overall-value"
                  style={{
                    color: getRiskColor(risks.overall_risk.risk_level),
                  }}
                >
                  {risks.overall_risk.risk_level.toUpperCase()}
                </div>
                <div className="overall-score">
                  {Math.round(risks.overall_risk.risk_score)} / 100
                </div>
              </div>

              <div className="risk-grid">
                {renderRiskCard(risks.chemical_risk, 'chemical')}
                {renderRiskCard(risks.biological_risk, 'biological')}
                {renderRiskCard(risks.environmental_risk, 'environmental')}
              </div>

              {/* Harvest Safety */}
              <div className="harvest-safety-card">
                <h3>🌾 Harvest Safety</h3>
                <div className="safety-status">
                  <div
                    className="status-indicator"
                    style={{
                      backgroundColor: risks.harvest_safety.harvest_safe
                        ? '#4CAF50'
                        : '#FF9800',
                    }}
                  >
                    {risks.harvest_safety.harvest_safe ? '✓ SAFE' : '⏳ WAITING'}
                  </div>
                  {!risks.harvest_safety.harvest_safe && (
                    <div className="safety-message">
                      Wait {risks.harvest_safety.days_until_safe} more days
                      before harvest
                    </div>
                  )}
                  <p className="safety-reason">
                    {risks.harvest_safety.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chemical Risk Tab */}
          {activeTab === 'chemical' && (
            <div className="detailed-risk-section">
              {renderRiskCard(risks.chemical_risk, 'chemical')}
              <div className="risk-details">
                <h4>Chemical Contamination Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Risk Score:</span>
                    <span className="detail-value">
                      {risks.chemical_risk.risk_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Probability:</span>
                    <span className="detail-value">
                      {(risks.chemical_risk.probability_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Primary Cause:</span>
                    <span className="detail-value">
                      {risks.chemical_risk.primary_cause}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Biological Risk Tab */}
          {activeTab === 'biological' && (
            <div className="detailed-risk-section">
              {renderRiskCard(risks.biological_risk, 'biological')}
              <div className="risk-details">
                <h4>Biological Contamination Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Risk Score:</span>
                    <span className="detail-value">
                      {risks.biological_risk.risk_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Probability:</span>
                    <span className="detail-value">
                      {(risks.biological_risk.probability_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Primary Cause:</span>
                    <span className="detail-value">
                      {risks.biological_risk.primary_cause}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Risk Tab */}
          {activeTab === 'environmental' && (
            <div className="detailed-risk-section">
              {renderRiskCard(risks.environmental_risk, 'environmental')}
              <div className="risk-details">
                <h4>Environmental Risk Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Risk Score:</span>
                    <span className="detail-value">
                      {risks.environmental_risk.risk_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Probability:</span>
                    <span className="detail-value">
                      {(risks.environmental_risk.probability_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Primary Cause:</span>
                    <span className="detail-value">
                      {risks.environmental_risk.primary_cause}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safety Score Tab */}
          {activeTab === 'safety' && safetyScore && (
            <div className="safety-score-section">
              <div className="safety-score-main">
                <div className="score-display">
                  <div className="score-number">
                    {safetyScore.safety_score.overall_score}
                  </div>
                  <div className="score-label">/ 100</div>
                </div>
                <div
                  className="score-status"
                  style={{
                    backgroundColor: safetyScore.safety_score.safe_for_consumption
                      ? '#4CAF50'
                      : '#F44336',
                  }}
                >
                  {safetyScore.safety_score.safe_for_consumption
                    ? '✓ SAFE FOR CONSUMPTION'
                    : '✕ NOT RECOMMENDED'}
                </div>
              </div>

              <div className="score-breakdown">
                <div className="score-component">
                  <div className="component-label">Agricultural Practices</div>
                  <div className="component-value">
                    {safetyScore.safety_score.agricultural_practices_score}
                  </div>
                </div>
                <div className="score-component">
                  <div className="component-label">Environmental Risk</div>
                  <div className="component-value">
                    {safetyScore.safety_score.environmental_risk_score}
                  </div>
                </div>
                <div className="score-component">
                  <div className="component-label">AI Prediction</div>
                  <div className="component-value">
                    {safetyScore.safety_score.ai_prediction_score}
                  </div>
                </div>
              </div>

              <div className="score-explanation">
                <h4>Assessment Explanation</h4>
                <p>{safetyScore.explanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContaminationRiskDisplay;
