import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data');
fs.mkdirSync(dir, { recursive: true });

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY, name TEXT, venue TEXT, date TEXT, description TEXT);
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY, event_id INTEGER, name TEXT, kind TEXT);
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY, event_id INTEGER, zone_id INTEGER,
      type TEXT, label TEXT, status TEXT DEFAULT 'green',
      value INTEGER, capacity INTEGER, note TEXT,
      source TEXT DEFAULT 'admin', updated_at TEXT);
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY, zone_id INTEGER, level TEXT, triggers INTEGER, created_at TEXT);
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY, event_id INTEGER, zone_id INTEGER, message TEXT,
      created_at TEXT, acknowledged INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY, resource_id INTEGER, value INTEGER, created_at TEXT);
    CREATE TABLE IF NOT EXISTS tasks_manual (
      id INTEGER PRIMARY KEY, event_id INTEGER, text TEXT, done INTEGER DEFAULT 0, created_at TEXT);
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY, event_id INTEGER, zone_id INTEGER, name TEXT, password_hash TEXT);
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY, event_id INTEGER, zone_id INTEGER, author TEXT, text TEXT, for_visitors INTEGER DEFAULT 0, created_at TEXT);
    CREATE TABLE IF NOT EXISTS organizers (
      id INTEGER PRIMARY KEY, name TEXT, password_hash TEXT, letter_file TEXT, letter_name TEXT,
      demo_letter INTEGER DEFAULT 0, status TEXT DEFAULT 'approved', created_at TEXT);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS broadcasts (
      id INTEGER PRIMARY KEY, event_id INTEGER, message TEXT, created_at TEXT, active INTEGER DEFAULT 1);
  `;

const g = globalThis;
if (!g.__db) g.__db = new DatabaseSync(path.join(dir, 'event.db'));
export const db = g.__db;
// Run every time this file loads, so new tables appear even if the site was not fully restarted
db.exec(SCHEMA);
// Events can belong to an organizer (owner_id). Older databases get the new column automatically.
if (!db.prepare('PRAGMA table_info(events)').all().some((c) => c.name === 'owner_id')) {
  db.exec('ALTER TABLE events ADD COLUMN owner_id INTEGER');
}
// A trusted organizer can be allowed (by the site owner) to manage every event, not only their own
if (!db.prepare('PRAGMA table_info(organizers)').all().some((c) => c.name === 'all_events')) {
  db.exec('ALTER TABLE organizers ADD COLUMN all_events INTEGER DEFAULT 0');
}

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM events').get().c > 0) return;
  for (const key of ['tech', 'cultural', 'sports', 'garba']) {
    const t = TEMPLATES[key];
    t.fill(db, newEvent(db, t));
  }
  ['cultural_night_seeded', 'sports_meet_seeded', 'garba_night_seeded'].forEach((k) =>
    db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(k, '1'));
}

// Upgrades an older database: removes the confusing 'Gate 1' card and adds the sensor card to Main Hall
function migrate(db) {
  const gate = db.prepare("SELECT id FROM zones WHERE name = 'Gate 1'").get();
  if (!gate) return;
  db.prepare('DELETE FROM resources WHERE zone_id = ?').run(gate.id);
  db.prepare('DELETE FROM zones WHERE id = ?').run(gate.id);
  const mh = db.prepare("SELECT id, event_id FROM zones WHERE name = 'Main Hall'").get();
  if (mh && !db.prepare("SELECT 1 FROM resources WHERE zone_id = ? AND type = 'devices'").get(mh.id)) {
    db.prepare(`INSERT INTO resources (event_id, zone_id, type, label, status, note, source, updated_at)
      VALUES (?,?,?,?,?,?,?,?)`).run(mh.event_id, mh.id, 'devices', 'Crowd sensor (Arduino + LM393)', 'green', 'Online', 'admin', new Date().toISOString());
  }
}

// Wipes everything and reloads the sample event data (used by the admin "Reset to sample data" button)
export function resetDemo() {
  ['events', 'zones', 'resources', 'readings', 'alerts', 'history', 'broadcasts', 'tasks_manual', 'volunteers', 'organizers', 'notes', 'meta'].forEach((t) => db.exec(`DELETE FROM ${t}`));
  seed(db);
}

// ================= Sample data =================
// Each "fill" function adds ready-made areas, cards and parking history to an event. Areas the event already has
// (same name) are left alone, so it is safe to use on an event that is partly set up.
function filler(db, ev) {
  const have = new Set(db.prepare('SELECT name FROM zones WHERE event_id = ?').all(ev).map((r) => r.name));
  const zone = db.prepare('INSERT INTO zones (event_id, name, kind) VALUES (?,?,?)');
  const res = db.prepare(`INSERT INTO resources
    (event_id, zone_id, type, label, status, value, capacity, note, source, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const hist = db.prepare('INSERT INTO history (resource_id, value, created_at) VALUES (?,?,?)');
  const now = new Date().toISOString();
  const ago = (m) => new Date(Date.now() - m * 60000).toISOString();
  let areas = 0;
  return {
    z: (name, kind) => { if (have.has(name)) return null; areas++; return Number(zone.run(ev, name, kind).lastInsertRowid); },
    add: (zid, type, label, status, value, capacity, note = '') =>
      zid == null ? null : Number(res.run(ev, zid, type, label, status, value, capacity, note, 'admin', now).lastInsertRowid),
    // a little past data so the "will be full in X min" prediction has something to work with
    history: (rid, points) => { if (rid != null) points.forEach(([m, v]) => hist.run(rid, v, ago(m))); },
    count: () => areas,
  };
}

