// Small decorative pieces shared by the animated pages. Pure SVG, no client code.

// Four-point twinkling star
export function Sparkle({ className = '', style }) {
  return (
    <svg viewBox="0 0 40 40" className={`w-spark ${className}`} style={style} aria-hidden="true">
      <path d="M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z" fill="currentColor" />
    </svg>
  );
}

// Thin orbit lines with a little planet travelling along each
export function Orbit({ className = '' }) {
  return (
    <svg viewBox="0 0 600 600" className={`w-orbit ${className}`} aria-hidden="true">
      <g transform="rotate(-24 300 300)">
        <ellipse cx="300" cy="300" rx="285" ry="190" fill="none" stroke="#c9a24a" strokeWidth="1.3" />
        <circle r="7" fill="#e8b83a"><animateMotion dur="16s" repeatCount="indefinite" path="M15 300a285 190 0 1 0 570 0a285 190 0 1 0 -570 0" /></circle>
      </g>
      <g transform="rotate(32 300 300)">
        <ellipse cx="300" cy="300" rx="270" ry="150" fill="none" stroke="#8fb3d1" strokeWidth="1.3" />
        <circle r="5" fill="#d98f9a"><animateMotion dur="22s" repeatCount="indefinite" path="M30 300a270 150 0 1 1 540 0a270 150 0 1 1 -540 0" /></circle>
      </g>
    </svg>
  );
}