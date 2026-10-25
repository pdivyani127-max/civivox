import Link from 'next/link';
import { getEvents } from '@/lib/data';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';
import { Cloud, Sun, Hills, Person, Car, ParkingSign, Bin, Bolt, Plant, PhoneQR, Shield, Signal } from '@/components/art';
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

// Four-point twinkling star
function Sparkle({ className = '', style }) {
  return (
    <svg viewBox="0 0 40 40" className={`w-spark ${className}`} style={style} aria-hidden="true">
      <path d="M20 0C21.5 13 27 18.5 40 20C27 21.5 21.5 27 20 40C18.5 27 13 21.5 0 20C13 18.5 18.5 13 20 0Z" fill="currentColor" />
    </svg>
  );
}

// Thin orbit lines with a little planet travelling along one of them
function Orbit({ className = '' }) {
  return (
    <svg viewBox="0 0 600 600" className={`w-orbit ${className}`} aria-hidden="true">
      <g transform="rotate(-24 300 300)">
        <ellipse cx="300" cy="300" rx="285" ry="190" fill="none" stroke="#c9a24a" strokeWidth="1.3" />
        <circle r="7" fill="#e8b83a"><animateMotion dur="16s" repeatCount="indefinite" path="M15 300a285 190 0 1 0 570 0a285 190 0 1 0 -570 0" /></circle>
      </g>
      <g transform="rotate(32 300 300)">
        <ellipse cx="300" cy="300" rx="270" ry="150" fill="none" stroke="#8fb3d1" strokeWidth="1.3" />
        <circle r="5" fill="#d98f9a"><animateMotion dur="22s" repeatCount="indefinite" path="M30 300a270 150 0 1 1 540 0a270 150 0 1 1 -540 0" /></circle>
      </g>
    </svg>
  );
}

const TINTS = ['#f3d3d3', '#dbe9f4', '#f3dfa8', '#dfe9d8'];

