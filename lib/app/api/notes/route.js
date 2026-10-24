import { db } from '@/lib/db';
import { getSession, canManageEvent } from '@/lib/auth';

// Admin sees every volunteer note for the event; a volunteer sees only their own area's notes.
export async function GET(req) {
  const s = await getSession();
  if (!s) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const eventId = Number(new URL(req.url).searchParams.get('eventId') || 1);
  const cols = `SELECT n.id, n.author, n.text, n.for_visitors, n.created_at, n.zone_id, z.name AS zone
    FROM notes n LEFT JOIN zones z ON z.id = n.zone_id`;
  if (s.role !== 'volunteer' && !canManageEvent(s, eventId)) return Response.json({ error: 'You cannot manage this event' }, { status: 403 });
  const rows = s.role !== 'volunteer'
    ? db.prepare(`${cols} WHERE n.event_id = ? ORDER BY n.id DESC LIMIT 50`).all(eventId)
    : db.prepare(`${cols} WHERE n.zone_id = ? ORDER BY n.id DESC LIMIT 50`).all(s.zoneId);
  return Response.json(rows.map((r) => ({ ...r })));
}

// Volunteers write a note: goes to the organizer, and optionally also shows to visitors under their area
export async function POST(req) {
  const s = await getSession();
  if (!s) return Response.json({ error: 'Not logged in' }, { status: 401 });
  if (s.role !== 'volunteer') return Response.json({ error: 'Only volunteers write notes' }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const text = String(b.text || '').trim().slice(0, 200);
  if (!text) return Response.json({ error: 'Write something first' }, { status: 400 });
  db.prepare('INSERT INTO notes (event_id, zone_id, author, text, for_visitors, created_at) VALUES (?,?,?,?,?,?)')
    .run(s.eventId, s.zoneId, s.name, text, b.forVisitors ? 1 : 0, new Date().toISOString());
  return Response.json({ ok: true });
}
