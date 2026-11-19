'use client';
import { useEffect, useState, useCallback } from 'react';
import { ResourceControl } from './AdminPanel';
import { tasks } from '@/lib/insights';
import { Person, Bin, Cloud } from './art';
import { Sparkle } from './Deco';

const NAV = [['vp-todo', 'Needs attention'], ['vp-note', 'Write a note'], ['vp-cards', 'Your cards']];

function GroupHead({ no, tone, title, text }) {
  return (
    <div className={`og-gh ${tone}`}>
      <span className="og-no">{no}</span>
      <div><h2>{title}</h2><p>{text}</p></div>
    </div>
  );
}

export default function VolunteerPanel({ session, initial }) {
  const [snap, setSnap] = useState(initial);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [forVisitors, setForVisitors] = useState(false);
  const [msg, setMsg] = useState(null);
  const [active, setActive] = useState('vp-todo');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

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

  const cnt = { green: 0, yellow: 0, red: 0 };
  if (zone) zone.resources.forEach((r) => { cnt[r.status] = (cnt[r.status] || 0) + 1; });

  return (
    <div className="og vp">
      <header className="og-hero">
        <i className="og-blob b1" /><i className="og-blob b2" />
        <div className="og-hero-in">
          <div className="og-hero-text">
            <span className="og-eyebrow">Welcome, {session.name}</span>
            <h1>Volunteer panel</h1>
            <p className="og-lead">
              {zone ? <>You look after <b>{zone.name}</b> at <b>{snap.event.name}</b></> : 'Your area is no longer available. Please ask the organizer.'}
            </p>
            <div className="og-bar">
              <span className="og-chip"><i />{zone ? zone.name : 'No area'}</span>
              <span className="og-chip gold"><i />{snap.event.name}</span>
            </div>
          </div>
          <div className="og-hero-art" aria-hidden="true">
            <div className="og-arch vp-arch">
              <Cloud className="cloud" />
              <Person className="vp-person" shirt="#e8b83a" />
              <Bin className="vp-bin" body="#8fb3d1" />
            </div>
            <Sparkle className="s1" /><Sparkle className="s2" />
          </div>
        </div>
      </header>

      {snap.broadcast && <div className="banner">📢 {snap.broadcast.message}</div>}

      {!zone ? <div className="card empty">Your area is no longer available. Please ask the organizer.</div> : (
        <>
          <div className="og-stats">
            <div className="og-stat s-areas"><b>{zone.resources.length}</b><span>Your cards</span></div>
            <div className="og-stat s-green"><b>{cnt.green}</b><span>Normal</span></div>
            <div className="og-stat s-yellow"><b>{cnt.yellow}</b><span>Busy</span></div>
            <div className={`og-stat s-red ${cnt.red ? 'hot' : ''}`}><b>{cnt.red}</b><span>Need attention</span></div>
          </div>

          <nav className="og-nav" aria-label="Sections">
            {NAV.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>)}
          </nav>

          <section id="vp-todo" className="og-group">
            <GroupHead no="01" tone="pink" title="Needs attention" text={`Live list for ${zone.name}`} />
            <div className="og-stack">
              <section className="card todo">
                {todo.length === 0 ? <div className="muted">Nothing needs attention right now.</div> : (
                  <ol>{todo.map(t => <li key={t.id} className={t.urgent ? 'urgent' : ''}>{t.text}</li>)}</ol>
                )}
              </section>
            </div>
          </section>

          <section id="vp-note" className="og-group">
            <GroupHead no="02" tone="sage" title="Tell your organizer" text="Tick the box to show a note to visitors too." />
            <div className="og-stack">
              <section className="card todo">
                <div className="row">
                  <input value={text} maxLength={200} placeholder="e.g. Need 10 more chairs"
                    onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && text.trim() && send()} />
                  <button className="btn primary" disabled={!text.trim()} onClick={send}>Send</button>
                </div>
                <label className="tiny" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
            </div>
          </section>

          <section id="vp-cards" className="og-group">
            <GroupHead no="03" tone="gold" title="Your cards" text="Tap a status to update visitors within seconds." />
            <div className="og-stack">
              <div className="grid admin-grid">
                {zone.resources.map(r => <ResourceControl key={r.id} r={r} reload={reload} canRemove={false} />)}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