function fillTechFest(db, ev) {
  const { z, add, history, count } = filler(db, ev);
  const mainHall = z('Main Hall', 'hall'), hallB = z('Seminar Hall B', 'hall'), lotA = z('Parking Lot A', 'parking');
  const lotB = z('Parking Lot B', 'parking'), food = z('Food Court', 'food');
  add(mainHall, 'crowd', 'Main Hall crowd', 'yellow', null, null, 'Moderate activity');
  add(mainHall, 'power', 'Main Hall power', 'green', null, null, 'Normal');
  add(hallB, 'crowd', 'Seminar Hall B crowd', 'green', null, null, 'Low activity');
  const a = add(lotA, 'parking', 'Lot A (govt. reserved)', 'yellow', 18, 120, 'Free slots');
  const b = add(lotB, 'parking', 'Lot B', 'red', 2, 80, 'Almost full');
  history(a, [[40, 70], [25, 50], [10, 30], [0, 18]]);
  history(b, [[40, 30], [25, 18], [10, 8], [0, 2]]);
  add(food, 'waste', 'Bin 1 - Food Court', 'red', null, null, 'Full - needs emptying');
  add(food, 'waste', 'Bin 2 - Food Court', 'green', null, null, 'Empty');
  add(food, 'power', 'Food Court power', 'yellow', null, null, 'Running on backup generator');
  add(mainHall, 'devices', 'Crowd sensor (Arduino + LM393)', 'green', null, null, 'Online');
  return count();
}

function fillCulturalNight(db, ev) {
  const { z, add, history, count } = filler(db, ev);
  const theatre = z('Open Air Theatre', 'hall'), gate = z('Main Gate Parking', 'parking'), overflow = z('Overflow Parking', 'parking');
  const stalls = z('Food Stalls', 'food'), back = z('Backstage', 'other');
  add(theatre, 'crowd', 'Theatre crowd', 'yellow', null, null, 'Moderate activity');
  add(theatre, 'power', 'Stage lighting power', 'green', null, null, 'Normal');
  const g1 = add(gate, 'parking', 'Main Gate Lot', 'green', 62, 150, 'Free slots');
  const g2 = add(overflow, 'parking', 'Overflow Lot', 'yellow', 20, 80, 'Filling up');
  add(stalls, 'waste', 'Bin 1 - Food Stalls', 'yellow', null, null, 'Half full');
  add(stalls, 'waste', 'Bin 2 - Food Stalls', 'green', null, null, 'Empty');
  add(stalls, 'power', 'Stalls power', 'green', null, null, 'Normal');
  add(back, 'power', 'Backstage power', 'green', null, null, 'Normal');
  add(back, 'devices', 'Stage CCTV camera', 'green', null, null, 'Online');
  history(g1, [[40, 110], [25, 92], [10, 76], [0, 62]]);
  history(g2, [[40, 56], [25, 42], [10, 30], [0, 20]]);
  return count();
}

function fillSportsMeet(db, ev) {
  const { z, add, history, count } = filler(db, ev);
  const stadium = z('Main Stadium', 'hall'), arena = z('Indoor Arena', 'hall'), north = z('North Gate Parking', 'parking');
  const east = z('East Gate Parking', 'parking'), refresh = z('Refreshment Zone', 'food'), control = z('Control Room', 'other');
  add(stadium, 'crowd', 'Stands crowd', 'red', null, null, 'Crowded');
  add(stadium, 'power', 'Floodlight power', 'green', null, null, 'Normal');
  add(arena, 'crowd', 'Arena crowd', 'green', null, null, 'Low activity');
  add(arena, 'power', 'Arena power', 'yellow', null, null, 'Running on backup generator');
  const n1 = add(north, 'parking', 'North Lot', 'yellow', 40, 200, 'Filling up');
  const e1 = add(east, 'parking', 'East Lot', 'green', 105, 180, 'Free slots');
  add(refresh, 'waste', 'Bin 1 - Refreshments', 'red', null, null, 'Full - needs emptying');
  add(refresh, 'waste', 'Bin 2 - Refreshments', 'green', null, null, 'Empty');
  add(refresh, 'power', 'Refreshment power', 'green', null, null, 'Normal');
  add(control, 'power', 'Control room power', 'green', null, null, 'Normal');
  add(control, 'devices', 'Gate CCTV camera', 'green', null, null, 'Online');
  history(n1, [[40, 120], [25, 96], [10, 68], [0, 40]]);
  history(e1, [[40, 150], [25, 135], [10, 120], [0, 105]]);
  return count();
}

