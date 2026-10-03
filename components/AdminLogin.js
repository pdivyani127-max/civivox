'use client';
import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    });
    if (res.ok) window.location.reload();
    else setError('Wrong password. Try again.');
  }

  return (
    <div className="card login">
      <h1>Admin login</h1>
      <p className="muted">For event organizers only.</p>
      <input type="password" placeholder="Password" value={password} autoFocus
        onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      <button className="btn primary" onClick={submit}>Log in</button>
      {error && <div className="err">{error}</div>}
    </div>
  );
}
