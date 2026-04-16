import React, { useState, useEffect } from 'react';
import { calculateSafetyScore, getSafetyStatus } from '../utils/safetyCalculator';
import './ScanHistory.css';

/**
 * ScanHistory Component
 * Displays all previous food scans with results
 * Stores data in localStorage (persists across sessions)
 */
const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'safe', 'unsafe'
  const [filterType, setFilterType] = useState('all'); // 'all', 'fresh', 'spoiled'

  // Load scans from localStorage on mount
  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = () => {
    try {
      const savedScans = localStorage.getItem('agrisafe_scans');
      if (savedScans) {
        setScans(JSON.parse(savedScans));
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const getSortedAndFilteredScans = () => {
    let filtered = scans;

    // Apply filter
    if (filterType === 'fresh') {
      filtered = filtered.filter(s => s.prediction === 'fresh');
    } else if (filterType === 'spoiled') {
      filtered = filtered.filter(s => s.prediction === 'spoiled');
    }

    // Apply sort
    if (sortBy === 'recent') {
      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'safe') {
      return filtered.sort((a, b) => b.safetyScore - a.safetyScore);
    } else if (sortBy === 'unsafe') {
      return filtered.sort((a, b) => a.safetyScore - b.safetyScore);
    }
    return filtered;
  };

  const clearAllScans = () => {
    if (window.confirm('Are you sure you want to clear all scan history?')) {
      localStorage.removeItem('agrisafe_scans');
      setScans([]);
    }
  };

  const deleteScan = (id) => {
    const updated = scans.filter(s => s.id !== id);
    setScans(updated);
    localStorage.setItem('agrisafe_scans', JSON.stringify(updated));
  };

  const displayedScans = getSortedAndFilteredScans();
  const safeCount = scans.filter(s => s.prediction === 'fresh').length;
  const unsafeCount = scans.filter(s => s.prediction === 'spoiled').length;
  const avgScore = scans.length > 0 ? Math.round(scans.reduce((sum, s) => sum + s.safetyScore, 0) / scans.length) : 0;

  return (
    <div className="scan-history">
      <div className="history-header">
        <h2>📋 Scan History</h2>
        <p className="subtitle">Track all your food safety analyses</p>
      </div>

      {/* Statistics Summary */}
      {scans.length > 0 && (
        <div className="history-stats">
          <div className="stat-card">
            <div className="stat-number">{scans.length}</div>
            <div className="stat-label">Total Scans</div>
          </div>
          <div className="stat-card safe">
            <div className="stat-number">{safeCount}</div>
            <div className="stat-label">Safe Items</div>
          </div>
          <div className="stat-card unsafe">
            <div className="stat-number">{unsafeCount}</div>
            <div className="stat-label">Unsafe Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{avgScore}</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="history-controls">
        <div className="control-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="safe">Safest First</option>
            <option value="unsafe">Riskiest First</option>
          </select>
        </div>

        <div className="control-group">
          <label>Filter:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Items</option>
            <option value="fresh">Fresh Only</option>
            <option value="spoiled">Spoiled Only</option>
          </select>
        </div>

        {scans.length > 0 && (
          <button className="btn-clear" onClick={clearAllScans}>
            Clear History
          </button>
        )}
      </div>

      {/* Scan List */}
      {displayedScans.length > 0 ? (
        <div className="scans-list">
          {displayedScans.map((scan) => (
            <div
              key={scan.id}
              className={`scan-item ${scan.prediction === 'fresh' ? 'safe' : 'unsafe'}`}
            >
              {scan.preview && (
                <img src={scan.preview} alt="Scanned food" className="scan-thumbnail" />
              )}

              <div className="scan-details">
                <div className="scan-header">
                  <span className={`prediction-badge ${scan.prediction}`}>
                    {scan.prediction === 'fresh' ? '✓ Fresh' : '✕ Spoiled'}
                  </span>
                  <span className="scan-date">
                    {new Date(scan.timestamp).toLocaleDateString()} {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="safety-bar">
                  <div className="safety-fill" style={{ width: `${scan.safetyScore}%`, backgroundColor: scan.safetyScore >= 70 ? '#10b981' : scan.safetyScore >= 50 ? '#f59e0b' : '#ef4444' }}></div>
                </div>
                <div className="safety-text">
                  Safety Score: <strong>{scan.safetyScore}/100</strong> - Confidence: <strong>{(scan.confidence * 100).toFixed(0)}%</strong>
                </div>
              </div>

              <button
                className="btn-delete"
                onClick={() => deleteScan(scan.id)}
                title="Delete this scan"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>📸 No scans yet. Upload a food image to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ScanHistory;
