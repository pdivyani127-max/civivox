// The moving picture on the left of the sign-in pages: sky, sun, clouds, drifting shapes, hills and walking people.
import { Sun, Cloud, Hills, Person, Bin, PhoneQR, Shield } from './art';
import { Sparkle } from './Deco';
import LoginArt from './LoginArt';

const SLIDES = ['Know before you go.', 'Calm crowds, happy events.', 'Every area, live.'];

export default function LoginScene({ role }) {
  return (
    <aside className={`lg-art is-${role}`}>
      <Sun className="sun" />
      <Cloud className="cloud" /><Cloud className="cloud c2" />

      <span className="lg-pill live"><i className="dot g" />Live event companion</span>
      <a href="/events" className="lg-pill link">See live events →</a>

      <div className="lg-shapes" aria-hidden="true"><LoginArt /></div>
      <div className="w-chip c1" aria-hidden="true"><i className="dot g" />Parking Lot A <b>Open</b></div>
      <div className="w-chip c2" aria-hidden="true"><i className="dot y" />Main Hall <b>Busy</b></div>
      <Sparkle className="s1" /><Sparkle className="s3" />

      <Hills className="hills far" fill="#a7c19a" edge="#bdd2b0" variant={2} />
      <Hills className="hills near" fill="#6d8a5f" edge="#86a477" variant={1} />
      <div className="lg-walk" aria-hidden="true"><Person shirt="#e8b83a" /></div>
      <div className="lg-walk b" aria-hidden="true"><Person shirt="#e9b9b9" pants="#e8b83a" skin="#c98f65" hair="#1f1a17" phone /></div>
      {role === 'volunteer' && <Bin className="lg-prop" body="#8fb3d1" style={{ position: 'absolute', right: '13%', bottom: '19%', width: '15%', zIndex: 3 }} />}
      {role === 'organizer' && <PhoneQR className="lg-prop w-bobs" style={{ position: 'absolute', left: '41%', bottom: '27%', width: '18%', height: 'auto', zIndex: 3 }} />}
      {role === 'owner' && <Shield className="lg-prop w-bobs" style={{ position: 'absolute', left: '43%', bottom: '28%', width: '15%', height: 'auto', zIndex: 3 }} />}

      <div className="lg-cap">
        <div className="lg-slides">{SLIDES.map((t, k) => <p key={t} style={{ '--k': k }}>{t}</p>)}</div>
        <div className="lg-dots" aria-hidden="true">{SLIDES.map((t, k) => <i key={t} style={{ '--k': k }} />)}</div>
      </div>
    </aside>
  );
}