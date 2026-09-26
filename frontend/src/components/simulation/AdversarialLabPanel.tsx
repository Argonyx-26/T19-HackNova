import React, { useState } from 'react';
import {
  FlaskConical,
  Copy,
  MapPinOff,
  Clock,
  WifiOff,
  AlertTriangle,
  GitBranch,
  Flame,
  Shuffle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

interface AdversarialLabPanelProps {
  situationId?: string;
  onSignalInjected?: () => void;
}

export const AdversarialLabPanel: React.FC<AdversarialLabPanelProps> = ({
  situationId = 'sit-20260925-001',
  onSignalInjected
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    type: string;
    message: string;
    time: string;
  } | null>(null);

  const injectionOptions = [
    {
      type: 'DUPLICATE_EVENT',
      label: 'Duplicate Event',
      desc: 'Re-emits identical access telemetry to test deduplication layer.',
      icon: <Copy className="w-3.5 h-3.5 text-cyan-400" />
    },
    {
      type: 'FALSE_LOCATION',
      label: 'False Location',
      desc: 'Simulates sensor reporting impossible GPS/room coordinates.',
      icon: <MapPinOff className="w-3.5 h-3.5 text-amber-400" />
    },
    {
      type: 'DELAYED_EVENT',
      label: 'Delayed Event (Out-of-Order)',
      desc: 'Injects CCTV feed telemetry delayed by 90s into temporal graph.',
      icon: <Clock className="w-3.5 h-3.5 text-orange-400" />
    },
    {
      type: 'SENSOR_FAILURE',
      label: 'Sensor Outage (Audio Feed)',
      desc: 'Forces acoustic anomaly sensor into degraded offline state.',
      icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      type: 'CONTRADICTORY_EVIDENCE',
      label: 'Contradictory Evidence',
      desc: 'Injects valid badge checkout while CCTV observes presence.',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
    },
    {
      type: 'TOPOLOGY_CONFLICT',
      label: 'Impossible Floor Transition',
      desc: 'Subject jumps between Floor 1 and Floor 5 in under 3 seconds.',
      icon: <Shuffle className="w-3.5 h-3.5 text-purple-400" />
    },
    {
      type: 'PARALLEL_INCIDENT',
      label: 'Parallel Incident (Split Test)',
      desc: 'Triggers independent anomaly in Building Beta to test situation split.',
      icon: <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      type: 'FALSE_ESCALATION',
      label: 'False Severity Surge',
      desc: 'Tests threat threshold dampening against unverified alert spikes.',
      icon: <Flame className="w-3.5 h-3.5 text-red-400" />
    }
  ];

  const handleInject = async (type: string) => {
    setLoadingType(type);
    try {
      const res = await api.injectAdversarialSignal(type, situationId);
      setLastResult({
        type,
        message: res.message || 'Adversarial signal injected successfully into reasoning engine.',
        time: new Date().toLocaleTimeString()
      });
      if (onSignalInjected) onSignalInjected();
    } catch (err: any) {
      setLastResult({
        type,
        message: `Injection error: ${err.message || err}`,
        time: new Date().toLocaleTimeString()
      });
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-2">
              <span>ADVERSARIAL SCENARIO LAB</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Live stress-testing suite: inject signal faults and observe resilient machine reasoning.
            </p>
          </div>
        </div>

        <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-neutral-950 text-cyan-400 border border-neutral-800">
          MODE: ADVERSARIAL STRESS-TEST
        </span>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {injectionOptions.map((opt) => (
          <button
            key={opt.type}
            onClick={() => handleInject(opt.type)}
            disabled={loadingType !== null}
            className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-900/80 transition-all text-left flex flex-col justify-between space-y-2 group disabled:opacity-50"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-cyan-500/30">
                {opt.icon}
              </div>
              <span className="text-xs font-bold text-neutral-200 group-hover:text-cyan-300 font-mono">
                {opt.label}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug font-sans">
              {opt.desc}
            </p>
            <div className="text-[10px] font-mono text-cyan-400/80 flex items-center space-x-1 pt-1">
              <span>{loadingType === opt.type ? 'Injecting...' : '→ Inject Signal'}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Last Result Box */}
      {lastResult && (
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs font-mono text-cyan-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>[{lastResult.type}]</strong> {lastResult.message}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 flex-shrink-0 ml-3">
            {lastResult.time}
          </span>
        </div>
      )}
    </div>
  );
};
