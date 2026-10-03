import { db } from './db';
import { isSensorCard, SENSOR_OFFLINE_AFTER_SECONDS } from './config';
import { predictEta } from './insights';

// node:sqlite returns special objects; convert to plain data so pages can pass them around
const plain = (x) => JSON.parse(JSON.stringify(x));

export function getEvents() {
  return plain(db.prepare('SELECT * FROM events ORDER BY date').all());
}

export function getSnapshot(eventId) {
  const event = plain(db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) || null);
  if (!event) return null;
  const zones = plain(db.prepare('SELECT * FROM zones WHERE event_id = ? ORDER BY id').all(eventId));
  const hist = db.prepare('SELECT value, created_at FROM history WHERE resource_id = ? AND created_at > ? ORDER BY id');
  const lastReading = db.prepare('SELECT level, triggers, created_at FROM readings WHERE zone_id = ? ORDER BY id DESC LIMIT 1');
  const resources = plain(db.prepare('SELECT * FROM resources WHERE event_id = ? ORDER BY id').all(eventId)).map((r) => {
    if (r.type === 'parking') {
      const pts = plain(hist.all(r.id, new Date(Date.now() - 45 * 60000).toISOString()));
      return { ...r, eta: predictEta(pts, r.value) };
    }
    if (!isSensorCard(r)) return r;
    // Sensor card is computed from real readings: Online if a reading arrived recently
    const lr = plain(lastReading.get(r.zone_id) || null);
    if (!lr) return null; // Arduino never connected: hide the card until the first reading arrives
    const fresh = lr && Date.now() - new Date(lr.created_at).getTime() < SENSOR_OFFLINE_AFTER_SECONDS * 1000;
    return {
      ...r, source: 'sensor', status: fresh ? 'green' : 'red',
      note: fresh ? `Online - sound activity ${lr.triggers}%` : 'Offline - no recent readings',
      updated_at: fresh ? lr.created_at : new Date().toISOString(),
    };
  }).filter(Boolean);
  const broadcast = plain(db.prepare(
    'SELECT message, created_at FROM broadcasts WHERE event_id = ? AND active = 1 ORDER BY id DESC LIMIT 1'
  ).get(eventId) || null);
  return {
    event,
    broadcast,
    serverTime: new Date().toISOString(),
    zones: zones.map(z => ({ ...z, resources: resources.filter(r => r.zone_id === z.id) })),
  };
}
