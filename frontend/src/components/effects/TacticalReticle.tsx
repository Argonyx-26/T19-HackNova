import React, { useEffect, useRef } from 'react';

export const TacticalReticle: React.FC = () => {
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ret = reticleRef.current;
    if (!ret) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let isHoveringTarget = false;
    let raf = 0;

    const move = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      if (ret) {
        ret.style.transform = `translate(${x}px, ${y}px) scale(${isHoveringTarget ? 1.45 : 1})`;
      }
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.25) {
        raf = requestAnimationFrame(move);
      } else {
        raf = 0;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as HTMLElement | null;
      isHoveringTarget = !!(target && target.closest('a, button, [role="button"], input, select, .cursor-pointer, .clickable-node'));
      if (ret) {
        ret.classList.toggle('hot', isHoveringTarget);
        ret.classList.add('active');
      }
      if (!raf) raf = requestAnimationFrame(move);
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && ret) {
        ret.classList.remove('active');
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div
      ref={reticleRef}
      aria-hidden="true"
      className="fixed left-[-17px] top-[-17px] w-[34px] height-[34px] z-[9999] pointer-events-none rounded-full border border-[#f0d28f]/60 opacity-0 transition-opacity duration-200 will-change-transform mix-blend-screen [&.active]:opacity-100 [&.hot]:border-[#fff] [&.hot]:shadow-[0_0_12px_rgba(240,210,143,0.8)]"
      style={{ height: '34px' }}
    >
      {/* 4-axis Crosshair Lashes */}
      <div
        className="absolute inset-[-6px] opacity-90 transition-transform duration-300 ease-out"
        style={{
          background: `
            linear-gradient(#f0d28f, #f0d28f) 50% 0 / 1px 7px no-repeat,
            linear-gradient(#f0d28f, #f0d28f) 50% 100% / 1px 7px no-repeat,
            linear-gradient(#f0d28f, #f0d28f) 0 50% / 7px 1px no-repeat,
            linear-gradient(#f0d28f, #f0d28f) 100% 50% / 7px 1px no-repeat
          `
        }}
      />
      {/* Center Reticle Point */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#f0d28f] shadow-[0_0_4px_#fff]" />
    </div>
  );
};
