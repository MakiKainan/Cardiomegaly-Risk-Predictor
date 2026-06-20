import React, { useState, useRef } from 'react';
import Reveal from './Reveal';

type DemoState = 'idle' | 'uploading' | 'analyzing' | 'result';

interface SampleXRay {
  id: string;
  name: string;
  type: 'cardiomegaly' | 'normal';
  previewUrl: string;
  desc: string;
  densenetResult: { confidence: number; label: string; xaiRating: string };
  vitResult: { confidence: number; label: string; xaiRating: string };
}

export default function TryDemoSection() {
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preloaded sample X-Ray definitions so users can test immediately
  const sampleXRays: SampleXRay[] = [
    {
      id: 'sample-1',
      name: 'Elderly Male (Age 74) - Cardiomegaly Positive',
      type: 'cardiomegaly',
      previewUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400',
      desc: 'Enlarged cardiac outline, CTR estimated at 0.58. High clinical significance.',
      densenetResult: { confidence: 81.24, label: 'CARDIOMEGALY DETECTED', xaiRating: 'Broad pleural activation' },
      vitResult: { confidence: 87.42, label: 'CARDIOMEGALY DETECTED', xaiRating: 'Highly localized bilateral boundaries' }
    },
    {
      id: 'sample-2',
      name: 'Elderly Female (Age 81) - Healthy Baseline',
      type: 'normal',
      previewUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=400',
      desc: 'Normal cardiovascular outline, clear lung fields, CTR estimated at 0.44.',
      densenetResult: { confidence: 89.15, label: 'NORMAL HEART Outline', xaiRating: 'Scattered attention' },
      vitResult: { confidence: 94.67, label: 'NORMAL HEART Outline', xaiRating: 'Precise cardiac framing' }
    }
  ];

  const [activeAnalysis, setActiveAnalysis] = useState<SampleXRay | null>(null);

  const simulateAnalysis = (name: string, url: string, customData?: SampleXRay) => {
    setFileName(name);
    setFileUrl(url);
    setDemoState('analyzing');
    setAnalysisProgress(0);

    const targetData = customData || {
      id: 'custom-upload',
      name: name,
      type: 'cardiomegaly',
      previewUrl: url,
      desc: 'User uploaded film. Automated analysis performed locally.',
      densenetResult: { confidence: 78.43, label: 'CARDIOMEGALY DETECTED', xaiRating: 'Thoracic region clusters' },
      vitResult: { confidence: 83.19, label: 'CARDIOMEGALY DETECTED', xaiRating: 'Bilateral heart contour matches' }
    };
    
    setActiveAnalysis(targetData);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDemoState('result');
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const localUrl = URL.createObjectURL(file);
        simulateAnalysis(file.name, localUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      simulateAnalysis(file.name, localUrl);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetDemo = () => {
    setDemoState('idle');
    setFileName('');
    setFileUrl('');
    setAnalysisProgress(0);
    setActiveAnalysis(null);
  };

  return (
    <section id="demo-section" className="px-6 md:px-12 lg:px-16 py-24">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Header */}
        <Reveal id="demo-header" className="text-center mb-12">
          <h2 id="demo-heading" className="text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-4">
            Upload a Chest X-Ray
          </h2>
          <p id="demo-subtext" className="text-base text-[#A8BFDA] max-w-2xl mx-auto">
            Test the models instantly using local simulation. Run dual-inference via DenseNet-121 and ViT-B/16 with side-by-side metric predictions.
          </p>
        </Reveal>

        {demoState === 'idle' && (
          <div className="space-y-8">
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
                {/* Upload Icon */}
                <div className="w-16 h-16 rounded-full bg-[#1E6FD9]/10 border border-[#1E6FD9]/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#2A7FEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                
                <p className="text-base font-medium text-white mb-2">
                  Drag & drop a chest X-ray image here, or{' '}
                  <button onClick={onButtonClick} className="text-[#2A7FEF] hover:underline focus:outline-none hover:text-white transition-colors">
                    click to upload
                  </button>
                </p>
                <p className="text-xs text-[#A8BFDA]">Supports PNG, JPG, JPEG up to 10MB</p>
              </div>
            </div>

            {/* Quick-Sample Radiographs */}
            <div id="quick-samples-container">
              <h4 className="text-xs font-semibold text-[#A8BFDA] uppercase tracking-widest text-center mb-6 select-none">
                OR SELECT A PRESET CLINICAL STUDY SAMPLE
              </h4>
              <div id="samples-row" className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {sampleXRays.map((sample) => (
                  <div
                    key={sample.id}
                    id={`btn-sample-${sample.id}`}
                    className="liquid-glass border border-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#1E6FD9] hover:bg-[#1E6FD9]/5 transition-all group"
                    onClick={() => simulateAnalysis(sample.name, sample.previewUrl, sample)}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10 group-hover:border-white/20">
                      <img src={sample.previewUrl} alt={sample.name} className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white group-hover:text-[#2A7FEF] transition-colors">
                        {sample.type === 'cardiomegaly' ? 'Positive (Cardiomegaly)' : 'Negative (Baseline)'}
                      </p>
                      <p className="text-[11px] text-[#A8BFDA] line-clamp-2 mt-1 font-light leading-snug">
                        {sample.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {demoState === 'analyzing' && (
          <div id="demo-analysis-stage" className="liquid-glass border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
            {/* Spinning radar / pulse effect */}
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
            
            {/* Percentage Bar */}
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
                Upload Another X-ray
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
                  {activeAnalysis.desc}
                </p>
              </div>

              {/* Right Column: Comparison Panels */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* CNN Column result */}
                <div className="liquid-glass border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-mono block w-fit mb-4">
                      CNN DENSENET-121
                    </span>
                    <h5 className="text-xl font-normal text-white mb-2">
                      {activeAnalysis.densenetResult.confidence.toFixed(1)}% Confidence
                    </h5>
                    <p className={`text-xs font-bold mb-4 tracking-wide ${
                      activeAnalysis.type === 'cardiomegaly' ? 'text-blue-400' : 'text-[#A8BFDA]'
                    }`}>
                      {activeAnalysis.densenetResult.label}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-[10px] text-[#A8BFDA] uppercase font-bold tracking-wide">Attribution Map</p>
                    <p className="text-xs text-white/90 mt-1 font-light italic">
                      &quot;{activeAnalysis.densenetResult.xaiRating}&quot;
                    </p>
                  </div>
                </div>

                {/* ViT Column result (Highlighted style but fitting the color guidelines) */}
                <div className="liquid-glass border-2 border-[#1E6FD9]/80 rounded-xl p-5 flex flex-col justify-between bg-[#1E6FD9]/5 shadow-lg">
                  <div>
                    <span className="text-[9px] bg-[#1E6FD9] px-2 py-0.5 rounded text-white font-mono block w-fit mb-4 font-bold">
                      TRANSFORMER (ViT-B/16)
                    </span>
                    <h5 className="text-xl font-medium text-white mb-2">
                      {activeAnalysis.vitResult.confidence.toFixed(1)}% Confidence
                    </h5>
                    <p className={`text-xs font-bold mb-4 tracking-wide ${
                      activeAnalysis.type === 'cardiomegaly' ? 'text-[#2A7FEF]' : 'text-[#A8BFDA]'
                    }`}>
                      {activeAnalysis.vitResult.label}
                    </p>
                  </div>
                  <div className="border-t border-[#1E6FD9]/30 pt-4 mt-4">
                    <p className="text-[10px] text-[#A8BFDA] uppercase font-bold tracking-wide">Attribution Map</p>
                    <p className="text-xs text-white mt-1 font-semibold italic">
                      &quot;{activeAnalysis.vitResult.xaiRating}&quot;
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
            Demo coming soon. Model deployment in progress. All classifications are simulated on your local client strictly for academic demonstration purposes.
          </p>
        </div>
      </div>
    </section>
  );
}
