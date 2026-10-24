import { db } from '@/lib/db';
import { getSession, isManager } from '@/lib/auth';
import { getEventsFor } from '@/lib/data';

export const dynamic = 'force-dynamic';

// The events this person can manage (site owner: all, organizer: their own)
export async function GET() {
  const s = await getSession();
  if (!isManager(s)) return Response.json({ error: 'Not logged in' }, { status: 401 });
  return Response.json(getEventsFor(s));
}

export async function POST(req) {
  const s = await getSession();
  if (!isManager(s)) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim().slice(0, 80);
  if (!name) return Response.json({ error: 'Event name is required' }, { status: 400 });
  const owner = s.role === 'organizer' ? s.id : null;
  const r = db.prepare('INSERT INTO events (name, venue, date, description, owner_id) VALUES (?,?,?,?,?)')
    .run(name, String(b.venue || '').slice(0, 80), String(b.date || '').slice(0, 20), String(b.description || '').slice(0, 200), owner);
  return Response.json({ ok: true, id: Number(r.lastInsertRowid) });
}
