import { db } from '@/lib/db';
import { getSession, canManageEvent, guardEvent } from '@/lib/auth';
import { recordParking } from '@/lib/history';
import { deleteResource } from '@/lib/manage';
import { STATUS_NOTES } from '@/lib/config';

const STATUSES = ['green', 'yellow', 'red'];

// Parking colour is worked out automatically from the free-slot count
function parkingStatus(free, capacity) {
  if (!capacity) return 'green';
  const ratio = free / capacity;
  return free <= 0 || ratio < 0.1 ? 'red' : ratio < 0.3 ? 'yellow' : 'green';
}

export async function POST(req, { params }) {
  const session = await getSession(); // admins can update anything, volunteers only their own area
  if (!session) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const cur = db.prepare('SELECT * FROM resources WHERE id = ?').get(Number(id));
  if (!cur) return Response.json({ error: 'Not found' }, { status: 404 });
  if (session.role === 'volunteer' && cur.zone_id !== session.zoneId)
    return Response.json({ error: 'This is not your area' }, { status: 403 });
  if (session.role !== 'volunteer' && !canManageEvent(session, cur.event_id))
    return Response.json({ error: 'You cannot manage this event' }, { status: 403 });

  let value = cur.value ?? null;
  if (b.value !== undefined && b.value !== null) {
    value = Math.max(0, Math.round(Number(b.value)) || 0);
    if (cur.capacity) value = Math.min(value, cur.capacity);
  }
  let status = cur.status;
  if (STATUSES.includes(b.status)) status = b.status;
  else if (cur.type === 'parking' && b.value !== undefined) status = parkingStatus(value, cur.capacity);
  // Keep the main text in step with the status, unless the admin typed their own note
  let note = cur.note;
  if (b.note !== undefined) note = String(b.note).slice(0, 120);
  else if (STATUSES.includes(b.status) || (cur.type === 'parking' && b.value !== undefined)) note = STATUS_NOTES[cur.type]?.[status] ?? cur.note;

  db.prepare('UPDATE resources SET status = ?, value = ?, note = ?, source = ?, updated_at = ? WHERE id = ?')
    .run(status, value, note ?? '', 'admin', new Date().toISOString(), cur.id);
  if (cur.type === 'parking' && b.value !== undefined) recordParking(cur.id, value);
  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const r = db.prepare('SELECT event_id FROM resources WHERE id = ?').get(Number(id));
  if (!r) return Response.json({ ok: true });
  const g = await guardEvent(r.event_id); if (g.error) return g.error;
  deleteResource(Number(id));
  return Response.json({ ok: true });
}
