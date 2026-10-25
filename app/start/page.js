import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';
import { Person, Bin, PhoneQR } from '@/components/art';
import { Sparkle, Orbit } from '@/components/Deco';
export const dynamic = 'force-dynamic';

const ROLES = [
  {
    href: '/login/volunteer', title: 'Volunteer', bg: '#f3dfa8',
    art: <>
      <Person style={{ position: 'absolute', left: '24%', bottom: '14%', width: '25%' }} shirt="#e8b83a" />
      <Bin className="w-bobs" style={{ position: 'absolute', right: '20%', bottom: '14%', width: '30%' }} body="#8fb3d1" />
    </>,
  },
  {
    href: '/login/organizer', title: 'Organizer', bg: '#f3d3d3',
    art: <PhoneQR className="w-bobs" style={{ position: 'absolute', left: '32%', top: '13%', width: '36%', height: 'auto' }} />,
  },
];

export default async function Home() {
  const session = await getSession();
  return (
    <section className="r-page bleed">
      <div className="r-orb"><Orbit /></div>
      <Sparkle className="s1" /><Sparkle className="s2" /><Sparkle className="s3" />
      <div className="r-in">
        <p className="eyebrow w-rise" style={{ '--i': 0 }}>Sign in to {SITE_NAME}</p>
        <h1 className="w-h1 r-h1">
          <span className="w-line"><span style={{ '--i': 1 }}>Welcome to</span></span>
          <span className="w-line"><span style={{ '--i': 2 }}><em>{SITE_NAME}</em></span></span>
        </h1>
        <p className="w-lead r-lead w-rise" style={{ '--i': 3 }}>{SITE_TAGLINE}</p>
        <h2 className="r-title w-rise" style={{ '--i': 4 }}>Choose your role</h2>
        <div className="r-cards">
          {ROLES.map((r, i) => (
            <Link key={r.href} href={r.href} className="r-card" style={{ '--bg': r.bg, '--i': i }}>
              <div className="r-disc"><i className="w-ring" /><div className="w-in">{r.art}</div></div>
              <h3>{r.title}</h3>
              <span className="r-go" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        {session && <p className="r-note w-rise" style={{ '--i': 7 }}>You are signed in. <Link href="/admin">Go to your dashboard →</Link></p>}
      </div>
    </section>
  );
}