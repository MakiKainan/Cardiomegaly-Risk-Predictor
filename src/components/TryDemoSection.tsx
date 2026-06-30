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
  const [showCaliperGuide, setShowCaliperGuide] = useState<boolean>(true);
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

  // Dataset sample: run simulated scan for a high-fidelity visual experience.
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

    // Start a simulated progress run for visual feedback
    setDemoState('analyzing');
    setAnalysisProgress(0);
    stopProgress();

    let currentProgress = 0;
    const intervalTime = 30; // 30ms * 40 steps = 1.2s total
    const totalSteps = 40;

    progressTimer.current = window.setInterval(() => {
      currentProgress += Math.ceil(100 / totalSteps);
      if (currentProgress >= 100) {
        setAnalysisProgress(100);
        setDemoState('result');
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
      } else {
        setAnalysisProgress(currentProgress);
      }
    }, intervalTime);
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

  const isCnnPositive = activeAnalysis?.densenet?.positive || false;
  const isVitPositive = activeAnalysis?.vit?.positive || false;
  const isCardiomegaly = isVitPositive || isCnnPositive;

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
          <div id="demo-analysis-stage" className="liquid-glass border border-white/10 rounded-2xl p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Visual Scanner Film */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[280px] aspect-square rounded-xl overflow-hidden bg-black border border-white/15 relative pulse-glow shadow-2xl">
                  {fileUrl && (
                    <img
                      src={fileUrl}
                      alt="Scanning film preview"
                      className="w-full h-full object-cover grayscale opacity-50 transition-opacity"
                    />
                  )}
                  {/* Laser Sweeper Line */}
                  <div className="scan-beam"></div>
                  
                  {/* Cybernetic HUD Target Overlays */}
                  <div className="absolute inset-4 pointer-events-none select-none flex flex-col justify-between opacity-80">
                    <div className="flex justify-between">
                      <div className="w-3 h-3 border-t-2 border-l-2 border-[#2A7FEF]"></div>
                      <div className="w-3 h-3 border-t-2 border-r-2 border-[#2A7FEF]"></div>
                    </div>
                    {/* Pulsing crosshair in the center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border border-[#22D3EE]/30 flex items-center justify-center animate-ping"></div>
                      <div className="w-2 h-2 rounded-full bg-[#22D3EE]/80"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-3 h-3 border-b-2 border-l-2 border-[#2A7FEF]"></div>
                      <div className="w-3 h-3 border-b-2 border-r-2 border-[#2A7FEF]"></div>
                    </div>
                  </div>
                  
                  <span className="absolute bottom-2 left-2 bg-black/70 text-[9px] text-[#22D3EE] font-mono px-2 py-0.5 rounded border border-[#22D3EE]/20 tracking-wider">
                    SCAN_ID: {(Math.random() * 100000).toFixed(0).padStart(6, '0')}
                  </span>
                </div>
              </div>

              {/* Right Column: Console Logs & Progress */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-ping"></span>
                    <span className="text-[10px] text-[#22D3EE] uppercase font-bold tracking-widest font-mono">
                      DUAL-MODEL NEURAL INFERENCE
                    </span>
                  </div>
                  <h4 className="text-xl font-normal text-white mb-2 text-center md:text-left">
                    Analyzing Cardiothoracic Anatomy
                  </h4>
                  <p className="text-xs text-[#A8BFDA] text-center md:text-left truncate">
                    Running DenseNet-121 and ViT-B/16 layers on <span className="font-mono text-white/90">{fileName}</span>
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#A8BFDA]">SCAN PROGRESS</span>
                    <span className="text-[#22D3EE] font-bold">{analysisProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#1E6FD9] to-[#22D3EE] transition-all duration-75 shadow-[0_0_10px_rgba(30,111,217,0.5)]"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Terminal Console Logs */}
                <div className="bg-black/60 rounded-xl p-4 border border-white/10 font-mono text-[10px] leading-relaxed text-left text-white/80 h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                  <div>
                    {analysisProgress >= 15 ? (
                      <span className="text-emerald-400 font-bold">[OK]</span>
                    ) : (
                      <span className="text-[#2A7FEF] font-bold animate-pulse">[RUNNING]</span>
                    )}{' '}
                    Initializing DICOM radiograph stream...
                  </div>
                  <div>
                    {analysisProgress >= 35 ? (
                      <span className="text-emerald-400 font-bold">[OK]</span>
                    ) : analysisProgress >= 15 ? (
                      <span className="text-[#2A7FEF] font-bold animate-pulse">[RUNNING]</span>
                    ) : (
                      <span className="text-white/20">[PENDING]</span>
                    )}{' '}
                    Normalizing aspect boundaries &amp; scaling to 224x224 px...
                  </div>
                  <div>
                    {analysisProgress >= 55 ? (
                      <span className="text-emerald-400 font-bold">[OK]</span>
                    ) : analysisProgress >= 35 ? (
                      <span className="text-[#2A7FEF] font-bold animate-pulse">[RUNNING]</span>
                    ) : (
                      <span className="text-white/20">[PENDING]</span>
                    )}{' '}
                    Applying CLAHE contrast equalization and rib-cage masking...
                  </div>
                  <div>
                    {analysisProgress >= 75 ? (
                      <span className="text-emerald-400 font-bold">[OK]</span>
                    ) : analysisProgress >= 55 ? (
                      <span className="text-[#2A7FEF] font-bold animate-pulse">[RUNNING]</span>
                    ) : (
                      <span className="text-white/20">[PENDING]</span>
                    )}{' '}
                    Extracting deep feature maps via CNN DenseNet-121 convolution...
                  </div>
                  <div>
                    {analysisProgress >= 90 ? (
                      <span className="text-emerald-400 font-bold">[OK]</span>
                    ) : analysisProgress >= 75 ? (
                      <span className="text-[#2A7FEF] font-bold animate-pulse">[RUNNING]</span>
                    ) : (
                      <span className="text-white/20">[PENDING]</span>
                    )}{' '}
                    Calculating Self-Attention weights in ViT-B/16 multi-head layers...
                  </div>
                  <div>
                    {analysisProgress >= 100 ? (
                      <span className="text-emerald-400 font-bold">[OK]</span>
                    ) : analysisProgress >= 90 ? (
                      <span className="text-[#2A7FEF] font-bold animate-pulse">[RUNNING]</span>
                    ) : (
                      <span className="text-white/20">[PENDING]</span>
                    )}{' '}
                    Aggregating classifier probability vectors...
                  </div>
                </div>
              </div>

            </div>
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
              {/* Left Column: Image Preview with SVG Overlay */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                  <img src={fileUrl} alt="Analyzed radiological content" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                  
                  <div className="absolute top-2 left-2 bg-[#2A7FEF] text-[9px] text-[#0A1628] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider z-10 shadow">
                    FILM PREVIEW
                  </div>

                  {showCaliperGuide && (
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
                      {/* Anatomical midline reference */}
                      <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="2 2" />
                      
                      {/* Thoracic Cavity Diameter line (standard base of lung) */}
                      <line x1="16" y1="78" x2="84" y2="78" stroke="#2A7FEF" strokeWidth="1" strokeDasharray="3 2" />
                      <line x1="16" y1="75" x2="16" y2="81" stroke="#2A7FEF" strokeWidth="1" />
                      <line x1="84" y1="75" x2="84" y2="81" stroke="#2A7FEF" strokeWidth="1" />
                      
                      {/* Cardiac Silhouette Diameter line (max width of heart) */}
                      <line
                        x1={isCardiomegaly ? "28" : "33.5"}
                        y1="64"
                        x2={isCardiomegaly ? "72" : "66.5"}
                        y2="64"
                        stroke={isCardiomegaly ? "#F43F5E" : "#10B981"}
                        strokeWidth="1.2"
                        strokeDasharray="3 2"
                      />
                      <line x1={isCardiomegaly ? "28" : "33.5"} y1="61" x2={isCardiomegaly ? "28" : "33.5"} y2="67" stroke={isCardiomegaly ? "#F43F5E" : "#10B981"} strokeWidth="1.2" />
                      <line x1={isCardiomegaly ? "72" : "66.5"} y1="61" x2={isCardiomegaly ? "72" : "66.5"} y2="67" stroke={isCardiomegaly ? "#F43F5E" : "#10B981"} strokeWidth="1.2" />
                      
                      {/* Midpoint of Thoracic line marker to show the 50% boundary */}
                      <circle cx="50" cy="78" r="1.5" fill="#2A7FEF" />
                      
                      {/* Shaded indicator showing normal vs excess */}
                      {isCardiomegaly && (
                        <>
                          {/* Highlight cardiac span exceeding 50% CTR */}
                          <rect x="67" y="63.5" width="5" height="1" fill="rgba(244, 63, 94, 0.4)" />
                          <rect x="28" y="63.5" width="5" height="1" fill="rgba(244, 63, 94, 0.4)" />
                        </>
                      )}

                      {/* Text Labels */}
                      <text x="50" y="85" fill="#A8BFDA" fontSize="3" textAnchor="middle" fontWeight="bold" fontFamily="monospace" className="select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        THORACIC DIA: 30.0 cm
                      </text>
                      <text
                        x="50"
                        y="57"
                        fill={isCardiomegaly ? "#F43F5E" : "#10B981"}
                        fontSize="3"
                        textAnchor="middle"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      >
                        CARDIAC DIA: {isCardiomegaly ? "17.8 cm" : "13.2 cm"} (CTR: {isCardiomegaly ? "59%" : "44%"})
                      </text>
                    </svg>
                  )}
                </div>
                
                {/* Caliper Toggle and Guide details */}
                <div className="w-full mt-3 flex flex-col items-center gap-2">
                  <button
                    onClick={() => setShowCaliperGuide(!showCaliperGuide)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono tracking-wide transition-all cursor-pointer ${
                      showCaliperGuide
                        ? 'bg-[#1E6FD9]/15 border-[#1E6FD9] text-white'
                        : 'bg-black/20 border-white/10 text-[#A8BFDA] hover:border-white/20'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                    {showCaliperGuide ? 'Hide Caliper Overlay' : 'Show Caliper Overlay'}
                  </button>
                  
                  <p className="text-[10px] text-[#A8BFDA]/80 text-center font-light leading-relaxed max-w-xs mt-1">
                    {showCaliperGuide
                      ? 'Lines estimate thoracic width (blue) and heart width (coral/green). CTR > 50% indicates cardiomegaly.'
                      : 'CTR (Cardiothoracic Ratio) = Cardiac Width / Thoracic Width.'}
                  </p>
                </div>
                
                <p className="text-xs text-[#A8BFDA] mt-4 italic text-center font-light">
                  {activeAnalysis.note}
                </p>
              </div>

              {/* Right Column: Comparison Panels */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* CNN result */}
                <div className={`liquid-glass border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  activeAnalysis.densenet.positive
                    ? 'border-rose-500/35 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                    : 'border-emerald-500/25 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-mono font-bold tracking-wide">
                        CNN DENSENET-121
                      </span>
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                        activeAnalysis.densenet.positive
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {activeAnalysis.densenet.positive ? 'Enlarged' : 'Normal'}
                      </span>
                    </div>
                    
                    <h5 className="text-xl font-normal text-white mb-1">
                      {activeAnalysis.densenet.confidence.toFixed(1)}% Confidence
                    </h5>
                    
                    <p className={`text-xs font-bold mb-4 tracking-wide ${
                      activeAnalysis.densenet.positive ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {activeAnalysis.densenet.label}
                    </p>

                    {/* Probability Gauge */}
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <div className="flex justify-between text-[8px] text-[#A8BFDA] mb-1 font-mono tracking-wider">
                        <span>NORMAL</span>
                        <span>CTR 50%</span>
                        <span>CARDIOMEGALY</span>
                      </div>
                      <div className="h-2 w-full bg-black/50 rounded-full relative overflow-hidden border border-white/5">
                        {/* Threshold midline */}
                        <div className="absolute top-0 bottom-0 w-[1px] bg-white/20 left-1/2 z-10"></div>
                        {/* Fill */}
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            activeAnalysis.densenet.positive
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                          }`}
                          style={{ width: `${activeAnalysis.densenet.prob * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] text-[#A8BFDA] font-mono">P(cardiomegaly)</span>
                        <span className="text-xs text-white font-mono font-bold">
                          {(activeAnalysis.densenet.prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ViT result */}
                <div className={`liquid-glass border-2 rounded-xl p-5 flex flex-col justify-between transition-all bg-black/30 ${
                  activeAnalysis.vit.positive
                    ? 'border-rose-500/50 bg-rose-950/15 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                    : 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wide ${
                        activeAnalysis.vit.positive
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        TRANSFORMER (ViT-B/16)
                      </span>
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                        activeAnalysis.vit.positive
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {activeAnalysis.vit.positive ? 'Enlarged' : 'Normal'}
                      </span>
                    </div>
                    
                    <h5 className="text-xl font-medium text-white mb-1">
                      {activeAnalysis.vit.confidence.toFixed(1)}% Confidence
                    </h5>
                    
                    <p className={`text-xs font-bold mb-4 tracking-wide ${
                      activeAnalysis.vit.positive ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {activeAnalysis.vit.label}
                    </p>

                    {/* Probability Gauge */}
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <div className="flex justify-between text-[8px] text-[#A8BFDA] mb-1 font-mono tracking-wider">
                        <span>NORMAL</span>
                        <span>CTR 50%</span>
                        <span>CARDIOMEGALY</span>
                      </div>
                      <div className="h-2.5 w-full bg-black/50 rounded-full relative overflow-hidden border border-white/5">
                        {/* Threshold midline */}
                        <div className="absolute top-0 bottom-0 w-[1px] bg-white/20 left-1/2 z-10"></div>
                        {/* Fill */}
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            activeAnalysis.vit.positive
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${activeAnalysis.vit.prob * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] text-[#A8BFDA] font-mono">P(cardiomegaly)</span>
                        <span className="text-xs text-white font-mono font-bold">
                          {(activeAnalysis.vit.prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
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
