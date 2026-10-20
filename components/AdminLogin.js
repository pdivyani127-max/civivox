'use client';
import { useState } from 'react';

export default function AdminLogin() {
  const [volunteer, setVolunteer] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: volunteer ? name : '', password }),
    });
    if (res.ok) window.location.reload();
    else setError(volunteer ? 'Wrong name or password. Try again.' : 'Wrong password. Try again.');
  }

  return (
    <div className="card login">
      <h1>{volunteer ? 'Volunteer login' : 'Admin login'}</h1>
      <p className="muted">{volunteer ? 'Use the name and password your organizer gave you.' : 'For event organizers only.'}</p>
      {volunteer && <input placeholder="Your name" value={name} autoFocus onChange={e => setName(e.target.value)} />}
      <input type="password" placeholder="Password" value={password} autoFocus={!volunteer}
        onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button className="btn primary" onClick={submit}>Log in</button>
      {error && <div className="err">{error}</div>}
      <button className="linkbtn" style={{ color: '#2e5c8a', fontSize: '.85rem' }} onClick={() => { setVolunteer(!volunteer); setError(''); }}>
        {volunteer ? '← Back to admin login' : "I'm a volunteer"}
      </button>
    </div>
  );
}
