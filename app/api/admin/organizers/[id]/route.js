import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { deleteOrganizer } from '@/lib/manage';

// Approve / reject an organizer
export async function POST(req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Only the site owner can do this' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.allEvents === 'boolean') {
    db.prepare('UPDATE organizers SET all_events = ? WHERE id = ?').run(body.allEvents ? 1 : 0, Number(id));
    return Response.json({ ok: true });
  }
  const { status } = body;
  if (!['approved', 'pending', 'rejected'].includes(status)) return Response.json({ error: 'Unknown status' }, { status: 400 });
  db.prepare('UPDATE organizers SET status = ? WHERE id = ?').run(status, Number(id));
  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Only the site owner can do this' }, { status: 403 });
  const { id } = await params;
  deleteOrganizer(Number(id));
  return Response.json({ ok: true });
}
