// // 'use client';
// // import { MAP_LAYOUT } from '@/lib/config';
// // import { worstStatus, zoneSummary } from '@/lib/insights';

// // const COLORS = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' };

// // export default function VenueMap({ zones }) {
// //   // Use the hand-made layout when every area is known; otherwise arrange all areas in a neat grid automatically
// //   const allKnown = zones.every((z) => MAP_LAYOUT[z.name]);
// //   const layout = {};
// //   let H = 360;
// //   if (allKnown) zones.forEach((z) => { layout[z.id] = MAP_LAYOUT[z.name]; });
// //   else {
// //     const n = zones.length, cols = n <= 2 ? n : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols), gap = 20, h = 110;
// //     const w = (640 - 40 - (cols - 1) * gap) / cols;
// //     zones.forEach((z, i) => { layout[z.id] = { x: 20 + (i % cols) * (w + gap), y: 20 + Math.floor(i / cols) * (h + gap), w, h }; });
// //     H = 40 + rows * h + (rows - 1) * gap;
// //   }
// //   return (
// //     <svg viewBox={`0 0 640 ${H}`} className="map" role="img" aria-label="Venue map with live status">
// //       <rect x="0" y="0" width="640" height={H} rx="14" fill="#eef2f7" />
// //       {allKnown && <>
// //         <rect x="180" y="175" width="300" height="30" rx="6" fill="#d7dee8" />
// //         <rect x="180" y="20" width="30" height="300" rx="6" fill="#d7dee8" />
// //         <text x="330" y="195" textAnchor="middle" fontSize="11" fill="#6b7280">main road</text>
// //       </>}
// //       {zones.map((z) => {
// //         const L = layout[z.id];
// //         const c = COLORS[worstStatus(z.resources)];
// //         return (
// //           <a key={z.id} href={`#zone-${z.id}`}>
// //             <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="12" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="3" />
// //             <text x={L.x + L.w / 2} y={L.y + L.h / 2 - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">{z.name}</text>
// //             <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 15} textAnchor="middle" fontSize="12" fill="#374151">{zoneSummary(z)}</text>
// //           </a>
// //         );
// //       })}
// //     </svg>
// //   );
// // }

// 'use client';
// import { MAP_LAYOUT, RESOURCE_TYPES } from '@/lib/config';
// import { worstStatus, zoneSummary } from '@/lib/insights';

// const COLORS = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' };
// const TINT = { green: '#dcebd3', yellow: '#fbe9b7', red: '#f6cfcf' };

// export default function VenueMap({ zones }) {
//   // Use the hand-made layout when every area is known; otherwise arrange all areas in a neat grid automatically
//   const allKnown = zones.every((z) => MAP_LAYOUT[z.name]);
//   const layout = {};
//   let H = 360;
//   if (allKnown) zones.forEach((z) => { layout[z.id] = MAP_LAYOUT[z.name]; });
//   else {
//     const n = zones.length, cols = n <= 2 ? n : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols), gap = 20, h = 110;
//     const w = (640 - 40 - (cols - 1) * gap) / cols;
//     zones.forEach((z, i) => { layout[z.id] = { x: 20 + (i % cols) * (w + gap), y: 20 + Math.floor(i / cols) * (h + gap), w, h }; });
//     H = 40 + rows * h + (rows - 1) * gap;
//   }
//   return (
//     <svg viewBox={`0 0 640 ${H}`} className="lv-map" role="img" aria-label="Venue map with live status">
//       <defs>
//         <linearGradient id="lv-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7f2e8" /><stop offset="1" stopColor="#e4edf1" /></linearGradient>
//         <pattern id="lv-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#26324a" fillOpacity=".13" /></pattern>
//         <filter id="lv-sh" x="-20%" y="-20%" width="140%" height="155%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#26324a" floodOpacity=".2" /></filter>
//       </defs>
//       <rect width="640" height={H} rx="26" fill="url(#lv-bg)" />
//       <rect width="640" height={H} rx="26" fill="url(#lv-dots)" />
//       <circle cx="585" cy={H - 20} r="95" fill="#8aa77b" fillOpacity=".14" />
//       <circle cx="35" cy={H - 5} r="70" fill="#e9b9b9" fillOpacity=".18" />

//       {allKnown && <g aria-hidden="true">
//         <rect x="180" y="175" width="300" height="30" rx="15" fill="#e4dccb" />
//         <rect x="180" y="20" width="30" height="300" rx="15" fill="#e4dccb" />
//         <line className="lv-dash" x1="195" y1="36" x2="195" y2="304" stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
//         <line className="lv-dash" x1="224" y1="190" x2="304" y2="190" stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
//         <line className="lv-dash" x1="356" y1="190" x2="466" y2="190" stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
//         <text x="330" y="194" textAnchor="middle" fontSize="10" letterSpacing="1.5" fill="#8a8473">MAIN ROAD</text>
//         <circle className="lv-walker" r="3.5" fill="#e8b83a"><animateMotion dur="22s" repeatCount="indefinite" path="M195 36 L195 304 L195 36" /></circle>
//         <circle className="lv-walker" r="3" fill="#d98f9a"><animateMotion dur="26s" begin="-9s" repeatCount="indefinite" path="M195 304 L195 36 L195 304" /></circle>
//         <circle className="lv-walker" r="3.5" fill="#8aa77b"><animateMotion dur="20s" begin="-5s" repeatCount="indefinite" path="M224 190 L466 190 L224 190" /></circle>
//       </g>}

