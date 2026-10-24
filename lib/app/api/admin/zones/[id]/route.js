import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';
import { deleteZone } from '@/lib/manage';

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const z = db.prepare('SELECT event_id FROM zones WHERE id = ?').get(Number(id));
  if (!z) return Response.json({ ok: true });
  const g = await guardEvent(z.event_id); if (g.error) return g.error;
  deleteZone(Number(id));
  return Response.json({ ok: true });
}
