import fs from 'node:fs';
import path from 'node:path';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { LETTER_DIR } from '@/lib/manage';

const TYPES = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg' };

// Site owner only: view an organizer's permission letter
export async function GET(_req, { params }) {
  if (!(await isAdmin())) return Response.json({ error: 'Only the site owner can do this' }, { status: 403 });
  const { id } = await params;
  const o = db.prepare('SELECT letter_file FROM organizers WHERE id = ?').get(Number(id));
  if (!o?.letter_file) return Response.json({ error: 'No letter uploaded' }, { status: 404 });
  const file = path.join(LETTER_DIR, path.basename(o.letter_file));
  if (!fs.existsSync(file)) return Response.json({ error: 'File is missing' }, { status: 404 });
  const type = TYPES[path.extname(file).slice(1)] || 'application/octet-stream';
  return new Response(fs.readFileSync(file), { headers: { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' } });
}
