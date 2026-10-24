'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Small, light helper: fades sections in as they scroll into view, and feeds the hills/clouds parallax.
export default function ScrollFX() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('.reveal');
    let io;
    if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('in'));
    else {
      io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      els.forEach(e => io.observe(e));
    }
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty('--sy', String(window.scrollY)); });
    };
    if (!reduce) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    return () => { io && io.disconnect(); window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [pathname]);
  return null;
}
