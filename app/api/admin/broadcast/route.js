import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';

export async function POST(req) {
  const { eventId, message } = await req.json().catch(() => ({}));
  if (!eventId) return Response.json({ error: 'Missing event' }, { status: 400 });
  const g = await guardEvent(eventId); if (g.error) return g.error;
  db.prepare('UPDATE broadcasts SET active = 0 WHERE event_id = ?').run(Number(eventId));
  const text = String(message ?? '').trim().slice(0, 200);
  if (text) {
    db.prepare('INSERT INTO broadcasts (event_id, message, created_at, active) VALUES (?,?,?,1)')
      .run(Number(eventId), text, new Date().toISOString());
  }
  return Response.json({ ok: true });
}
