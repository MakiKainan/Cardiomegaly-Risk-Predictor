import React, { useEffect, useRef } from 'react';

// Fixed full-screen grid backdrop for the demo page. A faint grid is always
// visible; a brighter grid is masked to a spotlight that follows the cursor.
// The cursor position is written straight to CSS vars on the element (no React
// re-render per mousemove).
export default function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty('--x', `${e.clientX}px`);
      el.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={ref} className="ig-root" aria-hidden>
      <div className="ig-base" />
      <div className="ig-glow" />
    </div>
  );
}
