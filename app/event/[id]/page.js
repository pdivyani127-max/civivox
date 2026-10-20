import { notFound } from 'next/navigation';
import { getSnapshot, isEventPublic } from '@/lib/data';
import { getSession, canManageEvent } from '@/lib/auth';
import LiveStatus from '@/components/LiveStatus';
export const dynamic = 'force-dynamic';

export default async function EventPage({ params }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!isEventPublic(eventId)) {
    const s = await getSession();
    if (!s || !(canManageEvent(s, eventId) || (s.role === 'volunteer' && s.eventId === eventId))) notFound();
  }
  const snap = getSnapshot(eventId);
  if (!snap) notFound();
  return <LiveStatus eventId={snap.event.id} initial={snap} />;
}
