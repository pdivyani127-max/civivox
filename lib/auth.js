import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';

// Change these by creating a file called .env.local  (see README)
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
export const adminPassword = () => process.env.ADMIN_PASSWORD || 'admin123';

const hmac = (s) => crypto.createHmac('sha256', SECRET).update(s).digest('hex');
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
export const makeToken = () => hmac('admin');
export const makeVolunteerToken = (id) => `v.${id}.${hmac('vol:' + id)}`;
export const makeOrganizerToken = (id) => `o.${id}.${hmac('org:' + id)}`;
export const sha = (s) => crypto.createHash('sha256').update(String(s ?? '')).digest();

export const COOKIE = 'admin_session';
export const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 };

// Who is logged in?
//   { role: 'admin' }                                  the site owner (master password)
//   { role: 'organizer', id, name, status }            an organizer who signed up
//   { role: 'volunteer', id, name, zoneId, eventId }   a volunteer added by an organizer
//   null                                               nobody
export async function getSession() {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  if (same(t, hmac('admin'))) return { role: 'admin' };
  let m = /^v\.(\d+)\.([0-9a-f]+)$/.exec(t);
  if (m && same(m[2], hmac('vol:' + m[1]))) {
    const v = db.prepare('SELECT id, name, zone_id, event_id FROM volunteers WHERE id = ?').get(Number(m[1]));
    if (v) return { role: 'volunteer', id: v.id, name: v.name, zoneId: v.zone_id, eventId: v.event_id };
  }
  m = /^o\.(\d+)\.([0-9a-f]+)$/.exec(t);
  if (m && same(m[2], hmac('org:' + m[1]))) {
    const o = db.prepare('SELECT id, name, status FROM organizers WHERE id = ?').get(Number(m[1]));
    if (o && o.status !== 'rejected') return { role: 'organizer', id: o.id, name: o.name, status: o.status };
  }
  return null;
}

// "Site owner" = the master admin password. Only the site owner may do platform-wide things.
export async function isAdmin() { return (await getSession())?.role === 'admin'; }
export const isManager = (s) => !!s && (s.role === 'admin' || s.role === 'organizer');

// Can this person manage this event? Site owner: all events. Organizer: only events they own.
export function canManageEvent(s, eventId) {
  if (!s) return false;
  if (s.role === 'admin') return true;
  if (s.role !== 'organizer') return false;
  const e = db.prepare('SELECT owner_id FROM events WHERE id = ?').get(Number(eventId));
  return !!e && e.owner_id === s.id;
}

// One-line permission check for routes. Usage:  const g = await guardEvent(eventId); if (g.error) return g.error;
export async function guardEvent(eventId) {
  const s = await getSession();
  if (!s) return { error: Response.json({ error: 'Not logged in' }, { status: 401 }) };
  if (!canManageEvent(s, eventId)) return { error: Response.json({ error: 'You cannot manage this event' }, { status: 403 }) };
  return { s };
}

// Volunteer / organizer passwords are stored as a salted hash, never as plain text
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(String(pw), salt, 32).toString('hex')}`;
}
export function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  return same(crypto.scryptSync(String(pw ?? ''), salt, 32).toString('hex'), hash);
}
