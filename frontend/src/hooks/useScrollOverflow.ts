import { useState, useEffect, RefObject } from 'react';

export const useScrollOverflow = (ref: RefObject<HTMLElement | null>) => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkOverflow = () => {
      const hasOverflow = element.scrollWidth > element.clientWidth;
      setIsOverflowing(hasOverflow);
    };

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(element, { childList: true, subtree: true });

    // A small delay helps ensure content has rendered before the initial check.
    const initialCheckTimeout = setTimeout(checkOverflow, 50);

    return () => {
      clearTimeout(initialCheckTimeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref]); // Re-run if the ref itself changes

  return isOverflowing;
};