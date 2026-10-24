import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';
import { Person, Bin, PhoneQR, Cloud } from '@/components/art';
export const dynamic = 'force-dynamic';

const ROLES = [
  { href: '/login/volunteer', art: <><Person className="ra" shirt="#e8b83a" /><Bin className="rb" body="#8fb3d1" /></>, title: 'Volunteer', text: 'Update your own area. Your organizer gives you a name and password.', tag: 'Name + password' },
  { href: '/login/organizer', art: <PhoneQR className="rq" />, title: 'Organizer', text: 'Run your event: areas, volunteers, broadcasts and alerts. Sign in or create an account.', tag: 'Account + permission letter' },
];

export default async function Home() {
  const session = await getSession();
  return (
    <div className="roles-page">
      <Cloud className="rp-cloud" />
      <h1>Welcome to {SITE_NAME}</h1>
      <p className="muted lead">{SITE_TAGLINE}</p>
      <h2 className="roles-title">Choose your role</h2>
      <div className="roles">
        {ROLES.map(r => (
          <Link key={r.href} href={r.href} className="card role">
            <div className="role-art">{r.art}</div>
            <h3>{r.title}</h3>
            <p>{r.text}</p>
            <span className="pill">{r.tag}</span>
          </Link>
        ))}
      </div>
      {session && <p className="muted tiny center">You are signed in. <Link href="/admin">Go to your dashboard →</Link></p>}
    </div>
  );
}
