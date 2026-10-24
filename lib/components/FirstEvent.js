'use client';
import { useState } from 'react';

// Shown when a signed-in organizer (or the site owner) has no event yet: create one to get started
export default function FirstEvent({ who }) {
  const [f, setF] = useState({ name: '', venue: '', date: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function create() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      let data = {}; try { data = await res.json(); } catch {}
      if (res.ok) { window.location.reload(); return; }
      setErr(data.error || 'Could not create the event');
    } catch { setErr('Could not reach the server'); }
    setBusy(false);
  }
  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/start'; };

  return (
    <div className="card login wide">
      <h1>Create your first event</h1>
      <p className="muted">{who}, you do not have an event yet. Add one, then you can set up areas, volunteers and live updates.</p>
      <input autoComplete="off" placeholder="Event name" value={f.name} onChange={set('name')} />
      <input autoComplete="off" placeholder="Venue (optional)" value={f.venue} onChange={set('venue')} />
      <input type="date" value={f.date} onChange={set('date')} />
      <button className="btn primary" disabled={busy || !f.name.trim()} onClick={create}>{busy ? 'Please wait...' : 'Create event'}</button>
      {err && <div className="err">{err}</div>}
      <button className="linkbtn" style={{ color: '#2e5c8a', fontSize: '.85rem' }} onClick={logout}>Log out</button>
    </div>
  );
}
