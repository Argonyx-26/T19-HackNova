import { useEffect } from 'react';

export const useSpotlightBorders = () => {
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const targets = document.querySelectorAll<HTMLElement>('.spotlight-card');
      targets.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--gx', `${x}px`);
        card.style.setProperty('--gy', `${y}px`);
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);
};
