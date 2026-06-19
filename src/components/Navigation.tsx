import React from 'react';

export default function Navigation() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav id="top-navbar" className="px-6 md:px-12 lg:px-16 pt-4 relative z-50">
      <div id="navbar-glass-container" className="liquid-glass rounded-xl px-5 py-2 flex items-center justify-center max-w-7xl mx-auto shadow-md">

        {/* Center: Links (hidden on mobile, visible md+) */}
        <div id="nav-center-links" className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest">
          <button
            onClick={() => scrollToSection('research-overview')}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            Research
          </button>
          <button
            onClick={() => scrollToSection('model-comparison')}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            Models
          </button>
          <button
            onClick={() => scrollToSection('explainability')}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            Results
          </button>
          <button
            onClick={() => scrollToSection('research-overview')}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            About
          </button>
        </div>

      </div>
    </nav>
  );
}
