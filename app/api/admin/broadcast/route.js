import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { eventId, message } = await req.json().catch(() => ({}));
  if (!eventId) return Response.json({ error: 'Missing event' }, { status: 400 });
  db.prepare('UPDATE broadcasts SET active = 0 WHERE event_id = ?').run(Number(eventId));
  const text = String(message ?? '').trim().slice(0, 200);
  if (text) {
    db.prepare('INSERT INTO broadcasts (event_id, message, created_at, active) VALUES (?,?,?,1)')
      .run(Number(eventId), text, new Date().toISOString());
  }
  return Response.json({ ok: true });
}
