import { getSnapshot, isEventPublic } from '@/lib/data';
import { getSession, canManageEvent } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const { id } = await params;
  const eventId = Number(id);
  // Events of organizers who are not approved yet are visible only to their own team
  if (!isEventPublic(eventId)) {
    const s = await getSession();
    const mine = s && (canManageEvent(s, eventId) || (s.role === 'volunteer' && s.eventId === eventId));
    if (!mine) return Response.json({ error: 'Event not found' }, { status: 404 });
  }
  const snap = getSnapshot(eventId);
  if (!snap) return Response.json({ error: 'Event not found' }, { status: 404 });
  return Response.json(snap);
}
