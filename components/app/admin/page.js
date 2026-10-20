import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getEventsFor, getSnapshot } from '@/lib/data';
import AdminPanel from '@/components/AdminPanel';
import VolunteerPanel from '@/components/VolunteerPanel';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/start');
  if (session.role === 'volunteer') {
    return <VolunteerPanel session={{ name: session.name, zoneId: session.zoneId }} initial={getSnapshot(session.eventId)} />;
  }
  const events = getEventsFor(session);
  if (events.length === 0) return <div className="card empty">There are no events yet. Ask the site owner.</div>;
  const account = session.role === 'organizer' ? { name: session.name, status: session.status } : { name: 'Site owner', status: 'approved' };
  return <AdminPanel events={events} initial={getSnapshot(events[0].id)} role={session.role} account={account} />;
}
