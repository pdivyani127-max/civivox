// Original paper-cut style illustrations for Civivox. Plain inline SVG: tiny files, no images to download.
const INK = '#26324a';
const GLASS = '#dcebf5';

export function Person({ skin = '#f1c9a5', hair = '#3b2a20', shirt = '#e9b9b9', pants = '#8fb3d1', phone = false, className = '', style }) {
  return (
    <svg className={`person ${className}`} style={style} viewBox="0 0 60 124" aria-hidden="true">
      <g className="leg leg-b"><rect x="27" y="78" width="10" height="34" rx="5" fill={pants} opacity=".85" /><ellipse cx="34" cy="114" rx="9" ry="4.5" fill={INK} /></g>
      <g className="leg leg-a"><rect x="23" y="78" width="10" height="34" rx="5" fill={pants} /><ellipse cx="30" cy="114" rx="9" ry="4.5" fill={INK} /></g>
      <path d="M16 40 Q30 30 44 40 L47 83 Q30 90 13 83 Z" fill={shirt} />
      <rect x="40" y="41" width="9" height="33" rx="4.5" fill={shirt} transform="rotate(-8 44 43)" />
      {phone && <rect x="43" y="62" width="9" height="15" rx="2" fill={INK} transform="rotate(-14 47 68)" />}
      <circle cx="30" cy="21" r="12" fill={skin} />
      <path d="M17 20 Q17 5 31 6 Q44 7 43 21 Q38 13 30 13 Q22 13 17 20Z" fill={hair} />
    </svg>
  );
}

export function Car({ body = '#e9b9b9', className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 140 72" aria-hidden="true">
      <path d="M8 50 Q8 38 24 36 L40 19 Q44 15 50 15 L90 15 Q96 15 100 19 L114 36 Q132 38 132 50 L132 54 Q132 58 128 58 L12 58 Q8 58 8 54Z" fill={body} />
      <path d="M45 22 L58 22 L58 35 L35 35Z" fill={GLASS} />
      <path d="M64 22 L90 22 L103 35 L64 35Z" fill={GLASS} />
      <circle cx="38" cy="58" r="11" fill={INK} /><circle cx="38" cy="58" r="4.5" fill="#cbd5e1" />
      <circle cx="104" cy="58" r="11" fill={INK} /><circle cx="104" cy="58" r="4.5" fill="#cbd5e1" />
      <rect x="123" y="42" width="9" height="6" rx="2" fill="#f6d365" />
    </svg>
  );
}

