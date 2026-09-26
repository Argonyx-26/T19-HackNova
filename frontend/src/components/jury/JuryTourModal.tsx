import React, { useState } from 'react';
import { Award, Play, ChevronRight, ChevronLeft, Shield, Zap, Cpu, GitBranch, ShieldAlert, FileText, CheckCircle2, X } from 'lucide-react';

interface JuryTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScenario: () => void;
  onJumpToSection?: (section: string) => void;
}

export const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Multimodal Signal Ingestion & Normalization',
    subtitle: 'From 1,000+ Raw Sensor Feeds to Unified Schema',
    icon: Zap,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    description: 'SENTINEL-X continuously ingests signals across CCTV computer vision, Access Control badge reader attempts, Network IDS alerts, and IoT sensors into a unified normalized schema with source confidence metrics.',
    keyHighlight: 'Eliminates 99.8% of noise by grouping raw alerts into temporal (≤ 120s) and spatial clusters.',
    actionLabel: 'View Raw Event Feed',
    targetSection: 'overview'
  },
  {
    step: 2,
    title: '2. Topological Situation Graph & 3D Twin',
    subtitle: 'Mapping Entity-Device-Location Relationships',
    icon: GitBranch,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    description: 'Rather than displaying isolated alerts, SENTINEL-X constructs a real-time NetworkX graph linking entities (users, IPs, badges), devices (cameras, firewalls), and locations with structural graph analytics.',
    keyHighlight: 'Displays live topological connections and 3D campus twin visualization.',
    actionLabel: 'Inspect Situation Graph',
    targetSection: 'graph'
  },
  {
    step: 3,
    title: '3. Explainable State Escalation Engine',
    subtitle: 'Deterministic Governance: NORMAL → CRITICAL',
    icon: ShieldAlert,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-500/10',
    description: 'The state machine monitors threat velocity and risk accumulation, transitioning through NORMAL → ANOMALOUS → SUSPICIOUS → ESCALATING → CRITICAL with complete audit justification logging.',
    keyHighlight: 'Zero black-box AI magic: every transition provides verifiable mathematical reasoning.',
    actionLabel: 'View State Evolution',
    targetSection: 'overview'
  },
  {
    step: 4,
    title: '4. Future-State Trajectory Forecasting',
    subtitle: 'Endsley Level 3 Situational Awareness',
    icon: Cpu,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    description: 'Looking beyond current state, SENTINEL-X projects impending threat trajectories and estimated time-to-escalation based on entity velocity and breach progression.',
    keyHighlight: 'Warns operators before breach escalation occurs.',
    actionLabel: 'Examine Trajectory Panel',
    targetSection: 'overview'
  },
  {
    step: 5,
    title: '5. Counterfactual Intervention Sandbox',
    subtitle: 'Simulate Operator Choices (MONITOR, ISOLATE, LOCKDOWN)',
    icon: Shield,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    description: 'Operators can simulate counterfactual actions in a safe sandbox prior to execution, evaluating projected risk reduction vs operational impact side-by-side.',
    keyHighlight: 'Prevents knee-jerk mistakes by calculating trade-offs objectively.',
    actionLabel: 'Test Intervention Sandbox',
    targetSection: 'overview'
  },
  {
    step: 6,
    title: '6. Immutable Hash Audit Log & Decision Support',
    subtitle: 'Human-in-the-Loop Authority & Forensic Integrity',
    icon: FileText,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/10',
    description: 'Every decision and state transition is appended to an immutable hash-chained audit ledger, keeping authorized human operators in command with complete legal auditability.',
    keyHighlight: 'Cryptographically signed audit trail with zero TTL data deletion.',
    actionLabel: 'Review Audit Hash Log',
    targetSection: 'audit'
  }
];

export const JuryTourModal: React.FC<JuryTourModalProps> = ({
  isOpen,
  onClose,
  onStartScenario,
  onJumpToSection
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleRunAndClose = () => {
    onStartScenario();
    if (onJumpToSection && currentStep.targetSection) {
      onJumpToSection(currentStep.targetSection);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050403]/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="relative w-full max-w-2xl spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/95 via-[#0d0905]/90 to-[#060402]/98 border border-[#c9a15d]/40 shadow-[0_16px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
        
        {/* Top Specular Glow Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#c9a15d]/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_16px_rgba(201,161,93,0.35)]">
              <div className="w-full h-full bg-[#0d0905] rounded-[14px] flex items-center justify-center text-[#f0d28f]">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#fff6e4]">90-Second Jury Guided Tour</h3>
                <span className="text-[10px] font-mono uppercase bg-[#3a2814]/80 text-[#f0d28f] border border-[#c9a15d]/40 px-2.5 py-0.5 rounded-full">
                  STEP {currentStep.step} OF 6
                </span>
              </div>
              <p className="text-xs text-[#a3927a]">Interactive walkthrough of SENTINEL-X breakthrough features.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#a3927a] hover:text-[#fff6e4] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 py-3 bg-[#0a0704]/80 border-b border-[#c9a15d]/15 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-8 bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] shadow-[0_0_10px_rgba(240,210,143,0.6)]'
                    : idx < currentStepIndex
                    ? 'w-2 bg-[#7a5a30]'
                    : 'w-2 bg-[#2a1d10]'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#a3927a]">
            {Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100)}% Complete
          </span>
        </div>

        {/* Step Content Card */}
        <div className="p-6">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#140e08]/90 to-[#080503] border border-[#c9a15d]/30 shadow-inner space-y-4">
            
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-[#0d0905] border border-[#c9a15d]/40 text-[#f0d28f] shrink-0 shadow-md">
                <StepIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#fff6e4] mb-0.5">{currentStep.title}</h4>
                <p className="text-xs font-mono font-medium text-[#f0d28f]">{currentStep.subtitle}</p>
              </div>
            </div>

            <p className="text-xs text-[#d5c7b3] leading-relaxed">
              {currentStep.description}
            </p>

            <div className="p-3 bg-[#0a0704]/90 rounded-xl border border-[#c9a15d]/20 flex items-center space-x-2.5 text-xs text-[#a3927a] font-sans">
              <CheckCircle2 className="w-4 h-4 text-[#f0d28f] shrink-0" />
              <span><strong className="text-[#fff6e4]">Jury Takeaway:</strong> {currentStep.keyHighlight}</span>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-[#080503]/90 border-t border-[#c9a15d]/20 flex items-center justify-between">
          <button
            onClick={handleRunAndClose}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] hover:from-[#d8b06c] hover:to-[#ffdf9e] text-[#050403] text-xs font-mono font-bold shadow-[0_0_18px_rgba(201,161,93,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#050403]" />
            <span>Start Live Breach Scenario</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-[#140e08] hover:bg-[#1f160d] disabled:opacity-30 text-[#a3927a] text-xs font-medium flex items-center gap-1 transition-colors border border-[#c9a15d]/20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStepIndex < TOUR_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#4d351a] to-[#201509] hover:from-[#5d4120] text-[#fff6e4] border border-[#f0d28f]/50 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(240,210,143,0.25)] cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleRunAndClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(201,161,93,0.35)] cursor-pointer"
              >
                <span>Complete Tour & Launch</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
