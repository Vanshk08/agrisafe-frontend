import React, { useState, useEffect } from 'react';
import './StatisticsDashboard.css';

const StatisticsDashboard = () => {
  const [scans, setScans] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'

  const loadScans = () => {
    try {
      const savedScans = localStorage.getItem('agrisafe_scans');
      if (savedScans) {
        let allScans = JSON.parse(savedScans);
        
        // Filter by time range
        if (timeRange !== 'all') {
          const now = new Date();
          const days = timeRange === 'week' ? 7 : 30;
          const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          
          allScans = allScans.filter(scan => 
            new Date(scan.timestamp) > cutoffDate
          );
        }
        
        setScans(allScans);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  useEffect(() => {
    loadScans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const getStatistics = () => {
    if (scans.length === 0) {
      return {
        totalScans: 0,
        freshCount: 0,
        spoiledCount: 0,
        avgConfidence: 0,
        avgSafetyScore: 0,
        freshPercentage: 0,
        spoiledPercentage: 0,
      };
    }

    const freshCount = scans.filter(s => s.prediction === 'fresh').length;
    const spoiledCount = scans.filter(s => s.prediction === 'spoiled').length;
    const avgConfidence = (scans.reduce((sum, s) => sum + s.confidence, 0) / scans.length) * 100;
    const avgSafetyScore = scans.reduce((sum, s) => sum + s.safetyScore, 0) / scans.length;

    return {
      totalScans: scans.length,
      freshCount,
      spoiledCount,
      avgConfidence,
      avgSafetyScore,
      freshPercentage: (freshCount / scans.length) * 100,
      spoiledPercentage: (spoiledCount / scans.length) * 100,
    };
  };

  const getSafetyTrend = () => {
    if (scans.length === 0) return [];
    
    // Group scans by date
    const grouped = {};
    scans.forEach(scan => {
      const date = new Date(scan.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(scan.safetyScore);
    });

    return Object.entries(grouped)
      .map(([date, scores]) => ({
        date,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10); // Last 10 days
  };

  const stats = getStatistics();
  const trend = getSafetyTrend();

  return (
    <div className="statistics-dashboard">
      <div className="dashboard-header">
        <h2>📊 Statistics Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
          <button
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </button>
          <button
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {scans.length === 0 ? (
        <div className="empty-dashboard">
          <p>No scan data available yet. Start uploading food images to see statistics!</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <section className="metrics-section">
            <h3>Key Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{stats.totalScans}</div>
                <div className="metric-label">Total Scans</div>
                <div className="metric-icon">📸</div>
              </div>

              <div className="metric-card fresh">
                <div className="metric-value">{stats.freshCount}</div>
                <div className="metric-label">Fresh Items</div>
                <div className="metric-percentage">{stats.freshPercentage.toFixed(1)}%</div>
                <div className="metric-icon">✓</div>
              </div>

              <div className="metric-card spoiled">
                <div className="metric-value">{stats.spoiledCount}</div>
                <div className="metric-label">Spoiled Items</div>
                <div className="metric-percentage">{stats.spoiledPercentage.toFixed(1)}%</div>
                <div className="metric-icon">⚠</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">{stats.avgConfidence.toFixed(1)}%</div>
                <div className="metric-label">Avg Confidence</div>
                <div className="metric-icon">🎯</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">{stats.avgSafetyScore.toFixed(0)}</div>
                <div className="metric-label">Avg Safety Score</div>
                <div className="metric-icon">⭐</div>
              </div>
            </div>
          </section>

          {/* Fresh vs Spoiled Pie Chart */}
          <section className="chart-section">
            <h3>Fresh vs Spoiled Distribution</h3>
            <div className="pie-chart-container">
              <div className="pie-chart">
                <div
                  className="pie-slice fresh-slice"
                  style={{
                    background: `conic-gradient(
                      #10b981 0deg ${stats.freshPercentage * 3.6}deg,
                      #ef4444 ${stats.freshPercentage * 3.6}deg 360deg
                    )`,
                  }}
                >
                  <div className="pie-center">
                    <div className="pie-label">{stats.freshPercentage.toFixed(0)}%</div>
                    <div className="pie-text">Fresh</div>
                  </div>
                </div>
              </div>
              <div className="distribution-legend">
                <div className="legend-item">
                  <span className="legend-color fresh"></span>
                  <span className="legend-text">Fresh ({stats.freshCount})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color spoiled"></span>
                  <span className="legend-text">Spoiled ({stats.spoiledCount})</span>
                </div>
              </div>
            </div>
          </section>

          {/* Trend Chart */}
          {trend.length > 0 && (
            <section className="chart-section">
              <h3>Safety Score Trend (Last 10 Scans)</h3>
              <div className="trend-chart">
                <div className="chart-bars">
                  {trend.map((item, index) => (
                    <div key={index} className="bar-container" title={`${item.date}: ${item.avgScore.toFixed(0)}`}>
                      <div
                        className="bar"
                        style={{
                          height: `${(item.avgScore / 100) * 200}px`,
                          backgroundColor: item.avgScore >= 70 ? '#10b981' : item.avgScore >= 50 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                      <div className="bar-label">{item.date}</div>
                      <div className="bar-value">{item.avgScore.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Confidence Distribution */}
          <section className="chart-section">
            <h3>Confidence Levels</h3>
            <div className="confidence-bars">
              {[
                { range: '90-100%', color: '#10b981', min: 0.9, max: 1.0 },
                { range: '80-89%', color: '#3b82f6', min: 0.8, max: 0.89 },
                { range: '70-79%', color: '#f59e0b', min: 0.7, max: 0.79 },
                { range: '60-69%', color: '#ef4444', min: 0.6, max: 0.69 },
              ].map((level, index) => {
                const count = scans.filter(s => s.confidence >= level.min && s.confidence <= level.max).length;
                const percentage = (count / stats.totalScans) * 100;
                return (
                  <div key={index} className="confidence-bar-item">
                    <div className="bar-label-text">{level.range}</div>
                    <div className="bar-background">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: level.color,
                        }}
                      />
                    </div>
                    <div className="bar-count">{count}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StatisticsDashboard;
