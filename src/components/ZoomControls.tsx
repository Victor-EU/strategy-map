import React from 'react';
import './ZoomControls.css';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="zoom-controls">
      <button
        className="zoom-button"
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 8H12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        className="zoom-reset"
        onClick={onResetZoom}
        title="Reset Zoom"
        aria-label="Reset Zoom"
      >
        {zoomPercentage}%
      </button>

      <button
        className="zoom-button"
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 4V12M4 8H12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
