import Link from 'next/link';
import { getEvents } from '@/lib/data';
export const dynamic = 'force-dynamic';

export default function Events() {
  const events = getEvents();
  return (
    <>
      <h1>Choose an event</h1>
      <p className="muted">No app, no login. Pick an event to see live crowd, parking, waste and power status.</p>
      <div className="list">
        {events.map(e => (
          <Link key={e.id} href={`/event/${e.id}`} className="card event">
            <h2>{e.name}</h2>
            <div className="muted">{e.venue} · {e.date}</div>
            <p>{e.description}</p>
          </Link>
        ))}
        {events.length === 0 && <div className="card empty">No events yet.</div>}
      </div>
    </>
  );
}
