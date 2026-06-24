import React, { useState, useRef } from 'react';
import Reveal from './Reveal';
import { sampleEntries } from '../sampleImages';
import metadata from '../../samples/metadata.json';

type DemoState = 'idle' | 'analyzing' | 'result';

interface ModelOut {
  prob: number; // P(cardiomegaly), 0..1
  confidence: number; // confidence in the PREDICTED class, 0..100
  label: string; // display label
  positive: boolean; // predicted cardiomegaly?
}

interface Analysis {
  name: string;
  previewUrl: string;
  densenet: ModelOut;
  vit: ModelOut;
  note: string; // ground truth (samples) or "live inference" (uploads)
}

type Row = (typeof metadata)[number];
const metaByName = new Map<string, Row>(
  metadata.map((m): [string, Row] => [m.filename, m]),
);

// prob + class label -> the shape the result panels render.
const buildModelOut = (prob: number, label: string): ModelOut => {
  const positive = label === 'Cardiomegaly';
  return {
    prob,
    confidence: (positive ? prob : 1 - prob) * 100,
    label: positive ? 'CARDIOMEGALY DETECTED' : 'NORMAL HEART OUTLINE',
    positive,
  };
};

export default function TryDemoSection() {
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<number | null>(null);

  const startProgress = () => {
    setAnalysisProgress(0);
    progressTimer.current = window.setInterval(() => {
      // Climb toward 90 and hold while we await the (unknown-length) request.
      setAnalysisProgress((p) => (p >= 90 ? 90 : p + 5));
    }, 120);
  };
  const stopProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  // Upload / drop / fallback path: run the real models via the local server.
  const analyzeBlob = async (name: string, blob: Blob, url: string) => {
    setError('');
    setFileName(name);
    setFileUrl(url);
    setDemoState('analyzing');
    startProgress();
    try {
      const fd = new FormData();
      fd.append('image', blob, name);
      const res = await fetch('/api/infer', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const j = await res.json();
      setActiveAnalysis({
        name,
        previewUrl: url,
        densenet: buildModelOut(j.densenet.prob, j.densenet.label),
        vit: buildModelOut(j.vit.prob, j.vit.label),
        note: 'Live inference · DenseNet-121 + ViT-B/16',
      });
      setAnalysisProgress(100);
      setDemoState('result');
    } catch {
      setError(
        'Inference server offline — start it with `npm run api` (see server/README.md), then try again.',
      );
      setDemoState('idle');
    } finally {
      stopProgress();
    }
  };

  // Dataset sample: render instantly from precomputed metadata (no server).
  const showSample = (entry: { name: string; url: string }) => {
    const row = metaByName.get(entry.name);
    if (!row) {
      void analyzeBlobFromUrl(entry.name, entry.url); // fallback to live model
      return;
    }
    setError('');
    setFileName(entry.name);
    setFileUrl(entry.url);
    setActiveAnalysis({
      name: entry.name,
      previewUrl: entry.url,
      densenet: buildModelOut(row.cnn_prob, row.cnn_pred),
      vit: buildModelOut(row.vit_prob, row.vit_pred),
      note: `Ground truth: ${row.true_label} · Age ${row.age}`,
    });
    setDemoState('result');
  };

  const analyzeBlobFromUrl = async (name: string, url: string) => {
    const blob = await fetch(url).then((r) => r.blob());
    await analyzeBlob(name, blob, url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      analyzeBlob(file.name, file, URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeBlob(file.name, file, URL.createObjectURL(file));
  };

  const onButtonClick = () => fileInputRef.current?.click();

  const resetDemo = () => {
    setDemoState('idle');
    setFileName('');
    setFileUrl('');
    setAnalysisProgress(0);
    setError('');
    setActiveAnalysis(null);
  };

  return (
    <section id="demo-section" className="px-6 md:px-12 lg:px-16 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <Reveal id="demo-header" className="text-center mb-12">
          <h2 id="demo-heading" className="text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-4">
            Upload a Chest X-Ray
          </h2>
          <p id="demo-subtext" className="text-base text-[#A8BFDA] max-w-2xl mx-auto">
            Pick a dataset X-ray for instant model output, or upload your own to run live
            dual-inference via DenseNet-121 and ViT-B/16 with side-by-side predictions.
          </p>
        </Reveal>

        {demoState === 'idle' && (
          <div className="space-y-8">
            {error && (
              <div id="demo-error" className="border border-red-400/40 bg-red-500/10 text-red-200 rounded-xl px-4 py-3 text-sm text-center">
                {error}
              </div>
            )}

            {/* Dashed Border Upload Zone */}
            <div
              id="upload-drag-zone"
              className={`border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all ${
                dragActive
                  ? 'border-[#2A7FEF] bg-[#1E6FD9]/5'
                  : 'border-[#1E6FD9]/45 hover:border-[#1E6FD9] bg-black/10'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#1E6FD9]/10 border border-[#1E6FD9]/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#2A7FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-base font-medium text-white mb-2">
                  Drag &amp; drop a chest X-ray image here, or{' '}
                  <button onClick={onButtonClick} className="text-[#2A7FEF] hover:underline focus:outline-none hover:text-white transition-colors">
                    click to upload
                  </button>
                </p>
                <p className="text-xs text-[#A8BFDA]">Supports PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>

            {/* Pick a real dataset X-ray — instant, precomputed model output */}
            <div id="dataset-samples-container">
              <h4 className="text-xs font-semibold text-[#A8BFDA] uppercase tracking-widest text-center mb-6 select-none">
                OR SELECT A SAMPLE X-RAY
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-3 px-1">
                {sampleEntries.map((entry, i) => {
                  const tag = `#${String(i).padStart(3, '0')}`;
                  return (
                    <button
                      key={entry.name}
                      onClick={() => showSample(entry)}
                      className="group relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-black border border-white/10 hover:border-[#1E6FD9] transition-all cursor-pointer"
                    >
                      <img
                        src={entry.url}
                        alt={`Sample X-ray ${tag}`}
                        loading="lazy"
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white/80 py-0.5 text-center font-mono">
                        {tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {demoState === 'analyzing' && (
          <div id="demo-analysis-stage" className="liquid-glass border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#1E6FD9]/20 animate-ping opacity-75"></span>
              <div className="w-16 h-16 rounded-full bg-[#0A1628] border-2 border-[#1E6FD9] flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-[#2A7FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0s1-3.75 3-4.5c2-.75 4 1.5 4 1.5s2.51-1 4 .5c1.62 1.62.5 5.5.5 5.5s3.5-.03 4 1.5c.5 1.5-2 4-2 4h-5" />
                </svg>
              </div>
            </div>

            <h4 className="text-lg font-medium text-white mb-2">Running Dual-Model Inference</h4>
            <p className="text-xs text-[#A8BFDA] mb-6">Processing {fileName} across DenseNet-121 and ViT-B/16 layers...</p>

            <div className="w-full max-w-sm h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#1E6FD9] to-[#2A7FEF] transition-all duration-75"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <span className="font-mono text-xs text-[#2A7FEF] font-bold">{analysisProgress}%</span>
          </div>
        )}

        {demoState === 'result' && activeAnalysis && (
          <div id="demo-results-wrapper" className="space-y-6">
            <div className="flex justify-between items-center bg-[#0D1E3A] border-b border-white/10 pb-4">
              <div className="text-left">
                <span className="text-[10px] text-[#2A7FEF] uppercase font-bold tracking-widest block">ANALYSIS REPORT</span>
                <span className="text-sm text-white font-medium truncate max-w-md block">{fileName}</span>
              </div>
              <button
                id="btn-re-upload"
                onClick={resetDemo}
                className="liquid-glass border border-white/10 text-white rounded-lg px-4 py-1.5 text-xs hover:bg-white hover:text-[#0A1628] transition-all"
              >
                Analyze Another
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Image Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                  <img src={fileUrl} alt="Analyzed radiological content" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 left-2 bg-[#2A7FEF] text-[9px] text-[#0A1628] font-bold px-2 py-0.5 rounded uppercase">
                    FILM PREVIEW
                  </div>
                </div>
                <p className="text-xs text-[#A8BFDA] mt-3 italic text-center font-light">
                  {activeAnalysis.note}
                </p>
              </div>

              {/* Right Column: Comparison Panels */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* CNN result */}
                <div className="liquid-glass border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-mono block w-fit mb-4">
                      CNN DENSENET-121
                    </span>
                    <h5 className="text-xl font-normal text-white mb-2">
                      {activeAnalysis.densenet.confidence.toFixed(1)}% Confidence
                    </h5>
                    <p className={`text-xs font-bold mb-4 tracking-wide ${
                      activeAnalysis.densenet.positive ? 'text-blue-400' : 'text-[#A8BFDA]'
                    }`}>
                      {activeAnalysis.densenet.label}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-[10px] text-[#A8BFDA] uppercase font-bold tracking-wide">P(cardiomegaly)</p>
                    <p className="text-xs text-white/90 mt-1 font-mono">
                      {(activeAnalysis.densenet.prob * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* ViT result */}
                <div className="liquid-glass border-2 border-[#1E6FD9]/80 rounded-xl p-5 flex flex-col justify-between bg-[#1E6FD9]/5 shadow-lg">
                  <div>
                    <span className="text-[9px] bg-[#1E6FD9] px-2 py-0.5 rounded text-white font-mono block w-fit mb-4 font-bold">
                      TRANSFORMER (ViT-B/16)
                    </span>
                    <h5 className="text-xl font-medium text-white mb-2">
                      {activeAnalysis.vit.confidence.toFixed(1)}% Confidence
                    </h5>
                    <p className={`text-xs font-bold mb-4 tracking-wide ${
                      activeAnalysis.vit.positive ? 'text-[#2A7FEF]' : 'text-[#A8BFDA]'
                    }`}>
                      {activeAnalysis.vit.label}
                    </p>
                  </div>
                  <div className="border-t border-[#1E6FD9]/30 pt-4 mt-4">
                    <p className="text-[10px] text-[#A8BFDA] uppercase font-bold tracking-wide">P(cardiomegaly)</p>
                    <p className="text-xs text-white mt-1 font-mono font-semibold">
                      {(activeAnalysis.vit.prob * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Info label at bottom */}
        <div id="demo-disclaimer" className="text-center mt-12">
          <p id="demo-coming-soon-warning" className="text-sm text-[#A8BFDA]/60 italic font-light">
            Sample results are precomputed from the trained models; uploads run live against the
            local inference server. For research and education only — not a medical device.
          </p>
        </div>
      </div>
    </section>
  );
}
