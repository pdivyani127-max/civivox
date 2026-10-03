import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim().slice(0, 80);
  if (!name) return Response.json({ error: 'Event name is required' }, { status: 400 });
  const r = db.prepare('INSERT INTO events (name, venue, date, description) VALUES (?,?,?,?)')
    .run(name, String(b.venue || '').slice(0, 80), String(b.date || '').slice(0, 20), String(b.description || '').slice(0, 200));
  return Response.json({ ok: true, id: Number(r.lastInsertRowid) });
}
