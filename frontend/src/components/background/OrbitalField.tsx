import React from 'react';

export const OrbitalField: React.FC<{ activeState?: string; isSimulating?: boolean }> = ({
  isSimulating = false
}) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 flex items-center justify-center"
      style={{ animation: 'drift 24s ease-in-out infinite', transformStyle: 'preserve-3d' }}
    >
      {/* Outer Large Tactical Coordinate Ring */}
      <div className="absolute w-[900px] h-[900px] rounded-full border border-[#c9a15d]/15 -rotate-x-[60deg]">
        <div className="absolute inset-0 animate-[spin-cw_60s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#f0d28f] shadow-[0_0_12px_2px_rgba(240,210,143,0.7)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#c9a15d]/50" />
        </div>
      </div>

      {/* Middle Orbit with Direction Indicator */}
      <div className="absolute w-[680px] h-[680px] rounded-full border border-dashed border-[#c9a15d]/20 -rotate-x-[60deg] rotate-z-[45deg]">
        <div className="absolute inset-0 animate-[spin-ccw_40s_linear_infinite]">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f0d28f] shadow-[0_0_10px_2px_rgba(240,210,143,0.6)]" />
        </div>
      </div>

      {/* Inner Fast Scanning Ring */}
      <div className="absolute w-[440px] h-[440px] rounded-full border border-[#f0d28f]/20 -rotate-x-[60deg] -rotate-z-[30deg]">
        <div className={`absolute inset-0 ${isSimulating ? 'animate-[spin-cw_8s_linear_infinite]' : 'animate-[spin-cw_20s_linear_infinite]'}`}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f0d28f] shadow-[0_0_8px_2px_rgba(240,210,143,0.8)]" />
        </div>
      </div>
    </div>
  );
};
