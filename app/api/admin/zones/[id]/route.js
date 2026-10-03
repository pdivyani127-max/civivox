import { isAdmin } from '@/lib/auth';
import { deleteZone } from '@/lib/manage';

export async function DELETE(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const { id } = await params;
  deleteZone(Number(id));
  return Response.json({ ok: true });
}
