import React, { useEffect, useRef, useState } from 'react';
import type { SituationState } from '../../types';

export interface SentinelLogoProps {
  variant?: 'compact' | 'header' | 'hero' | 'loading' | 'monochrome';
  activeState?: SituationState;
  interactive?: boolean;
  showOrbits?: boolean;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({
  variant = 'header',
  activeState = 'CRITICAL',
  interactive = false,
  showOrbits = true,
  showWordmark = false,
  className = '',
  onClick
}) => {
  const worldRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const streaksRef = useRef<SVGGElement>(null);
  const streaksRevRef = useRef<SVGGElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Procedural radial streaks calculation for authentic organic tech iris
  useEffect(() => {
    const drawStreaks = (el: SVGGElement | null, count: number, rInner: number, rOuter: number, widthMin: number, widthMax: number) => {
      if (!el) return;
      el.innerHTML = '';
      const svgNS = 'http://www.w3.org/2000/svg';
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2) * (i / count) + (Math.random() * 0.06 - 0.03);
        const jitter = Math.random() * 0.28;
        const r1 = rInner + Math.random() * 4;
        const r2 = rOuter - jitter * (rOuter - rInner) * 0.5;
        const x1 = 75 + Math.cos(a) * r1;
        const y1 = 75 + Math.sin(a) * r1;
        const x2 = 75 + Math.cos(a) * r2;
        const y2 = 75 + Math.sin(a) * r2;
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x1.toFixed(2));
        line.setAttribute('y1', y1.toFixed(2));
        line.setAttribute('x2', x2.toFixed(2));
        line.setAttribute('y2', y2.toFixed(2));
        line.setAttribute('stroke-width', (widthMin + Math.random() * (widthMax - widthMin)).toFixed(2));
        line.setAttribute('opacity', (0.4 + Math.random() * 0.5).toFixed(2));
        line.setAttribute('stroke', 'url(#sentinelGoldGrad)');
        line.setAttribute('stroke-linecap', 'round');
        el.appendChild(line);
      }
    };

