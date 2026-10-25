'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { RESOURCE_TYPES, STATUS_LABELS, PRESETS, isSensorCard } from '@/lib/config';
import QrPanel from './QrPanel';
import OrganizerAccounts from './OrganizerAccounts';
import TasksSection from './TasksSection';
import VolunteersSection from './VolunteersSection';
import MessagesSection from './MessagesSection';
import BroadcastSection from './BroadcastSection';

const call = (method, url, body) => fetch(url, {
  method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
});
const post = (url, body) => call('POST', url, body);

function NoteBox({ resource, save }) {
  const [text, setText] = useState(resource.note || '');
  return (
    <div className="row">
      <input value={text} maxLength={120} placeholder="Add a note for visitors"
        onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && save({ note: text })} />
      <button className="btn" onClick={() => save({ note: text })}>Save note</button>
    </div>
  );
}

export function ResourceControl({ r, reload, canRemove = true }) {
  const t = RESOURCE_TYPES[r.type] || { icon: '•', label: r.type };
  const save = async (changes) => { await post(`/api/admin/resources/${r.id}`, changes); reload(); };
  const remove = async () => {
    if (!confirm(`Remove the card "${r.label}"?`)) return;
    await call('DELETE', `/api/admin/resources/${r.id}`); reload();
  };
  if (isSensorCard(r)) {
    return (
      <div className={`card res ${r.status}`}>
        <div className="res-top"><span>{t.icon} {r.label}</span><span className="pill">{r.status === 'green' ? 'Online' : 'Offline'}</span></div>
        <div>{r.note}</div>
        <div className="muted tiny">Updated automatically from the Arduino readings</div>
        {canRemove && <button className="linkbtn" onClick={remove}>Remove card</button>}
      </div>
    );
  }
  return (
    <div className={`card res ${r.status}`}>
      <div className="res-top"><span>{t.icon} {r.label}</span><span className="pill">{STATUS_LABELS[r.status]}</span></div>

      {r.type === 'parking' && (
        <div className="row stepper">
          {[-5, -1].map(n => <button key={n} className="btn" onClick={() => save({ value: (r.value ?? 0) + n })}>{n}</button>)}
          <div className="big">{r.value}<small> / {r.capacity} free</small></div>
          {[1, 5].map(n => <button key={n} className="btn" onClick={() => save({ value: (r.value ?? 0) + n })}>+{n}</button>)}
        </div>
      )}
      {r.type === 'parking' && r.eta != null && r.status !== 'red' && <div className="eta">⏱ Predicted full in about {r.eta} min</div>}

      <div className="row chips">
        {(PRESETS[r.type] || []).map(([note, status]) => (
          <button key={note} className={`btn chip ${status}`} onClick={() => save({ note, status })}>{note}</button>
        ))}
      </div>
      <div className="row chips">
        {['green', 'yellow', 'red'].map(s => (
          <button key={s} className={`btn chip ${s} ${r.status === s ? 'on' : ''}`} onClick={() => save({ status: s })}>{STATUS_LABELS[s]}</button>
        ))}
      </div>
      <NoteBox key={`${r.id}-${r.updated_at}`} resource={r} save={save} />
      <div className="muted tiny">
        {r.source === 'sim' ? 'Simulated · ' : ''}Last updated {new Date(r.updated_at).toLocaleTimeString()}
      </div>
      {canRemove && <button className="linkbtn" onClick={remove}>Remove card</button>}
    </div>
  );
}

