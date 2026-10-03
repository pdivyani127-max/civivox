// Smart logic (pure functions, used by both server and browser)
export const RANK = { green: 0, yellow: 1, red: 2 };
export const worstStatus = (resources) =>
  resources.reduce((w, r) => (RANK[r.status] > RANK[w] ? r.status : w), 'green');

export function parkingStatus(free, capacity) {
  if (!capacity) return 'green';
  const ratio = free / capacity;
  return free <= 0 || ratio < 0.1 ? 'red' : ratio < 0.3 ? 'yellow' : 'green';
}

// Fill-time prediction: how fast are free slots dropping? -> minutes until zero
export function predictEta(points, current) {
  if (!current || points.length < 2) return null;
  const a = points[0], b = points[points.length - 1];
  const mins = (new Date(b.created_at) - new Date(a.created_at)) / 60000;
  if (mins < 2) return null;
  const rate = (a.value - b.value) / mins; // slots per minute
  if (rate <= 0.05) return null;
  const eta = Math.round(current / rate);
  return eta <= 180 ? Math.max(eta, 1) : null;
}

const flat = (zones, type) =>
  zones.flatMap((z) => z.resources.filter((r) => r.type === type).map((r) => ({ ...r, zone: z.name, kind: z.kind })));

// "Where should I go?" advice for visitors
export function suggestions(zones) {
  const out = [];
  const halls = flat(zones, 'crowd').filter((r) => r.kind === 'hall');
  const calm = halls.filter((r) => r.status === 'green');
  halls.filter((r) => r.status === 'red').forEach((h) =>
    out.push({ icon: '👥', tone: 'red', text: calm.length
      ? `${h.zone} is crowded. Try ${calm[0].zone} - it is calm right now.`
      : `${h.zone} is crowded. Expect a wait.` }));

  const lots = flat(zones, 'parking');
  const open = lots.filter((l) => l.value > 0).sort((a, b) => b.value / b.capacity - a.value / a.capacity);
  if (lots.length) {
    if (!open.length) out.push({ icon: '🅿️', tone: 'red', text: 'All parking lots are full. Please use public transport or park outside the venue.' });
    else if (open[0].status === 'red') out.push({ icon: '🅿️', tone: 'red', text: `Parking is almost full everywhere. Best chance: ${open[0].zone} (${open[0].value} free).` });
    else out.push({ icon: '🅿️', tone: 'green', text: `Best parking now: ${open[0].zone} - ${open[0].value} slots free.` });
  }

  const bins = flat(zones, 'waste');
  bins.filter((b) => b.status === 'red').forEach((b) => {
    const alt = bins.find((x) => x.zone === b.zone && x.status === 'green');
    if (alt) out.push({ icon: '🗑️', tone: 'yellow', text: `${b.label} is full - use ${alt.label} instead.` });
  });
  flat(zones, 'power').filter((p) => p.status === 'red').forEach((p) =>
    out.push({ icon: '⚡', tone: 'red', text: `Power outage at ${p.zone}. Please use another area while it is restored.` }));
  return out;
}

// Auto-generated, ranked to-do list for staff
const WEIGHT = { power: { red: 100, yellow: 40 }, crowd: { red: 90, yellow: 30 }, parking: { red: 70, yellow: 15 }, waste: { red: 60, yellow: 20 } };
const TEXT = {
  power: { red: (z) => `Restore power at ${z}`, yellow: (z) => `Check the backup generator at ${z}` },
  crowd: { red: (z) => `Send a guard to manage the crowd at ${z}`, yellow: (z) => `Keep watch on the crowd at ${z}` },
  parking: { red: (z) => `Divert traffic away from ${z}`, yellow: (z) => `Get ready to close ${z} soon` },
  waste: { red: (z, r) => `Empty ${r.label}`, yellow: (z, r) => `Check ${r.label} (half full)` },
};
export function tasks(zones) {
  const list = [];
  zones.forEach((z) => z.resources.forEach((r) => {
    const w = WEIGHT[r.type]?.[r.status];
    if (w) list.push({ id: r.id, score: w, urgent: r.status === 'red', zone: z.name, text: TEXT[r.type][r.status](z.name, r) });
    if (r.type === 'parking' && r.status !== 'red' && r.eta != null && r.eta <= 15)
      list.push({ id: `eta-${r.id}`, score: 50, urgent: false, zone: z.name, text: `${z.name} will be full in about ${r.eta} min - prepare a diversion` });
  }));
  return list.sort((a, b) => b.score - a.score).slice(0, 8);
}

// Short text shown on each map zone
export function zoneSummary(z) {
  const p = z.resources.find((r) => r.type === 'parking');
  if (p && p.value != null) return `${p.value} / ${p.capacity} free`;
  const c = z.resources.find((r) => r.type === 'crowd');
  if (c) return String(c.note || '').replace(/\s*\(.*\)/, '');
  const w = worstStatus(z.resources);
  return w === 'green' ? 'All normal' : w === 'yellow' ? 'Busy' : 'Alert';
}