//       {zones.map((z, i) => {
//         const L = layout[z.id];
//         const st = worstStatus(z.resources);
//         const c = COLORS[st];
//         const icons = [...new Set(z.resources.map((r) => r.type))].slice(0, 4).map((t) => (RESOURCE_TYPES[t] || {}).icon).filter(Boolean).join(' ');
//         const dx = L.x + L.w - 18, dy = L.y + 18;
//         return (
//           <a key={z.id} href={`#zone-${z.id}`} aria-label={`${z.name}: ${zoneSummary(z)}`}>
//             <g className={`lv-area ${st}`} style={{ '--i': i }}>
//               <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="22" fill={TINT[st]} stroke={c} strokeWidth="2.5" filter="url(#lv-sh)" />
//               <text x={L.x + 14} y={L.y + 24} fontSize="13">{icons}</text>
//               <circle cx={dx} cy={dy} r="6" fill={c} />
//               {st !== 'green' && <circle className="lv-pulse" cx={dx} cy={dy} r="6" fill="none" stroke={c} strokeWidth="2" />}
//               <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 3} textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="Georgia, 'Palatino Linotype', serif" fill="#26324a">{z.name}</text>
//               <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 22} textAnchor="middle" fontSize="12" fill="#3a4764">{zoneSummary(z)}</text>
//             </g>
//           </a>
//         );
//       })}
//     </svg>
//   );
// }

'use client';
import { MAP_LAYOUT, RESOURCE_TYPES } from '@/lib/config';
import { worstStatus, zoneSummary } from '@/lib/insights';

