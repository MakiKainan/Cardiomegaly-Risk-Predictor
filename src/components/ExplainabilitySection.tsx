/// <reference types="vite/client" />
import React, { useState } from 'react';
import Reveal from './Reveal';
import limeVid from '../assets/lime.mp4';
import shapVid from '../assets/shap.mp4';

type Method = 'lime' | 'shap';

// One lever drives everything: the canvas video, the badge, and the right-hand
// explanation card all key off the selected method.
const METHODS: Record<Method, {
  code: string;
  title: string;
  video: string;
  dot: string;       // canvas label dot colour
  iconBg: string;    // small letter-tile classes
  badge: string;     // canvas overlay label
  body: string;
}> = {
  lime: {
    code: 'LM',
    title: 'LIME Analysis',
    video: limeVid,
    dot: 'bg-[#1E6FD9]',
    iconBg: 'bg-[#1E6FD9]/10 border-[#1E6FD9]/30 text-[#1E6FD9]',
    badge: 'LIME: Superpixel Regions',
    body: "Local Interpretable Model-Agnostic Explanations highlight superpixel regions of the chest X-ray driving the classification. ViT shows tighter, more anatomically precise cardiac boundary attention compared to CNN's broader, less specific activation regions.",
  },
  shap: {
    code: 'SH',
    title: 'SHAP Analysis',
    video: shapVid,
    dot: 'bg-white',
    iconBg: 'bg-white/5 border-white/10 text-white',
    badge: 'SHAP: Pixel Attribution',
    body: 'SHapley Additive exPlanations provide pixel-level attribution maps. ViT produces bilateral cardiac border attribution while CNN exhibits a more unilateral pattern, suggesting ViT learns more clinically relevant structural symmetry.',
  },
};

export default function ExplainabilitySection() {
  const [method, setMethod] = useState<Method>('lime');
  const m = METHODS[method];

  return (
    <section id="explainability" className="bg-[#0A1628] px-6 md:px-12 lg:px-16 py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <Reveal id="xai-header" className="mb-16">
          <p id="xai-section-label" className="text-xs tracking-widest text-[#2A7FEF] uppercase mb-4 font-semibold">
            EXPLAINABILITY (XAI)
          </p>
          <h2 id="xai-section-heading" className="text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-6">
            Why the Model Decided What It Did
          </h2>
        </Reveal>

        {/* Interactive Visual Simulator Box */}
        <div id="xai-visualization-block" className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-center">

          {/* LIME/SHAP toggle + attribution video canvas (7 cols) */}
          <div id="xray-canvas-container" className="lg:col-span-7 bg-[#0D1E3A] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <h4 className="text-sm font-medium text-[#A8BFDA]">Attribution Map Visualization</h4>
              <div className="flex bg-[#0A1628] rounded-lg p-1 border border-white/10">
                <button
                  id="btn-toggle-lime"
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    method === 'lime'
                      ? 'bg-[#1E6FD9] text-white shadow-md'
                      : 'text-[#A8BFDA] hover:text-white'
                  }`}
                  onClick={() => setMethod('lime')}
                >
                  LIME
                </button>
                <button
                  id="btn-toggle-shap"
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    method === 'shap'
                      ? 'bg-white text-[#0A1628] shadow-md'
                      : 'text-[#A8BFDA] hover:text-white'
                  }`}
                  onClick={() => setMethod('shap')}
                >
                  SHAP
                </button>
              </div>
            </div>

            {/* Attribution clip for the selected method. key= remounts so the new
                clip autoplays from the start on every toggle. */}
            <div className="relative w-full max-w-[480px] aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5">
              <video
                key={method}
                src={m.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Absolute label annotation */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`}></span>
                {m.badge}
              </div>
            </div>
          </div>

          {/* Switchable LIME/SHAP explanation card (5 cols) — replaces the old
              static side text, driven by the same lever, with the noise border. */}
          <div id="xai-explanation-col" className="lg:col-span-12 xl:col-span-5">
            <div
              id="xai-method-card"
              className="noise-border liquid-glass border border-white/10 rounded-xl p-8 transition-all duration-300 hover:border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-semibold ${m.iconBg}`}>
                  {m.code}
                </div>
                <h3 className="text-xl font-normal text-white">{m.title}</h3>
              </div>
              <p className="text-sm text-[#A8BFDA] leading-relaxed">{m.body}</p>
            </div>
          </div>
        </div>

        {/* Key Finding Callout Box */}
        <Reveal
          id="xai-key-finding-box"
          className="border border-[#1E6FD9]/40 bg-[#1E6FD9]/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-lg"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1E6FD9]/20 flex items-center justify-center border border-[#1E6FD9]/30">
            <svg className="w-5 h-5 text-[#2A7FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div id="xai-key-finding-text">
            <p className="text-sm text-white leading-relaxed">
              <strong className="text-[#2A7FEF] font-bold">Key Finding:</strong> ViT-B/16 attends to clinically meaningful bilateral cardiac borders, while DenseNet-121 focuses on broader thoracic regions — suggesting architectural superiority in spatial reasoning for cardiac imaging tasks.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
