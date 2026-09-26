import React, { useState, useEffect } from 'react';
import type { ThreatDNA, EvidenceStrength, IntelRelevance } from '../../types';
import { api } from '../../services/api';
import {
  Dna,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Server,
  Radio,
  Key,
  Layers,
  CheckCircle,
  Activity,
  RefreshCw,
  Crosshair
} from 'lucide-react';

interface ThreatDNAPanelProps {
  situationId?: string;
}

export const ThreatDNAPanel: React.FC<ThreatDNAPanelProps> = ({ situationId }) => {
  const [dna, setDna] = useState<ThreatDNA | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    fusion: true,
    physical: true,
    access: true,
    cyber: true,
    intel: true,
    investigation: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const fetchThreatDNA = async () => {
    const targetId = situationId || 'sit-20260925-001';
    setLoading(true);
    try {
      const data = await api.getThreatDNA(targetId);
      setDna(data);
    } catch (err) {
      console.error('Failed to load Threat DNA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatDNA();
  }, [situationId]);

  const getEvidenceStrengthBadge = (str: EvidenceStrength) => {
    switch (str) {
      case 'VERY_HIGH':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-sm';
      case 'HIGH':
        return 'bg-[#2a1d0f] text-[#f0d28f] border-[#c9a15d]/50';
      case 'MEDIUM':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/50';
      case 'LOW':
      default:
        return 'bg-[#140e08] text-[#a3927a] border-[#c9a15d]/20';
    }
  };

  const getRelevanceBadge = (rel: IntelRelevance) => {
    switch (rel) {
      case 'RELATED':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/50';
      case 'POSSIBLY_RELATED':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/50';
      case 'UNRELATED':
      default:
        return 'bg-[#140e08] text-[#a3927a] border-[#c9a15d]/20';
    }
  };

  if (loading && !dna) {
    return (
      <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-8 text-center space-y-3 backdrop-blur-3xl shadow-xl">
        <RefreshCw className="w-6 h-6 animate-spin text-[#f0d28f] mx-auto" />
        <p className="text-xs font-mono text-[#a3927a]">Synthesizing Cyber-Physical Threat DNA Profile...</p>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-6 text-center text-[#7a6a55] text-xs backdrop-blur-3xl">
        No Threat DNA profile available for this situation.
      </div>
    );
  }

  const fusion = dna.fusion_scores;

  return (
    <div className="spotlight-card rounded-3xl bg-gradient-to-b from-[#140e08]/90 via-[#0d0905]/85 to-[#060402]/95 border border-[#c9a15d]/30 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-3xl space-y-4 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#c9a15d]/20">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7a4f1c] via-[#c9a15d] to-[#f0d28f] p-0.5 shadow-[0_0_14px_rgba(201,161,93,0.3)]">
            <div className="w-full h-full bg-[#0d0905] rounded-[13px] flex items-center justify-center text-[#f0d28f]">
              <Dna className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#fff6e4] uppercase flex items-center gap-2">
              Cyber-Physical Threat DNA
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${getEvidenceStrengthBadge(fusion.evidence_strength)}`}>
                {fusion.evidence_strength} EVIDENCE
              </span>
            </h3>
            <p className="text-[11px] text-[#a3927a]">
              Multi-Domain Incident Profiling (Physical • Access • Cyber • Threat Intel)
            </p>
          </div>
        </div>

        <button
          onClick={fetchThreatDNA}
          title="Regenerate Threat DNA"
          className="p-1.5 rounded-xl bg-[#140e08] hover:bg-[#20160c] text-[#a3927a] hover:text-[#fff6e4] border border-[#c9a15d]/20 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f0d28f]' : ''}`} />
        </button>
      </div>

      {/* Mandatory Attribution Notice */}
      <div className="px-3.5 py-2.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-start space-x-2.5 text-[11px] text-amber-200 shadow-inner">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-tight">
          <strong className="text-amber-300 font-semibold">ATTRIBUTION NOTICE: </strong>
          {dna.intelligence_domain.attribution_note}
        </div>
      </div>

      {/* Incident Summary Card */}
      <div className="p-3.5 bg-[#0b0805]/90 border border-[#c9a15d]/20 rounded-2xl space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#f0d28f] font-bold uppercase">INCIDENT PROFILE SYNTHESIS</span>
          <div className="flex items-center space-x-1.5">
            {dna.domains_active.map((dom) => (
              <span key={dom} className="text-[9px] px-2 py-0.5 rounded-full bg-[#1a120a] text-[#f0d28f] border border-[#c9a15d]/30 font-mono">
                {dom}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-[#d5c7b3] leading-relaxed font-sans">
          {dna.incident_summary}
        </p>
      </div>

      {/* SECTION 1: Fusion Evidence Meter */}
      <div className="border border-[#c9a15d]/20 rounded-2xl overflow-hidden shadow-inner">
        <button
          onClick={() => toggleSection('fusion')}
          className="w-full px-3.5 py-2.5 bg-[#0e0a06] hover:bg-[#191107] flex items-center justify-between text-xs font-mono font-bold text-[#fff6e4] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#f0d28f]" />
            <span>MULTI-DOMAIN FUSION EVIDENCE SCORES</span>
          </div>
          {openSections.fusion ? <ChevronUp className="w-4 h-4 text-[#a3927a]" /> : <ChevronDown className="w-4 h-4 text-[#a3927a]" />}
        </button>

        {openSections.fusion && (
          <div className="p-3.5 bg-[#080503]/80 border-t border-[#c9a15d]/15 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-[#120d08] border border-[#c9a15d]/20 text-left">
              <div className="text-[10px] text-[#a3927a] uppercase font-mono">Visual Anomaly</div>
              <div className="text-base font-bold font-mono text-[#f0d28f]">{(fusion.visual_anomaly_strength * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-[#7a6a55]">Camera behavior conf</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#120d08] border border-[#c9a15d]/20 text-left">
              <div className="text-[10px] text-[#a3927a] uppercase font-mono">Access Anomaly</div>
              <div className="text-base font-bold font-mono text-amber-300">{(fusion.access_anomaly_score * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-[#7a6a55]">Badge & auth status</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#120d08] border border-[#c9a15d]/20 text-left">
              <div className="text-[10px] text-[#a3927a] uppercase font-mono">Network Anomaly</div>
              <div className="text-base font-bold font-mono text-rose-300">{(fusion.network_anomaly_score * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-[#7a6a55]">Exfil & traffic spike</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#120d08] border border-[#c9a15d]/20 text-left">
              <div className="text-[10px] text-[#a3927a] uppercase font-mono">Situation Conf</div>
              <div className="text-base font-bold font-mono text-emerald-300">{(fusion.situation_confidence * 100).toFixed(0)}%</div>
              <div className="text-[9px] text-[#7a6a55]">Multi-source correlation</div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Physical Domain Profile */}
      <div className="border border-[#c9a15d]/20 rounded-2xl overflow-hidden shadow-inner">
        <button
          onClick={() => toggleSection('physical')}
          className="w-full px-3.5 py-2.5 bg-[#0e0a06] hover:bg-[#191107] flex items-center justify-between text-xs font-mono font-bold text-[#fff6e4] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>PHYSICAL BEHAVIOR DOMAIN</span>
          </div>
          {openSections.physical ? <ChevronUp className="w-4 h-4 text-[#a3927a]" /> : <ChevronDown className="w-4 h-4 text-[#a3927a]" />}
        </button>

        {openSections.physical && (
          <div className="p-3.5 bg-[#080503]/80 border-t border-[#c9a15d]/15 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-[#7a6a55]">Behavior: </span>
                <strong className="text-emerald-300">{dna.physical_domain.observed_behavior || 'None'}</strong>
              </div>
              <div>
                <span className="text-[#7a6a55]">Zone Class: </span>
                <span className="text-[#d5c7b3] font-semibold">{dna.physical_domain.zone_classification || 'CONTROLLED'}</span>
              </div>
              <div>
                <span className="text-[#7a6a55]">Cameras: </span>
                <span className="text-[#d5c7b3]">{dna.physical_domain.camera_ids.join(', ') || 'CAM-02'}</span>
              </div>
              <div>
                <span className="text-[#7a6a55]">Dwell Time: </span>
                <span className="text-[#d5c7b3]">{dna.physical_domain.dwell_seconds ? `${dna.physical_domain.dwell_seconds}s` : 'N/A'}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#a3927a] bg-[#120d08] p-2.5 rounded-xl border border-[#c9a15d]/15">
              {dna.physical_domain.behavior_note}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3: Access & Identity Domain */}
      <div className="border border-[#c9a15d]/20 rounded-2xl overflow-hidden shadow-inner">
        <button
          onClick={() => toggleSection('access')}
          className="w-full px-3.5 py-2.5 bg-[#0e0a06] hover:bg-[#191107] flex items-center justify-between text-xs font-mono font-bold text-[#fff6e4] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>ACCESS & CREDENTIAL DOMAIN</span>
          </div>
          {openSections.access ? <ChevronUp className="w-4 h-4 text-[#a3927a]" /> : <ChevronDown className="w-4 h-4 text-[#a3927a]" />}
        </button>

        {openSections.access && (
          <div className="p-3.5 bg-[#080503]/80 border-t border-[#c9a15d]/15 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-[#7a6a55]">Credential State: </span>
                <strong className={dna.access_domain.auth_anomaly ? 'text-rose-400' : 'text-emerald-400'}>
                  {dna.access_domain.credential_state || 'VALID'}
                </strong>
              </div>
              <div>
                <span className="text-[#7a6a55]">Access Point: </span>
                <span className="text-[#d5c7b3]">{dna.access_domain.access_point || 'DOOR-SERVER-01'}</span>
              </div>
              <div>
                <span className="text-[#7a6a55]">Failed Attempts: </span>
                <span className="text-amber-400 font-bold">{dna.access_domain.failed_attempts}</span>
              </div>
              <div>
                <span className="text-[#7a6a55]">Auth Anomaly: </span>
                <span className={dna.access_domain.auth_anomaly ? 'text-rose-400 font-bold' : 'text-[#a3927a]'}>
                  {dna.access_domain.auth_anomaly ? 'YES (UNAUTHORIZED)' : 'NO'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#a3927a] bg-[#120d08] p-2.5 rounded-xl border border-[#c9a15d]/15">
              {dna.access_domain.access_note}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 4: Cyber & Network Domain */}
      <div className="border border-[#c9a15d]/20 rounded-2xl overflow-hidden shadow-inner">
        <button
          onClick={() => toggleSection('cyber')}
          className="w-full px-3.5 py-2.5 bg-[#0e0a06] hover:bg-[#191107] flex items-center justify-between text-xs font-mono font-bold text-[#fff6e4] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-rose-400" />
            <span>CYBER & NETWORK TELEMETRY</span>
          </div>
          {openSections.cyber ? <ChevronUp className="w-4 h-4 text-[#a3927a]" /> : <ChevronDown className="w-4 h-4 text-[#a3927a]" />}
        </button>

        {openSections.cyber && (
          <div className="p-3.5 bg-[#080503]/80 border-t border-[#c9a15d]/15 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-[#7a6a55]">Endpoint: </span>
                <strong className="text-[#f0d28f]">{dna.cyber_domain.endpoint_id || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[#7a6a55]">Target IP: </span>
                <span className="text-rose-300 font-bold">{dna.cyber_domain.connection_target || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#7a6a55]">Protocol: </span>
                <span className="text-[#d5c7b3]">{dna.cyber_domain.protocol || 'TCP/SSH'}</span>
              </div>
              <div>
                <span className="text-[#7a6a55]">Exfiltration: </span>
                <span className="text-rose-400 font-bold">{dna.cyber_domain.data_volume_mb ? `${dna.cyber_domain.data_volume_mb} MB` : 'N/A'}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#a3927a] bg-[#120d08] p-2.5 rounded-xl border border-[#c9a15d]/15">
              {dna.cyber_domain.cyber_note}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 5: Threat Intelligence & ATT&CK Mappings */}
      <div className="border border-[#c9a15d]/20 rounded-2xl overflow-hidden shadow-inner">
        <button
          onClick={() => toggleSection('intel')}
          className="w-full px-3.5 py-2.5 bg-[#0e0a06] hover:bg-[#191107] flex items-center justify-between text-xs font-mono font-bold text-[#fff6e4] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#f0d28f]" />
            <span>THREAT INTEL & ATT&CK LINKAGE</span>
          </div>
          {openSections.intel ? <ChevronUp className="w-4 h-4 text-[#a3927a]" /> : <ChevronDown className="w-4 h-4 text-[#a3927a]" />}
        </button>

        {openSections.intel && (
          <div className="p-3.5 bg-[#080503]/80 border-t border-[#c9a15d]/15 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#a3927a]">TTP Relevance:</span>
              <span className={`px-2.5 py-0.5 rounded-full border uppercase text-[10px] font-bold ${getRelevanceBadge(dna.intelligence_domain.ttp_relevance)}`}>
                {dna.intelligence_domain.ttp_relevance}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#a3927a] font-mono uppercase">MITRE ATT&CK Techniques (Cyber-Corroborated):</span>
              <div className="flex flex-wrap gap-1.5">
                {dna.intelligence_domain.mitre_technique_ids.length > 0 ? (
                  dna.intelligence_domain.mitre_technique_ids.map((tid) => (
                    <span key={tid} className="px-2.5 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
                      {tid}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-[#7a6a55] italic">No cyber evidence — ATT&CK technique IDs suppressed by policy</span>
                )}
              </div>
            </div>

            {dna.intelligence_domain.threat_actor_attribution && (
              <div className="p-2.5 bg-[#120d08] border border-[#c9a15d]/20 rounded-xl text-[11px]">
                <span className="text-[#a3927a]">Associated Threat Cluster: </span>
                <strong className="text-rose-400 font-mono">{dna.intelligence_domain.threat_actor_attribution}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 6: Actionable Investigation Steps */}
      <div className="border border-[#c9a15d]/20 rounded-2xl overflow-hidden shadow-inner">
        <button
          onClick={() => toggleSection('investigation')}
          className="w-full px-3.5 py-2.5 bg-[#0e0a06] hover:bg-[#191107] flex items-center justify-between text-xs font-mono font-bold text-[#fff6e4] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-[#f0d28f]" />
            <span>RECOMMENDED INVESTIGATION CHECKLIST</span>
          </div>
          {openSections.investigation ? <ChevronUp className="w-4 h-4 text-[#a3927a]" /> : <ChevronDown className="w-4 h-4 text-[#a3927a]" />}
        </button>

        {openSections.investigation && (
          <div className="p-3.5 bg-[#080503]/80 border-t border-[#c9a15d]/15 space-y-1.5">
            {dna.investigation_steps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11px] text-[#d5c7b3] font-sans">
                <CheckCircle className="w-3.5 h-3.5 text-[#f0d28f] shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
