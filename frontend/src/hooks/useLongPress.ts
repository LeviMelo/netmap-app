import { useCallback, useRef } from 'react';

// Defines the options for the long press hook
interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

/**
 * A hook to detect long press events on mouse and touch devices.
 * @param onLongPress - Callback for the long press event.
 * @param onClick - Callback for a regular click event.
 * @param options - Configuration for delay and default event prevention.
 */
export const useLongPress = (
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void,
  onClick: (event: React.MouseEvent | React.TouchEvent) => void,
  { shouldPreventDefault = true, delay = 400 }: LongPressOptions = {}
) => {
  // FIXED: The ref type must include `| null` and be initialized with `null`.
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // FIXED: Initialize the target ref with `null`.
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        target.current = event.target;
        const preventDefault = (e: Event) => e.preventDefault();
        event.target.addEventListener('contextmenu', preventDefault, { once: true });
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        // FIXED: Set the ref back to `null` after firing to match the type.
        timeout.current = null;
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      // This logic is now robust. If the timeout completed, timeout.current is null,
      // and isShortClick will correctly be false.
      const isShortClick = timeout.current !== null;
      
      // Always clear the timer if it exists.
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      if (shouldTriggerClick && isShortClick && event.target === target.current) {
        onClick(event);
      }
      
      if (shouldPreventDefault && target.current) {
        const preventDefault = (e: Event) => e.preventDefault();
        target.current.removeEventListener('contextmenu', preventDefault);
      }
    },
    [shouldPreventDefault, onClick]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
};