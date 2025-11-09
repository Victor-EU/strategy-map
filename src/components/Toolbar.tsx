import React from 'react';
import { Tool } from '../managers/InteractionManager';
import { Logo } from './Logo';
import './Toolbar.css';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onClear: () => void;
  onExport: () => void;
  onShare: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onClear,
  onExport,
  onShare: _onShare, // Commented out for now, will be used when share feature is enabled
}) => {
  const tools = [
    { tool: Tool.SELECT, icon: '↖', label: 'Select', shortcut: 'V' },
    { tool: Tool.NODE, icon: '○', label: 'Node', shortcut: 'N' },
    { tool: Tool.ARROW, icon: '→', label: 'Arrow', shortcut: 'A' },
    { tool: Tool.TEXT, icon: 'T', label: 'Text', shortcut: 'T' },
    { tool: Tool.PAN, icon: '✋', label: 'Pan', shortcut: 'H' },
    { tool: Tool.LASER, icon: '🔴', label: 'Laser', shortcut: 'L' },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section toolbar-branding">
        <Logo size="small" showTagline={false} />
        <div className="toolbar-brand-text">
          <div className="toolbar-brand-title">Strategy Map</div>
          <div className="toolbar-brand-tagline">A thinking tool to connect the dots</div>
        </div>
      </div>

      <div className="toolbar-section toolbar-tools">
        {tools.map(({ tool, icon, label, shortcut }) => (
          <button
            key={tool}
            className={`toolbar-button ${currentTool === tool ? 'active' : ''}`}
            onClick={() => onToolChange(tool)}
            title={`${label} (${shortcut})`}
          >
            <span className="toolbar-button-icon">{icon}</span>
            <span className="toolbar-button-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-section toolbar-actions">
        <button className="toolbar-button toolbar-button-secondary" onClick={onClear} title="Clear canvas">
          <span className="toolbar-button-icon">🗑</span>
          <span className="toolbar-button-label">Clear</span>
        </button>
        {/* Share button temporarily hidden - will be enabled when Vercel KV is set up */}
        {/* <button className="toolbar-button toolbar-button-primary" onClick={onShare} title="Share diagram">
          <span className="toolbar-button-icon">🔗</span>
          <span className="toolbar-button-label">Share</span>
        </button> */}
        <button className="toolbar-button toolbar-button-primary" onClick={onExport} title="Export as JPEG">
          <span className="toolbar-button-icon">↓</span>
          <span className="toolbar-button-label">Export</span>
        </button>
      </div>
    </div>
  );
};
