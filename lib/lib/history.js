import { db } from './db';

// Remember parking counts over time so we can predict when a lot will fill up
export function recordParking(resourceId, value) {
  db.prepare('INSERT INTO history (resource_id, value, created_at) VALUES (?,?,?)').run(resourceId, value, new Date().toISOString());
  db.prepare('DELETE FROM history WHERE resource_id = ? AND id NOT IN (SELECT id FROM history WHERE resource_id = ? ORDER BY id DESC LIMIT 200)')
    .run(resourceId, resourceId);
}
