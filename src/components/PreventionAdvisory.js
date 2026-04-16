import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PreventionAdvisory.css';

/**
 * PreventionAdvisory Component
 * Displays prevention recommendations and mitigation strategies
 */
const PreventionAdvisory = ({ batchId }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('priority');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Fetch safety score with recommendations
   */
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/batch/${batchId}`,
        {}
      );

      setRecommendations(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Failed to fetch recommendations';
      setError(errorMessage);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, batchId]);

  /**
   * Fetch recommendations when batch ID changes
   */
  useEffect(() => {
    if (batchId) {
      fetchRecommendations();
    }
  }, [batchId, fetchRecommendations]);

  /**
   * Get priority color
   */
  const getPriorityColor = (priority) => {
    if (priority >= 8) return '#e74c3c'; // High - Red
    if (priority >= 6) return '#f39c12'; // Medium - Orange
    return '#3498db'; // Low - Blue
  };

  /**
   * Get priority label
   */
  const getPriorityLabel = (priority) => {
    if (priority >= 8) return 'CRITICAL';
    if (priority >= 6) return 'IMPORTANT';
    return 'RECOMMENDED';
  };

  /**
   * Get category emoji
   */
  const getCategoryEmoji = (category) => {
    const emojis = {
      pesticide: '⚗️',
      water: '💧',
      environmental: '🌤️',
      harvest: '🌾',
      storage: '📦',
    };
    return emojis[category] || '💡';
  };

  /**
   * Sort recommendations
   */
  const getSortedRecommendations = () => {
    if (!recommendations?.recommendations) return [];

    const recs = [...recommendations.recommendations];

    if (sortBy === 'priority') {
      return recs.sort((a, b) => b.priority - a.priority);
    } else if (sortBy === 'category') {
      return recs.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === 'impact') {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return recs.sort(
        (a, b) => impactOrder[a.impact] - impactOrder[b.impact]
      );
    }

    return recs;
  };

  if (!batchId) {
    return (
      <div className="prevention-advisory-container">
        <div className="empty-state">
          <p>📋 Select a batch to view prevention recommendations</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="prevention-advisory-container">
        <div className="loading-state">
          <p>⏳ Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prevention-advisory-container">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchRecommendations} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="prevention-advisory-container">
        <div className="empty-state">
          <p>No recommendations available</p>
        </div>
      </div>
    );
  }

  const sortedRecs = getSortedRecommendations();
  const criticalRecs = sortedRecs.filter((r) => r.priority >= 8);

  return (
    <div className="prevention-advisory-container">
      <div className="advisory-card">
        <div className="card-header">
          <h2>💡 Prevention & Mitigation Recommendations</h2>
          <button
            onClick={fetchRecommendations}
            className="btn-refresh"
            disabled={loading}
          >
            ⟳ Refresh
          </button>
        </div>

        {/* Advisory Summary */}
        {recommendations.advisory_summary && (
          <div className="advisory-summary">
            <div className="summary-header">
              <span className="badge-critical">
                {recommendations.advisory_summary.critical_count}
              </span>
              <span className="summary-text">
                {recommendations.advisory_summary.summary}
              </span>
            </div>

            {recommendations.advisory_summary.critical_actions.length > 0 && (
              <div className="critical-actions">
                <h4>Critical Actions Required:</h4>
                <ul>
                  {recommendations.advisory_summary.critical_actions.map(
                    (action, idx) => (
                      <li key={idx}>
                        <span className="action-bullet">→</span>
                        {action}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sort Controls */}
        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button
            className={`sort-btn ${sortBy === 'priority' ? 'active' : ''}`}
            onClick={() => setSortBy('priority')}
          >
            Priority
          </button>
          <button
            className={`sort-btn ${sortBy === 'category' ? 'active' : ''}`}
            onClick={() => setSortBy('category')}
          >
            Category
          </button>
          <button
            className={`sort-btn ${sortBy === 'impact' ? 'active' : ''}`}
            onClick={() => setSortBy('impact')}
          >
            Impact
          </button>
        </div>

        {/* Recommendations List */}
        <div className="recommendations-list">
          {sortedRecs.length > 0 ? (
            sortedRecs.map((rec, idx) => (
              <div key={idx} className="recommendation-card">
                <div className="rec-header">
                  <div className="rec-priority-section">
                    <div
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(rec.priority),
                      }}
                    >
                      {getPriorityLabel(rec.priority)}
                    </div>
                    <span className="priority-score">P{rec.priority}/10</span>
                  </div>

                  <div className="rec-category">
                    <span className="category-emoji">
                      {getCategoryEmoji(rec.category)}
                    </span>
                    <span className="category-label">
                      {rec.category.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className={`impact-badge impact-${rec.impact}`}>
                    {rec.impact.toUpperCase()}
                  </div>
                </div>

                <div className="rec-content">
                  <h4 className="rec-action">{rec.action}</h4>
                  <p className="rec-reason">{rec.reason}</p>
                </div>

                {rec.priority >= 8 && (
                  <div className="critical-indicator">
                    ⚠️ Critical - Requires immediate attention
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-recommendations">
              <p>✓ No additional recommendations at this time</p>
            </div>
          )}
        </div>

        {/* Stats */}
        {sortedRecs.length > 0 && (
          <div className="recommendations-stats">
            <div className="stat-item">
              <span className="stat-label">Total Recommendations</span>
              <span className="stat-value">{sortedRecs.length}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Critical</span>
              <span className="stat-value critical">
                {criticalRecs.length}
              </span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Categories</span>
              <span className="stat-value">
                {new Set(sortedRecs.map((r) => r.category)).size}
              </span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Avg. Priority</span>
              <span className="stat-value">
                {(
                  sortedRecs.reduce((sum, r) => sum + r.priority, 0) /
                  sortedRecs.length
                ).toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Implementation Guide */}
        <div className="implementation-guide">
          <h4>📋 Implementation Guide</h4>
          <ol className="guide-steps">
            <li>
              <strong>Review Critical Items:</strong> Address all CRITICAL
              priority recommendations first (P≥8)
            </li>
            <li>
              <strong>Plan Implementation:</strong> Create a timeline for
              implementing IMPORTANT recommendations (P≥6)
            </li>
            <li>
              <strong>Monitor Progress:</strong> Track implementation of each
              recommendation
            </li>
            <li>
              <strong>Document Changes:</strong> Record all preventive measures
              taken for traceability
            </li>
            <li>
              <strong>Verify Compliance:</strong> Confirm that actions have
              been completed successfully
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PreventionAdvisory;
