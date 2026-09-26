import React, { useState } from 'react';
import { Upload, FileVideo, ShieldAlert, Download, RefreshCw } from 'lucide-react';

interface PresetClip {
  id: string;
  name: string;
  category: string;
  duration: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'BENIGN';
  thumbnailUrl: string;
  summary: string;
  detectedEvents: { timestamp: string; label: string; confidence: number; location: string }[];
}

const PRESET_CLIPS: PresetClip[] = [
  {
    id: 'clip_cafe_01',
    name: 'MEVA Cafe Unattended Bag & Theft',
    category: 'CCTV Vision',
    duration: '00:45',
    threatLevel: 'CRITICAL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
    summary: 'Bag left unattended by Owner #102 at 15:18:10. Non-owner Person #104 approaches, lingers for 12s, picks up bag and exfiltrates via East Exit.',
    detectedEvents: [
      { timestamp: '15:18:10', label: 'UNATTENDED_BAG (Stationary > 15s)', confidence: 0.94, location: 'Table 4 Cafe' },
      { timestamp: '15:18:42', label: 'CUSTODY_CHANGE (Non-owner pick-up)', confidence: 0.91, location: 'Table 4 Cafe' },
      { timestamp: '15:19:05', label: 'EXFILTRATION (Rapid exit)', confidence: 0.89, location: 'East Corridor' }
    ]
  },
  {
    id: 'clip_server_02',
    name: 'Server Room Badge Spoofing & Tailgating',
    category: 'Access & CCTV Fusion',
    duration: '01:12',
    threatLevel: 'CRITICAL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
    summary: 'Card reader badge swipe by User #881 followed by unregistered entity tailgating through Door #02 within 1.8 seconds.',
    detectedEvents: [
      { timestamp: '15:20:01', label: 'ACCESS_GRANTED (Badge #881)', confidence: 0.99, location: 'Door #02 Server' },
      { timestamp: '15:20:03', label: 'TAILGATING_DETECTED (Dual occupancy)', confidence: 0.96, location: 'Door #02 Server' },
      { timestamp: '15:20:22', label: 'UNAUTHORIZED_ZONE_ENTRY', confidence: 0.92, location: 'Rack A-4 Corridor' }
    ]
  },
  {
    id: 'clip_brawl_03',
    name: 'Armed Altercation & Crowd Surge',
    category: 'Behavioral Threat',
    duration: '00:38',
    threatLevel: 'HIGH',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800',
    summary: 'Sudden motion velocity change (2.4m/s) with pose classification indicating physical aggression and weapon-like object detected.',
    detectedEvents: [
      { timestamp: '15:22:10', label: 'RAPID_MOTION (Running & Violent Pose)', confidence: 0.88, location: 'Platform North' },
      { timestamp: '15:22:18', label: 'WEAPON_VISIBLE (Handgun pose 3/6 frames)', confidence: 0.85, location: 'Platform North' }
    ]
  }
];

