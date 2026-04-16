import React from 'react';
import '../styles/LandingPage.css';

/**
 * Landing Page Component
 * Professional welcome page with features and CTAs
 */
function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-emoji">🍎</span>
            <span className="logo-text">AgriSafe AI</span>
          </div>
          <button className="nav-cta-btn" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Intelligent Food Safety<br />at Your Fingertips
            </h1>
            <p className="hero-description">
              Harness the power of AI to detect food freshness and predict contamination risks in seconds. 
              Protect your health and reduce food waste with our advanced detection system.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={onGetStarted}>
                Analyze Your Food Now
              </button>
              <button className="btn btn-secondary" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </button>
            </div>
            <div className="trust-indicators">
              <span className="indicator">⚡ Instant Results</span>
              <span className="indicator">🎯 AI-Powered Accuracy</span>
              <span className="indicator">🔒 Private & Secure</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <span className="card-icon">🔍</span>
              <span className="card-label">Food Analysis</span>
            </div>
            <div className="floating-card card-2">
              <span className="card-icon">⚠️</span>
              <span className="card-label">Risk Detection</span>
            </div>
            <div className="floating-card card-3">
              <span className="card-icon">✓</span>
              <span className="card-label">Safe to Eat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="problems">
        <div className="section-container">
          <h2>Why AgriSafe AI?</h2>
          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-icon">😵</div>
              <h3>Food Poisoning Risk</h3>
              <p>1 in 6 Americans gets food poisoning yearly. Detect spoilage before it happens.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">🗑️</div>
              <h3>Food Waste</h3>
              <p>Millions of tons wasted annually. Know exactly when food expires with precision.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">❓</div>
              <h3>Uncertainty</h3>
              <p>Can't tell if food is safe? Get instant AI-powered assessments backed by science.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-container">
          <h2>Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">01</div>
              <div className="feature-icon">📸</div>
              <h3>Image Analysis</h3>
              <p>Upload a photo of any food item. Our AI instantly analyzes color, texture, and appearance to determine freshness.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">02</div>
              <div className="feature-icon">🔬</div>
              <h3>Risk Prediction</h3>
              <p>Input food type, storage conditions, and time. Get a detailed contamination risk score from 0-100%.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">03</div>
              <div className="feature-icon">⚡</div>
              <h3>Real-Time Results</h3>
              <p>Get instant predictions with confidence scores. No waiting. No guessing. Just reliable AI decisions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">04</div>
              <div className="feature-icon">🧠</div>
              <h3>Machine Learning</h3>
              <p>Trained on thousands of food samples. Continuously improving with advanced scikit-learn models.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">05</div>
              <div className="feature-icon">📊</div>
              <h3>Detailed Analytics</h3>
              <p>Understand why we made a prediction. View confidence scores and detailed risk breakdowns.</p>
            </div>
            <div className="feature-card">
              <div className="feature-number">06</div>
              <div className="feature-icon">🔐</div>
              <h3>Privacy First</h3>
              <p>Your data stays private. No cloud uploads. All processing happens securely on your device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Capture</h3>
              <p>Take a photo or upload an image of your food</p>
            </div>
            <div className="step-divider">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Analyze</h3>
              <p>Our AI examines color, texture, and patterns</p>
            </div>
            <div className="step-divider">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Decide</h3>
              <p>Get instant freshness verdict and risk score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number">99%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat">
              <div className="stat-number">&lt; 1s</div>
              <div className="stat-label">Average Prediction Time</div>
            </div>
            <div className="stat">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Foods Analyzed</div>
            </div>
            <div className="stat">
              <div className="stat-number">∞</div>
              <div className="stat-label">Peace of Mind</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="section-container">
          <h2>Ready to Eat Safer?</h2>
          <p>Start analyzing your food with AI-powered precision today</p>
          <button className="btn btn-primary btn-large" onClick={onGetStarted}>
            Launch AgriSafe AI
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2026 AgriSafe AI. Protecting your health with artificial intelligence.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
