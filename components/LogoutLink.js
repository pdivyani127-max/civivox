'use client';

// "Log out" in the top bar. Looks like the other top-bar links; signs out, then goes to the role page.
export default function LogoutLink() {
  const logout = async (e) => {
    e.preventDefault();
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
    window.location.href = '/start';
  };
  return <a href="/start" className="adm" onClick={logout}>Log out</a>;
}