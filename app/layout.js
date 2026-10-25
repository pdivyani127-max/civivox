import './globals.css';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';
import { getSession } from '@/lib/auth';
import ScrollFX from '@/components/ScrollFX';
import BackButton from '@/components/BackButton';
import LogoutLink from '@/components/LogoutLink';
export const metadata = { title: SITE_NAME, description: SITE_TAGLINE };
export const viewport = { width: 'device-width', initialScale: 1 };
export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="navl"><BackButton staff={!!session} /></div>
          <a href="/" className="brand">{SITE_NAME}</a>
          {session ? <LogoutLink /> : <a href="/" className="adm">Home</a>}
        </header>
        <main className="wrap">{children}</main>
        <ScrollFX />
      </body>
    </html>
  );
}