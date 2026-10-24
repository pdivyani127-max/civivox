'use client';
// Back / print buttons for the sample letter page
export default function LetterActions() {
  const back = () => { if (window.history.length > 1) window.history.back(); else window.location.href = '/login/organizer'; };
  return (
    <div className="letter-actions">
      <button className="btn" onClick={back}>← Back to sign-up</button>
      <button className="btn primary" onClick={() => window.print()}>🖨 Print / save as PDF</button>
    </div>
  );
}
