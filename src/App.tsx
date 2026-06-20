import React, { useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import AnimatedHeading from './components/AnimatedHeading';
import FadeIn from './components/FadeIn';
import AboutSection from './components/AboutSection';
import ModelComparisonSection from './components/ModelComparisonSection';
import ExplainabilitySection from './components/ExplainabilitySection';
import TryDemoSection from './components/TryDemoSection';
import FooterSection from './components/FooterSection';
import GlowButton from './components/GlowButton';
import MosaicWipe, { MOSAIC_COVER_MS } from './components/MosaicWipe';
import InteractiveGrid from './components/InteractiveGrid';

type View = 'landing' | 'demo';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [mosaic, setMosaic] = useState<'idle' | 'cover' | 'reveal'>('idle');

  const defaultVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-medical-analysis-on-a-computer-screen-40176-large.mp4';

  // Swap pages behind a mosaic wipe: cover the screen, swap the view + scroll,
  // then reveal. Optional scrollId scrolls to a section once the new view is up.
  const transitionTo = useCallback((next: View, scrollId?: string) => {
    setMosaic('cover');
    window.setTimeout(() => {
      setView(next);
      setMosaic('reveal');
      window.setTimeout(() => {
        if (scrollId) document.getElementById(scrollId)?.scrollIntoView();
        else window.scrollTo(0, 0);
      }, 50);
      window.setTimeout(() => setMosaic('idle'), MOSAIC_COVER_MS);
    }, MOSAIC_COVER_MS);
  }, []);

  // Nav links: just scroll when already on the landing page, otherwise wipe
  // back to the landing page and scroll there.
  const handleSection = useCallback((id: string) => {
    if (view === 'landing') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      transitionTo('landing', id);
    }
  }, [view, transitionTo]);

  return (
    <div id="research-landing-pages" className="relative font-sans bg-[#0A1628] overflow-x-hidden">
      <MosaicWipe mode={mosaic} />

      {view === 'landing' ? (
        <>
          {/* SECTION 1 — HERO & VIDEO BACKGROUND */}
          <section id="hero-viewport" className="relative min-h-screen flex flex-col justify-between">
            {/* Full-screen Video Background */}
            <video
              id="hero-bg-video"
              src={defaultVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
              referrerPolicy="no-referrer"
            />

            {/* Immersive HUD background mesh and scanline overlay */}
            <div id="immersive-hud-overlay" className="absolute inset-0 bg-medical-mesh pointer-events-none z-[1]">
              <div className="scanline animate-[pulse_3s_infinite]" />
              <svg className="absolute right-0 top-0 opacity-15 md:opacity-25 lg:opacity-30 mix-blend-screen" width="600" height="768" viewBox="0 0 400 600" fill="none">
                <path d="M200 100 C150 100 100 150 100 250 C100 350 150 450 200 450 C250 450 300 350 300 250 C300 150 250 100 200 100" stroke="#1E6FD9" strokeWidth="2" strokeDasharray="4 4"/>
                <circle cx="200" cy="280" r="60" stroke="#1E6FD9" strokeWidth="1" opacity="0.5"/>
                <path d="M100 250 L300 250 M200 100 L200 450" stroke="#1E6FD9" strokeWidth="0.5" opacity="0.3"/>
              </svg>
            </div>

            {/* Global Nav overlay */}
            <Navigation onSection={handleSection} />

            {/* Hero Content (Pushed to bottom of viewport) */}
            <div id="hero-content-outer" className="relative z-10 px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-8 lg:pb-12 max-w-7xl mx-auto w-full">
              <div id="hero-content-grid" className="grid grid-cols-1 lg:grid-cols-2 lg:items-end gap-8 w-full">

                {/* Left Column: Title */}
                <div id="hero-left-col" className="text-left">
                  <AnimatedHeading
                    id="hero-main-title"
                    text={`Medical Imaging for\nCardiovascular Risk Prediction\nin Elderly Patients`}
                    highlight="Elderly Patients"
                    colorCycle
                    className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal tracking-tight leading-tight"
                  />
                </div>

                {/* Right Column: Try Demo Button → opens the standalone demo page */}
                <div id="hero-right-col" className="flex items-end justify-start lg:justify-end">
                  <FadeIn delay={800} duration={1000} id="hero-cta-buttons-container" className="w-full lg:w-auto">
                    <GlowButton
                      onClick={() => transitionTo('demo')}
                      className="w-full lg:w-auto"
                    >
                      Try Demo
                    </GlowButton>
                  </FadeIn>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 2 — ABOUT THE RESEARCH */}
          <AboutSection />

          {/* SECTION 3 — MODEL COMPARISON */}
          <ModelComparisonSection />

          {/* SECTION 4 — EXPLAINABILITY (XAI) */}
          <ExplainabilitySection />

          {/* SECTION 5 — FOOTER */}
          <FooterSection />
        </>
      ) : (
        /* STANDALONE DEMO PAGE — navbar + inference simulator */
        <div id="demo-page" className="relative min-h-screen flex flex-col bg-[#0A1628]">
          <InteractiveGrid />

          <div className="relative z-10 flex flex-col flex-1">
            <Navigation onSection={handleSection} />

            <div className="px-6 md:px-12 lg:px-16 pt-6 max-w-5xl mx-auto w-full">
              <button
                id="demo-back-button"
                onClick={() => transitionTo('landing')}
                className="noise-border liquid-glass rounded-full px-4 py-2 text-xs text-white hover:bg-white/[0.08] transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span aria-hidden>←</span> Back to overview
              </button>
            </div>

            <TryDemoSection />
            <FooterSection />
          </div>
        </div>
      )}

    </div>
  );
}
