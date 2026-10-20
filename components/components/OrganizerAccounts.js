'use client';
import { useEffect, useState, useCallback } from 'react';

// Site owner only: see organizer accounts, view their permission letters, approve / reject / remove
export default function OrganizerAccounts() {
  const [list, setList] = useState([]);
  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/organizers', { cache: 'no-store' }); if (r.ok) setList(await r.json()); } catch {}
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, [load]);

  const setStatus = async (o, status) => {
    await fetch(`/api/admin/organizers/${o.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };
  const remove = async (o) => {
    if (!confirm(`Remove organizer "${o.name}" and all of their events?`)) return;
    await fetch(`/api/admin/organizers/${o.id}`, { method: 'DELETE' }); load();
  };

  return (
    <section className="card volunteers">
      <h2>🏢 Organizer accounts ({list.length})</h2>
      <p className="muted tiny">Organizers who signed up. Each one can manage only their own events. In the demo, accounts are approved automatically and the letter is not checked.</p>
      {list.length === 0 ? <div className="muted">No organizers have signed up yet.</div> : list.map(o => (
        <div className="orgrow" key={o.id}>
          <div className="grow">
            <b>{o.name}</b> <span className={`badge ${o.status}`}>{o.status}</span>
            <div className="muted tiny">
              {o.events} event{o.events === 1 ? '' : 's'} · {o.hasLetter
                ? <a href={`/api/admin/letters/${o.id}`} target="_blank">View letter ({o.letterName})</a>
                : o.demoLetter ? 'Sample letter (demo)' : 'No letter'}
            </div>
          </div>
          {o.status !== 'approved' && <button className="btn small" onClick={() => setStatus(o, 'approved')}>Approve</button>}
          {o.status !== 'rejected' && <button className="btn small" onClick={() => setStatus(o, 'rejected')}>Reject</button>}
          <button className="btn danger small" onClick={() => remove(o)}>Remove</button>
        </div>
      ))}
    </section>
  );
}
