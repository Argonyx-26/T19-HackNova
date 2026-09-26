import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export const IntelligenceParticles: React.FC<{ count?: number; activeState?: string }> = ({
  count = 24
}) => {
  // Deterministic seed generation to avoid re-renders & layout thrashing
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic pseudo-random based on index
      const seed1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const seed2 = Math.cos(i * 269.5 + 183.3) * 43758.5453;
      const r1 = seed1 - Math.floor(seed1);
      const r2 = seed2 - Math.floor(seed2);

      return {
        id: i,
        x: Math.round(r1 * 100),
        y: Math.round(r2 * 100),
        size: Math.round((1.2 + r1 * 2.2) * 10) / 10,
        opacity: Math.round((0.15 + r2 * 0.45) * 100) / 100,
        duration: Math.round((3.0 + r1 * 4.0) * 10) / 10,
        delay: Math.round(r2 * 3.0 * 10) / 10
      };
    });
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-60 mix-blend-screen"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#f0d28f] shadow-[0_0_8px_1px_rgba(240,210,143,0.6)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `breathe-glow ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};
