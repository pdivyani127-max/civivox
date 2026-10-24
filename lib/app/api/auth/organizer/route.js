import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, makeOrganizerToken, COOKIE, COOKIE_OPTIONS } from '@/lib/auth';
import { LETTER_DIR } from '@/lib/manage';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const demoMode = () => process.env.DEMO_MODE !== '0';             // default ON: a sample letter is allowed
const needApproval = () => process.env.REQUIRE_APPROVAL === '1';  // default OFF: accounts are approved at once

// Look at the first bytes of the file, not its name, to decide what it really is
function sniff(buf) {
  if (buf.subarray(0, 4).toString('latin1') === '%PDF') return 'pdf';
  if (buf[0] === 0x89 && buf.subarray(1, 4).toString('latin1') === 'PNG') return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  return null;
}
const fail = (error, status = 400) => Response.json({ error }, { status });

// Organizer sign-up: name, password, first event, permission letter (multipart form)
export async function POST(req) {
  const fd = await req.formData().catch(() => null);
  if (!fd) return fail('Could not read the form');
  const name = String(fd.get('name') || '').trim().slice(0, 40);
  const password = String(fd.get('password') || '');
  const eventName = String(fd.get('eventName') || '').trim().slice(0, 80);
  const venue = String(fd.get('venue') || '').trim().slice(0, 80);
  if (name.length < 2) return fail('Enter your name (at least 2 letters)');
  if (password.length < 6) return fail('Password must be at least 6 characters');
  if (!eventName) return fail('Enter the event name');
  if (db.prepare('SELECT 1 FROM organizers WHERE lower(name) = lower(?)').get(name)) return fail('That organizer name is already used');

  const file = fd.get('letter');
  let letterFile = null, letterName = null, demoLetter = 0;
  if (file && typeof file === 'object' && file.size > 0) {
    if (file.size > MAX_BYTES) return fail('The letter must be smaller than 2 MB');
    const buf = Buffer.from(await file.arrayBuffer());
    const kind = sniff(buf);
    if (!kind) return fail('The letter must be a PDF, PNG or JPG file');
    fs.mkdirSync(LETTER_DIR, { recursive: true });
    letterFile = `${crypto.randomBytes(16).toString('hex')}.${kind}`;
    fs.writeFileSync(path.join(LETTER_DIR, letterFile), buf);
    letterName = String(file.name || 'letter').slice(0, 80);
  } else if (fd.get('demoLetter') === '1' && demoMode()) {
    demoLetter = 1; // demo: the sample letter is used and nothing is uploaded
  } else {
    return fail('Please upload your permission letter');
  }

  const status = needApproval() ? 'pending' : 'approved';
  const now = new Date().toISOString();
  const org = db.prepare(`INSERT INTO organizers (name, password_hash, letter_file, letter_name, demo_letter, status, created_at)
    VALUES (?,?,?,?,?,?,?)`).run(name, hashPassword(password), letterFile, letterName, demoLetter, status, now);
  const orgId = Number(org.lastInsertRowid);
  db.prepare('INSERT INTO events (name, venue, date, description, owner_id) VALUES (?,?,?,?,?)')
    .run(eventName, venue, now.slice(0, 10), '', orgId);

  (await cookies()).set(COOKIE, makeOrganizerToken(orgId), COOKIE_OPTIONS);
  return Response.json({ ok: true, status });
}
