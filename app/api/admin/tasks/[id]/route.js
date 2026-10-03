import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  db.prepare('UPDATE tasks_manual SET done = ? WHERE id = ?').run(b.done ? 1 : 0, Number(id));
  return Response.json({ ok: true });
}
export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { id } = await params;
  db.prepare('DELETE FROM tasks_manual WHERE id = ?').run(Number(id));
  return Response.json({ ok: true });
}