export function ParkingSign({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 60 100" aria-hidden="true">
      <rect x="27" y="40" width="6" height="58" rx="3" fill={INK} />
      <rect x="4" y="4" width="52" height="52" rx="10" fill="#8fb3d1" stroke={INK} strokeWidth="3" />
      <path d="M21 44 V16 H33 Q43 16 43 26 Q43 36 33 36 H27" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bin({ body = '#8aa77b', className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 70 92" aria-hidden="true">
      <rect x="6" y="6" width="58" height="12" rx="5" fill="#6d8a5f" />
      <rect x="28" y="1" width="14" height="7" rx="3" fill="#6d8a5f" />
      <path d="M11 20 H59 L55 86 Q55 90 51 90 H19 Q15 90 15 86Z" fill={body} />
      <path d="M26 30 V78 M35 30 V78 M44 30 V78" stroke="#6d8a5f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Bolt({ fill = '#e8b83a', className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 90" aria-hidden="true">
      <polygon points="38,2 10,48 28,48 20,88 54,34 35,34 46,2" fill={fill} stroke="#d19a1c" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Sun({ className = '', style }) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <g className="rays" style={{ transformOrigin: '50px 50px' }}>
        {rays.map(a => <rect key={a} x="47" y="2" width="6" height="16" rx="3" fill="#e8b83a" transform={`rotate(${a} 50 50)`} />)}
      </g>
      <circle cx="50" cy="50" r="22" fill="#f4cf5d" />
    </svg>
  );
}

export function Plant({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 70 70" aria-hidden="true">
      <path d="M35 68 Q33 40 18 24 Q34 26 35 52Z" fill="#7fa6a0" />
      <path d="M35 68 Q37 34 54 16 Q58 36 36 56Z" fill="#6d9a8a" />
      <path d="M35 68 Q36 44 32 14 Q44 30 37 60Z" fill="#8fb8a8" />
    </svg>
  );
}

export function PhoneQR({ className = '', style }) {
  const cells = [[0,0],[1,0],[2,0],[4,0],[0,1],[2,1],[3,1],[0,2],[1,2],[2,2],[4,2],[3,3],[1,4],[2,4],[4,4],[0,4],[4,3],[0,3]];
  return (
    <svg className={className} style={style} viewBox="0 0 120 200" aria-hidden="true">
      <rect x="6" y="4" width="108" height="192" rx="18" fill={INK} />
      <rect x="14" y="20" width="92" height="160" rx="8" fill="#f6f1e7" />
      <rect x="42" y="9" width="36" height="6" rx="3" fill="#4a5875" />
      <g transform="translate(34 56)">
        <rect width="52" height="52" rx="4" fill="#fff" stroke={INK} strokeWidth="2" />
        {cells.map(([x, y], i) => <rect key={i} x={5 + x * 8} y={5 + y * 8} width="7" height="7" fill={INK} />)}
      </g>
      <rect x="30" y="124" width="60" height="9" rx="4.5" fill="#8fb3d1" />
      <rect x="40" y="142" width="40" height="7" rx="3.5" fill="#e9b9b9" />
    </svg>
  );
}

export function Shield({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 60 72" aria-hidden="true">
      <path d="M30 3 L55 13 V35 C55 52 44 62 30 69 C16 62 5 52 5 35 V13Z" fill="#8aa77b" stroke="#6d8a5f" strokeWidth="2" />
      <path d="M18 36 L27 45 L43 26" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Signal({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 70 70" aria-hidden="true">
      <circle cx="35" cy="52" r="7" fill="#e9b9b9" />
      <path d="M20 40 Q35 26 50 40" fill="none" stroke="#8fb3d1" strokeWidth="6" strokeLinecap="round" />
      <path d="M8 28 Q35 4 62 28" fill="none" stroke="#8fb3d1" strokeWidth="6" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

// Rolling hills: stretches to any width
const HILL_PATHS = {
  1: 'M0 110 C150 30 290 40 420 88 S690 150 840 78 S1060 30 1200 96 L1200 200 L0 200Z',
  2: 'M0 90 C170 150 310 60 500 92 S770 150 930 82 S1110 42 1200 74 L1200 200 L0 200Z',
  3: 'M0 120 C200 60 330 130 520 100 S800 40 980 96 S1120 130 1200 90 L1200 200 L0 200Z',
};
export function Hills({ fill = '#8aa77b', edge = '#9fba90', variant = 1, className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
      <path d={HILL_PATHS[variant]} fill={fill} />
      <path d={HILL_PATHS[variant]} fill="none" stroke={edge} strokeWidth="4" opacity=".7" transform="translate(0 4)" />
    </svg>
  );
}

// Wavy edge used as a divider between sections (fills with the NEXT section's colour)
export function Wave({ fill = '#f6f1e7', flip = false, className = '', style }) {
  return (
    <svg className={className} style={{ transform: flip ? 'scaleY(-1)' : undefined, ...style }} viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 40 C120 0 260 0 400 36 S680 80 820 40 S1080 0 1200 34 L1200 80 L0 80Z" fill={fill} />
    </svg>
  );
}

export function Cloud({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 140 60" aria-hidden="true">
      <path d="M20 50 Q4 50 6 36 Q8 24 24 26 Q28 8 48 10 Q62 -2 80 12 Q100 8 106 26 Q130 24 132 40 Q134 52 116 50Z" fill="#fff" opacity=".85" />
    </svg>
  );
}
