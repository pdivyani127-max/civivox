'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { RESOURCE_TYPES, STATUS_LABELS, PRESETS, isSensorCard } from '@/lib/config';
import { tasks } from '@/lib/insights';
import QrPanel from './QrPanel';
import OrganizerAccounts from './OrganizerAccounts';
import { noFillName, noFillPassword } from '@/lib/noautofill';

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
  const [msg, setMsg] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [vols, setVols] = useState([]);
  const [vol, setVol] = useState({ name: '', password: '', zoneId: '' });
  const [volMsg, setVolMsg] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  const [simOn, setSimOn] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [ev, setEv] = useState({ name: '', venue: '', date: '', description: '' });
  const [zoneName, setZoneName] = useState('');
  const [zoneKind, setZoneKind] = useState('hall');
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
      const tr = await fetch(`/api/admin/tasks?eventId=${eventId}`, { cache: 'no-store' });
      if (tr.ok) setMyTasks(await tr.json());
      const vr = await fetch(`/api/admin/volunteers?eventId=${eventId}`, { cache: 'no-store' });
      if (vr.ok) setVols(await vr.json());
      const nr = await fetch(`/api/notes?eventId=${eventId}`, { cache: 'no-store' });
      if (nr.ok) setNotes(await nr.json());
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
  const addZone = async () => {
    const res = await post('/api/admin/zones', { eventId, name: zoneName, kind: zoneKind });
    if (!res.ok) return setErr((await res.json()).error || 'Could not add area');
    setErr(''); setZoneName(''); reload();
  };
  const deleteZone = async (z) => {
    if (!confirm(`Delete the area "${z.name}" and all its cards?`)) return;
    await call('DELETE', `/api/admin/zones/${z.id}`); reload();
  };
  const addVolunteer = async () => {
    setVolMsg(null);
    try {
      const res = await post('/api/admin/volunteers', vol);
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) return setVolMsg({ ok: false, text: data.error || 'Could not add the volunteer (server error). Stop the site and run npm run dev again.' });
      const areaName = snap.zones.find(z => z.id === Number(vol.zoneId))?.name || 'the area';
      setVolMsg({ ok: true, text: `Added ${vol.name.trim()} to ${areaName}.` });
      setVol({ name: '', password: '', zoneId: '' });
      reload();
    } catch { setVolMsg({ ok: false, text: 'Could not reach the server. Is the site still running?' }); }
  };
  const dismissNote = async (n) => { await call('DELETE', `/api/notes/${n.id}`); reload(); };
  const removeVolunteer = async (v) => { if (confirm(`Remove volunteer "${v.name}"?`)) { await call('DELETE', `/api/admin/volunteers/${v.id}`); reload(); } };
  const addTask = async () => { await post('/api/admin/tasks', { eventId, text: newTask }); setNewTask(''); reload(); };
  const toggleTask = async (t) => { await post(`/api/admin/tasks/${t.id}`, { done: !t.done }); reload(); };
  const removeTask = async (t) => { await call('DELETE', `/api/admin/tasks/${t.id}`); reload(); };

  const broadcast = async (text) => { await post('/api/admin/broadcast', { eventId, message: text }); setMsg(''); reload(); };
  const ack = async () => { await post('/api/admin/alerts', { eventId }); reload(); };
  const toggleSound = () => { if (!soundOn) beep(); setSoundOn(!soundOn); };
  const logout = async () => { await post('/api/admin/logout', {}); window.location.reload(); };
  const openAlerts = alerts.filter(a => !a.acknowledged);
  const todo = tasks(snap.zones);

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
          <button className="btn" onClick={logout}>Log out</button>
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
        <div className="row">
          <button className="btn danger small" onClick={deleteEvent}>Delete this event</button>
          {isOwner && <button className="btn danger small" onClick={resetDemo}>Reset everything to sample data</button>}
        </div>
      </details>

      <section className="card todo">
        <h2>📋 Staff to-do list</h2>
        {todo.length === 0 ? <div className="muted">Nothing needs attention right now.</div> : (
          <ol>{todo.map(t => <li key={t.id} className={t.urgent ? 'urgent' : ''}>{t.text}</li>)}</ol>
        )}
        <h3 className="tiny muted" style={{ marginTop: 14 }}>Added by you</h3>
        <ul className="mytasks">
          {myTasks.map(t => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <input type="checkbox" style={{ flex: 'none', minWidth: 0 }} checked={!!t.done} onChange={() => toggleTask(t)} />
              <span>{t.text}</span>
              <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => removeTask(t)}>Remove</button>
            </li>
          ))}
        </ul>
        <div className="row">
          <input value={newTask} maxLength={160} placeholder="Write a task for staff, e.g. Bring extra chairs to Hall B"
            onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && newTask.trim() && addTask()} />
          <button className="btn primary" disabled={!newTask.trim()} onClick={addTask}>Add task</button>
        </div>
      </section>

      <section className="card volunteers">
        <h2>👥 Volunteers ({vols.length})</h2>
        <p className="muted tiny">A volunteer can update only the cards in their own area. They log in on this same /admin page using "I'm a volunteer".</p>
        {vols.length === 0 ? <div className="muted">No volunteers added yet.</div> : (
          <ul className="mytasks">
            {vols.map(v => (
              <li key={v.id}><span>👤 <b>{v.name}</b> → {v.zone}</span>
                <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => removeVolunteer(v)}>Remove</button></li>
            ))}
          </ul>
        )}
        <h3 className="tiny muted" style={{ marginTop: 14 }}>Add a volunteer</h3>
        <div className="row">
          <input name="new-volunteer-name" {...noFillName} value={vol.name} maxLength={40} placeholder="Volunteer name" onChange={e => setVol({ ...vol, name: e.target.value })} />
          <input name="new-volunteer-secret" type="password" {...noFillPassword} value={vol.password} placeholder="Password (4+ characters)" onChange={e => setVol({ ...vol, password: e.target.value })} />
          <select value={vol.zoneId} onChange={e => setVol({ ...vol, zoneId: e.target.value })}>
            <option value="">Choose area</option>
            {snap.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <button className="btn primary" disabled={!vol.name.trim() || vol.password.length < 4 || !vol.zoneId} onClick={addVolunteer}>Add volunteer</button>
        </div>
        {volMsg && <div className={volMsg.ok ? 'okmsg' : 'err'}>{volMsg.text}</div>}
      </section>

      <section className="card volunteers">
        <h2>💬 Messages from volunteers ({notes.length})</h2>
        {notes.length === 0 ? <div className="muted">No messages yet. Volunteers can type notes on their own panel.</div> : (
          <ul className="mytasks">
            {notes.map(n => (
              <li key={n.id}>
                <span><b>{n.author}</b> · {n.zone} · <span className="muted tiny">{new Date(n.created_at).toLocaleTimeString()}{n.for_visitors ? ' · visible to visitors' : ''}</span><br />{n.text}</span>
                <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => dismissNote(n)}>Dismiss</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card zone">
        <h2>📢 Broadcast to all visitors</h2>
        {snap.broadcast && <div className="banner">Live now: {snap.broadcast.message}</div>}
        <div className="row">
          <input value={msg} maxLength={200} placeholder="e.g. Emergency lane closed - use Gate 2"
            onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && msg.trim() && broadcast(msg)} />
          <button className="btn primary" disabled={!msg.trim()} onClick={() => broadcast(msg)}>Send</button>
          <button className="btn" onClick={() => broadcast('')}>Clear</button>
        </div>
      </section>

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
