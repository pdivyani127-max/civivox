import { db } from './db';

export function deleteResource(id) {
  db.prepare('DELETE FROM history WHERE resource_id = ?').run(id);
  db.prepare('DELETE FROM resources WHERE id = ?').run(id);
}
export function deleteZone(id) {
  db.prepare('SELECT id FROM resources WHERE zone_id = ?').all(id).forEach((r) => deleteResource(r.id));
  db.prepare('DELETE FROM readings WHERE zone_id = ?').run(id);
  db.prepare('DELETE FROM alerts WHERE zone_id = ?').run(id);
  db.prepare('DELETE FROM volunteers WHERE zone_id = ?').run(id);
  db.prepare('DELETE FROM notes WHERE zone_id = ?').run(id);
  db.prepare('DELETE FROM zones WHERE id = ?').run(id);
}
export function deleteEvent(id) {
  db.prepare('SELECT id FROM zones WHERE event_id = ?').all(id).forEach((z) => deleteZone(z.id));
  db.prepare('DELETE FROM broadcasts WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM alerts WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM tasks_manual WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM volunteers WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM notes WHERE event_id = ?').run(id);
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

// Removes an organizer account together with their events and uploaded letter
import fs from 'node:fs';
import path from 'node:path';
export const LETTER_DIR = path.join(process.cwd(), 'data', 'letters');
export function deleteOrganizer(id) {
  db.prepare('SELECT id FROM events WHERE owner_id = ?').all(id).forEach((e) => deleteEvent(e.id));
  const o = db.prepare('SELECT letter_file FROM organizers WHERE id = ?').get(id);
  if (o?.letter_file) fs.rmSync(path.join(LETTER_DIR, path.basename(o.letter_file)), { force: true });
  db.prepare('DELETE FROM organizers WHERE id = ?').run(id);
}
export function clearLetters() { fs.rmSync(LETTER_DIR, { recursive: true, force: true }); }
