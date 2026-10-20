import { db } from '@/lib/db';
import { guardEvent } from '@/lib/auth';

export async function GET(req) {
  const eventId = Number(new URL(req.url).searchParams.get('eventId') || 1);
  const g = await guardEvent(eventId); if (g.error) return g.error;
  const rows = db.prepare(`SELECT a.id, a.message, a.created_at, a.acknowledged, z.name AS zone
    FROM alerts a LEFT JOIN zones z ON z.id = a.zone_id WHERE a.event_id = ? ORDER BY a.id DESC LIMIT 10`).all(eventId);
  return Response.json(rows.map((r) => ({ ...r })));
}

export async function POST(req) {
  const { eventId } = await req.json().catch(() => ({}));
  const g = await guardEvent(eventId); if (g.error) return g.error;
  db.prepare('UPDATE alerts SET acknowledged = 1 WHERE event_id = ?').run(Number(eventId || 1));
  return Response.json({ ok: true });
}
