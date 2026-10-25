// 'use client';
// import { useRouter, usePathname } from 'next/navigation';

// // A small paper-cut "back" button for the top bar. Goes to the previous page; if there is none, to a sensible home.
// export default function BackButton() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const go = () => {
//     const cameFromHere = document.referrer && new URL(document.referrer).origin === window.location.origin;
//     if (cameFromHere || window.history.length > 1) router.back();
//     else router.push(pathname === '/welcome' ? '/' : '/welcome');
//   };
//   return (
//     <button type="button" className="back-btn" onClick={go} aria-label="Go back" title="Back">
//       <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
//       <span>Back</span>
//     </button>
//   );
// }

'use client';
import { useRouter, usePathname } from 'next/navigation';

// A small paper-cut "back" button for the top bar. Goes to the previous page; if there is none, to a sensible home.
export default function BackButton({ staff = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const go = () => {
    // Visitor page opened in a new tab from the dashboard: there is no earlier page, so staff go back to the dashboard.
    if (staff && window.history.length <= 1 && pathname.startsWith('/event/')) { router.push('/admin'); return; }
    // Everything below is the original behaviour, unchanged.
    const cameFromHere = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (cameFromHere || window.history.length > 1) router.back();
    else router.push(pathname === '/welcome' ? '/' : '/welcome');
  };
  return (
    <button type="button" className="back-btn" onClick={go} aria-label="Go back" title="Back">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>Back</span>
    </button>
  );
}