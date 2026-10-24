// Lists events and removes the ones that do NOT belong to any organizer account.
//   node remove-owner-events.mjs            -> only shows what it would delete
//   node remove-owner-events.mjs --delete   -> really deletes them
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'data', 'event.db');
if (!fs.existsSync(file)) { console.error('Cannot find', file, '- run this from the project folder (the one with package.json).'); process.exit(1); }
const db = new DatabaseSync(file);

const rows = db.prepare(`SELECT e.id, e.name, e.date, e.owner_id, o.name AS owner
  FROM events e LEFT JOIN organizers o ON o.id = e.owner_id ORDER BY e.id`).all();
console.log('\nEvents in the database:');
rows.forEach((r) => console.log(`  #${r.id}  ${r.name}  (${r.date})  ->  ${r.owner_id == null ? 'NO ACCOUNT (will be deleted)' : 'owned by ' + r.owner}`));

const doomed = rows.filter((r) => r.owner_id == null);
if (!process.argv.includes('--delete')) {
  console.log(`\nDry run only. ${doomed.length} event(s) would be deleted. Run again with --delete to do it.\n`);
  process.exit(0);
}
if (doomed.length === rows.length) { console.error('\nStopped: this would delete EVERY event. Nothing was changed.\n'); process.exit(1); }

const run = (sql, id) => db.prepare(sql).run(id);
db.exec('BEGIN');
for (const ev of doomed) {
  for (const z of db.prepare('SELECT id FROM zones WHERE event_id = ?').all(ev.id)) {
    for (const r of db.prepare('SELECT id FROM resources WHERE zone_id = ?').all(z.id)) {
      run('DELETE FROM history WHERE resource_id = ?', r.id);
      run('DELETE FROM resources WHERE id = ?', r.id);
    }
    run('DELETE FROM readings WHERE zone_id = ?', z.id);
    run('DELETE FROM alerts WHERE zone_id = ?', z.id);
    run('DELETE FROM volunteers WHERE zone_id = ?', z.id);
    run('DELETE FROM notes WHERE zone_id = ?', z.id);
    run('DELETE FROM zones WHERE id = ?', z.id);
  }
  for (const t of ['broadcasts', 'alerts', 'tasks_manual', 'volunteers', 'notes']) run(`DELETE FROM ${t} WHERE event_id = ?`, ev.id);
  run('DELETE FROM events WHERE id = ?', ev.id);
  console.log('deleted:', ev.name);
}
// keep the "already seeded" markers so the sample events do not come back when the site restarts
for (const k of ['cultural_night_seeded', 'sports_meet_seeded', 'garba_night_seeded'])
  db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(k, '1');
db.exec('COMMIT');
console.log('\nDone. Start the site again with npm run dev.\n');
