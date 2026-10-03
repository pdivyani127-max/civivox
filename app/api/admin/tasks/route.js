import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

// Tasks that organizers write themselves
export async function GET(req) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const eventId = Number(new URL(req.url).searchParams.get('eventId') || 1);
  const rows = db.prepare('SELECT id, text, done, created_at FROM tasks_manual WHERE event_id = ? ORDER BY done, id').all(eventId);
  return Response.json(rows.map((r) => ({ ...r })));
}

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const text = String(b.text || '').trim().slice(0, 160);
  if (!text || !b.eventId) return Response.json({ error: 'Write the task first' }, { status: 400 });
  db.prepare('INSERT INTO tasks_manual (event_id, text, created_at) VALUES (?,?,?)').run(Number(b.eventId), text, new Date().toISOString());
  return Response.json({ ok: true });
}
