import { db } from '@/lib/db';
import { guardEvent, hashPassword } from '@/lib/auth';

export async function GET(req) {
  const eventId = Number(new URL(req.url).searchParams.get('eventId') || 1);
  const g = await guardEvent(eventId); if (g.error) return g.error;
  const rows = db.prepare(`SELECT v.id, v.name, v.zone_id, z.name AS zone FROM volunteers v
    LEFT JOIN zones z ON z.id = v.zone_id WHERE v.event_id = ? ORDER BY v.id`).all(eventId);
  return Response.json(rows.map((r) => ({ ...r })));
}

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim().slice(0, 40);
  const password = String(b.password || '');
  const zone = db.prepare('SELECT * FROM zones WHERE id = ?').get(Number(b.zoneId));
  if (!name) return Response.json({ error: 'Volunteer name is required' }, { status: 400 });
  if (password.length < 4) return Response.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
  if (!zone) return Response.json({ error: 'Choose an area' }, { status: 400 });
  const g = await guardEvent(zone.event_id); if (g.error) return g.error;
  if (db.prepare('SELECT 1 FROM volunteers WHERE lower(name) = lower(?)').get(name))
    return Response.json({ error: 'That name is already used' }, { status: 400 });
  db.prepare('INSERT INTO volunteers (event_id, zone_id, name, password_hash) VALUES (?,?,?,?)')
    .run(zone.event_id, zone.id, name, hashPassword(password));
  return Response.json({ ok: true });
}
