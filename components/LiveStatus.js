'use client';
import { useEffect, useState } from 'react';
import { RESOURCE_TYPES, STATUS_LABELS, STALE_AFTER_MINUTES } from '@/lib/config';
import { suggestions, worstStatus } from '@/lib/insights';
import VenueMap from './VenueMap';

const POLL_MS = 4000; // refresh every 4 seconds
const ZONE_WORD = { green: 'All normal', yellow: 'Getting busy', red: 'Needs attention' };
const STEPS = { crowd: ['Low', 'Moderate', 'Crowded'], waste: ['Empty', 'Half full', 'Full'], power: ['Normal', 'Backup', 'Outage'] };
const LEVEL = { green: 0, yellow: 1, red: 2 };

function minutesAgo(iso, now) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}
function pretty(d) {
  const x = new Date(`${d}T00:00:00`);
  return isNaN(x) ? d : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ResCard({ r, now }) {
  const age = minutesAgo(r.updated_at, now);
  const stale = age >= STALE_AFTER_MINUTES;
  const t = RESOURCE_TYPES[r.type] || { label: r.type, icon: '•' };
  const lv = LEVEL[r.status] ?? 0;
  const free = r.type === 'parking' && r.value != null ? Math.max(0, Math.min(100, Math.round((100 * r.value) / (r.capacity || 1)))) : null;
  return (
    <article className={`lv-res ${stale ? 'stale' : r.status}`}>
      <div className="lv-res-top">
        <span className="lv-ic">{t.icon}</span>
        <h3>{r.label}</h3>
        <span className="lv-pill">{stale ? 'Outdated' : STATUS_LABELS[r.status]}</span>
      </div>
      {r.type === 'parking' && r.value != null && (
        <>
          <div className="lv-big"><b>{r.value}</b><span>/ {r.capacity} free</span></div>
          <div className="lv-bar"><i style={{ width: `${free}%` }} /></div>
        </>
      )}
      {r.type === 'parking' && r.eta != null && r.status !== 'red' && <div className="lv-eta">⏱ Likely full in about {r.eta} min</div>}
      {STEPS[r.type] && !stale && (
        <div className="lv-steps">
          {STEPS[r.type].map((s, i) => <span key={s} className={`${i <= lv ? 'on' : ''} ${i === lv ? 'cur' : ''}`}>{s}</span>)}
        </div>
      )}
      <p className="lv-note">{r.note}</p>
      <div className="lv-ml">
        {r.source === 'sensor' && <span className="lv-src">Sensor</span>}
        {r.source === 'sim' && <span className="lv-src">Simulated</span>}
        Updated {age === 0 ? 'just now' : `${age} min ago`}
      </div>
    </article>
  );
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
  const counts = { green: 0, yellow: 0, red: 0 };
  zones.forEach((z) => { counts[worstStatus(z.resources)]++; });

  return (
    <div className="lv bleed">
      <header className="lv-head">
        <a href="/events" className="lv-back" aria-label="All events" data-label="All events">
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill="currentColor" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill="currentColor" /></svg>
</a>
        <div><span className={`lv-live ${offline ? 'off' : ''}`}><i />{offline ? 'Reconnecting' : 'Live'}</span></div>
        <h1 className="lv-title">{event.name}</h1>
        <div className="lv-chips">
          {event.venue && <span className="lv-chip"><i />{event.venue}</span>}
          {event.date && <span className="lv-chip date"><i />{pretty(event.date)}</span>}
        </div>
      </header>

      {broadcast && <div className="lv-banner">📢 {broadcast.message}</div>}
      {offline && <div className="lv-offline">Connection lost – showing last known data</div>}

      {zones.length === 0 && <div className="lv-empty">The organizers haven't added any information for this event yet. Please check back soon.</div>}

      {zones.length > 0 && (
        <section className="lv-hero">
          <div className="lv-hero-head"><h2>Venue map</h2><p>Tap an area to jump to its details.</p></div>
          <div className="lv-map-card"><VenueMap zones={zones} /></div>
          <div className="lv-legend">
            <span className="lv-lg green"><i />Normal <b>{counts.green}</b></span>
            <span className="lv-lg yellow"><i />Busy <b>{counts.yellow}</b></span>
            <span className="lv-lg red"><i />Alert <b>{counts.red}</b></span>
          </div>
        </section>
      )}

      {tips.length > 0 && (
        <section className="lv-tips">
          <h2><span>🧭</span>Where should I go?</h2>
          {tips.map((t, i) => <div key={i} className={`lv-tip ${t.tone}`}><i className="dot" /><span>{t.icon} {t.text}</span></div>)}
        </section>
      )}

      {zones.length > 0 && (
        <div className="lv-flow">
          {zones.map((z, i) => {
            const w = worstStatus(z.resources);
            const types = [...new Set(z.resources.map((r) => r.type))];
            return (
              <section key={z.id} id={`zone-${z.id}`} className={`lv-zone ${i % 2 ? 'flip' : ''}`}>
                <div className="lv-info">
                  <h2>{z.name}</h2>
                  <span className={`lv-zpill ${w}`}><i />{ZONE_WORD[w]}</span>
                  <div className="lv-types">{types.map((tp) => <span key={tp} title={(RESOURCE_TYPES[tp] || {}).label}>{(RESOURCE_TYPES[tp] || {}).icon}</span>)}</div>
                  {(z.notes || []).map((n) => (
                    <div key={n.id} className="lv-bubble">📝 {n.text} <span className="lv-ago">· {minutesAgo(n.created_at, now) === 0 ? 'just now' : `${minutesAgo(n.created_at, now)} min ago`}</span></div>
                  ))}
                </div>
                <div className={`lv-node ${w}`}><span>{i + 1}</span></div>
                <div className="lv-cards">{z.resources.map((r) => <ResCard key={r.id} r={r} now={now} />)}</div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
