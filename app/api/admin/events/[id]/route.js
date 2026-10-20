import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';
import { deleteEvent } from '@/lib/manage';

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const g = await guardEvent(id); if (g.error) return g.error;
  // Everyone keeps at least one event: organizers their own last event, the site owner the platform's last event
  const left = g.s.role === 'organizer'
    ? db.prepare('SELECT COUNT(*) AS c FROM events WHERE owner_id = ?').get(g.s.id).c
    : db.prepare('SELECT COUNT(*) AS c FROM events').get().c;
  if (left <= 1) return Response.json({ error: 'Keep at least one event' }, { status: 400 });
  deleteEvent(Number(id));
  return Response.json({ ok: true });
}
