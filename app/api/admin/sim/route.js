import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';
import { recordParking } from '@/lib/history';
import { parkingStatus } from '@/lib/insights';
import { STATUS_NOTES } from '@/lib/config';

// Simulation mode: one "tick" makes the event data move a little (cars arrive, bins fill, crowds change).
// The admin page calls this every few seconds while Simulation is switched on.
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ORDER = ['green', 'yellow', 'red'];

export async function POST(req) {
  const { eventId } = await req.json().catch(() => ({}));
  const g = await guardEvent(eventId); if (g.error) return g.error;
  const rows = db.prepare('SELECT * FROM resources WHERE event_id = ?').all(Number(eventId || 1));
  const now = new Date().toISOString();
  const upd = db.prepare('UPDATE resources SET status = ?, value = ?, note = ?, source = ?, updated_at = ? WHERE id = ?');
  const rnd = Math.random;

  for (const r of rows) {
    if (r.type === 'parking') {
      let v = r.value ?? 0;
      const low = v < r.capacity * 0.1;
      if (rnd() < (low ? 0.5 : 0.25)) v += Math.floor(rnd() * 4) + 1;      // cars leave
      else if (rnd() < 0.8) v -= Math.floor(rnd() * 3);                    // cars arrive
      v = clamp(v, 0, r.capacity);
      const st = parkingStatus(v, r.capacity);
      upd.run(st, v, STATUS_NOTES.parking[st], 'sim', now, r.id);
      recordParking(r.id, v);
    } else if (r.type === 'crowd') {
      if (r.source === 'sensor' && Date.now() - new Date(r.updated_at).getTime() < 60000) continue; // real sensor wins
      let i = ORDER.indexOf(r.status);
      if (rnd() < 0.3) i = clamp(i + (rnd() < 0.5 ? -1 : 1), 0, 2);
      upd.run(ORDER[i], r.value ?? null, STATUS_NOTES.crowd[ORDER[i]], 'sim', now, r.id);
    } else if (r.type === 'waste') {
      const p = { green: 0.08, yellow: 0.1, red: 0.12 }[r.status] ?? 0;
      if (rnd() < p) {
        const next = r.status === 'green' ? 'yellow' : r.status === 'yellow' ? 'red' : 'green';
        upd.run(next, r.value ?? null, STATUS_NOTES.waste[next], 'sim', now, r.id);
      }
    } else if (r.type === 'power') {
      if (r.status === 'green' && rnd() < 0.03) { const st = rnd() < 0.5 ? 'yellow' : 'red'; upd.run(st, null, STATUS_NOTES.power[st], 'sim', now, r.id); }
      else if (r.status !== 'green' && rnd() < 0.2) upd.run('green', null, STATUS_NOTES.power.green, 'sim', now, r.id);
    }
  }
  return Response.json({ ok: true });
}
