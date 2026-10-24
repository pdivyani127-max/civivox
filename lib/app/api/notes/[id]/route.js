import { db } from '@/lib/db';
import { getSession, canManageEvent } from '@/lib/auth';

export async function DELETE(_req, { params }) {
  const s = await getSession();
  if (!s) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { id } = await params;
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(Number(id));
  if (!note) return Response.json({ ok: true });
  if (s.role === 'volunteer' && note.zone_id !== s.zoneId) return Response.json({ error: 'Not your area' }, { status: 403 });
  if (s.role !== 'volunteer' && !canManageEvent(s, note.event_id)) return Response.json({ error: 'You cannot manage this event' }, { status: 403 });
  db.prepare('DELETE FROM notes WHERE id = ?').run(note.id);
  return Response.json({ ok: true });
}
