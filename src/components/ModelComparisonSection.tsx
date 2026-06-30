import React, { useState } from 'react';
import Reveal, { useInView } from './Reveal';

interface Metric {
  name: string;
  cnn: number;
  vit: number;
  description: string;
}

export default function ModelComparisonSection() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  // Drives the watery fill-up: bars grow from 0 to their value when the chart
  // scrolls into view, and drain back to 0 when it leaves.
  const { ref: barsRef, inView: barsInView } = useInView<HTMLDivElement>();

  const metrics: Metric[] = [
    {
      name: 'AUC-ROC',
      cnn: 0.8152,
      vit: 0.8451,
      description: 'The overall discriminative ability of the model'
    },
    {
      name: 'Accuracy',
      cnn: 0.7004,
      vit: 0.7653,
      description: 'Overall proportion of correct classifications'
    },
    {
      name: 'Precision',
      cnn: 0.6325,
      vit: 0.6870,
      description: 'Ability to avoid false positives (positive predictive value)'
    },
    {
      name: 'Recall',
      cnn: 0.6491,
      vit: 0.7895,
      description: 'Ability to detect cardiac abnormalities (sensitivity)'
    },
    {
      name: 'F1 Score',
      cnn: 0.6407,
      vit: 0.7347,
      description: 'Harmonic mean of precision and recall'
    }
  ];

  return (
    <section id="model-comparison" className="bg-[#0D1E3A] px-6 md:px-12 lg:px-16 py-24">
      <div className="max-w-7xl mx-auto">
        {/* Centered Heading */}
        <Reveal id="comparison-header" className="text-center mb-16">
          <p id="comparison-section-label" className="text-xs tracking-widest text-[#2A7FEF] uppercase mb-4 font-semibold">
            MODEL PERFORMANCE
          </p>
          <h2 id="comparison-section-heading" className="text-3xl md:text-4xl lg:text-5xl font-normal text-white">
            CNN vs Vision Transformer
          </h2>
        </Reveal>

        {/* Custom Horizontal Bar Chart */}
        <Reveal id="metric-chart-container" className="liquid-glass border border-white/10 rounded-2xl p-8 mb-12 shadow-xl">
          <h3 id="chart-title" className="text-lg font-medium text-white mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
            <span>Comparative Architecture Metrics</span>
            <span className="flex gap-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#1E6FD9] rounded"></span>
                <span className="text-[#A8BFDA]">CNN (DenseNet-121)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#FFFFFF] rounded"></span>
                <span className="text-[#A8BFDA]">Vision Transformer (ViT-B/16)</span>
              </span>
            </span>
          </h3>

          <div ref={barsRef} id="chart-metrics-list" className="space-y-6">
            {metrics.map((m, idx) => {
              // Convert to percentages for rendering width
              const cnnPercent = m.cnn * 100;
              const vitPercent = m.vit * 100;
              const isSelected = activeMetric === m.name;

              return (
                <div
                  key={m.name}
                  id={`chart-row-${m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className={`group transition-all duration-300 p-4 rounded-xl ${
                    isSelected ? 'bg-white/[0.04] border border-white/10' : 'border border-transparent'
                  }`}
                  onMouseEnter={() => setActiveMetric(m.name)}
                  onMouseLeave={() => setActiveMetric(null)}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-white tracking-wide group-hover:text-[#2A7FEF] transition-colors">
                      {m.name}
                    </span>
                    <span className="text-xs text-[#A8BFDA] italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {m.description}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* CNN Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-xs text-[#A8BFDA]">CNN</div>
                      <div className="flex-1 h-3 bg-navy-deep rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full water-fill"
                          style={{
                            ['--c1' as string]: '#1666c4',
                            ['--c2' as string]: '#4aa3ff',
                            width: barsInView ? `${cnnPercent}%` : '0%',
                            transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                            transitionDelay: `${idx * 0.08}s`,
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="w-16 text-right font-mono text-xs text-[#A8BFDA] font-semibold">
                        {m.cnn.toFixed(4)}
                      </div>
                    </div>

                    {/* ViT Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-xs text-white">ViT-B/16</div>
                      <div className="flex-1 h-3 bg-navy-deep rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full water-fill"
                          style={{
                            ['--c1' as string]: '#bcd8ff',
                            ['--c2' as string]: '#ffffff',
                            width: barsInView ? `${vitPercent}%` : '0%',
                            transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                            transitionDelay: `${idx * 0.08 + 0.15}s`,
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="w-16 text-right font-mono text-xs text-white font-bold">
                        {m.vit.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Side-by-Side Summary Cards */}
        <div id="summary-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CNN Card */}
          <Reveal
            id="cnn-summary-card"
            className="liquid-glass border border-white/10 rounded-xl p-8 relative flex flex-col justify-between transition-all duration-300 hover:border-white/20"
          >
            <div>
              <p className="text-xs text-[#A8BFDA] uppercase tracking-wider mb-2">Standard conv-net</p>
              <h4 className="text-2xl font-normal text-white mb-4">CNN-DenseNet121</h4>
              <p className="text-sm text-[#A8BFDA] leading-relaxed mb-6">
                DenseNet-121 connects each layer to every other layer in a feed-forward fashion, preserving feature propagation. While it achieves robust baseline detection, it lacks the global self-attention mechanism required to understand broader bilateral symmetric structures.
              </p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <div className="text-base font-semibold text-white">0.7004</div>
                  <div className="text-[10px] text-[#A8BFDA]">Accuracy</div>
                </div>
                <div>
                  <div className="text-base font-semibold text-white">0.6325</div>
                  <div className="text-[10px] text-[#A8BFDA]">Precision</div>
                </div>
                <div>
                  <div className="text-base font-semibold text-white">0.6491</div>
                  <div className="text-[10px] text-[#A8BFDA]">Recall</div>
                </div>
                <div>
                  <div className="text-base font-semibold text-white">0.6407</div>
                  <div className="text-[10px] text-[#A8BFDA]">F1 Score</div>
                </div>
                <div>
                  <div className="text-base font-semibold text-[#1E6FD9]">0.8152</div>
                  <div className="text-[10px] text-[#1E6FD9] font-medium">AUC-ROC</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ViT Card (Highlighted) */}
          <Reveal
            id="vit-summary-card"
            delay={0.1}
            className="liquid-glass border-2 border-[#1E6FD9]/50 rounded-xl p-8 relative flex flex-col justify-between transition-all duration-300 hover:border-[#1E6FD9] bg-gradient-to-br from-[#0F2044] to-[#0A1628] shadow-2xl"
          >
            {/* Winner Badge */}
            <div className="absolute top-4 right-4 bg-[#1E6FD9]/20 text-white text-[10px] font-semibold border border-[#1E6FD9]/40 rounded-full px-3 py-1">
              PERFORMANCE LEADER
            </div>

            <div>
              <p className="text-xs text-[#2A7FEF] uppercase tracking-wider mb-2 font-semibold">Self-Attention Architecture</p>
              <h4 className="text-2xl font-normal text-white mb-4 flex items-center gap-2">
                ViT-B/16 <span className="text-xs text-[#2A7FEF] font-bold">(Top Performer)</span>
              </h4>
              <p className="text-sm text-[#A8BFDA] leading-relaxed mb-6">
                The Vision Transformer breaks images into 16x16 pixel patches, treating them as tokens processed via self-attention layers. This enables long-range visual relationships and learns clinically vital shape symmetries, outperforming DenseNet-121's localized filters.
              </p>
            </div>
            <div className="border-t border-[#1E6FD9]/30 pt-6">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <div className="text-base font-bold text-white">0.7653</div>
                  <div className="text-[10px] text-white">Accuracy</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white">0.6870</div>
                  <div className="text-[10px] text-white">Precision</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white">0.7895</div>
                  <div className="text-[10px] text-white">Recall</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white">0.7347</div>
                  <div className="text-[10px] text-white">F1 Score</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#2A7FEF]">0.8451</div>
                  <div className="text-[10px] text-[#2A7FEF] font-semibold">AUC-ROC</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
