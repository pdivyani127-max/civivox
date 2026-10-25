'use client';
import { useEffect, useState, useCallback } from 'react';
import { ResourceControl } from './AdminPanel';
import { tasks } from '@/lib/insights';

export default function VolunteerPanel({ session, initial }) {
  const [snap, setSnap] = useState(initial);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [forVisitors, setForVisitors] = useState(false);
  const [msg, setMsg] = useState(null);

  const reload = useCallback(async () => {
    try {
      const r = await fetch(`/api/events/${initial.event.id}/status`, { cache: 'no-store' });
      if (r.ok) setSnap(await r.json());
      const nr = await fetch(`/api/notes?eventId=${initial.event.id}`, { cache: 'no-store' });
      if (nr.ok) setNotes(await nr.json());
    } catch {}
  }, [initial.event.id]);
  useEffect(() => { reload(); const t = setInterval(reload, 5000); return () => clearInterval(t); }, [reload]);

  const send = async () => {
    setMsg(null);
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, forVisitors }) });
      let data = {}; try { data = await res.json(); } catch {}
      if (!res.ok) return setMsg({ ok: false, text: data.error || 'Could not send. Please try again.' });
      setMsg({ ok: true, text: forVisitors ? 'Sent to the organizer and shown to visitors.' : 'Sent to the organizer.' });
      setText(''); setForVisitors(false); reload();
    } catch { setMsg({ ok: false, text: 'Could not reach the server.' }); }
  };
  const remove = async (n) => { await fetch(`/api/notes/${n.id}`, { method: 'DELETE' }); reload(); };
  

  const zone = snap.zones.find(z => z.id === session.zoneId);
  const todo = zone ? tasks([zone]) : [];

  return (
    <>
      <div className="row between">
        <div>
          <h1>Volunteer panel</h1>
          <div className="muted">{session.name} · {zone ? zone.name : 'area'} · {snap.event.name}</div>
        </div>
        
      </div>

      {snap.broadcast && <div className="banner">📢 {snap.broadcast.message}</div>}

      {!zone ? <div className="card empty">Your area is no longer available. Please ask the organizer.</div> : (
        <>
          <section className="card todo">
            <h2>📋 Needs attention in {zone.name}</h2>
            {todo.length === 0 ? <div className="muted">Nothing needs attention right now.</div> : (
              <ol>{todo.map(t => <li key={t.id} className={t.urgent ? 'urgent' : ''}>{t.text}</li>)}</ol>
            )}
          </section>

          <section className="card todo">
            <h2>💬 Write a note</h2>
            <p className="muted tiny">Type anything you want the organizer to know, like "Need 10 more chairs" or "Bin 3 is broken". Tick the box if visitors should see it too.</p>
            <div className="row">
              <input value={text} maxLength={200} placeholder="Type your note here"
                onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && text.trim() && send()} />
              <button className="btn primary" disabled={!text.trim()} onClick={send}>Send</button>
            </div>
            <label className="tiny" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" style={{ flex: 'none', minWidth: 0 }} checked={forVisitors} onChange={e => setForVisitors(e.target.checked)} />
              Also show this to visitors under "{zone.name}"
            </label>
            {msg && <div className={msg.ok ? 'okmsg' : 'err'}>{msg.text}</div>}
            {notes.length > 0 && (
              <ul className="mytasks" style={{ marginTop: 10 }}>
                {notes.map(n => (
                  <li key={n.id}>
                    <span>{n.text} <span className="muted tiny">· {new Date(n.created_at).toLocaleTimeString()} · {n.for_visitors ? 'visitors can see this' : 'organizer only'}</span></span>
                    <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => remove(n)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="zone">
            <h2>{zone.name}</h2>
            <p className="muted tiny">You can update only the cards in this area. Visitors see your changes within a few seconds.</p>
            <div className="grid admin-grid">
              {zone.resources.map(r => <ResourceControl key={r.id} r={r} reload={reload} canRemove={false} />)}
            </div>
          </section>
        </>
      )}
    </>
  );
}
