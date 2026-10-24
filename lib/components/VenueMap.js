'use client';
import { MAP_LAYOUT } from '@/lib/config';
import { worstStatus, zoneSummary } from '@/lib/insights';

const COLORS = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' };

export default function VenueMap({ zones }) {
  // Use the hand-made layout when every area is known; otherwise arrange all areas in a neat grid automatically
  const allKnown = zones.every((z) => MAP_LAYOUT[z.name]);
  const layout = {};
  let H = 360;
  if (allKnown) zones.forEach((z) => { layout[z.id] = MAP_LAYOUT[z.name]; });
  else {
    const n = zones.length, cols = n <= 2 ? n : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols), gap = 20, h = 110;
    const w = (640 - 40 - (cols - 1) * gap) / cols;
    zones.forEach((z, i) => { layout[z.id] = { x: 20 + (i % cols) * (w + gap), y: 20 + Math.floor(i / cols) * (h + gap), w, h }; });
    H = 40 + rows * h + (rows - 1) * gap;
  }
  return (
    <svg viewBox={`0 0 640 ${H}`} className="map" role="img" aria-label="Venue map with live status">
      <rect x="0" y="0" width="640" height={H} rx="14" fill="#eef2f7" />
      {allKnown && <>
        <rect x="180" y="175" width="300" height="30" rx="6" fill="#d7dee8" />
        <rect x="180" y="20" width="30" height="300" rx="6" fill="#d7dee8" />
        <text x="330" y="195" textAnchor="middle" fontSize="11" fill="#6b7280">main road</text>
      </>}
      {zones.map((z) => {
        const L = layout[z.id];
        const c = COLORS[worstStatus(z.resources)];
        return (
          <a key={z.id} href={`#zone-${z.id}`}>
            <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="12" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="3" />
            <text x={L.x + L.w / 2} y={L.y + L.h / 2 - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">{z.name}</text>
            <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 15} textAnchor="middle" fontSize="12" fill="#374151">{zoneSummary(z)}</text>
          </a>
        );
      })}
    </svg>
  );
}
