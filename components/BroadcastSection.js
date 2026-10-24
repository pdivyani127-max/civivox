'use client';
import { useState } from 'react';
import EventPick from './EventPick';
import { useChosenEvent, useEventSnap } from './useEventSnap';
import { post } from './api';

export default function BroadcastSection({ events, defaultEventId }) {
  const [eid, setEid] = useChosenEvent(defaultEventId, events, true);
  const [snap, reload] = useEventSnap(eid);
  const [text, setText] = useState('');
  const [info, setInfo] = useState('');
  const targets = eid === 'all' ? events : events.filter(e => e.id === eid);

  const send = async (message) => {
    const results = await Promise.all(targets.map(e => post('/api/admin/broadcast', { eventId: e.id, message })));
    const n = results.filter(r => r.ok).length;
    setInfo(message ? `Sent to ${n} event${n === 1 ? '' : 's'}.` : `Cleared on ${n} event${n === 1 ? '' : 's'}.`);
    setText(''); reload();
  };

  return (
    <section className="card zone">
      <h2>📢 Broadcast to visitors</h2>
      <EventPick events={events} value={eid} onChange={(v) => { setEid(v); setInfo(''); }} allowAll />
      {snap && snap.broadcast && <div className="banner">Live now on "{snap.event.name}": {snap.broadcast.message}</div>}
      <div className="row">
        <input value={text} maxLength={200} placeholder="e.g. Emergency lane closed - use Gate 2"
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && text.trim() && send(text)} />
        <button className="btn primary" disabled={!text.trim()} onClick={() => send(text)}>Send</button>
        <button className="btn" onClick={() => send('')}>Clear</button>
      </div>
      {info && <div className="okmsg">{info}</div>}
    </section>
  );
}
