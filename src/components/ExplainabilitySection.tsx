import React, { useState } from 'react';
import Reveal from './Reveal';

export default function ExplainabilitySection() {
  const [selectedModel, setSelectedModel] = useState<'cnn' | 'vit'>('vit');

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
          
          {/* Interactive Toggle & X-ray Canvas (6 cols) */}
          <div id="xray-canvas-container" className="lg:col-span-7 bg-[#0D1E3A] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <h4 className="text-sm font-medium text-[#A8BFDA]">Active Attention Map Simulation</h4>
              <div className="flex bg-[#0A1628] rounded-lg p-1 border border-white/10">
                <button
                  id="btn-toggle-cnn"
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedModel === 'cnn'
                      ? 'bg-[#1E6FD9] text-white shadow-md'
                      : 'text-[#A8BFDA] hover:text-white'
                  }`}
                  onClick={() => setSelectedModel('cnn')}
                >
                  CNN (Broad)
                </button>
                <button
                  id="btn-toggle-vit"
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedModel === 'vit'
                      ? 'bg-white text-[#0A1628] shadow-md'
                      : 'text-[#A8BFDA] hover:text-white'
                  }`}
                  onClick={() => setSelectedModel('vit')}
                >
                  ViT (Precise)
                </button>
              </div>
            </div>

            {/* Simulated Chest Radiograph SVG */}
            <div className="relative w-full max-w-[380px] aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center p-4">
              <svg className="w-full h-full text-white/20" viewBox="0 0 100 100">
                {/* Background Shadow */}
                <rect width="100" height="100" fill="#050C16" />
                
                {/* Spine & Ribcage Silhouette */}
                <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 50 15 Q 15 12 15 25" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 50 15 Q 85 12 85 25" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                
                <path d="M 50 25 Q 12 22 12 38" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 50 25 Q 88 22 88 38" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                
                <path d="M 50 38 Q 10 35 10 52" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 50 38 Q 90 35 90 52" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                <path d="M 50 52 Q 8 48 8 68" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 50 52 Q 92 48 92 68" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                
                {/* Lung Silhouettes Left & Right */}
                <path d="M 45 15 C 30 15, 18 20, 18 45 C 18 70, 30 75, 45 78 C 42 55, 42 30, 45 15 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <path d="M 55 15 C 70 15, 82 20, 82 45 C 82 70, 70 75, 55 78 C 58 55, 58 30, 55 15 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Normal Heart Outline */}
                <path d="M 50 38 C 40 38, 32 46, 32 55 C 32 64, 42 70, 50 72 C 58 70, 68 64, 68 55 C 68 46, 60 38, 50 38 Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.02)" />

                {/* Lungs Sub-structures / Vessels */}
                <path d="M 28 35 Q 35 45 25 55" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
                <path d="M 72 35 Q 65 45 75 55" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />

                {/* Cardiomegaly Enlarged Heart (dotted dashed red-ish or blue outline for comparison context) */}
                <path d="M 50 36 C 36 36, 22 47, 22 58 C 22 71, 38 76, 50 78 C 62 76, 78 71, 78 58 C 78 47, 64 36, 50 36 Z" stroke="rgba(30,111,217,0.3)" strokeWidth="1" strokeDasharray="2,2" fill="none" />

                {/* Simulated Overlay Heatmaps (SHAP / LIME attribution map) */}
                {selectedModel === 'cnn' ? (
                  // CNN Broad less specific activation map (spanning lungs, clavicles, upper gastric)
                  <g>
                    <circle cx="50" cy="50" r="18" fill="rgba(30,111,217,0.5)" filter="blur(8px)" />
                    <circle cx="35" cy="45" r="16" fill="rgba(30,111,217,0.35)" filter="blur(8px)" />
                    <circle cx="62" cy="38" r="14" fill="rgba(30,111,217,0.25)" filter="blur(6px)" />
                    <ellipse cx="60" cy="58" rx="15" ry="10" fill="rgba(30,111,217,0.2)" filter="blur(6px)" />
                  </g>
                ) : (
                  // Vision Transformer: highly aligned, precise bilateral cardiac boundary attention map
                  <g>
                    {/* Bilateral Cardiac Boundary Hotspots */}
                    <path
                      d="M 32 46 C 28 52, 28 58, 30 63"
                      stroke="#FFFFFF"
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                      filter="blur(3px)"
                      opacity="0.85"
                    />
                    <path
                      d="M 32 46 C 28 52, 28 58, 30 63"
                      stroke="#2A7FEF"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      filter="blur(5px)"
                      opacity="0.75"
                    />
                    
                    <path
                      d="M 68 46 C 72 52, 72 58, 70 63"
                      stroke="#FFFFFF"
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                      filter="blur(3px)"
                      opacity="0.85"
                    />
                    <path
                      d="M 68 46 C 72 52, 72 58, 70 63"
                      stroke="#2A7FEF"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      filter="blur(5px)"
                      opacity="0.75"
                    />
                    
                    {/* Tiny general center activation */}
                    <circle cx="50" cy="55" r="6" fill="rgba(255,255,255,0.4)" filter="blur(4px)" />
                  </g>
                )}
              </svg>

              {/* Absolute label annotation */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${selectedModel === 'cnn' ? 'bg-[#1E6FD9]' : 'bg-white'}`}></span>
                {selectedModel === 'cnn' ? 'CNN Activation: Thoracic Region' : 'ViT Activation: Bilateral Border'}
              </div>
            </div>
          </div>

          {/* Side Explanations Text Block (5 cols) */}
          <div id="xai-explanation-col" className="lg:col-span-12 xl:col-span-5 flex flex-col justify-center space-y-4 text-left">
            <h3 className="text-xl font-medium text-white">Anatomical Localization Contrast</h3>
            <p className="text-sm text-[#A8BFDA] leading-relaxed">
              When clinician teams validated these results, we found a distinct qualitative split. 
              The DenseNet-121 convolutional filters focus on global contrast variations, mistakenly registering superpixel cues around the diaphragm or upper clavicles.
            </p>
            <p className="text-sm text-[#A8BFDA] leading-relaxed">
              In contrast, the self-attention heads inside the <strong className="text-white font-medium">ViT-B/16</strong> isolate specific token patches right along the lateral edges of the cardiac silhouette — matching standard cardiothoracic ratio (CTR) measurements used by human radiograph specialists.
            </p>
          </div>
        </div>

        {/* Side-by-Side LIME and SHAP Cards */}
        <div id="xai-methods-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* LIME Card */}
          <Reveal
            id="xai-lime-card"
            className="liquid-glass border border-white/10 rounded-xl p-8 transition-all duration-300 hover:border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#1E6FD9]/10 border border-[#1E6FD9]/30 flex items-center justify-center text-xs font-semibold text-[#1E6FD9]">
                LM
              </div>
              <h3 className="text-xl font-normal text-white">LIME Analysis</h3>
            </div>
            <p className="text-sm text-[#A8BFDA] leading-relaxed">
              Local Interpretable Model-Agnostic Explanations highlight superpixel regions of the chest X-ray driving the classification. ViT shows tighter, more anatomically precise cardiac boundary attention compared to CNN's broader, less specific activation regions.
            </p>
          </Reveal>

          {/* SHAP Card */}
          <Reveal
            id="xai-shap-card"
            delay={0.1}
            className="liquid-glass border border-white/10 rounded-xl p-8 transition-all duration-300 hover:border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                SH
              </div>
              <h3 className="text-xl font-normal text-white">SHAP Analysis</h3>
            </div>
            <p className="text-sm text-[#A8BFDA] leading-relaxed">
              SHapley Additive exPlanations provide pixel-level attribution maps. ViT produces bilateral cardiac border attribution while CNN exhibits a more unilateral pattern, suggesting ViT learns more clinically relevant structural symmetry.
            </p>
          </Reveal>
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
