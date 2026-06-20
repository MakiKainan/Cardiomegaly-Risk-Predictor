import React from 'react';

// Full-screen grid of tiles that scale in (cover) then scale out (reveal) in a
// diagonal wave, for an artistic page transition. `mode` is driven by App:
//   idle   → tiles hidden (scale 0), non-interactive
//   cover  → tiles grow to fill the screen, hiding the outgoing view
//   reveal → tiles shrink away, exposing the swapped-in view
const COLS = 14;
const ROWS = 9;
const STEP = 14; // ms stagger per diagonal step
const DUR = 300; // ms per tile

// How long a cover (or reveal) takes end-to-end. App waits this long before
// swapping the view, so the screen is fully covered at the swap.
export const MOSAIC_COVER_MS = (COLS - 1 + ROWS - 1) * STEP + DUR;

export default function MosaicWipe({ mode }: { mode: 'idle' | 'cover' | 'reveal' }) {
  const covered = mode === 'cover';
  const active = mode !== 'idle';
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: '2px',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const delay = (Math.floor(i / COLS) + (i % COLS)) * STEP;
        return (
          <div
            key={i}
            style={{
              background: '#0E2038',
              boxShadow: 'inset 0 0 0 1px rgba(30,111,217,0.18)',
              transform: covered ? 'scale(1)' : 'scale(0)',
              transition: `transform ${DUR}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
              willChange: 'transform',
            }}
          />
        );
      })}
    </div>
  );
}
