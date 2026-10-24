import './globals.css';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';
import ScrollFX from '@/components/ScrollFX';
import BackButton from '@/components/BackButton';
export const metadata = { title: SITE_NAME, description: SITE_TAGLINE };
export const viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="navl"><BackButton /></div>
          <a href="/" className="brand">{SITE_NAME}</a>
          <a href="/admin" className="adm">Dashboard</a>
        </header>
        <main className="wrap">{children}</main>
        <ScrollFX />
      </body>
    </html>
  );
}
