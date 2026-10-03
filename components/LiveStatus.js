'use client';
import { useEffect, useState } from 'react';
import { RESOURCE_TYPES, STATUS_LABELS, STALE_AFTER_MINUTES } from '@/lib/config';
import { suggestions } from '@/lib/insights';
import VenueMap from './VenueMap';

const POLL_MS = 4000; // refresh every 4 seconds

function minutesAgo(iso, now) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export default function LiveStatus({ eventId, initial }) {
  const [snap, setSnap] = useState(initial);
  const [now, setNow] = useState(Date.now());
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/status`, { cache: 'no-store' });
        if (!res.ok) throw new Error('bad');
        setSnap(await res.json());
        setOffline(false);
      } catch { setOffline(true); } // keep showing last known data
      setNow(Date.now());
    }, POLL_MS);
    return () => clearInterval(t);
  }, [eventId]);

  const { event, zones, broadcast } = snap;
  const tips = suggestions(zones);
  return (
    <>
      <a href="/" className="back">← All events</a>
      <h1>{event.name}</h1>
      <div className="muted">{event.venue} · {event.date}</div>

      {broadcast && <div className="banner">📢 {broadcast.message}</div>}
      {offline && <div className="offline">Connection lost – showing last known data</div>}

      {zones.length === 0 && <div className="card empty">The organizers haven't added any information for this event yet. Please check back soon.</div>}
      {zones.length > 0 && <div className="card map-card"><VenueMap zones={zones} /></div>}

      {tips.length > 0 && (
        <section className="card tips">
          <h2>🧭 Where should I go?</h2>
          {tips.map((t, i) => <div key={i} className={`tip ${t.tone}`}>{t.icon} {t.text}</div>)}
        </section>
      )}

      {zones.map(z => (
        <section key={z.id} id={`zone-${z.id}`} className="zone">
          <h2>{z.name}</h2>
          <div className="grid">
            {z.resources.map(r => {
              const age = minutesAgo(r.updated_at, now);
              const stale = age >= STALE_AFTER_MINUTES;
              const t = RESOURCE_TYPES[r.type] || { label: r.type, icon: '•' };
              return (
                <div key={r.id} className={`card res ${stale ? 'stale' : r.status}`}>
                  <div className="res-top">
                    <span>{t.icon} {r.label}</span>
                    <span className="pill">{stale ? 'Outdated' : STATUS_LABELS[r.status]}</span>
                  </div>
                  {r.type === 'parking' && r.value != null && (
                    <div className="big">{r.value}<small> / {r.capacity} free</small></div>
                  )}
                  {r.type === 'parking' && r.eta != null && r.status !== 'red' && (
                    <div className="eta">⏱ Likely full in about {r.eta} min</div>
                  )}
                  <div>{r.note}</div>
                  <div className="muted tiny">
                    {r.source === 'sensor' ? 'Sensor · ' : r.source === 'sim' ? 'Simulated · ' : ''}Updated {age === 0 ? 'just now' : `${age} min ago`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
