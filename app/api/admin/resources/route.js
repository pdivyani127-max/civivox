import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { recordParking } from '@/lib/history';
import { parkingStatus } from '@/lib/insights';
import { RESOURCE_TYPES } from '@/lib/config';

const DEFAULT_NOTE = { crowd: 'Low activity', parking: 'Free slots', waste: 'Empty', power: 'Normal', devices: 'Online' };

// Create a new card (resource) inside an area
export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const zone = db.prepare('SELECT * FROM zones WHERE id = ?').get(Number(b.zoneId));
  if (!zone) return Response.json({ error: 'Area not found' }, { status: 404 });
  if (!RESOURCE_TYPES[b.type]) return Response.json({ error: 'Unknown card type' }, { status: 400 });
  const label = String(b.label || '').trim().slice(0, 60);
  if (!label) return Response.json({ error: 'Card name is required' }, { status: 400 });

  let value = null, capacity = null, status = 'green';
  if (b.type === 'parking') {
    capacity = Math.round(Number(b.capacity));
    if (!(capacity > 0)) return Response.json({ error: 'Enter the total number of parking slots' }, { status: 400 });
    value = Math.min(capacity, Math.max(0, Math.round(Number(b.value ?? capacity)) || 0));
    status = parkingStatus(value, capacity);
  }
  const r = db.prepare(`INSERT INTO resources (event_id, zone_id, type, label, status, value, capacity, note, source, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(zone.event_id, zone.id, b.type, label, status, value, capacity, DEFAULT_NOTE[b.type] || '', 'admin', new Date().toISOString());
  if (b.type === 'parking') recordParking(Number(r.lastInsertRowid), value);
  return Response.json({ ok: true, id: Number(r.lastInsertRowid) });
}