export const VideoThreatAnalyzer: React.FC = () => {
  const [selectedClip, setSelectedClip] = useState<PresetClip>(PRESET_CLIPS[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [reportGenerated, setReportGenerated] = useState<boolean>(true);

  const handleRunAnalysis = (clip: PresetClip) => {
    setSelectedClip(clip);
    setIsScanning(true);
    setScanProgress(0);
    setReportGenerated(false);

    let pct = 0;
    const interval = setInterval(() => {
      pct += 15;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setIsScanning(false);
        setReportGenerated(true);
      }
      setScanProgress(pct);
    }, 250);
  };

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-6 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] space-y-6 font-sans select-none backdrop-blur-3xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c9a15d]/20 pb-4 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_16px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[14px] flex items-center justify-center text-[#f0d28f]">
              <FileVideo className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#fff6e4] flex items-center gap-2">
              Drop-in Video Threat Analyzer
              <span className="text-[10px] font-mono uppercase bg-[#3a2814]/70 text-[#f0d28f] border border-[#c9a15d]/40 px-2.5 py-0.5 rounded-full">
                ANY VIDEO CLIP
              </span>
            </h3>
            <p className="text-xs text-[#a3927a]">
              Upload or select any CCTV video clip to run instant frame-by-frame AI threat extraction.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleRunAnalysis(selectedClip)}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] hover:from-[#d8b06c] hover:to-[#ffdf9e] text-[#050403] text-xs font-mono font-bold shadow-[0_0_18px_rgba(201,161,93,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Extracting Detections...' : 'Re-Run Vision Pipeline'}</span>
        </button>
      </div>

      {/* Drop Zone & Preset Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Drag & Drop Box + Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0b0805]/90 border-2 border-dashed border-[#c9a15d]/30 hover:border-[#f0d28f] transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner">
            <div className="w-12 h-12 rounded-full bg-[#3a2814] border border-[#c9a15d]/40 flex items-center justify-center text-[#f0d28f] mb-3 group-hover:scale-110 transition-transform shadow-md">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#fff6e4] mb-1 font-sans">Drag & Drop Any CCTV Video Clip</div>
            <div className="text-[11px] text-[#a3927a] mb-3 font-mono">Supports MP4, AVI, MOV, WebM (up to 500MB)</div>
            <span className="px-3 py-1.5 rounded-full bg-[#140e08] border border-[#c9a15d]/30 text-[#fff6e4] text-[11px] font-mono font-medium hover:bg-[#241a0d] transition shadow-sm">
              Browse Files
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#a3927a] uppercase tracking-wider mb-2 font-bold">
              Or Select Hackathon Demo Video Clips
            </label>

            <div className="space-y-2">
              {PRESET_CLIPS.map((clip) => (
                <button
                  key={clip.id}
                  onClick={() => handleRunAnalysis(clip)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                    selectedClip.id === clip.id
                      ? 'bg-gradient-to-r from-[#3a2814] via-[#241a0d] to-[#140e07] border-[#f0d28f]/60 text-[#fff6e4] shadow-[0_0_16px_rgba(240,210,143,0.25)]'
                      : 'bg-[#0b0805]/80 border-[#c9a15d]/20 text-[#a3927a] hover:border-[#c9a15d]/40 hover:text-[#fff6e4]'
                  }`}
                >
                  <img
                    src={clip.thumbnailUrl}
                    alt={clip.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#c9a15d]/30 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#fff6e4] truncate font-sans">{clip.name}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          clip.threatLevel === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        }`}
                      >
                        {clip.threatLevel}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#a3927a] mt-0.5">
                      {clip.category} · {clip.duration}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Video Scanning Preview & Extracted Report */}
        <div className="lg:col-span-7 space-y-4">
          {/* Video Scanning Player Canvas */}
          <div className="relative h-64 w-full bg-[#080503] rounded-2xl border border-[#c9a15d]/25 overflow-hidden shadow-inner">
            <img
              src={selectedClip.thumbnailUrl}
              alt={selectedClip.name}
              className="w-full h-full object-cover filter brightness-[0.8]"
            />

            {/* Laser Scan Animation when analyzing */}
            {isScanning && (
              <div className="absolute inset-0 bg-[#080503]/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-12 h-12 border-4 border-[#c9a15d]/30 border-t-[#f0d28f] rounded-full animate-spin mb-3" />
                <div className="text-xs font-mono font-bold text-[#f0d28f]">
                  YOLO11 Object Tracking: {scanProgress}%
                </div>
                <div className="w-48 bg-[#1a120a] h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] h-full transition-all duration-200"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scanning Line */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(240,210,143,0.06)_50%)] bg-[size:100%_6px] pointer-events-none" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-[#0a0704]/90 backdrop-blur-xl px-4 py-2 rounded-full border border-[#c9a15d]/30 font-mono text-xs text-white">
              <span className="truncate max-w-[240px]">{selectedClip.name}</span>
              <span className="text-emerald-400 font-bold">ANALYSIS COMPLETE</span>
            </div>
          </div>

          {/* Threat Verdict & Extracted Events Breakdown */}
          {reportGenerated && (
            <div className="p-5 rounded-2xl bg-[#0b0805]/90 border border-[#c9a15d]/20 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#c9a15d]/15 pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-bold text-[#fff6e4] uppercase tracking-wider font-mono">
                    THREAT VERDICT: {selectedClip.threatLevel}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Exporting Threat Assessment Report for ${selectedClip.name}...`)}
                  className="px-3.5 py-1.5 rounded-full bg-[#140e08] hover:bg-[#22160a] text-[#f0d28f] border border-[#c9a15d]/30 text-xs font-mono flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#f0d28f]" />
                  <span>Export Report</span>
                </button>
              </div>

              <p className="text-xs text-[#a3927a] leading-relaxed font-sans">{selectedClip.summary}</p>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#a3927a] font-bold block">
                  Extracted Physical & Cyber Evidence Signals
                </span>
                {selectedClip.detectedEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#140e08] border border-[#c9a15d]/20 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[#f0d28f] font-bold">{evt.timestamp}</span>
                      <span className="text-[#fff6e4]">{evt.label}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-[#a3927a]">
                      <span>{evt.location}</span>
                      <span className="text-emerald-400 font-bold">{Math.round(evt.confidence * 100)}% Conf</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
