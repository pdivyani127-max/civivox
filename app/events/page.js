import Link from 'next/link';
import { getEvents } from '@/lib/data';
import { Cloud, Person, Car, ParkingSign, Bin, Bolt, Plant, PhoneQR } from '@/components/art';
import { Sparkle } from '@/components/Deco';
export const dynamic = 'force-dynamic';

const TINTS = ['#f3d3d3', '#dbe9f4', '#f3dfa8', '#dfe9d8'];

function pretty(d) {
  try {
    const x = new Date(`${d}T00:00:00`);
    return isNaN(x) ? d : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
}

// A small illustration inside each arch, picked from the event name (falls back to rotating)
function artFor(name = '', i = 0) {
  const n = name.toLowerCase();
  const kind = /sport|match|race|run|stadium/.test(n) ? 'park' : /tech|hack|code|expo/.test(n) ? 'tech'
    : /garba|cultur|dance|music|night|concert/.test(n) ? 'crowd' : ['crowd', 'tech', 'park', 'green'][i % 4];
  const pos = (o) => ({ position: 'absolute', ...o });
  if (kind === 'park') return <>
    <Cloud className="cloud" style={{ top: '12%', left: '10%', width: '34%' }} />
    <ParkingSign style={pos({ left: '14%', bottom: '14%', width: '18%' })} />
    <Car className="w-bobs" style={pos({ right: '6%', bottom: '15%', width: '62%' })} />
  </>;
  if (kind === 'tech') return <>
    <Cloud className="cloud" style={{ top: '10%', right: '8%', left: 'auto', width: '30%' }} />
    <PhoneQR className="w-bobs" style={pos({ left: '30%', top: '18%', width: '40%', height: 'auto' })} />
    <Bolt className="w-bobs" style={pos({ right: '12%', bottom: '18%', width: '15%' })} />
    <Plant style={pos({ left: '10%', bottom: '8%', width: '20%' })} />
  </>;
  if (kind === 'green') return <>
    <Cloud className="cloud" style={{ top: '12%', left: '12%', width: '32%' }} />
    <Bin style={pos({ left: '14%', bottom: '12%', width: '28%' })} body="#8fb3d1" />
    <Person style={pos({ left: '52%', bottom: '10%', width: '26%' })} shirt="#e8b83a" />
  </>;
  return <>
    <Cloud className="cloud" style={{ top: '11%', left: '9%', width: '34%' }} />
    <Person style={pos({ left: '8%', bottom: '10%', width: '27%' })} shirt="#e8b83a" />
    <Person style={pos({ left: '35%', bottom: '15%', width: '27%' })} shirt="#e9b9b9" pants="#6d8a5f" skin="#c98f65" hair="#1f1a17" phone />
    <Person style={pos({ left: '62%', bottom: '8%', width: '27%' })} shirt="#fbf8f1" pants="#26324a" hair="#7a4b2a" />
  </>;
}

export default function Events() {
  const events = getEvents();
  return (
    <section className="ev-page bleed">
      <header className="ev-head">
        <Sparkle className="inline" />
        <h1 className="w-h1 ev-h1"><span className="w-line"><span style={{ '--i': 0 }}>Choose an <em>event</em></span></span></h1>
        <p className="w-lead ev-sub w-rise" style={{ '--i': 2 }}>No app, no login. Pick an event to see live crowd, parking, waste and power status.</p>
      </header>

      <div className="ev-list">
        {events.map((e, i) => (
          <article key={e.id} className="ev-row" style={{ '--bg': TINTS[i % TINTS.length] }}>
            <Link href={`/event/${e.id}`} className="ev-frame reveal" aria-label={e.name}>
              <i className="ev-blob" />
              <div className="ev-arch"><div className="ev-art">{artFor(e.name, i)}</div></div>
              <Sparkle className="ev-sp" />
            </Link>
            <div className="ev-text reveal d1">
              <span className="ev-no">{String(i + 1).padStart(2, '0')}</span>
              <h2><Link href={`/event/${e.id}`}>{e.name}</Link></h2>
              <i className="ev-rule" />
              <div className="ev-meta">
                {e.venue && <span className="ev-chip"><i />{e.venue}</span>}
                {e.date && <span className="ev-chip date"><i />{pretty(e.date)}</span>}
              </div>
              {e.description && <p>{e.description}</p>}
              <Link href={`/event/${e.id}`} className="enter ev-go">See live status <span className="arrow">→</span></Link>
            </div>
          </article>
        ))}
        {events.length === 0 && <div className="ev-empty">No events yet.</div>}
      </div>
    </section>
  );
}