const COLORS = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' };
const TINT = { green: '#dcebd3', yellow: '#fbe9b7', red: '#f6cfcf' };

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Split a long area name into two lines at the space nearest the middle
function wrapName(name, maxChars) {
  if (name.length <= maxChars) return [name];
  const mid = name.length / 2;
  let best = -1;
  for (let i = 0; i < name.length; i++) if (name[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [name] : [name.slice(0, best), name.slice(best + 1)];
}

export default function VenueMap({ zones }) {
  // The hand-made layout is only used when every area is known AND no two areas share the same spot.
  // Otherwise (a new area, or two areas that would overlap) every area is placed automatically in a clean grid.
  const known = zones.length > 0 && zones.every((z) => MAP_LAYOUT[z.name]);
  const rects = known ? zones.map((z) => MAP_LAYOUT[z.name]) : [];
  const clash = known && rects.some((r, i) => rects.slice(i + 1).some((o) => overlaps(r, o)));
  const hand = known && !clash;

  const layout = {};
  let H = 360;
  let hRoads = [], vRoads = [];
  if (hand) zones.forEach((z) => { layout[z.id] = MAP_LAYOUT[z.name]; });
  else {
    const n = zones.length;
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
    const rows = Math.max(1, Math.ceil(n / cols));
    const pad = 26, gapX = 44, gapY = 44;
    const h = rows === 1 ? 190 : rows === 2 ? 150 : 124;
    const w = (640 - 2 * pad - (cols - 1) * gapX) / cols;
    zones.forEach((z, i) => { layout[z.id] = { x: pad + (i % cols) * (w + gapX), y: pad + Math.floor(i / cols) * (h + gapY), w, h }; });
    H = 2 * pad + rows * h + (rows - 1) * gapY;
    for (let r = 0; r < rows - 1; r++) hRoads.push(pad + (r + 1) * h + r * gapY + (gapY - 20) / 2);
    for (let c = 0; c < cols - 1; c++) vRoads.push(pad + (c + 1) * w + c * gapX + (gapX - 20) / 2);
  }
  return (
    <svg viewBox={`0 0 640 ${H}`} className="lv-map" role="img" aria-label="Venue map with live status">
      <defs>
        <linearGradient id="lv-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7f2e8" /><stop offset="1" stopColor="#e4edf1" /></linearGradient>
        <pattern id="lv-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#26324a" fillOpacity=".13" /></pattern>
        <filter id="lv-sh" x="-20%" y="-20%" width="140%" height="155%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#26324a" floodOpacity=".2" /></filter>
      </defs>
      <rect width="640" height={H} rx="26" fill="url(#lv-bg)" />
      <rect width="640" height={H} rx="26" fill="url(#lv-dots)" />
      <circle cx="585" cy={H - 20} r="95" fill="#8aa77b" fillOpacity=".14" />
      <circle cx="35" cy={H - 5} r="70" fill="#e9b9b9" fillOpacity=".18" />

      {hand && <g aria-hidden="true">
        <rect x="180" y="175" width="300" height="30" rx="15" fill="#e4dccb" />
        <rect x="180" y="20" width="30" height="300" rx="15" fill="#e4dccb" />
        <line className="lv-dash" x1="195" y1="36" x2="195" y2="304" stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
        <line className="lv-dash" x1="224" y1="190" x2="304" y2="190" stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
        <line className="lv-dash" x1="356" y1="190" x2="466" y2="190" stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
        <text x="330" y="194" textAnchor="middle" fontSize="10" letterSpacing="1.5" fill="#8a8473">MAIN ROAD</text>
        <circle className="lv-walker" r="3.5" fill="#e8b83a"><animateMotion dur="22s" repeatCount="indefinite" path="M195 36 L195 304 L195 36" /></circle>
        <circle className="lv-walker" r="3" fill="#d98f9a"><animateMotion dur="26s" begin="-9s" repeatCount="indefinite" path="M195 304 L195 36 L195 304" /></circle>
        <circle className="lv-walker" r="3.5" fill="#8aa77b"><animateMotion dur="20s" begin="-5s" repeatCount="indefinite" path="M224 190 L466 190 L224 190" /></circle>
      </g>}

      {!hand && <g aria-hidden="true">
        {hRoads.map((y, i) => <g key={`h${i}`}>
          <rect x="8" y={y} width="624" height="20" rx="10" fill="#e4dccb" />
          <line className="lv-dash" x1="22" y1={y + 10} x2="618" y2={y + 10} stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
        </g>)}
        {vRoads.map((x, i) => <g key={`v${i}`}>
          <rect x={x} y="8" width="20" height={H - 16} rx="10" fill="#e4dccb" />
          <line className="lv-dash" x1={x + 10} y1="22" x2={x + 10} y2={H - 22} stroke="#fbf8f1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 9" />
        </g>)}
        {hRoads.length > 0 && <circle className="lv-walker" r="3.5" fill="#e8b83a"><animateMotion dur="24s" repeatCount="indefinite" path={`M22 ${hRoads[0] + 10} L618 ${hRoads[0] + 10} L22 ${hRoads[0] + 10}`} /></circle>}
        {vRoads.length > 0 && <circle className="lv-walker" r="3.5" fill="#d98f9a"><animateMotion dur="22s" begin="-7s" repeatCount="indefinite" path={`M${vRoads[0] + 10} 22 L${vRoads[0] + 10} ${H - 22} L${vRoads[0] + 10} 22`} /></circle>}
      </g>}

      {zones.map((z, i) => {
        const L = layout[z.id];
        const st = worstStatus(z.resources);
        const c = COLORS[st];
        const icons = [...new Set(z.resources.map((r) => r.type))].slice(0, 4).map((t) => (RESOURCE_TYPES[t] || {}).icon).filter(Boolean).join(' ');
        const dx = L.x + L.w - 18, dy = L.y + 18;
        const lines = wrapName(z.name, Math.floor((L.w - 24) / 9.6));
        const longest = Math.max(...lines.map((l) => l.length));
        const fs = Math.max(11, Math.min(15, (L.w - 24) / (longest * 0.64)));
        const cy = L.y + L.h / 2;
        const nameY = lines.length > 1 ? cy - 12 : cy + 3;
        const sumY = lines.length > 1 ? cy + 28 : cy + 22;
        return (
          <a key={z.id} href={`#zone-${z.id}`} aria-label={`${z.name}: ${zoneSummary(z)}`}>
            <g className={`lv-area ${st}`} style={{ '--i': i }}>
              <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="22" fill={TINT[st]} stroke={c} strokeWidth="2.5" filter="url(#lv-sh)" />
              <text x={L.x + 14} y={L.y + 24} fontSize="13">{icons}</text>
              <circle cx={dx} cy={dy} r="6" fill={c} />
              {st !== 'green' && <circle className="lv-pulse" cx={dx} cy={dy} r="6" fill="none" stroke={c} strokeWidth="2" />}
              <text x={L.x + L.w / 2} y={nameY} textAnchor="middle" fontSize={fs} fontWeight="700" fontFamily="Georgia, 'Palatino Linotype', serif" fill="#26324a">
                {lines.map((ln, k) => <tspan key={k} x={L.x + L.w / 2} dy={k === 0 ? 0 : fs * 1.2}>{ln}</tspan>)}
              </text>
              <text x={L.x + L.w / 2} y={sumY} textAnchor="middle" fontSize="12" fill="#3a4764">{zoneSummary(z)}</text>
            </g>
          </a>
        );
      })}
    </svg>
  );
}