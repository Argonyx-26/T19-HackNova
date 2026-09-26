import React from 'react';

interface ProgressiveBlurProps {
  direction?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  blurIntensity?: number;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  direction = 'bottom',
  className = '',
  blurIntensity = 24
}) => {
  const getGradient = () => {
    switch (direction) {
      case 'top':
        return 'linear-gradient(to top, rgba(5,4,3,0) 0%, rgba(5,4,3,0.85) 75%, rgba(5,4,3,1) 100%)';
      case 'bottom':
        return 'linear-gradient(to bottom, rgba(5,4,3,0) 0%, rgba(5,4,3,0.85) 75%, rgba(5,4,3,1) 100%)';
      case 'left':
        return 'linear-gradient(to left, rgba(5,4,3,0) 0%, rgba(5,4,3,0.85) 75%, rgba(5,4,3,1) 100%)';
      case 'right':
        return 'linear-gradient(to right, rgba(5,4,3,0) 0%, rgba(5,4,3,0.85) 75%, rgba(5,4,3,1) 100%)';
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 ${className}`}
      style={{
        background: getGradient(),
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`
      }}
    />
  );
};
