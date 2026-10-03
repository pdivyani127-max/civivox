import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { deleteEvent } from '@/lib/manage';

export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { id } = await params;
  if (db.prepare('SELECT COUNT(*) AS c FROM events').get().c <= 1)
    return Response.json({ error: 'Keep at least one event' }, { status: 400 });
  deleteEvent(Number(id));
  return Response.json({ ok: true });
}
