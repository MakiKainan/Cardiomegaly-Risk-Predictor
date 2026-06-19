import React from 'react';
import Reveal from './Reveal';

export default function FooterSection() {
  return (
    <footer id="app-footer" className="bg-[#06101E] px-6 md:px-12 lg:px-16 py-12 border-t border-white/10">
      <Reveal className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left */}
        <div id="footer-left-info" className="text-sm text-[#A8BFDA] tracking-wide font-light">
          Medical Imaging for Cardiovascular Risk Prediction in Elderly Patients
        </div>

        {/* Right */}
        <div id="footer-right-affiliation" className="text-sm text-[#A8BFDA]/60 font-light">
          Bina Nusantara University · Computer Science Department · 2026
        </div>
      </Reveal>
    </footer>
  );
}