function AddCard({ zone, reload }) {
  const [type, setType] = useState('waste');
  const [label, setLabel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [free, setFree] = useState('');
  const [err, setErr] = useState('');
  const add = async () => {
    const res = await post('/api/admin/resources', { zoneId: zone.id, type, label, capacity, value: free === '' ? capacity : free });
    if (res.ok) { setLabel(''); setCapacity(''); setFree(''); setErr(''); reload(); }
    else setErr((await res.json()).error || 'Could not add');
  };
  return (
    <details className="addcard">
      <summary>+ Add a card to {zone.name}</summary>
      <div className="row">
        <select value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(RESOURCE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <input value={label} maxLength={60} placeholder="Card name, e.g. Bin 3 or Stage power" onChange={e => setLabel(e.target.value)} />
      </div>
      {type === 'parking' && (
        <div className="row">
          <input type="number" min="1" value={capacity} placeholder="Total slots" onChange={e => setCapacity(e.target.value)} />
          <input type="number" min="0" value={free} placeholder="Free now (default: all)" onChange={e => setFree(e.target.value)} />
        </div>
      )}
      <div className="row"><button className="btn primary" disabled={!label.trim()} onClick={add}>Add card</button>{err && <span className="err">{err}</span>}</div>
    </details>
  );
}

export default function AdminPanel({ events: initialEvents, initial, role = 'admin', account = { name: 'Site owner', status: 'approved' } }) {
  const isOwner = role === 'admin';
  const [events, setEvents] = useState(initialEvents);
  const [eventId, setEventId] = useState(initial.event.id);
  const [snap, setSnap] = useState(initial);
  const [alerts, setAlerts] = useState([]);
  const [soundOn, setSoundOn] = useState(false);
  const [simOn, setSimOn] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [ev, setEv] = useState({ name: '', venue: '', date: '', description: '' });
  const [zoneName, setZoneName] = useState('');
  const [zoneKind, setZoneKind] = useState('hall');
  const [tpl, setTpl] = useState('garba');
  const [tplMsg, setTplMsg] = useState(null);
  const [err, setErr] = useState('');
  const lastCount = useRef(null);
  const soundRef = useRef(false);
  soundRef.current = soundOn;

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.2;
      o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 450);
    } catch {}
  };

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/status`, { cache: 'no-store' });
      if (res.ok) setSnap(await res.json());
      const ar = await fetch(`/api/admin/alerts?eventId=${eventId}`, { cache: 'no-store' });
      if (ar.ok) {
        const list = await ar.json();
        const open = list.filter(a => !a.acknowledged).length;
        if (lastCount.current !== null && open > lastCount.current && soundRef.current) beep();
        lastCount.current = open;
        setAlerts(list);
      }
    } catch {}
  }, [eventId]);

  useEffect(() => { reload(); const t = setInterval(reload, 5000); return () => clearInterval(t); }, [reload]);
  useEffect(() => { if (snap.event.id === eventId && snap.zones.length === 0) setManageOpen(true); }, [snap.event.id, snap.zones.length, eventId]);

  // Simulation mode: while ON, event data moves every 4 seconds (keep this admin tab open)
  useEffect(() => {
    if (!simOn) return;
    const t = setInterval(async () => { await post('/api/admin/sim', { eventId }); reload(); }, 4000);
    return () => clearInterval(t);
  }, [simOn, eventId, reload]);

  const refreshEvents = async () => { const r = await fetch('/api/admin/events', { cache: 'no-store' }); const list = await r.json(); setEvents(list); return list; };
  const createEvent = async () => {
    const res = await post('/api/admin/events', ev);
    const data = await res.json();
    if (!res.ok) return setErr(data.error || 'Could not create event');
    setErr(''); setEv({ name: '', venue: '', date: '', description: '' });
    await refreshEvents(); setEventId(data.id);
  };
  const deleteEvent = async () => {
    if (!confirm(`Delete the whole event "${snap.event.name}" with all its areas and cards?`)) return;
    const res = await call('DELETE', `/api/admin/events/${eventId}`);
    if (!res.ok) return setErr((await res.json()).error || 'Could not delete');
    setErr(''); const list = await refreshEvents(); setEventId(list[0].id);
  };
  const resetDemo = async () => {
    if (!confirm('Reset EVERYTHING to the sample data? All events, areas, cards and tasks you added will be deleted.')) return;
    await post('/api/admin/reset', {});
    const list = await refreshEvents(); setEventId(list[0].id); setErr(''); reload();
  };
  const loadSample = async () => {
    setTplMsg(null);
    try {
      const res = await post(`/api/admin/events/${eventId}/sample`, { template: tpl });
      let data = {}; try { data = await res.json(); } catch {}
      if (!res.ok) return setTplMsg({ ok: false, text: data.error || 'Could not load the sample data' });
      setTplMsg({ ok: true, text: data.added > 0 ? `Added ${data.added} area${data.added === 1 ? '' : 's'} with their cards.` : 'Nothing to add: this event already has all of those areas.' });
      reload();
    } catch { setTplMsg({ ok: false, text: 'Could not reach the server.' }); }
  };
  const addZone = async () => {
    const res = await post('/api/admin/zones', { eventId, name: zoneName, kind: zoneKind });
    if (!res.ok) return setErr((await res.json()).error || 'Could not add area');
    setErr(''); setZoneName(''); reload();
  };
  const deleteZone = async (z) => {
    if (!confirm(`Delete the area "${z.name}" and all its cards?`)) return;
    await call('DELETE', `/api/admin/zones/${z.id}`); reload();
  };
  const gotoEvent = (id) => { setEventId(id); setManageOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const ack = async () => { await post('/api/admin/alerts', { eventId }); reload(); };
  const toggleSound = () => { if (!soundOn) beep(); setSoundOn(!soundOn); };
  
  const openAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <>
      <div className="row between">
        <div>
          <h1>{isOwner ? 'Site owner panel' : 'Organizer panel'}</h1>
          <div className="muted">{account.name}</div>
        </div>
        <div className="row">
          <button className={`btn ${simOn ? 'primary' : ''}`} onClick={() => setSimOn(!simOn)}>{simOn ? '▶ Simulation: ON' : '⏸ Simulation: OFF'}</button>
          <button className="btn" onClick={toggleSound}>{soundOn ? '🔔 Alert sound: ON' : '🔕 Alert sound: OFF'}</button>
          
        </div>
      </div>
      {account.status === 'pending' && <div className="pending">⏳ Your account is waiting for approval. You can set everything up, but visitors cannot see your events yet.</div>}
      {isOwner && <OrganizerAccounts />}
      {simOn && <div className="offline">Simulation is ON: parking, bins, power and crowd levels change with fake data (labelled "Simulated"). Turn it off for real use.</div>}

      {openAlerts.length > 0 && (
        <div className="alertbox">
          <strong>🚨 {openAlerts.length} active alert{openAlerts.length > 1 ? 's' : ''}</strong>
          {openAlerts.map(a => (
            <div key={a.id}>{a.message} <span className="muted">({new Date(a.created_at).toLocaleTimeString()})</span></div>
          ))}
          <button className="btn" onClick={ack}>Acknowledge all</button>
        </div>
      )}

      <div className="row">
        <label>Event:&nbsp;</label>
        <select value={eventId} onChange={e => setEventId(Number(e.target.value))}>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}{e.date ? ` · ${e.date}` : ''}</option>)}
        </select>
        <a className="back" href={`/event/${eventId}`} target="_blank">Open visitor page ↗</a>
      </div>

      <QrPanel eventId={eventId} eventName={snap.event.name} />

      <details className="card manage" open={manageOpen} onToggle={e => setManageOpen(e.currentTarget.open)}>
        <summary>⚙️ Manage events and areas</summary>
        {err && <div className="err">{err}</div>}
        <h3>Add a new event</h3>
        <div className="row">
          <input value={ev.name} maxLength={80} placeholder="Event name" onChange={e => setEv({ ...ev, name: e.target.value })} />
          <input value={ev.venue} maxLength={80} placeholder="Venue" onChange={e => setEv({ ...ev, venue: e.target.value })} />
          <input type="date" value={ev.date} onChange={e => setEv({ ...ev, date: e.target.value })} />
        </div>
        <div className="row">
          <input value={ev.description} maxLength={200} placeholder="Short description" onChange={e => setEv({ ...ev, description: e.target.value })} />
          <button className="btn primary" disabled={!ev.name.trim()} onClick={createEvent}>Create event</button>
        </div>
        <h3>Add an area to "{snap.event.name}"</h3>
        <div className="row">
          <input value={zoneName} maxLength={60} placeholder="Area name, e.g. Main Stage, Parking Lot C" onChange={e => setZoneName(e.target.value)} />
          <select value={zoneKind} onChange={e => setZoneKind(e.target.value)}>
            <option value="hall">Hall / stage</option><option value="parking">Parking</option>
            <option value="food">Food / stalls</option><option value="other">Other</option>
          </select>
          <button className="btn primary" disabled={!zoneName.trim()} onClick={addZone}>Add area</button>
        </div>
        <h3>Load sample data into "{snap.event.name}"</h3>
        <p className="muted tiny">Adds ready-made areas, cards and parking history, like the demo events. Areas you already have are kept.</p>
        <div className="row">
          <select value={tpl} onChange={e => { setTpl(e.target.value); setTplMsg(null); }}>
            <option value="garba">Garba Night</option><option value="sports">Annual Sports Meet</option>
            <option value="cultural">Cultural Night</option><option value="tech">Tech Fest 2026</option>
          </select>
          <button className="btn primary" onClick={loadSample}>Add sample data</button>
        </div>
        {tplMsg && <div className={tplMsg.ok ? 'okmsg' : 'err'}>{tplMsg.text}</div>}
        <div className="row">
          <button className="btn danger small" onClick={deleteEvent}>Delete this event</button>
          {isOwner && <button className="btn danger small" onClick={resetDemo}>Reset everything to sample data</button>}
        </div>
      </details>

      <TasksSection events={events} defaultEventId={eventId} />
      <VolunteersSection events={events} defaultEventId={eventId} onGoto={gotoEvent} />
      <MessagesSection events={events} defaultEventId={eventId} />
      <BroadcastSection events={events} defaultEventId={eventId} />

      {snap.zones.length === 0 && (
        <div className="card empty">This event has no areas yet. Open "⚙️ Manage events and areas" above and add areas such as Main Stage, Parking and Food Court. Then add cards (crowd, parking, waste, power) to each area.</div>
      )}

      {snap.zones.map(z => (
        <section key={z.id} className="zone">
          <div className="zonehead">
            <h2>{z.name}</h2>
            <button className="btn danger small" onClick={() => deleteZone(z)}>Delete area</button>
          </div>
          <div className="grid admin-grid">{z.resources.map(r => <ResourceControl key={r.id} r={r} reload={reload} />)}</div>
          <AddCard zone={z} reload={reload} />
        </section>
      ))}
    </>
  );
}
