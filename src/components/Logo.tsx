import React from 'react';
import './Logo.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
}) => {
  const dimensions = {
    small: { width: 38, height: 38 },
    medium: { width: 56, height: 56 },
    large: { width: 75, height: 75 },
  };

  const { width, height } = dimensions[size];

  return (
    <div className={`logo-container logo-${size}`}>
      <svg
        width={width}
        height={height}
        viewBox="15 15 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Gradient definitions for depth */}
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4DABF7" stopOpacity="1" />
            <stop offset="100%" stopColor="#1971C2" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63E6BE" stopOpacity="1" />
            <stop offset="100%" stopColor="#20C997" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="1" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Connection lines with subtle glow */}
        <g opacity="0.4">
          <line x1="28" y1="40" x2="52" y2="28" stroke="url(#blueGrad)" strokeWidth="3.2" strokeLinecap="round"/>
          <line x1="28" y1="40" x2="52" y2="52" stroke="url(#blueGrad)" strokeWidth="3.2" strokeLinecap="round"/>
          <line x1="52" y1="28" x2="52" y2="52" stroke="url(#purpleGrad)" strokeWidth="2.6" strokeLinecap="round"/>
        </g>

        {/* Main nodes with gradients and subtle shadows */}
        <g filter="url(#shadow)">
          {/* Central node - primary */}
          <circle cx="28" cy="40" r="9" fill="url(#blueGrad)"/>

          {/* Top right node */}
          <circle cx="52" cy="28" r="7" fill="url(#greenGrad)"/>

          {/* Bottom right node */}
          <circle cx="52" cy="52" r="7" fill="url(#purpleGrad)"/>
        </g>

        {/* Subtle shadow filter */}
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};