export default function Welcome() {
  const events = getEvents();
  return (
    <>
      {/* HERO */}
      <section className="w-hero bleed">
        <div className="w-hero-in">
          <div className="w-copy">
            <p className="eyebrow w-rise" style={{ '--i': 0 }}>{SITE_NAME} · live event companion</p>
            <h1 className="w-h1">
              <span className="w-line"><span style={{ '--i': 1 }}>Know before</span></span>
              <span className="w-line"><span style={{ '--i': 2 }}>you <em>go.</em></span></span>
            </h1>
            <p className="w-lead w-rise" style={{ '--i': 3 }}>Live parking, crowd, waste and power for any event, on any phone. No app. No login.</p>
            <div className="w-btns w-rise" style={{ '--i': 4 }}>
              <a href="#events" className="enter">See live events <span className="arrow">↓</span></a>
              <Link href="/start" className="ghost">Volunteer or organizer sign-in</Link>
            </div>
          </div>

          <div className="w-stage">
            <Orbit />
            <div className="w-blob">
              <Sun className="sun" />
              <Cloud className="cloud" /><Cloud className="cloud c2" />
              <PhoneQR className="w-phone" />
              <Hills className="hills far" fill="#a7c19a" edge="#bdd2b0" variant={2} />
              <Hills className="hills near" fill="#6d8a5f" edge="#86a477" variant={1} />
              <div className="w-walk"><Person shirt="#e8b83a" /></div>
              <div className="w-walk b"><Person shirt="#e9b9b9" pants="#e8b83a" skin="#c98f65" hair="#1f1a17" phone /></div>
            </div>
            <div className="w-chip c1"><i className="dot g" />Parking Lot A <b>Open</b></div>
            <div className="w-chip c2"><i className="dot y" />Main Hall <b>Busy</b></div>
            <div className="w-chip c3"><i className="dot r" />Bin 2 <b>Full</b></div>
            <Sparkle className="s1" /><Sparkle className="s2" /><Sparkle className="s3" />
            <span className="w-dotc d1" /><span className="w-dotc d2" />
          </div>
        </div>
      </section>

      <Ticker items={['Know before you go', 'Scan', 'See', 'Move', 'No app · No login']} duration={58} />

      {/* AT A GLANCE */}
      <section id="how" className="w-cats bleed">
        <div className="w-head reveal">
          <Sparkle className="inline" />
          <h2>Explore your event at a glance</h2>
          <p>Three things people worry about most, answered before they leave home.</p>
        </div>
        <div className="w-circles">
          <article className="w-cat reveal d1">
            <div className="w-disc" style={{ '--bg': '#f3dfa8' }}><i className="w-ring" />
              <div className="w-in">
                <ParkingSign style={{ position: 'absolute', left: '16%', bottom: '18%', width: '20%' }} />
                <Car className="w-bobs" style={{ position: 'absolute', right: '8%', bottom: '20%', width: '56%' }} />
              </div>
            </div>
            <h3>Find a parking spot</h3>
            <p>See which lots have space, and when one is about to fill up.</p>
          </article>
          <article className="w-cat reveal d2">
            <div className="w-disc" style={{ '--bg': '#dbe9f4' }}><i className="w-ring" />
              <div className="w-in">
                <Person style={{ position: 'absolute', left: '12%', bottom: '14%', width: '24%' }} shirt="#e8b83a" />
                <Person style={{ position: 'absolute', left: '38%', bottom: '20%', width: '24%' }} shirt="#e9b9b9" pants="#6d8a5f" skin="#c98f65" hair="#1f1a17" phone />
                <Person style={{ position: 'absolute', left: '64%', bottom: '12%', width: '24%' }} shirt="#fbf8f1" pants="#26324a" hair="#7a4b2a" />
              </div>
            </div>
            <h3>Feel the crowd</h3>
            <p>Know which halls are calm and which are packed, without cameras.</p>
          </article>
          <article className="w-cat reveal d3">
            <div className="w-disc" style={{ '--bg': '#dfe9d8' }}><i className="w-ring" />
              <div className="w-in">
                <Bin style={{ position: 'absolute', left: '20%', bottom: '16%', width: '30%' }} body="#8fb3d1" />
                <Bolt className="w-bobs" style={{ position: 'absolute', right: '20%', bottom: '20%', width: '24%' }} />
              </div>
            </div>
            <h3>Stay comfortable</h3>
            <p>Spot full bins and power cuts before you walk all the way there.</p>
          </article>
        </div>
        <div className="center reveal d2" style={{ marginTop: 50 }}><Link href="/events" className="enter">Browse events <span className="arrow">→</span></Link></div>
      </section>

      {/* HAPPENING NOW */}
      <section id="events" className="w-live bleed">
        <div className="w-head reveal">
          <Sparkle className="inline" />
          <h2>Happening now</h2>
          <p>Tap an event to see it live.</p>
        </div>
        <div className="w-arches">
          {events.map((e, i) => (
            <Link key={e.id} href={`/event/${e.id}`} className="w-arch reveal" style={{ '--bg': TINTS[i % TINTS.length], '--r': '0deg' }}>
              <div className="orb">{(e.name || '?').trim().charAt(0)}</div>
              <b>{e.name}</b>
              {e.venue && <span>{e.venue}</span>}
              <small>{e.date}</small>
            </Link>
          ))}
          {events.length === 0 && <div className="w-arch" style={{ '--bg': TINTS[0] }}><b>Events will appear here</b></div>}
        </div>
      </section>

      {/* SCAN */}
      <section className="w-scan bleed">
        <div className="w-scan-art reveal">
          <Orbit />
          <div className="w-ellipse">
            <Cloud className="cloud" /><Plant className="w-plant" />
            <PhoneQR className="w-phone2" />
          </div>
          <Sparkle className="s1" /><Sparkle className="s3" />
        </div>
        <div className="w-scan-text reveal d1">
          <p className="eyebrow">Zero friction</p>
          <h2>No app.<br />No login.<br />Just scan.</h2>
          <p className="w-scan-p">Point your phone camera at a {SITE_NAME} code and the live page opens in your browser. That is all there is to it.</p>
          <Link href="/events" className="ghost dark">See an event →</Link>
        </div>
      </section>

      {/* STATEMENT + FEATURES */}
      <section className="w-dark bleed">
        <Sparkle className="s1" /><Sparkle className="s2" />
        <h2 className="reveal">Built for crowds,<br />made for calm.</h2>
        <div className="w-feats">
          <div className="w-feat reveal d1"><div className="w-ic"><i className="w-ring" /><Bolt style={{ width: 34 }} /></div><h3>Instant updates</h3><p>Organizers and volunteers update from their phones. Visitors see it within seconds.</p></div>
          <div className="w-feat reveal d2"><div className="w-ic"><i className="w-ring" /><Shield style={{ width: 40 }} /></div><h3>Private by design</h3><p>Crowd levels come from sound, never from cameras or faces.</p></div>
          <div className="w-feat reveal d3"><div className="w-ic"><i className="w-ring" /><Signal style={{ width: 40 }} /></div><h3>Works on any phone</h3><p>Light pages that still load when the network is busy.</p></div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-cta bleed">
        <div className="w-cta-blob reveal">
          <Sparkle className="s1" /><Sparkle className="s3" />
          <h2>Ready to begin?</h2>
          <p>Visitors need nothing. Volunteers and organizers sign in.</p>
          <div className="w-btns" style={{ justifyContent: 'center' }}><Link href="/events" className="enter">Browse events <span className="arrow">→</span></Link><Link href="/start" className="ghost">Sign in</Link></div>
        </div>
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