import crypto from 'node:crypto';
import { cookies } from 'next/headers';

// Change these by creating a file called .env.local  (see README)
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
export const adminPassword = () => process.env.ADMIN_PASSWORD || 'admin123';

const token = () => crypto.createHmac('sha256', SECRET).update('admin').digest('hex');
export const makeToken = token;
export const sha = (s) => crypto.createHash('sha256').update(String(s ?? '')).digest();

export async function isAdmin() {
  const c = await cookies();
  const t = c.get('admin_session')?.value;
  if (!t) return false;
  const expected = token();
  return t.length === expected.length && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(expected));
}
