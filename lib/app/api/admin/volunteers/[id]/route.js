import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const v = db.prepare('SELECT event_id FROM volunteers WHERE id = ?').get(Number(id));
  if (!v) return Response.json({ ok: true });
  const g = await guardEvent(v.event_id); if (g.error) return g.error;
  db.prepare('DELETE FROM volunteers WHERE id = ?').run(Number(id));
  return Response.json({ ok: true });
}
