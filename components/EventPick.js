'use client';

// "For event: [ ... ]" dropdown shown at the top of each dashboard box
export default function EventPick({ events, value, onChange, allowAll = false }) {
  return (
    <div className="pick">
      <label>For event:</label>
      <select value={value} onChange={(e) => onChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
        {allowAll && <option value="all">All my events</option>}
        {events.map((e) => <option key={e.id} value={e.id}>{e.name}{e.date ? ` · ${e.date}` : ''}</option>)}
      </select>
    </div>
  );
}