function fillGarbaNight(db, ev) {
  const { z, add, history, count } = filler(db, ev);
  const ground = z('Main Garba Ground', 'hall'), lawn = z('Dandiya Lawn', 'hall'), lot1 = z('Ground Parking', 'parking');
  const lot2 = z('Gate 2 Parking', 'parking'), stalls = z('Chai & Food Stalls', 'food'), stage = z('Stage & Sound', 'other');
  add(ground, 'crowd', 'Dance circle crowd', 'red', null, null, 'Crowded');
  add(ground, 'power', 'Ground lighting power', 'green', null, null, 'Normal');
  add(lawn, 'crowd', 'Lawn crowd', 'green', null, null, 'Low activity');
  add(lawn, 'power', 'Lawn lights', 'green', null, null, 'Normal');
  const p1 = add(lot1, 'parking', 'Ground Lot', 'yellow', 36, 300, 'Filling up');
  const p2 = add(lot2, 'parking', 'Gate 2 Lot', 'green', 74, 120, 'Free slots');
  add(stalls, 'waste', 'Bin 1 - Chai Stall', 'yellow', null, null, 'Half full');
  add(stalls, 'waste', 'Bin 2 - Food Stalls', 'red', null, null, 'Full - needs emptying');
  add(stalls, 'power', 'Stalls power', 'green', null, null, 'Normal');
  add(stage, 'power', 'Sound system power', 'yellow', null, null, 'Running on backup generator');
  add(stage, 'devices', 'Stage CCTV camera', 'green', null, null, 'Online');
  history(p1, [[40, 150], [25, 110], [10, 72], [0, 36]]);
  history(p2, [[40, 100], [25, 92], [10, 83], [0, 74]]);
  return count();
}

const TEMPLATES = {
  tech: { name: 'Tech Fest 2026', venue: 'Main Campus', date: '2026-10-15', description: 'Annual college tech fest with talks, demos and a food court.', fill: fillTechFest },
  cultural: { name: 'Cultural Night', venue: 'Open Air Theatre', date: '2026-10-20', description: 'Evening of music and dance performances.', fill: fillCulturalNight },
  sports: { name: 'Annual Sports Meet', venue: 'City Stadium', date: '2026-10-27', description: 'Inter-college athletics finals with big stands, food stalls and a large parking area.', fill: fillSportsMeet },
  garba: { name: 'Garba Night', venue: 'Community Ground', date: '2026-10-24', description: 'Open-ground garba and dandiya night with live music, food stalls and a big parking area.', fill: fillGarbaNight },
};
export const SAMPLE_TEMPLATES = Object.fromEntries(Object.entries(TEMPLATES).map(([k, t]) => [k, t.name]));

const newEvent = (db, t) => Number(db.prepare('INSERT INTO events (name, venue, date, description) VALUES (?,?,?,?)').run(t.name, t.venue, t.date, t.description).lastInsertRowid);

// Used by the "Load sample data" button: returns how many areas were added (null = unknown template)
export function fillSample(template, eventId) {
  const t = TEMPLATES[template];
  return t ? t.fill(db, eventId) : null;
}

// Older databases: add the extra sample events once. They are never added again, even if the owner deletes them on purpose.
const mark = (db, key) => db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(key, '1');
function migrateCulturalNight(db) {
  if (db.prepare("SELECT 1 FROM meta WHERE key = 'cultural_night_seeded'").get()) return;
  const ev = db.prepare("SELECT id FROM events WHERE name = 'Cultural Night' AND owner_id IS NULL ORDER BY id LIMIT 1").get();
  if (ev && db.prepare('SELECT COUNT(*) AS c FROM zones WHERE event_id = ?').get(ev.id).c === 0) fillCulturalNight(db, ev.id);
  mark(db, 'cultural_night_seeded');
}
function migrateExtra(db, key, template) {
  if (db.prepare('SELECT 1 FROM meta WHERE key = ?').get(key)) return;
  const t = TEMPLATES[template];
  if (!db.prepare('SELECT 1 FROM events WHERE name = ?').get(t.name)) t.fill(db, newEvent(db, t));
  mark(db, key);
}
function migrateSportsMeet(db) { migrateExtra(db, 'sports_meet_seeded', 'sports'); }
function migrateGarbaNight(db) { migrateExtra(db, 'garba_night_seeded', 'garba'); }

// Start-up: create the sample events on a new database, upgrade an old one. (Kept at the very end so everything above is ready.)
if (!g.__seeded) {
  seed(db);
  migrate(db);
  migrateCulturalNight(db);
  migrateSportsMeet(db);
  migrateGarbaNight(db);
  g.__seeded = true;
}
