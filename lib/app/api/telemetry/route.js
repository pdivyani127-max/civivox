import { db } from '@/lib/db';

// The Arduino bridge posts here. Protected by a shared key (change it in .env.local).
const LEVELS = {
  low: ['green', 'Low activity'],
  moderate: ['yellow', 'Moderate activity'],
  crowded: ['red', 'Crowded - very high noise'],
};

export async function POST(req) {
  if (req.headers.get('x-api-key') !== (process.env.TELEMETRY_KEY || 'sensor-demo-key')) {
    return Response.json({ error: 'Bad key' }, { status: 401 });
  }
  const b = await req.json().catch(() => ({}));
  const lv = LEVELS[b.level];
  if (!lv) return Response.json({ error: 'Unknown level' }, { status: 400 });

  const eventId = Number(b.eventId || 1);
  const zone = db.prepare('SELECT * FROM zones WHERE event_id = ? AND name = ?').get(eventId, String(b.zone || 'Main Hall'));
  if (!zone) return Response.json({ error: 'Zone not found' }, { status: 404 });

  const now = new Date().toISOString();
  const activity = Math.max(0, Math.min(100, Math.round(Number(b.activity) || 0)));
  db.prepare('INSERT INTO readings (zone_id, level, triggers, created_at) VALUES (?,?,?,?)').run(zone.id, b.level, activity, now);
  db.prepare('DELETE FROM readings WHERE zone_id = ? AND id NOT IN (SELECT id FROM readings WHERE zone_id = ? ORDER BY id DESC LIMIT 500)').run(zone.id, zone.id);

  const crowd = db.prepare("SELECT * FROM resources WHERE zone_id = ? AND type = 'crowd'").get(zone.id);
  if (crowd) {
    const trend = b.trend === 'rising' || b.trend === 'falling' ? ` (${b.trend})` : '';
    // Raise an alert when the zone newly becomes Crowded (max one per minute)
    if (b.level === 'crowded' && crowd.status !== 'red') {
      const recent = db.prepare('SELECT 1 FROM alerts WHERE zone_id = ? AND created_at > ?').get(zone.id, new Date(Date.now() - 60000).toISOString());
      if (!recent) {
        db.prepare('INSERT INTO alerts (event_id, zone_id, message, created_at) VALUES (?,?,?,?)')
          .run(eventId, zone.id, `${zone.name} is very noisy - possible overcrowding. Check the area.`, now);
      }
    }
    db.prepare('UPDATE resources SET status = ?, note = ?, source = ?, updated_at = ? WHERE id = ?')
      .run(lv[0], lv[1] + trend, 'sensor', now, crowd.id);
  }
  return Response.json({ ok: true });
}
