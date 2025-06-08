import React, { useState, cloneElement } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  arrow,
} from '@floating-ui/react';
import { useRef } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: JSX.Element; // Important: We need a single JSX element as a child
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  // Floating UI's core hook for positioning
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    // Make sure the tooltip stays on the screen
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10), // Move it 10px away from the button
      flip({ fallbackAxisSideDirection: 'start' }), // Flip to the bottom if there's no space on top
      shift(), // Ensure it doesn't get cut off at the edges
      arrow({ element: arrowRef }), // Connect the arrow
    ],
  });

  // Hooks to control visibility based on user interaction
  const hover = useHover(context, { move: false, delay: { open: 500, close: 100 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  // Merge all the interaction hooks into props
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      {/* We clone the child to attach the necessary ref and event handlers */}
      {cloneElement(children, getReferenceProps({ ref: refs.setReference, ...children.props }))}
      
      {/* The Portal teleports the tooltip's JSX to the `tooltip-root` div in index.html */}
      <FloatingPortal id="tooltip-root">
        {isOpen && (
          <div
            className="pointer-events-none z-[999]" // High z-index to be on top of everything
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {/* NEW STYLING: Opaque, glassmorphic, with a more prominent pointer */}
            <div 
              className="
                px-3 py-2 rounded-lg shadow-xl
                text-sm font-medium text-slate-200
                bg-slate-800/90 dark:bg-slate-900/90
                backdrop-blur-md border border-white/10
              "
            >
              {content}
              {/* The Arrow/Tail, positioned by Floating UI */}
              <div
                ref={arrowRef}
                className="absolute h-2 w-2 rotate-45 bg-slate-800 dark:bg-slate-900"
                style={{
                  bottom: -4,
                  left: context.middlewareData.arrow?.x,
                  right: '',
                }}
              />
            </div>
          </div>
        )}
      </FloatingPortal>
    </>
  );
};