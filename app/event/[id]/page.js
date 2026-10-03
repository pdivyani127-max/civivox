import { notFound } from 'next/navigation';
import { getSnapshot } from '@/lib/data';
import LiveStatus from '@/components/LiveStatus';
export const dynamic = 'force-dynamic';

export default async function EventPage({ params }) {
  const { id } = await params;
  const snap = getSnapshot(Number(id));
  if (!snap) notFound();
  return <LiveStatus eventId={snap.event.id} initial={snap} />;
}
