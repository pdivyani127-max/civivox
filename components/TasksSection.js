'use client';
import { useEffect, useState, useCallback } from 'react';
import { tasks } from '@/lib/insights';
import EventPick from './EventPick';
import { useChosenEvent, useEventSnap } from './useEventSnap';
import { call, post } from './api';

export default function TasksSection({ events, defaultEventId }) {
  const [eid, setEid] = useChosenEvent(defaultEventId, events);
  const [snap] = useEventSnap(eid);
  const [mine, setMine] = useState([]);
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    try { const r = await fetch(`/api/admin/tasks?eventId=${eid}`, { cache: 'no-store' }); if (r.ok) setMine(await r.json()); } catch {}
  }, [eid]);
  useEffect(() => { setMine([]); load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const todo = snap ? tasks(snap.zones) : [];
  const add = async () => { await post('/api/admin/tasks', { eventId: eid, text }); setText(''); load(); };
  const toggle = async (t) => { await post(`/api/admin/tasks/${t.id}`, { done: !t.done }); load(); };
  const remove = async (t) => { await call('DELETE', `/api/admin/tasks/${t.id}`); load(); };

  return (
    <section className="card todo">
      <h2>📋 Staff to-do list</h2>
      <EventPick events={events} value={eid} onChange={setEid} />
      {todo.length === 0 ? <div className="muted">Nothing needs attention right now.</div> : (
        <ol>{todo.map(t => <li key={t.id} className={t.urgent ? 'urgent' : ''}>{t.text}</li>)}</ol>
      )}
      <h3 className="tiny muted" style={{ marginTop: 14 }}>Added by you</h3>
      <ul className="mytasks">
        {mine.map(t => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <input type="checkbox" style={{ flex: 'none', minWidth: 0 }} checked={!!t.done} onChange={() => toggle(t)} />
            <span>{t.text}</span>
            <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => remove(t)}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <input value={text} maxLength={160} placeholder="Write a task for staff, e.g. Bring extra chairs to Hall B"
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && text.trim() && add()} />
        <button className="btn primary" disabled={!text.trim()} onClick={add}>Add task</button>
      </div>
    </section>
  );
}
