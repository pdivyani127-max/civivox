import { isAdmin } from '@/lib/auth';
import { resetDemo } from '@/lib/db';
import { clearLetters } from '@/lib/manage';

// Site owner only: wipes everything (including organizer accounts) and reloads the sample event
export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: 'Only the site owner can do this' }, { status: 403 });
  resetDemo();
  clearLetters();
  return Response.json({ ok: true });
}
