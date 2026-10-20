'use client';
import { useState } from 'react';
import SampleLetter from './SampleLetter';
import { noFillName, noFillPassword } from '@/lib/noautofill';

const TITLES = { volunteer: 'Volunteer login', organizer: 'Organizer', owner: 'Site owner login' };

export default function LoginForm({ role, demoMode }) {
  const [mode, setMode] = useState('signin'); // organizers can also create an account
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [sample, setSample] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const signup = role === 'organizer' && mode === 'signup';
  const needName = role !== 'owner';
  const pwType = show ? 'text' : 'password';

  // Values are read from the form when you press the button, so browser autofill / saved passwords always count
  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      if (signup) {
        if (fd.get('password') !== fd.get('confirm')) { setErr('The two passwords do not match'); setBusy(false); return; }
        fd.delete('confirm');
        const res = await fetch('/api/auth/organizer', { method: 'POST', body: fd });
        let data = {}; try { data = await res.json(); } catch {}
        if (res.ok) { window.location.href = '/admin'; return; }
        setErr(data.error || 'Could not create the account');
      } else {
        const res = await fetch('/api/admin/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, name: String(fd.get('name') || ''), password: String(fd.get('password') || '') }),
        });
        let data = {}; try { data = await res.json(); } catch {}
        if (res.ok) { window.location.href = '/admin'; return; }
        setErr(data.error || 'Could not sign in');
      }
    } catch { setErr('Could not reach the server. Is the site still running?'); }
    setBusy(false);
  }

  return (
    <>
      <form className="card login wide" onSubmit={onSubmit} autoComplete="off">
        <a href="/start" className="back">← Choose your role</a>
        <h1>{signup ? 'Create organizer account' : TITLES[role]}</h1>
        {role === 'organizer' && (
          <div className="tabs">
            <button type="button" className={mode === 'signin' ? 'tab on' : 'tab'} onClick={() => { setMode('signin'); setErr(''); }}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'tab on' : 'tab'} onClick={() => { setMode('signup'); setErr(''); }}>Create account</button>
          </div>
        )}
        <p className="muted">
          {role === 'volunteer' && 'Use the name and password your organizer gave you.'}
          {role === 'owner' && 'For the person who runs this website.'}
          {role === 'organizer' && !signup && 'Sign in with the organizer name and password you created.'}
          {signup && 'Tell us about your event. You will add areas, volunteers and live updates after this.'}
        </p>

        {needName && <input name="name" {...noFillName} placeholder={role === 'organizer' ? 'Your name or organization' : 'Your name'} />}
        <input name="password" type={pwType} {...noFillPassword} placeholder="Password" />

        {signup && (
          <>
            <input name="confirm" type={pwType} {...noFillPassword} placeholder="Confirm password (6+ characters)" />
            <input name="eventName" autoComplete="off" placeholder="Event name" />
            <input name="venue" autoComplete="off" placeholder="Venue (optional)" />
            <label className="filebox">
              <span>Permission letter (PDF, PNG or JPG, max 2 MB)</span>
              <input name="letter" type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                onChange={e => setHasFile(!!e.target.files?.length)} />
            </label>
            {demoMode && (
              <div className="check">
                <input id="demoLetter" name="demoLetter" value="1" type="checkbox" disabled={hasFile} />
                <label htmlFor="demoLetter">This is the sample letter or permission letter format</label>
                <button type="button" className="linkish" onClick={() => setSample(true)}>View it</button>
              </div>
            )}
          </>
        )}

        <label className="check small">
          <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />
          <span>Show password</span>
        </label>

        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Please wait...' : signup ? 'Create account' : 'Log in'}
        </button>
        {err && <div className="err">{err}</div>}
      </form>

      {sample && (
        <div className="modal" onClick={() => setSample(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-bar">
              <b>Sample permission letter</b>
              <button type="button" className="btn small" onClick={() => setSample(false)}>✕ Close</button>
            </div>
            <SampleLetter />
            <div className="modal-bar">
              <a href="/sample-letter" target="_blank" className="tiny">Open printable version in a new tab</a>
              <button type="button" className="btn primary small" onClick={() => setSample(false)}>Back to sign-up</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
