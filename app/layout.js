import './globals.css';
export const metadata = { title: 'Event Logistics Coordinator', description: 'Live event status: crowd, parking, waste and power' };
export const viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar"><a href="/">📍 Event Coordinator</a><a href="/admin" className="adm">Admin</a></header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
