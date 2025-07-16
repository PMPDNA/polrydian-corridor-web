import { useEffect, useState } from 'react';

export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Detect user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

    setReducedMotion(prefersReducedMotion.matches);
    setHighContrast(prefersHighContrast.matches);

    // Listen for changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    prefersReducedMotion.addEventListener('change', handleReducedMotionChange);
    prefersHighContrast.addEventListener('change', handleContrastChange);

    return () => {
      prefersReducedMotion.removeEventListener('change', handleReducedMotionChange);
      prefersHighContrast.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    if (reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    root.setAttribute('data-font-size', fontSize);
  }, [highContrast, reducedMotion, fontSize]);

  const increaseFontSize = () => {
    setFontSize(current => {
      switch (current) {
        case 'normal': return 'large';
        case 'large': return 'extra-large';
        default: return 'extra-large';
      }
    });
  };

  const decreaseFontSize = () => {
    setFontSize(current => {
      switch (current) {
        case 'extra-large': return 'large';
        case 'large': return 'normal';
        default: return 'normal';
      }
    });
  };

  const resetFontSize = () => setFontSize('normal');

  const toggleHighContrast = () => setHighContrast(!highContrast);

  return {
    highContrast,
    reducedMotion,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
  };
};