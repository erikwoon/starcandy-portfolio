import { useEffect, useRef } from 'react';

/**
 * Reveals `.reveal` elements inside the returned ref as they scroll into
 * view, by toggling `is-visible` (see .reveal in App.css). Re-scans on
 * every render so it also picks up elements that appear after a tab
 * switch; already-visible elements are left alone so nothing re-animates.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
    els.forEach((el, i) => el.style.setProperty('--reveal-index', String(i)));

    const toObserve = els.filter((el) => !el.classList.contains('is-visible'));
    if (toObserve.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    toObserve.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });

  return ref;
}
