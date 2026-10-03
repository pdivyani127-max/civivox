import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data');
fs.mkdirSync(dir, { recursive: true });

const g = globalThis;
if (!g.__db) {
  const db = new DatabaseSync(path.join(dir, 'event.db'));
  db.exec(`
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
    CREATE TABLE IF NOT EXISTS broadcasts (
      id INTEGER PRIMARY KEY, event_id INTEGER, message TEXT, created_at TEXT, active INTEGER DEFAULT 1);
  `);
  seed(db);
  migrate(db);
  g.__db = db;
}
export const db = g.__db;

function seed(db) {
  const n = db.prepare('SELECT COUNT(*) AS c FROM events').get().c;
  if (n > 0) return;
  const now = new Date().toISOString();
  const ev = db.prepare('INSERT INTO events (name, venue, date, description) VALUES (?,?,?,?)');
  const e1 = Number(ev.run('Tech Fest 2026', 'Main Campus', '2026-10-15', 'Annual college tech fest with talks, demos and a food court.').lastInsertRowid);
  ev.run('Cultural Night', 'Open Air Theatre', '2026-10-20', 'Evening of music and dance performances.');

  const zone = db.prepare('INSERT INTO zones (event_id, name, kind) VALUES (?,?,?)');
  const z = (name, kind) => Number(zone.run(e1, name, kind).lastInsertRowid);
  const mainHall = z('Main Hall', 'hall'), hallB = z('Seminar Hall B', 'hall');
  const lotA = z('Parking Lot A', 'parking'), lotB = z('Parking Lot B', 'parking');
  const food = z('Food Court', 'food');

  const r = db.prepare(`INSERT INTO resources
    (event_id, zone_id, type, label, status, value, capacity, note, source, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const add = (zid, type, label, status, value, capacity, note = '', source = 'admin') =>
    Number(r.run(e1, zid, type, label, status, value, capacity, note, source, now).lastInsertRowid);

  add(mainHall, 'crowd', 'Main Hall crowd', 'yellow', null, null, 'Moderate activity');
  add(mainHall, 'power', 'Main Hall power', 'green', null, null, 'Normal');
  add(hallB, 'crowd', 'Seminar Hall B crowd', 'green', null, null, 'Low activity');
  const idA = add(lotA, 'parking', 'Lot A (govt. reserved)', 'yellow', 18, 120, 'Free slots');
  const idB = add(lotB, 'parking', 'Lot B', 'red', 2, 80, 'Almost full');
  // a little past data so the "will be full in X min" prediction has something to work with
  const hist = db.prepare('INSERT INTO history (resource_id, value, created_at) VALUES (?,?,?)');
  const ago = (m) => new Date(Date.now() - m * 60000).toISOString();
  [[40, 70], [25, 50], [10, 30], [0, 18]].forEach(([m, v]) => hist.run(idA, v, ago(m)));
  [[40, 30], [25, 18], [10, 8], [0, 2]].forEach(([m, v]) => hist.run(idB, v, ago(m)));
  add(food, 'waste', 'Bin 1 - Food Court', 'red', null, null, 'Full - needs emptying');
  add(food, 'waste', 'Bin 2 - Food Court', 'green', null, null, 'Empty');
  add(food, 'power', 'Food Court power', 'yellow', null, null, 'Running on backup generator');
  add(mainHall, 'devices', 'Crowd sensor (Arduino + LM393)', 'green', null, null, 'Online');
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
