import { isAdmin } from '@/lib/auth';
import { getEvents, getSnapshot } from '@/lib/data';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;
  const events = getEvents();
  return <AdminPanel events={events} initial={getSnapshot(events[0].id)} />;
}
