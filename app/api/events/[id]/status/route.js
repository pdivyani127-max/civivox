import { getSnapshot } from '@/lib/data';
export const dynamic = 'force-dynamic';
export async function GET(_req, { params }) {
  const { id } = await params;
  const snap = getSnapshot(Number(id));
  if (!snap) return Response.json({ error: 'Event not found' }, { status: 404 });
  return Response.json(snap);
}