    drawStreaks(streaksRef.current, 44, 20, 48, 0.6, 1.4);
    drawStreaks(streaksRevRef.current, 28, 24, 44, 0.5, 1.0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !worldRef.current) return;
    const rect = worldRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: my * -16, y: mx * 20 });
  };

  const handleMouseLeave = () => {
    if (interactive) setTilt({ x: 0, y: 0 });
  };

  const getStateColor = (st: SituationState) => {
    switch (st) {
      case 'CRITICAL': return '#c21f2b';
      case 'ESCALATING': return '#e5502f';
      case 'SUSPICIOUS': return '#e0812f';
      case 'ANOMALOUS': return '#e0b23e';
      case 'NORMAL': return '#3fae63';
      default: return '#c9a15d';
    }
  };

  const isHero = variant === 'hero' || variant === 'loading';
  const isCompact = variant === 'compact';
  const isMonochrome = variant === 'monochrome';

  const eyeSize = isHero ? 180 : isCompact ? 32 : 44;
  const worldDimensions = isHero ? 'w-[320px] h-[320px]' : isCompact ? 'w-9 h-9' : 'w-12 h-12';

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        ref={worldRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative ${worldDimensions} flex items-center justify-center`}
        style={{ perspective: isHero ? '1100px' : 'none' }}
      >
        <div
          ref={parallaxRef}
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: isHero ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Orbital Rings (Only shown for Hero / Header when enabled) */}
          {showOrbits && isHero && (
            <div className="absolute inset-0 pointer-events-none" style={{ animation: 'drift 16s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
              {/* Ring 1: VIDEO */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-x-[74deg]">
                <div className="w-[300px] h-[300px] -m-[150px] rounded-full border border-[#c9a15d]/35 shadow-[0_0_12px_rgba(201,161,93,0.12)_inset]" />
                <div className="absolute inset-0 animate-[spin-cw_10s_linear_infinite]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[150px] w-2 h-2 -m-1 rounded-full bg-[#f0d28f] shadow-[0_0_9px_2px_rgba(240,210,143,0.85)]">
                    <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-wider text-[#c9a15d] whitespace-nowrap">
                      VIDEO
                    </span>
                  </div>
                </div>
              </div>

              {/* Ring 2: NETWORK */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-x-[74deg] rotate-z-[55deg]">
                <div className="w-[246px] h-[246px] -m-[123px] rounded-full border border-[#c9a15d]/35 shadow-[0_0_10px_rgba(201,161,93,0.12)_inset]" />
                <div className="absolute inset-0 animate-[spin-ccw_7s_linear_infinite]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[123px] w-2 h-2 -m-1 rounded-full bg-[#f0d28f] shadow-[0_0_8px_2px_rgba(240,210,143,0.8)]">
                    <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-wider text-[#c9a15d] whitespace-nowrap">
                      NETWORK
                    </span>
                  </div>
                </div>
              </div>

              {/* Ring 3: ACCESS */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-x-[74deg] -rotate-z-[50deg]">
                <div className="w-[200px] h-[200px] -m-[100px] rounded-full border border-[#c9a15d]/30 shadow-[0_0_8px_rgba(201,161,93,0.1)_inset]" />
                <div className="absolute inset-0 animate-[spin-cw_5s_linear_infinite]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[100px] w-2 h-2 -m-1 rounded-full bg-[#f0d28f] shadow-[0_0_8px_2px_rgba(240,210,143,0.8)]">
                    <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-wider text-[#c9a15d] whitespace-nowrap">
                      ACCESS
                    </span>
                  </div>
                </div>
              </div>

              {/* Ring 4: INNER DASHED */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-x-[74deg] rotate-z-[20deg]">
                <div className="w-[155px] h-[155px] -m-[77px] rounded-full border border-dashed border-[#f0d28f]/40" />
                <div className="absolute inset-0 animate-[spin-ccw_3.5s_linear_infinite]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[77px] w-1.5 h-1.5 -m-0.75 rounded-full bg-[#f0d28f] shadow-[0_0_6px_1px_rgba(240,210,143,0.7)]" />
                </div>
              </div>
            </div>
          )}

          {/* Central Eye Core */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: `${eyeSize}px`,
              height: `${eyeSize}px`,
              animation: isHero ? 'tilt-eye 7s ease-in-out infinite' : 'none'
            }}
          >
            {/* Atmospheric Core Glow */}
            <div
              className="absolute -inset-4 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${isMonochrome ? 'rgba(201,161,93,0.25)' : `${getStateColor(activeState)}33`}, transparent 70%)`,
                filter: 'blur(8px)',
                animation: 'breathe-glow 3.2s ease-in-out infinite'
              }}
            />

            <svg
              viewBox="0 0 150 150"
              width={eyeSize}
              height={eyeSize}
              className="overflow-visible relative"
            >
              <defs>
                <radialGradient id="sentinelSphereGrad" cx="38%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#2a2113" />
                  <stop offset="55%" stopColor="#150f09" />
                  <stop offset="100%" stopColor="#070503" />
                </radialGradient>
                <radialGradient id="sentinelIrisBed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3a2c15" />
                  <stop offset="70%" stopColor="#1c150c" />
                  <stop offset="100%" stopColor="#0d0a06" />
                </radialGradient>
                <linearGradient id="sentinelGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff0cf" />
                  <stop offset="55%" stopColor="#c9a15d" />
                  <stop offset="100%" stopColor="#e8b25c" />
                </linearGradient>
              </defs>

              {/* Sclera Base Sphere */}
              <circle cx="75" cy="75" r="72" fill="url(#sentinelSphereGrad)" stroke="rgba(201,161,93,0.6)" strokeWidth="1.6" />
              <circle cx="75" cy="75" r="50" fill="url(#sentinelIrisBed)" opacity="0.95" />

              {/* Procedural Streaks */}
              <g ref={streaksRef} style={{ transformOrigin: '75px 75px', animation: 'iris-rot 22s linear infinite' }} />
              <g ref={streaksRevRef} style={{ transformOrigin: '75px 75px', animation: 'iris-rot 30s linear infinite reverse', opacity: 0.6 }} />

              {/* Technical Precision Hex / Circles */}
              <polygon
                points="75,33 106,49 106,101 75,117 44,101 44,49"
                fill="none"
                stroke="rgba(240,210,143,0.5)"
                strokeWidth="1"
                strokeDasharray="2 5"
                style={{ transformOrigin: '75px 75px', animation: 'iris-rot 9s linear infinite reverse' }}
              />
              <circle
                cx="75"
                cy="75"
                r="29"
                fill="none"
                stroke="rgba(240,210,143,0.5)"
                strokeWidth="1"
                strokeDasharray="2 5"
                style={{ transformOrigin: '75px 75px', animation: 'iris-rot 14s linear infinite' }}
              />

              {/* Reticle Lashes */}
              <g stroke="rgba(201,161,93,0.6)" strokeWidth="1.2">
                <line x1="75" y1="6" x2="75" y2="16" />
                <line x1="75" y1="134" x2="75" y2="144" />
                <line x1="6" y1="75" x2="16" y2="75" />
                <line x1="134" y1="75" x2="144" y2="75" />
                <line x1="24" y1="24" x2="31" y2="31" />
                <line x1="126" y1="24" x2="119" y2="31" />
                <line x1="24" y1="126" x2="31" y2="119" />
                <line x1="126" y1="126" x2="119" y2="119" />
              </g>

              {/* Radar Sweep Line */}
              <line
                x1="75"
                y1="75"
                x2="75"
                y2="22"
                stroke="#f0d28f"
                strokeWidth="1.4"
                opacity="0.9"
                style={{ transformOrigin: '75px 75px', animation: 'sweep-rot 3.4s linear infinite' }}
              />

              {/* Active Intelligence State Core */}
              <g style={{ transformOrigin: '75px 75px', color: getStateColor(activeState) }}>
                <circle
                  cx="75"
                  cy="75"
                  r="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity="0.65"
                  style={{ animation: 'ring-expand 1.6s ease-out infinite' }}
                />
                <line x1="65" y1="75" x2="85" y2="75" stroke="#fff6e4" strokeWidth="1" opacity="0.85" style={{ transformOrigin: '75px 75px', animation: 'sweep-rot 2.6s linear infinite' }} />
                <line x1="75" y1="65" x2="75" y2="85" stroke="#fff6e4" strokeWidth="1" opacity="0.85" style={{ transformOrigin: '75px 75px', animation: 'sweep-rot 2.6s linear infinite' }} />
                <circle
                  cx="75"
                  cy="75"
                  r="6.5"
                  fill="currentColor"
                  style={{ filter: `drop-shadow(0 0 10px ${getStateColor(activeState)})` }}
                />
              </g>
            </svg>

            {/* Specular Iris Gloss Highlight */}
            <div
              className="absolute top-[12%] left-[16%] w-[46%] h-[32%] rounded-full pointer-events-none -rotate-[18deg] mix-blend-screen"
              style={{
                background: 'radial-gradient(ellipse at 35% 30%, rgba(255,246,228,0.55), rgba(255,246,228,0) 70%)',
                animation: 'breathe-glow 3.2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-sans font-bold tracking-wider text-base lg:text-lg text-gold-gradient">
              SENTINEL<span className="text-gold-hot font-extrabold">-X</span>
            </span>
            <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold-deep/30 border border-gold/40 text-gold-hot font-bold tracking-widest">
              v2.0
            </span>
          </div>
          <p className="text-[10px] text-muted font-mono tracking-wider">
            SITUATION INTELLIGENCE
          </p>
        </div>
      )}
    </div>
  );
};
