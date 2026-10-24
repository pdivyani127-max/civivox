'use client';
import { useEffect, useState, useCallback } from 'react';
import EventPick from './EventPick';
import { useChosenEvent } from './useEventSnap';
import { call } from './api';

export default function MessagesSection({ events, defaultEventId }) {
  const [eid, setEid] = useChosenEvent(defaultEventId, events, true);
  const [notes, setNotes] = useState([]);

  const load = useCallback(async () => {
    try {
      const ids = eid === 'all' ? events.map(e => e.id) : [eid];
      const parts = await Promise.all(ids.map(async (id) => {
        const r = await fetch(`/api/notes?eventId=${id}`, { cache: 'no-store' });
        if (!r.ok) return [];
        const ev = events.find(e => e.id === id);
        return (await r.json()).map(n => ({ ...n, eventName: ev ? ev.name : '' }));
      }));
      setNotes(parts.flat().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))));
    } catch {}
  }, [eid, events]);
  useEffect(() => { setNotes([]); load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const dismiss = async (n) => { await call('DELETE', `/api/notes/${n.id}`); load(); };

  return (
    <section className="card volunteers">
      <h2>💬 Messages from volunteers ({notes.length})</h2>
      <EventPick events={events} value={eid} onChange={setEid} allowAll />
      {notes.length === 0 ? <div className="muted">No messages yet. Volunteers can type notes on their own panel.</div> : (
        <ul className="mytasks">
          {notes.map(n => (
            <li key={n.id}>
              <span>
                {eid === 'all' && <><b>{n.eventName}</b> · </>}<b>{n.author}</b> · {n.zone} · <span className="muted tiny">{new Date(n.created_at).toLocaleTimeString()}{n.for_visitors ? ' · visible to visitors' : ''}</span><br />{n.text}
              </span>
              <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => dismiss(n)}>Dismiss</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
