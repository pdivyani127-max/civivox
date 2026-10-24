'use client';
import { useEffect, useState, useCallback } from 'react';
import EventPick from './EventPick';
import { useChosenEvent, useEventSnap } from './useEventSnap';
import { call, post } from './api';
import { noFillName, noFillPassword } from '@/lib/noautofill';

export default function VolunteersSection({ events, defaultEventId, onGoto }) {
  const [eid, setEid] = useChosenEvent(defaultEventId, events);
  const [snap] = useEventSnap(eid);
  const [vols, setVols] = useState([]);
  const [f, setF] = useState({ name: '', password: '', zoneId: '' });
  const [msg, setMsg] = useState(null);
  const zones = snap ? snap.zones : [];

  const load = useCallback(async () => {
    try { const r = await fetch(`/api/admin/volunteers?eventId=${eid}`, { cache: 'no-store' }); if (r.ok) setVols(await r.json()); } catch {}
  }, [eid]);
  useEffect(() => { setVols([]); load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);
  useEffect(() => { setF((x) => ({ ...x, zoneId: '' })); setMsg(null); }, [eid]); // an area belongs to one event only

  const add = async () => {
    setMsg(null);
    try {
      const res = await post('/api/admin/volunteers', f);
      let data = {}; try { data = await res.json(); } catch {}
      if (!res.ok) return setMsg({ ok: false, text: data.error || 'Could not add the volunteer (server error). Stop the site and run npm run dev again.' });
      const area = zones.find(z => z.id === Number(f.zoneId))?.name || 'the area';
      setMsg({ ok: true, text: `Added ${f.name.trim()} to ${area} (${snap?.event.name || 'this event'}).` });
      setF({ name: '', password: '', zoneId: '' });
      load();
    } catch { setMsg({ ok: false, text: 'Could not reach the server. Is the site still running?' }); }
  };
  const remove = async (v) => { if (confirm(`Remove volunteer "${v.name}"?`)) { await call('DELETE', `/api/admin/volunteers/${v.id}`); load(); } };

  return (
    <section className="card volunteers">
      <h2>👥 Volunteers ({vols.length})</h2>
      <EventPick events={events} value={eid} onChange={setEid} />
      <p className="muted tiny">A volunteer can update only the cards in their own area, in the event chosen above. They log in on the sign-in page using "Volunteer".</p>
      {vols.length === 0 ? <div className="muted">No volunteers added for this event yet.</div> : (
        <ul className="mytasks">
          {vols.map(v => (
            <li key={v.id}><span>👤 <b>{v.name}</b> → {v.zone}</span>
              <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => remove(v)}>Remove</button></li>
          ))}
        </ul>
      )}
      <h3 className="tiny muted" style={{ marginTop: 14 }}>Add a volunteer to {snap ? `"${snap.event.name}"` : 'this event'}</h3>
      {snap && zones.length === 0 ? (
        <div className="pending">
          This event has no areas yet, and a volunteer needs an area to look after.{' '}
          <button className="linkish" onClick={() => onGoto && onGoto(eid)}>Add areas to this event</button>
        </div>
      ) : (
        <div className="row">
          <input name="new-volunteer-name" {...noFillName} value={f.name} maxLength={40} placeholder="Volunteer name" onChange={e => setF({ ...f, name: e.target.value })} />
          <input name="new-volunteer-secret" type="password" {...noFillPassword} value={f.password} placeholder="Password (4+ characters)" onChange={e => setF({ ...f, password: e.target.value })} />
          <select value={f.zoneId} onChange={e => setF({ ...f, zoneId: e.target.value })}>
            <option value="">Choose area</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <button className="btn primary" disabled={!f.name.trim() || f.password.length < 4 || !f.zoneId} onClick={add}>Add volunteer</button>
        </div>
      )}
      {msg && <div className={msg.ok ? 'okmsg' : 'err'}>{msg.text}</div>}
    </section>
  );
}
