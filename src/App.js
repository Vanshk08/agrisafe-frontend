import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AgriculturalForm from './components/AgriculturalForm';
import ContaminationRiskDisplay from './components/ContaminationRiskDisplay';
import PreventionAdvisory from './components/PreventionAdvisory';
import ImageUploader from './components/ImageUploader';
import RiskPredictor from './components/RiskPredictor';
import ScanHistory from './components/ScanHistory';
import DarkModeToggle from './components/DarkModeToggle';
import StatisticsDashboard from './components/StatisticsDashboard';
import BatchUpload from './components/BatchUpload';
import './App.css';

/**
 * Main App Component
 * AgriSafe AI - Agricultural Contamination Detection System
 */
function App() {
  const [showApp, setShowApp] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [batchId, setBatchId] = useState(null);
  const [activeTab, setActiveTab] = useState('agricultural'); // 'agricultural' or 'traditional'

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Check API health on mount
   */
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        console.error('API health check failed:', err);
        setApiStatus('error');
      }
    };

    checkApiHealth();
  }, [API_BASE_URL]);

  /**
   * Handle agricultural data submission
   */
  const handleAgriculturalDataSubmitted = (result) => {
    setBatchId(result.batch_id);
  };

  // Show landing page if user hasn't started yet
  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => setShowApp(false)} style={{ cursor: 'pointer' }}>
            <span className="app-logo">🌾</span>
            <div className="header-text">
              <h1>AgriSafe AI</h1>
              <p className="subtitle">Protection from Agricultural Contamination Towards Food</p>
            </div>
          </div>
          
          {/* API Status */}
          <div className="api-status">
            <span className={`status-badge ${apiStatus}`}>
              {apiStatus === 'connected' && '✓ Connected'}
              {apiStatus === 'error' && '✕ Offline'}
              {apiStatus === 'checking' && '⏳ Checking...'}
            </span>
          </div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {apiStatus === 'error' && (
          <div className="api-error">
            <h3>⚠️ API Connection Error</h3>
            <p>Cannot connect to backend API at {API_BASE_URL}</p>
            <p>Make sure the Flask server is running on port 5000</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`nav-btn ${activeTab === 'agricultural' ? 'active' : ''}`}
            onClick={() => setActiveTab('agricultural')}
          >
            🌾 Agricultural Analysis
          </button>
          <button
            className={`nav-btn ${activeTab === 'traditional' ? 'active' : ''}`}
            onClick={() => setActiveTab('traditional')}
          >
            🍎 Traditional Analyzer
          </button>
        </div>

        {/* Agricultural Analysis Tab */}
        {activeTab === 'agricultural' && (
          <div className="agricultural-tab">
            {/* Step 1: Agricultural Input */}
            <section className="section">
              <AgriculturalForm onDataSubmitted={handleAgriculturalDataSubmitted} />
            </section>

            {/* Step 2: Risk Display */}
            {batchId && (
              <>
                <section className="section">
                  <ContaminationRiskDisplay batchId={batchId} />
                </section>

                {/* Step 3: Prevention Advisory */}
                <section className="section">
                  <PreventionAdvisory batchId={batchId} />
                </section>

                {/* Batch Traceability */}
                <section className="section">
                  <div className="traceability-card">
                    <h2>📦 Batch Traceability</h2>
                    <div className="traceability-info">
                      <p><strong>Batch ID:</strong> {batchId}</p>
                      <p>Use this ID to track the batch through the entire supply chain: Farm → Storage → Consumer</p>
                      <button
                        onClick={() => alert(`Traceability for batch ${batchId}`)}
                        className="btn-primary"
                      >
                        View Full Traceability
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* Traditional Analysis Tab */}
        {activeTab === 'traditional' && (
          <div className="traditional-tab">
            <div className="content-grid">
              {/* Image Analysis Section */}
              <section className="content-section">
                <ImageUploader onPredictionComplete={setImageResult} />
              </section>

              {/* Risk Assessment Section */}
              <section className="content-section">
                <RiskPredictor onPredictionComplete={setRiskResult} />
              </section>
            </div>

            {/* Batch Upload Section */}
            <section className="batch-section">
              <BatchUpload />
            </section>

            {/* Combined Results */}
            {(imageResult || riskResult) && (
              <section className="results-section">
                <div className="results-card">
                  <h2>📋 Analysis Summary</h2>
                  
                  <div className="results-grid">
                    {imageResult && (
                      <div className="result-item">
                        <h3>Image Analysis</h3>
                        <div className={`result-badge ${imageResult.prediction}`}>
                          {imageResult.prediction === 'fresh' ? '✓ Fresh' : '⚠ Spoiled'}
                        </div>
                        <p>Confidence: {imageResult.confidence_percentage.toFixed(2)}%</p>
                      </div>
                    )}

                    {riskResult && (
                      <div className="result-item">
                        <h3>Risk Assessment</h3>
                        <div className={`result-badge ${riskResult.risk_level}`}>
                          {riskResult.risk_level === 'low' && '✓ Low Risk'}
                          {riskResult.risk_level === 'medium' && '⚠ Medium Risk'}
                          {riskResult.risk_level === 'high' && '🚫 High Risk'}
                        </div>
                        <p>Risk: {riskResult.risk_percentage.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>

                  {imageResult && riskResult && (
                    <div className="combined-recommendation">
                      <h3>🎯 Final Recommendation</h3>
                      {imageResult.prediction === 'fresh' && riskResult.safe_to_eat ? (
                        <p className="recommendation-safe">✓ Safe to consume</p>
                      ) : (
                        <p className="recommendation-unsafe">✕ Not recommended for consumption</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Scan History Section */}
            <section className="history-section">
              <ScanHistory />
            </section>

            {/* Statistics Dashboard Section */}
            <section className="stats-section">
              <StatisticsDashboard />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 AgriSafe AI. Protection from Agricultural Contamination Towards Food.</p>
      </footer>
    </div>
  );
}

export default App;
