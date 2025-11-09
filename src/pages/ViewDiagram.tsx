/**
 * ViewDiagram Page - View Shared Diagrams (Read-Only)
 *
 * This page loads a shared diagram by ID and displays it in read-only mode.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Diagram } from '../models/Diagram';
import { Canvas } from '../components/Canvas';
import { Tool } from '../managers/InteractionManager';
import './ViewDiagram.css';

export function ViewDiagram() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load diagram from API
  useEffect(() => {
    if (!id) {
      setError('No diagram ID provided');
      setLoading(false);
      return;
    }

    const loadDiagram = async () => {
      try {
        const response = await fetch(`/api/view?id=${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Diagram not found. It may have expired or the link is invalid.');
          }
          throw new Error('Failed to load diagram');
        }

        const { diagram: diagramData } = await response.json();
        const loadedDiagram = Diagram.fromJSON(diagramData);
        setDiagram(loadedDiagram);
        setLoading(false);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError(err instanceof Error ? err.message : 'Failed to load diagram');
        setLoading(false);
      }
    };

    loadDiagram();
  }, [id]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleDiagramChange = useCallback(() => {
    // No-op for read-only mode
  }, []);

  if (loading) {
    return (
      <div className="view-diagram-container">
        <div className="view-diagram-loading">
          <div className="view-diagram-spinner"></div>
          <p>Loading diagram...</p>
        </div>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="view-diagram-container">
        <div className="view-diagram-error">
          <div className="view-diagram-error-icon">⚠️</div>
          <h2>Failed to Load Diagram</h2>
          <p>{error || 'Unknown error occurred'}</p>
          <button className="view-diagram-button" onClick={handleGoHome}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-diagram-container">
      <div className="view-diagram-header">
        <div className="view-diagram-logo" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
          <span className="view-diagram-logo-text">Strategy Map</span>
          <span className="view-diagram-logo-badge">View Only</span>
        </div>
        <button className="view-diagram-button-primary" onClick={handleGoHome}>
          Create Your Own
        </button>
      </div>

      <div className="view-diagram-canvas-container">
        <Canvas
          diagram={diagram}
          currentTool={Tool.SELECT}
          onDiagramChange={handleDiagramChange}
          onToolChange={() => {}}
          onRendererReady={() => {}}
          onZoomChange={() => {}}
          onViewStateChange={() => {}}
          onEditingChange={() => {}}
          renderTrigger={0}
        />
      </div>

      <div className="view-diagram-footer">
        <p>
          This is a read-only view. <a href="/" className="view-diagram-link">Create your own diagram</a> for free.
        </p>
      </div>
    </div>
  );
}
