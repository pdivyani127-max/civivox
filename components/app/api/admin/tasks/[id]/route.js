import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';

export async function POST(req, { params }) {
  const { id } = await params;
  const t = db.prepare('SELECT event_id FROM tasks_manual WHERE id = ?').get(Number(id));
  if (!t) return Response.json({ ok: true });
  const g = await guardEvent(t.event_id); if (g.error) return g.error;
  const b = await req.json().catch(() => ({}));
  db.prepare('UPDATE tasks_manual SET done = ? WHERE id = ?').run(b.done ? 1 : 0, Number(id));
  return Response.json({ ok: true });
}
export async function DELETE(_req, { params }) {
  const { id } = await params;
  const t = db.prepare('SELECT event_id FROM tasks_manual WHERE id = ?').get(Number(id));
  if (!t) return Response.json({ ok: true });
  const g = await guardEvent(t.event_id); if (g.error) return g.error;
  db.prepare('DELETE FROM tasks_manual WHERE id = ?').run(Number(id));
  return Response.json({ ok: true });
}
