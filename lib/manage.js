import { db } from './db';

export function deleteResource(id) {
  db.prepare('DELETE FROM history WHERE resource_id = ?').run(id);
  db.prepare('DELETE FROM resources WHERE id = ?').run(id);
}
export function deleteZone(id) {
  db.prepare('SELECT id FROM resources WHERE zone_id = ?').all(id).forEach((r) => deleteResource(r.id));
  db.prepare('DELETE FROM readings WHERE zone_id = ?').run(id);
  db.prepare('DELETE FROM alerts WHERE zone_id = ?').run(id);
  db.prepare('DELETE FROM zones WHERE id = ?').run(id);
}
export function deleteEvent(id) {
  db.prepare('SELECT id FROM zones WHERE event_id = ?').all(id).forEach((z) => deleteZone(z.id));
  db.prepare('DELETE FROM broadcasts WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM alerts WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM tasks_manual WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}
