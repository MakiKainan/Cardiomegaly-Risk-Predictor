import React from 'react';
import Reveal from './Reveal';

export default function AboutSection() {
  const stats = [
    { id: 'stat-vit-auc', value: '0.8483', label: 'ViT AUC-ROC' },
    { id: 'stat-cnn-auc', value: '0.8229', label: 'CNN AUC-ROC' },
    { id: 'stat-dataset', value: 'NIH ChestX-ray14', label: 'Dataset Registry' },
    { id: 'stat-patients', value: 'Ages 60–100', label: 'Patient Cohort' },
  ];

  return (
    <section id="research-overview" className="bg-[#0A1628] px-6 md:px-12 lg:px-16 py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 items-center">
        {/* Left Column: Narrative */}
        <Reveal id="about-narrative-col" className="mb-12 lg:mb-0">
          <p id="about-section-label" className="text-xs tracking-widest text-[#2A7FEF] uppercase mb-4 font-semibold">
            RESEARCH OVERVIEW
          </p>
          <h2 id="about-section-heading" className="text-3xl md:text-4xl lg:text-5xl font-normal mb-6 text-white leading-tight">
            Deep Learning Meets Cardiovascular Imaging
          </h2>
          <p id="about-section-body" className="text-[#A8BFDA] leading-relaxed text-base md:text-lg">
            This study presents a systematic evaluation of two deep learning architectures —{' '}
            <span className="text-white font-medium">DenseNet-121 (CNN)</span> and{' '}
            <span className="text-white font-medium">ViT-B/16 (Vision Transformer)</span> —{' '}
            for automated cardiomegaly detection in chest radiographs of elderly patients aged 60–100,{' '}
            using the NIH ChestX-ray14 dataset. Explainability is provided via LIME and SHAP,{' '}
            revealing how each model attends to cardiac structures.
          </p>
        </Reveal>

        {/* Right Column: 2x2 stat grid */}
        <div id="about-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat, i) => (
            <Reveal key={stat.id} delay={i * 0.08}>
              <div
                id={stat.id}
                className="liquid-glass noise-border rounded-[2rem] p-6 h-full transition-all duration-300 hover:bg-white/[0.08]"
              >
                <div className="text-2xl sm:text-3xl font-medium text-white mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#A8BFDA]">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
