'use client';
import { useEffect, useState, useCallback } from 'react';
import { tasks } from '@/lib/insights';
import EventPick from './EventPick';
import { useChosenEvent } from './useEventSnap';
import { call, post } from './api';

export default function TasksSection({ events, defaultEventId }) {
  const [eid, setEid] = useChosenEvent(defaultEventId, events, true);
  const [groups, setGroups] = useState([]); // one entry per event: { event, auto, mine }
  const [text, setText] = useState('');
  const all = eid === 'all';

  const load = useCallback(async () => {
    try {
      const targets = all ? events : events.filter(e => e.id === eid);
      const parts = await Promise.all(targets.map(async (e) => {
        const [sr, tr] = await Promise.all([
          fetch(`/api/events/${e.id}/status`, { cache: 'no-store' }),
          fetch(`/api/admin/tasks?eventId=${e.id}`, { cache: 'no-store' }),
        ]);
        const snap = sr.ok ? await sr.json() : null;
        const mine = tr.ok ? await tr.json() : [];
        return { event: e, auto: snap ? tasks(snap.zones) : [], mine };
      }));
      setGroups(parts);
    } catch {}
  }, [eid, events, all]);
  useEffect(() => { setGroups([]); load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const add = async () => { await post('/api/admin/tasks', { eventId: eid, text }); setText(''); load(); };
  const toggle = async (t) => { await post(`/api/admin/tasks/${t.id}`, { done: !t.done }); load(); };
  const remove = async (t) => { await call('DELETE', `/api/admin/tasks/${t.id}`); load(); };

  return (
    <section className="card todo">
      <h2>📋 Staff to-do list</h2>
      <EventPick events={events} value={eid} onChange={setEid} allowAll />
      {groups.map(g => (
        <div key={g.event.id}>
          {all && <h3 style={{ marginTop: 14 }}>{g.event.name}</h3>}
          {g.auto.length === 0 ? <div className="muted">Nothing needs attention right now.</div> : (
            <ol>{g.auto.map(t => <li key={t.id} className={t.urgent ? 'urgent' : ''}>{t.text}</li>)}</ol>
          )}
          <h3 className="tiny muted" style={{ marginTop: 14 }}>Added by you</h3>
          <ul className="mytasks">
            {g.mine.map(t => (
              <li key={t.id} className={t.done ? 'done' : ''}>
                <input type="checkbox" style={{ flex: 'none', minWidth: 0 }} checked={!!t.done} onChange={() => toggle(t)} />
                <span>{t.text}</span>
                <button className="linkbtn" style={{ marginTop: 0 }} onClick={() => remove(t)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {all ? (
        <div className="muted tiny" style={{ marginTop: 10 }}>To write a new task, choose one event above.</div>
      ) : (
        <div className="row">
          <input value={text} maxLength={160} placeholder="Write a task for staff, e.g. Bring extra chairs to Hall B"
            onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && text.trim() && add()} />
          <button className="btn primary" disabled={!text.trim()} onClick={add}>Add task</button>
        </div>
      )}
    </section>
  );
}
