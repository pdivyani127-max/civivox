import Link from 'next/link';
import { SITE_NAME, SITE_TAGLINE, SPLASH_BUTTON } from '@/lib/config';
import { Cloud, Sun, Hills, Person } from '@/components/art';

// First screen: the name, one line, one button. Paper-cut hills with little people walking by.
export default function Splash() {
  return (
    <div className="splash paper">
      <Cloud className="cloud c1" /><Cloud className="cloud c2" /><Cloud className="cloud c3" />
      <Sun className="sun" />
      <div className="splash-center">
        <h1 aria-label={SITE_NAME}>
          {SITE_NAME.split('').map((ch, i) => (
            <span key={i} aria-hidden="true" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>{ch}</span>
          ))}
        </h1>
        <p className="tag">{SITE_TAGLINE}</p>
        <Link href="/welcome" className="enter">{SPLASH_BUTTON} <span className="arrow">→</span></Link>
      </div>
      <Hills className="hills far" fill="#a7c19a" edge="#bdd2b0" variant={2} />
      <Hills className="hills near" fill="#6d8a5f" edge="#86a477" variant={1} />
      <div className="walker" style={{ '--b': '13vh', '--w': '64px', '--t': '46s', '--d': '-6s' }}><Person shirt="#e8b83a" /></div>
      <div className="walker" style={{ '--b': '11vh', '--w': '58px', '--t': '58s', '--d': '-22s' }}><Person shirt="#e9b9b9" pants="#e8b83a" skin="#c98f65" hair="#1f1a17" phone /></div>
      <div className="walker" style={{ '--b': '14vh', '--w': '66px', '--t': '52s', '--d': '-34s' }}><Person shirt="#8fb3d1" pants="#26324a" hair="#7a4b2a" /></div>
      <div className="walker" style={{ '--b': '10vh', '--w': '52px', '--t': '64s', '--d': '-46s' }}><Person shirt="#fbf8f1" pants="#e9b9b9" skin="#f1c9a5" hair="#2a1d17" /></div>
    </div>
  );
}
