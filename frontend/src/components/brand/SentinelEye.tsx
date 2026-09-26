import React, { useEffect, useRef, useState } from 'react';

interface SentinelEyeProps {
  size?: 'hero' | 'header' | 'compact';
  interactive?: boolean;
  activeState?: 'NORMAL' | 'ANOMALOUS' | 'SUSPICIOUS' | 'ESCALATING' | 'CRITICAL' | 'CONTAINED';
  showOrbits?: boolean;
  className?: string;
}

export const SentinelEye: React.FC<SentinelEyeProps> = ({
  size = 'hero',
  interactive = true,
  activeState = 'CRITICAL',
  showOrbits = true,
  className = ''
}) => {
  const worldRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const streaksRef = useRef<SVGGElement>(null);
  const streaksRevRef = useRef<SVGGElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Draw procedural radial iris streaks
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
        line.setAttribute('stroke', 'url(#goldGrad)');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-width', (widthMin + Math.random() * (widthMax - widthMin)).toFixed(2));
        line.setAttribute('opacity', (0.35 + Math.random() * 0.5).toFixed(2));
        el.appendChild(line);
      }
    };

    drawStreaks(streaksRef.current, 46, 20, 49, 0.6, 1.4);
    drawStreaks(streaksRevRef.current, 30, 24, 44, 0.5, 1.0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !worldRef.current) return;
    const rect = worldRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: my * -16, y: mx * 20 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const stateColors: Record<string, string> = {
    NORMAL: '#3fae63',
    ANOMALOUS: '#e0b23e',
    SUSPICIOUS: '#e0812f',
    ESCALATING: '#e5502f',
    CRITICAL: '#c21f2b',
    CONTAINED: '#6366f1'
  };

  const currentColor = stateColors[activeState] || '#c21f2b';

  if (size === 'compact' || size === 'header') {
    const dim = size === 'header' ? 'w-10 h-10' : 'w-7 h-7';
    return (
      <div className={`relative ${dim} flex items-center justify-center select-none ${className}`}>
        <div
          className="absolute inset-0 rounded-full blur-sm opacity-60 animate-pulse"
          style={{ background: `radial-gradient(circle, ${currentColor}44 0%, transparent 70%)` }}
        />
        <svg viewBox="0 0 150 150" className="w-full h-full relative z-10 overflow-visible">
          <defs>
            <radialGradient id={`sphereGrad-${size}`} cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#2a2113" />
              <stop offset="55%" stopColor="#150f09" />
              <stop offset="100%" stopColor="#070503" />
            </radialGradient>
            <linearGradient id={`goldGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff0cf" />
              <stop offset="55%" stopColor="#c9a15d" />
              <stop offset="100%" stopColor="#e8b25c" />
            </linearGradient>
          </defs>
          <circle cx="75" cy="75" r="72" fill={`url(#sphereGrad-${size})`} stroke="rgba(201,161,93,0.7)" strokeWidth="3" />
          <circle cx="75" cy="75" r="50" fill="#1c150c" stroke="rgba(201,161,93,0.3)" strokeWidth="1" />
          <polygon points="75,33 106,49 106,101 75,117 44,101 44,49" fill="none" stroke="rgba(240,210,143,0.6)" strokeWidth="1.5" strokeDasharray="3 5" />
          <line x1="75" y1="75" x2="75" y2="24" stroke="#f0d28f" strokeWidth="2" opacity="0.85" className="origin-[75px_75px] animate-[spin-cw_3.4s_linear_infinite]" />
          <circle cx="75" cy="75" r="7" fill={currentColor} style={{ filter: `drop-shadow(0 0 8px ${currentColor})` }} />
        </svg>
      </div>
    );
  }

  // Hero size (340x340 full 3D parallax)
  return (
    <div
      ref={worldRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-[340px] h-[340px] select-none [perspective:1100px] ${className}`}
    >
      <div
        ref={parallaxRef}
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-300 ease-out"
      >
        {/* Depth particle field */}
        <div className="absolute inset-0 [transform-style:preserve-3d] animate-[field-spin_30s_linear_infinite] pointer-events-none">
          {Array.from({ length: 28 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 28;
            const r = 90 + ((i * 17) % 75);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * (r * 0.45) - 15;
            const z = ((i % 5) - 2) * 45;
            const sizePx = 1.6 + (i % 3) * 0.8;
            return (
              <div
                key={i}
                style={{
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                  animationDelay: `${(i * 0.2) % 2.8}s`
                }}
                className="absolute top-1/2 left-1/2 rounded-full bg-[#f0d28f] shadow-[0_0_6px_1px_rgba(240,210,143,0.6)] animate-pulse"
              />
            );
          })}
        </div>

        {/* Orbit rings */}
        {showOrbits && (
          <div className="absolute inset-0 [transform-style:preserve-3d] animate-[drift_16s_ease-in-out_infinite]">
            {/* Orbit 1: VIDEO */}
            <div className="absolute top-1/2 left-1/2 [transform-style:preserve-3d] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(74deg)]">
              <div className="w-[310px] h-[310px] -m-[155px] rounded-full border border-[rgba(201,161,93,0.4)] shadow-[0_0_12px_rgba(201,161,93,0.12)_inset]" />
              <div className="absolute inset-0 [transform-style:preserve-3d] animate-[spin-cw_10s_linear_infinite]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[155px]">
                  <div className="w-2 h-2 rounded-full bg-[#f0d28f] shadow-[0_0_9px_2px_rgba(240,210,143,0.85)] relative">
                    <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-wider text-[#a3927a] whitespace-nowrap">
                      VIDEO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbit 2: NETWORK */}
            <div className="absolute top-1/2 left-1/2 [transform-style:preserve-3d] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(74deg)_rotateZ(55deg)]">
              <div className="w-[256px] h-[256px] -m-[128px] rounded-full border border-[rgba(201,161,93,0.35)] shadow-[0_0_10px_rgba(201,161,93,0.1)_inset]" />
              <div className="absolute inset-0 [transform-style:preserve-3d] animate-[spin-ccw_7s_linear_infinite]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[128px]">
                  <div className="w-2 h-2 rounded-full bg-[#f0d28f] shadow-[0_0_9px_2px_rgba(240,210,143,0.85)] relative">
                    <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-wider text-[#a3927a] whitespace-nowrap">
                      NETWORK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbit 3: ACCESS */}
            <div className="absolute top-1/2 left-1/2 [transform-style:preserve-3d] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(74deg)_rotateZ(-50deg)]">
              <div className="w-[208px] h-[208px] -m-[104px] rounded-full border border-[rgba(201,161,93,0.35)] shadow-[0_0_8px_rgba(201,161,93,0.1)_inset]" />
              <div className="absolute inset-0 [transform-style:preserve-3d] animate-[spin-cw_5s_linear_infinite]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[104px]">
                  <div className="w-2 h-2 rounded-full bg-[#f0d28f] shadow-[0_0_9px_2px_rgba(240,210,143,0.85)] relative">
                    <span className="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-wider text-[#a3927a] whitespace-nowrap">
                      ACCESS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbit 4: Dashed Inner Ring */}
            <div className="absolute top-1/2 left-1/2 [transform-style:preserve-3d] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(74deg)_rotateZ(20deg)]">
              <div className="w-[160px] h-[160px] -m-[80px] rounded-full border border-dashed border-[rgba(201,161,93,0.4)]" />
              <div className="absolute inset-0 [transform-style:preserve-3d] animate-[spin-ccw_3.4s_linear_infinite]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-[80px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f0d28f] shadow-[0_0_6px_rgba(240,210,143,0.8)]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Central Optic Cyber Eye */}
        <div className="absolute top-1/2 left-1/2 w-[180px] h-[180px] -m-[90px] rounded-full flex items-center justify-center [transform-style:preserve-3d] animate-[tilt-eye_7s_ease-in-out_infinite]">
          {/* Radial Glow Background */}
          <div
            className="absolute -inset-6 rounded-full blur-md animate-[breathe-glow_3.2s_ease-in-out_infinite] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(240,210,143,0.35) 0%, transparent 70%)' }}
          />

          <svg viewBox="0 0 150 150" width="180" height="180" className="overflow-visible relative">
            <defs>
              <radialGradient id="sphereGrad" cx="38%" cy="32%" r="70%">
                <stop offset="0%" stopColor="#2a2113" />
                <stop offset="55%" stopColor="#150f09" />
                <stop offset="100%" stopColor="#070503" />
              </radialGradient>
              <radialGradient id="irisBed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3a2c15" />
                <stop offset="70%" stopColor="#1c150c" />
                <stop offset="100%" stopColor="#0d0a06" />
              </radialGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff0cf" />
                <stop offset="55%" stopColor="#c9a15d" />
                <stop offset="100%" stopColor="#e8b25c" />
              </linearGradient>
            </defs>

            {/* Sclera & Iris Bed */}
            <circle cx="75" cy="75" r="72" fill="url(#sphereGrad)" stroke="rgba(201,161,93,0.6)" strokeWidth="1.6" />
            <circle cx="75" cy="75" r="50" fill="url(#irisBed)" opacity="0.9" />

            {/* Radial Streaks Groups */}
            <g ref={streaksRef} className="origin-[75px_75px] animate-[iris-rot_22s_linear_infinite]" />
            <g ref={streaksRevRef} className="origin-[75px_75px] animate-[iris-rot_30s_linear_infinite_reverse] opacity-60" />

            {/* Tech Hexagon and Circle */}
            <polygon points="75,33 106,49 106,101 75,117 44,101 44,49" fill="none" stroke="rgba(240,210,143,0.5)" strokeWidth="1" strokeDasharray="2 5" className="origin-[75px_75px] animate-[iris-rot_9s_linear_infinite_reverse]" />
            <circle cx="75" cy="75" r="29" fill="none" stroke="rgba(240,210,143,0.4)" strokeWidth="1" strokeDasharray="3 6" className="origin-[75px_75px] animate-[iris-rot_14s_linear_infinite]" />

            {/* Crosshair Lashes */}
            <g stroke="rgba(201,161,93,0.55)" strokeWidth="1.2">
              <line x1="75" y1="6" x2="75" y2="16" />
              <line x1="75" y1="134" x2="75" y2="144" />
              <line x1="6" y1="75" x2="16" y2="75" />
              <line x1="134" y1="75" x2="144" y2="75" />
              <line x1="24" y1="24" x2="31" y2="31" />
              <line x1="126" y1="24" x2="119" y2="31" />
              <line x1="24" y1="126" x2="31" y2="119" />
              <line x1="126" y1="126" x2="119" y2="119" />
            </g>

            {/* Sweeping Radar Scanner */}
            <line x1="75" y1="75" x2="75" y2="22" stroke="#f0d28f" strokeWidth="1.4" opacity="0.9" className="origin-[75px_75px] animate-[sweep-rot_3.4s_linear_infinite]" />

            {/* Active Core with Dynamic State Pulse */}
            <g className="origin-[75px_75px] animate-[core-pulse_6s_infinite]">
              <circle cx="75" cy="75" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.6" className="animate-[ring-expand_1.5s_ease-out_infinite]" />
              <line x1="65" y1="75" x2="85" y2="75" stroke="#fff6e4" strokeWidth="1" opacity="0.85" className="origin-[75px_75px] animate-[spin-cw_2.6s_linear_infinite]" />
              <line x1="75" y1="65" x2="75" y2="85" stroke="#fff6e4" strokeWidth="1" opacity="0.85" className="origin-[75px_75px] animate-[spin-cw_2.6s_linear_infinite]" />
              <circle cx="75" cy="75" r="6.5" fill="currentColor" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
            </g>
          </svg>

          {/* Optical Gloss Reflection */}
          <div className="absolute top-[12%] left-[16%] w-[46%] h-[32%] rounded-full bg-[radial-gradient(ellipse_at_35%_30%,rgba(255,246,228,0.55),rgba(255,246,228,0)_70%)] -rotate-[18deg] mix-blend-screen pointer-events-none animate-pulse" />
        </div>
      </div>
    </div>
  );
};
