/**
 * A centralized hook for responsive design.
 * Provides a boolean indicating if the current viewport matches the desktop breakpoint.
 * Uses the performant `window.matchMedia` API.
 */
import { useState, useEffect } from 'react';

// Using 768px as the standard 'md' breakpoint from Tailwind.
const DESKTOP_BREAKPOINT = '(min-width: 768px)';

export const useResponsive = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_BREAKPOINT).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(DESKTOP_BREAKPOINT);
    const listener = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);

    // Cleanup listener on component unmount
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, []);

  return { isDesktop };
};