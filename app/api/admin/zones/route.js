import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

const KINDS = ['hall', 'parking', 'food', 'other'];

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim().slice(0, 60);
  if (!name || !b.eventId) return Response.json({ error: 'Area name is required' }, { status: 400 });
  if (!db.prepare('SELECT 1 FROM events WHERE id = ?').get(Number(b.eventId))) return Response.json({ error: 'Event not found' }, { status: 404 });
  const kind = KINDS.includes(b.kind) ? b.kind : 'other';
  const r = db.prepare('INSERT INTO zones (event_id, name, kind) VALUES (?,?,?)').run(Number(b.eventId), name, kind);
  return Response.json({ ok: true, id: Number(r.lastInsertRowid) });
}
