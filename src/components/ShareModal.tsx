import React, { useEffect, useState } from 'react';
import './ShareModal.css';

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Auto-select URL on mount
  useEffect(() => {
    const input = document.getElementById('share-url-input') as HTMLInputElement;
    if (input) {
      input.select();
    }
  }, []);

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3 className="share-modal-title">Share Diagram</h3>
          <button className="share-modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
        <div className="share-modal-body">
          <p className="share-modal-message">
            Anyone with this link can view your diagram (read-only):
          </p>
          <div className="share-url-container">
            <input
              id="share-url-input"
              type="text"
              className="share-url-input"
              value={url}
              readOnly
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              className={`share-copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="share-modal-note">
            Link expires after 90 days. The diagram is saved as a snapshot.
          </p>
        </div>
        <div className="share-modal-footer">
          <button className="share-modal-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
