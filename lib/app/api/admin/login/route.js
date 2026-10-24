import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { adminPassword, makeToken, makeVolunteerToken, makeOrganizerToken, sha, verifyPassword, COOKIE, COOKIE_OPTIONS } from '@/lib/auth';

// body: { role: 'owner' | 'organizer' | 'volunteer', name, password }
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const role = body.role || (String(body.name || '').trim() ? 'volunteer' : 'owner');
  const name = String(body.name || '').trim();
  const c = await cookies();

  if (role === 'volunteer') {
    const v = name && db.prepare('SELECT * FROM volunteers WHERE lower(name) = lower(?)').get(name);
    if (!v || !verifyPassword(body.password, v.password_hash)) {
      const o = name && db.prepare('SELECT * FROM organizers WHERE lower(name) = lower(?)').get(name);
      if (o && verifyPassword(body.password, o.password_hash)) return Response.json({ error: 'These details belong to an organizer account. Go back and choose Organizer, then Sign in.' }, { status: 401 });
      return Response.json({ error: 'Wrong name or password' }, { status: 401 });
    }
    c.set(COOKIE, makeVolunteerToken(v.id), COOKIE_OPTIONS);
    return Response.json({ ok: true, role: 'volunteer' });
  }
  if (role === 'organizer') {
    const o = name && db.prepare('SELECT * FROM organizers WHERE lower(name) = lower(?)').get(name);
    if (!o || !verifyPassword(body.password, o.password_hash)) {
      const v = name && db.prepare('SELECT * FROM volunteers WHERE lower(name) = lower(?)').get(name);
      if (v && verifyPassword(body.password, v.password_hash)) return Response.json({ error: 'These details belong to a volunteer account. Go back and choose Volunteer.' }, { status: 401 });
      return Response.json({ error: 'Wrong name or password' }, { status: 401 });
    }
    if (o.status === 'rejected') return Response.json({ error: 'This account was not approved' }, { status: 403 });
    c.set(COOKIE, makeOrganizerToken(o.id), COOKIE_OPTIONS);
    return Response.json({ ok: true, role: 'organizer', status: o.status });
  }
  if (!crypto.timingSafeEqual(sha(body.password), sha(adminPassword()))) {
    return Response.json({ error: 'Wrong password' }, { status: 401 });
  }
  c.set(COOKIE, makeToken(), COOKIE_OPTIONS);
  return Response.json({ ok: true, role: 'admin' });
}
