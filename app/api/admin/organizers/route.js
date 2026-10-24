import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Site owner only: list organizer accounts
export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Only the site owner can do this' }, { status: 403 });
  const rows = db.prepare(`SELECT o.id, o.name, o.status, o.demo_letter, o.letter_file, o.letter_name, o.created_at, o.all_events,
      (SELECT COUNT(*) FROM events e WHERE e.owner_id = o.id) AS events
    FROM organizers o ORDER BY o.id DESC`).all();
  return Response.json(rows.map((r) => ({
    id: r.id, name: r.name, status: r.status, demoLetter: !!r.demo_letter, hasLetter: !!r.letter_file,
    letterName: r.letter_name, created_at: r.created_at, events: r.events, allEvents: !!r.all_events,
  })));
}
