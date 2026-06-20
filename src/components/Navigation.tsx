import React from 'react';

// `onSection` lets App decide what a link does: smooth-scroll on the landing
// page, or wipe back to the landing page and then scroll when on the demo page.
export default function Navigation({ onSection }: { onSection: (id: string) => void }) {
  const link = 'text-white/80 hover:text-white transition-colors cursor-pointer';
  return (
    <nav id="top-navbar" className="px-6 pt-4 relative z-50">
      {/* w-fit so the glass pill hugs the links instead of spanning the page */}
      <div
        id="navbar-glass-container"
        className="liquid-glass rounded-xl px-5 py-2 flex items-center justify-center flex-wrap gap-5 sm:gap-8 w-fit mx-auto shadow-md text-[11px] uppercase tracking-widest"
      >
        <button onClick={() => onSection('research-overview')} className={link}>Research</button>
        <button onClick={() => onSection('model-comparison')} className={link}>Models</button>
        <button onClick={() => onSection('explainability')} className={link}>Results</button>
        <button onClick={() => onSection('research-overview')} className={link}>About</button>
      </div>
    </nav>
  );
}
