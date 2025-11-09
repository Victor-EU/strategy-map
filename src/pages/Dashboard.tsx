/**
 * Analytics Dashboard Page
 *
 * Displays global usage statistics for the Strategy Map application.
 * Beautiful, modern design showcasing worldwide usage metrics.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGlobalStats } from '../utils/analytics';
import './Dashboard.css';

interface GlobalStats {
  sessions: number;
  exports: number;
}

export const Dashboard: React.FC = () => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetchGlobalStats()
      .then(data => {
        setGlobalStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(false);

    fetchGlobalStats()
      .then(data => {
        setGlobalStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  const calculateExportRate = () => {
    if (!globalStats || globalStats.sessions === 0) return 0;
    return ((globalStats.exports / globalStats.sessions) * 100).toFixed(1);
  };

  const calculateAvgExportsPerSession = () => {
    if (!globalStats || globalStats.sessions === 0) return '0.0';
    return (globalStats.exports / globalStats.sessions).toFixed(2);
  };

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <Link to="/" className="back-link">← Back to App</Link>
          <h1 className="hero-title">Strategy Map Analytics</h1>
          <p className="hero-subtitle">Real-time usage statistics from around the world</p>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Fetching global statistics...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to load statistics</h3>
            <p>There was a problem connecting to the analytics service.</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        ) : globalStats ? (
          <>
            {/* Main Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card stat-card-primary">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">🌍</div>
                </div>
                <div className="stat-details">
                  <h3 className="stat-label">Total Sessions</h3>
                  <div className="stat-value">{globalStats.sessions.toLocaleString()}</div>
                  <p className="stat-description">Worldwide usage sessions</p>
                </div>
              </div>

              <div className="stat-card stat-card-secondary">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">📥</div>
                </div>
                <div className="stat-details">
                  <h3 className="stat-label">Total Exports</h3>
                  <div className="stat-value">{globalStats.exports.toLocaleString()}</div>
                  <p className="stat-description">Diagrams downloaded globally</p>
                </div>
              </div>

              <div className="stat-card stat-card-accent">
                <div className="stat-icon-wrapper">
                  <div className="stat-icon">📊</div>
                </div>
                <div className="stat-details">
                  <h3 className="stat-label">Export Rate</h3>
                  <div className="stat-value">{calculateExportRate()}%</div>
                  <p className="stat-description">Sessions resulting in exports</p>
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="insights-section">
              <h2 className="insights-title">Platform Insights</h2>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-number">{calculateAvgExportsPerSession()}</div>
                  <div className="insight-label">Avg exports per session</div>
                </div>
                <div className="insight-card">
                  <div className="insight-number">{globalStats.sessions > 0 ? '✓' : '—'}</div>
                  <div className="insight-label">Active community</div>
                </div>
                <div className="insight-card">
                  <div className="insight-number">∞</div>
                  <div className="insight-label">Free forever</div>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="privacy-section">
              <div className="privacy-icon">🔒</div>
              <h3 className="privacy-title">Privacy-First Analytics</h3>
              <p className="privacy-description">
                All statistics are completely anonymous. We don't collect IP addresses,
                personal information, or use tracking cookies. These metrics help us
                understand usage patterns while respecting your privacy.
              </p>
            </div>

            {/* Refresh Button */}
            <div className="actions-section">
              <button onClick={handleRefresh} className="refresh-button">
                <span className="button-icon">🔄</span>
                <span className="button-text">Refresh Data</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
