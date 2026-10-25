// Soft boho shapes for the sign-in cards. Pure SVG; the movement lives in globals.css (.ba-*).
const SPIRAL = 'M484.0 60.0 L484.4 60.5 L484.6 61.2 L484.5 62.0 L484.2 62.8 L483.6 63.6 L482.8 64.3 L481.7 64.7 L480.4 64.9 L479.0 64.8 L477.7 64.3 L476.4 63.5 L475.3 62.3 L474.5 60.8 L474.1 59.0 L474.1 57.2 L474.7 55.3 L475.7 53.5 L477.2 52.0 L479.2 50.7 L481.5 50.0 L484.1 49.7 L486.7 50.1 L489.2 51.1 L491.5 52.6 L493.5 54.8 L494.8 57.3 L495.6 60.2 L495.6 63.3 L494.8 66.4 L493.2 69.3 L490.9 71.8 L487.9 73.8 L484.5 75.2 L480.7 75.7 L476.7 75.4 L472.9 74.1 L469.4 72.0 L466.5 69.2 L464.3 65.6 L462.9 61.6 L462.6 57.3 L463.4 53.0 L465.3 48.9 L468.1 45.2 L471.9 42.2 L476.4 40.1 L481.4 39.0 L486.6 39.0 L491.8 40.2 L496.6 42.6 L500.8 46.0 L504.1 50.4 L506.2 55.4 L507.1 60.9 L506.6 66.5 L504.8 71.9 L501.6 76.9 L497.2 81.0 L491.8 84.2 L485.7 86.1 L479.2 86.6 L472.7 85.7 L466.5 83.3 L460.9 79.5 L456.4 74.5 L453.1 68.6 L451.4 62.1 L451.3 55.2 L452.9 48.5 L456.1 42.1';
 
export default function LoginArt() {
  return (
    <div className="auth-art" aria-hidden="true">
      <svg viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ba-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.3" fill="#6d8a5f" />
          </pattern>
        </defs>
        {/* leaves, left edge */}
        <g className="ba-sway" transform="translate(0 0)">
          <path d="M-4 96 Q22 46 70 40 Q52 84 -4 96Z" fill="#8aa77b" opacity=".9" />
          <path d="M-4 104 Q30 70 78 74 Q50 106 -4 104Z" fill="#6d8a5f" opacity=".85" />
          <path d="M-4 84 Q14 52 40 30 Q40 66 -4 84Z" fill="#a9c29a" opacity=".9" />
        </g>
        {/* mustard ring */}
        <circle className="ba-float" cx="100" cy="62" r="21" fill="none" stroke="#e8b83a" strokeWidth="10" />
        {/* terracotta dome */}
        <path className="ba-float2" d="M128 92 a34 34 0 0 1 68 0z" fill="#e2a79a" />
        {/* sage ring */}
        <circle className="ba-float2" cx="226" cy="72" r="16" fill="none" stroke="#8aa77b" strokeWidth="8" />
        {/* cream crescent */}
        <path className="ba-spin" d="M262 36 a30 30 0 1 1 0 60 a24 24 0 1 0 0 -60z" fill="#f3dfa8" />
        {/* speckled blob */}
        <circle className="ba-float" cx="318" cy="64" r="24" fill="url(#ba-dots)" stroke="#8aa77b" strokeWidth="1.2" />
        {/* peach egg */}
        <ellipse className="ba-float2" cx="376" cy="62" rx="26" ry="33" fill="#f1c9a5" />
        <ellipse cx="368" cy="50" rx="6" ry="9" fill="#fbe3cf" opacity=".7" />
        {/* pink scribble spiral, right edge */}
        <g className="ba-spin2">
          <path className="ba-draw" d={SPIRAL} fill="none" stroke="#d98f9a" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}