import React, { useEffect, useRef, useState } from 'react';

// Native IntersectionObserver. Fires reliably on scroll and flips back to
// false when the element leaves the viewport, so the animation replays when
// you scroll back up. (motion's whileInView was not triggering here.)
// `once` latches inView=true the first time the element appears and stops
// observing. IntersectionObserver measures the *transformed* box, so an element
// that slides on reveal can cross the threshold back and forth and oscillate
// ("violent shake") — latching breaks that loop. Leave once=false for things
// that only change size (e.g. bars), which don't move and so don't oscillate.
export function useInView<T extends HTMLElement = HTMLDivElement>({ once = false } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return { ref, inView };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  // ponytail: declared because this project has no @types/react, so TS won't
  // inject the special `key` attribute on custom components. React strips it.
  key?: React.Key;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Vertical travel distance in px. */
  y?: number;
}

// Scroll-reveal wrapper: slides up + fades in when scrolled into view, and
// resets when scrolled back out.
export default function Reveal({ children, className = '', id, delay = 0, y = 40 }: RevealProps) {
  const { ref, inView } = useInView({ once: true });
  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
