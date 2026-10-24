import Link from 'next/link';
import { getEvents } from '@/lib/data';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';
import { Cloud, Sun, Hills, Wave, Person, Car, ParkingSign, Bin, Bolt, Plant, PhoneQR, Shield, Signal } from '@/components/art';
export const dynamic = 'force-dynamic';
export const metadata = { title: `${SITE_NAME} · Know before you go` };

// A thin yellow line of words that slides across the page, like a ribbon
function Ticker({ items, duration = 50, reverse = false }) {
  let base = [...items];
  while (base.length < 8) base = [...base, ...items];
  const set = base.map((t, i) => <span key={i} className="tk-item">{t}<i className="tk-dot" /></span>);
  return (
    <div className="ticker" aria-hidden="true">
      <div className={reverse ? 'tk-track rev' : 'tk-track'} style={{ '--dur': `${duration}s` }}>
        <div className="tk-set">{set}</div><div className="tk-set">{set}</div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const events = getEvents();
  return (
    <>
      {/* HERO */}
      <section className="hero bleed paper">
        <Cloud className="cloud c1 drift" /><Cloud className="cloud c2 drift" /><Sun className="sun" />
        <div className="hero-text">
          <p className="eyebrow">{SITE_NAME} · live event companion</p>
          <h1>Know before<br />you go.</h1>
          <p className="lead2">Live parking, crowd, waste and power for any event, on any phone. No app. No login.</p>
          <div className="btnrow">
            <a href="#events" className="enter">See live events <span className="arrow">↓</span></a>
            <Link href="/start" className="ghost">Volunteer or organizer sign-in</Link>
          </div>
        </div>
        <Hills className="hills far px1" fill="#a7c19a" edge="#bdd2b0" variant={2} />
        <Hills className="hills near px2" fill="#6d8a5f" edge="#86a477" variant={1} />
        <div className="walker" style={{ '--b': '9vh', '--w': '60px', '--t': '50s', '--d': '-8s' }}><Person shirt="#e8b83a" /></div>
        <div className="walker" style={{ '--b': '7vh', '--w': '54px', '--t': '62s', '--d': '-30s' }}><Person shirt="#e9b9b9" pants="#e8b83a" skin="#c98f65" hair="#1f1a17" phone /></div>
        <div className="walker" style={{ '--b': '10vh', '--w': '62px', '--t': '56s', '--d': '-42s' }}><Person shirt="#8fb3d1" pants="#26324a" hair="#7a4b2a" /></div>
        <Wave className="wave" fill="#f6f1e7" />
      </section>

      {/* AT A GLANCE */}
      <section id="how" className="glance bleed">
        <h2 className="reveal">Explore your event at a glance</h2>
        <p className="sub reveal d1">Three things people worry about most, answered before they leave home.</p>
        <div className="panels">
          <article className="panel tilt a reveal d1" style={{ '--r': '-3deg' }}>
            <div className="art">
              <ParkingSign className="i-sign" /><Car className="i-car" />
            </div>
            <h3>Find a parking spot</h3>
            <p>See which lots have space, and when one is about to fill up.</p>
          </article>
          <article className="panel tilt b reveal d2" style={{ '--r': '2deg' }}>
            <div className="art">
              <Person className="i-p1" shirt="#e8b83a" /><Person className="i-p2" shirt="#e9b9b9" pants="#6d8a5f" skin="#c98f65" hair="#1f1a17" phone /><Person className="i-p3" shirt="#fbf8f1" pants="#26324a" hair="#7a4b2a" />
            </div>
            <h3>Feel the crowd</h3>
            <p>Know which halls are calm and which are packed, without cameras.</p>
          </article>
          <article className="panel tilt c reveal d3" style={{ '--r': '-2deg' }}>
            <div className="art">
              <Bin className="i-bin" body="#8fb3d1" /><Bolt className="i-bolt" />
            </div>
            <h3>Stay comfortable</h3>
            <p>Spot full bins and power cuts before you walk all the way there.</p>
          </article>
        </div>
        <div className="center"><Link href="/events" className="enter">Browse events <span className="arrow">→</span></Link></div>
      </section>

      {/* HAPPENING NOW: a calm band framed by two slowly moving yellow lines */}
      <section id="events" className="live bleed">
        <Ticker items={['Happening now', ...events.map(e => e.name)]} duration={46} />
        <div className="live-body">
          <div className="ribbon-head reveal"><h2>Happening now</h2><span>Tap an event to see it live</span></div>
          <div className="strip">
            {events.map(e => (
              <Link key={e.id} href={`/event/${e.id}`} className="ev">
                <b>{e.name}</b>
                <span>{e.venue}</span>
                <small>{e.date}</small>
              </Link>
            ))}
            {events.length === 0 && <div className="ev"><b>Events will appear here</b></div>}
          </div>
        </div>
        <Ticker items={['Know before you go', 'Scan', 'See', 'Move', 'No app · No login']} duration={58} reverse />
      </section>

      {/* SCAN */}
      <section className="split bleed">
        <div className="split-art reveal">
          <Cloud className="cloud sc1 drift" /><Plant className="plant" />
          <PhoneQR className="phone" />
        </div>
        <div className="split-text reveal d1">
          <p className="eyebrow">Zero friction</p>
          <h2>No app.<br />No login.<br />Just scan.</h2>
          <p>Point your phone camera at a {SITE_NAME} code and the live page opens in your browser. That is all there is to it.</p>
          <Link href="/events" className="ghost dark">See an event →</Link>
        </div>
      </section>

      {/* STATEMENT + FEATURES */}
      <section className="statement bleed">
        <h2 className="reveal">Built for crowds,<br />made for calm.</h2>
        <div className="features">
          <div className="feat reveal d1"><Bolt className="fi" /><h3>Instant updates</h3><p>Organizers and volunteers update from their phones. Visitors see it within seconds.</p></div>
          <div className="feat reveal d2"><Shield className="fi" /><h3>Private by design</h3><p>Crowd levels come from sound, never from cameras or faces.</p></div>
          <div className="feat reveal d3"><Signal className="fi" /><h3>Works on any phone</h3><p>Light pages that still load when the network is busy.</p></div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta bleed paper">
        <h2 className="reveal">Ready to begin?</h2>
        <p className="reveal d1">Visitors need nothing. Volunteers and organizers sign in.</p>
        <div className="reveal d2 btnrow"><Link href="/events" className="enter">Browse events <span className="arrow">→</span></Link><Link href="/start" className="ghost">Sign in</Link></div>
      </section>

      {/* FOOTER */}
      <footer className="foot bleed">
        <Hills className="hills-top" fill="#2d4f3d" edge="#3f6b4f" variant={3} />
        <div className="foot-body">
          <div className="foot-brand"><b>{SITE_NAME}</b><span>{SITE_TAGLINE}</span></div>
          <nav className="foot-links">
            <Link href="/events">Browse events</Link><Link href="/login/volunteer">Volunteer</Link><Link href="/login/organizer">Organizer</Link>
          </nav>
          <nav className="foot-links">
            <Link href="/sample-letter">Sample permission letter</Link>
          </nav>
        </div>
        <p className="foot-fine">© {SITE_NAME} · Idea Lab project</p>
      </footer>
    </>
  );
}
