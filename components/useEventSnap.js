'use client';
import { useEffect, useState, useCallback } from 'react';

// Which event a dashboard box is working on. It starts as the page's main event and can be changed inside the box.
export function useChosenEvent(defaultId, events, allowAll = false) {
  const [id, setId] = useState(defaultId);
  useEffect(() => { setId(defaultId); }, [defaultId]);
  const ok = (allowAll && id === 'all') || events.some((e) => e.id === id);
  return [ok ? id : defaultId, setId];
}

// Live data (areas, current broadcast, ...) of one event, refreshed every few seconds
export function useEventSnap(eventId) {
  const [snap, setSnap] = useState(null);
  const reload = useCallback(async () => {
    if (!eventId || eventId === 'all') return;
    try {
      const r = await fetch(`/api/events/${eventId}/status`, { cache: 'no-store' });
      if (r.ok) setSnap(await r.json());
    } catch {}
  }, [eventId]);
  useEffect(() => { reload(); const t = setInterval(reload, 5000); return () => clearInterval(t); }, [reload]);
  const fresh = snap && snap.event.id === eventId ? snap : null; // never show another event's data
  return [fresh, reload];
}
