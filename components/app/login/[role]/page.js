import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
export const dynamic = 'force-dynamic';

export default async function LoginPage({ params }) {
  const { role } = await params;
  if (!['volunteer', 'organizer', 'owner'].includes(role)) notFound();
  if (await getSession()) redirect('/admin');
  return <LoginForm role={role} demoMode={process.env.DEMO_MODE !== '0'} />;
}
