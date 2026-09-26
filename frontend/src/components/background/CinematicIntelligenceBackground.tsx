import React, { useEffect, useState } from 'react';
import type { SituationState } from '../../types';
import { IntelligenceParticles } from './IntelligenceParticles';
import { OrbitalField } from './OrbitalField';
import { ThreatAttentionField } from '../effects/ThreatAttentionField';
import { TacticalReticle } from '../effects/TacticalReticle';
import { useSpotlightBorders } from '../effects/useSpotlight';

interface CinematicBackgroundProps {
  activeState?: SituationState;
  isSimulating?: boolean;
  threatLevel?: number;
  children?: React.ReactNode;
}

export const CinematicIntelligenceBackground: React.FC<CinematicBackgroundProps> = ({
  activeState = 'CRITICAL',
  isSimulating = false,
  threatLevel = 0.94,
  children
}) => {
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Initialize interactive pointer spotlight tracking on all .spotlight-card elements
  useSpotlightBorders();

  // Pause heavy background effects when tab is not visible to preserve GPU/CPU performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Compute state-reactive atmospheric colors
  const getStateAtmosphere = (state: SituationState) => {
    switch (state) {
      case 'CRITICAL':
        return {
          glowColor: 'rgba(194, 31, 43, 0.16)',
          accentGlow: 'rgba(240, 210, 143, 0.09)',
          gridOpacity: '0.14'
        };
      case 'ESCALATING':
        return {
          glowColor: 'rgba(229, 80, 47, 0.14)',
          accentGlow: 'rgba(232, 178, 92, 0.09)',
          gridOpacity: '0.13'
        };
      case 'SUSPICIOUS':
        return {
          glowColor: 'rgba(224, 129, 47, 0.12)',
          accentGlow: 'rgba(201, 161, 93, 0.08)',
          gridOpacity: '0.11'
        };
      case 'ANOMALOUS':
        return {
          glowColor: 'rgba(224, 178, 62, 0.10)',
          accentGlow: 'rgba(201, 161, 93, 0.07)',
          gridOpacity: '0.10'
        };
      case 'NORMAL':
        return {
          glowColor: 'rgba(63, 174, 99, 0.09)',
          accentGlow: 'rgba(201, 161, 93, 0.06)',
          gridOpacity: '0.08'
        };
      default:
        return {
          glowColor: 'rgba(201, 161, 93, 0.12)',
          accentGlow: 'rgba(240, 210, 143, 0.07)',
          gridOpacity: '0.10'
        };
    }
  };

  const atmosphere = getStateAtmosphere(activeState);

  return (
    <div className="relative min-h-screen w-full bg-[#050403] text-[#fbf3e3] overflow-x-hidden selection:bg-[#c9a15d]/30 selection:text-[#fff6e4]">
      {/* Tactical OSINT Reticle Cursor (Smooth mouse lock-on tracker) */}
      <TacticalReticle />

      {/* =========================================================================
          LAYER 0: Base Obsidian Vacuum
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none bg-[#050403]" />

      {/* =========================================================================
          LAYER 1: Interactive WebGL Threat Attention Field (Mouse Gaze Tracker)
          ========================================================================= */}
      {isTabVisible && (
        <ThreatAttentionField activeState={activeState} />
      )}

      {/* =========================================================================
          LAYER 1.5: Tactical Coordinate Grid & Geospatial Contour Lines
          ========================================================================= */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: isTabVisible ? atmosphere.gridOpacity : '0.04' }}
      >
        {/* Subtle 64px tactical coordinate grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(201, 161, 93, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(201, 161, 93, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px'
          }}
        />

        {/* Faint crosshair reticles at grid intersections */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(240, 210, 143, 0.4) 1px, transparent 0)`,
            backgroundSize: '128px 128px'
          }}
        />
      </div>

      {/* =========================================================================
          LAYER 2: Dark Vignette Radial Depth Gradient
          ========================================================================= */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 1200px 900px at 50% 25%, rgba(26, 19, 10, 0.38) 0%, rgba(10, 7, 4, 0.88) 60%, #050403 100%)'
        }}
      />

      {/* =========================================================================
          LAYER 3: Dynamic Gold & State-Reactive Atmospheric Glow
          ========================================================================= */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle 600px at 20% 15%, ${atmosphere.accentGlow}, transparent 70%),
            radial-gradient(circle 700px at 80% 20%, ${atmosphere.glowColor}, transparent 70%),
            radial-gradient(circle 900px at 50% 80%, ${atmosphere.glowColor}, transparent 80%)
          `
        }}
      />

      {/* =========================================================================
          LAYER 4: Subtle Depth Particle Field (Deterministic & GPU-accelerated)
          ========================================================================= */}
      {isTabVisible && <IntelligenceParticles count={24} activeState={activeState} />}

      {/* =========================================================================
          LAYER 5: Orbital Telemetry System & Sweep Horizon
          ========================================================================= */}
      {isTabVisible && <OrbitalField activeState={activeState} isSimulating={isSimulating} />}

      {/* Threat Energy Pulse Horizon (Subtle top bar glow when threat is high) */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-30 transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${activeState === 'CRITICAL' ? '#c21f2b' : '#c9a15d'} 50%, transparent 100%)`,
          boxShadow: `0 0 16px ${activeState === 'CRITICAL' ? 'rgba(194, 31, 43, 0.8)' : 'rgba(201, 161, 93, 0.6)'}`,
          opacity: threatLevel > 0.8 ? 0.9 : 0.4
        }}
      />

      {/* =========================================================================
          LAYER 6: Foreground Application UI
          ========================================================================= */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
