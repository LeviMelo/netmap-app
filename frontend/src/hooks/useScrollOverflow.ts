import { useState, useEffect, useRef, RefObject } from 'react';

export const useScrollOverflow = (ref: RefObject<HTMLElement | null>) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Disconnect previous observer if ref changes
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const checkOverflow = () => {
      // The core logic: content width is greater than visible width
      const hasOverflow = element.scrollWidth > element.clientWidth;
      setIsOverflowing(hasOverflow);
    };

    // Create a new observer that calls our check function on resize
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);
    observerRef.current = resizeObserver;

    // Initial check
    checkOverflow();

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return isOverflowing;
};