import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { adminPassword, makeToken, sha } from '@/lib/auth';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (!crypto.timingSafeEqual(sha(body.password), sha(adminPassword()))) {
    return Response.json({ error: 'Wrong password' }, { status: 401 });
  }
  const c = await cookies();
  c.set('admin_session', makeToken(), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
  return Response.json({ ok: true });
}
