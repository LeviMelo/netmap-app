import React, { useRef, useEffect } from 'react';
import { useScrollOverflow } from '../../hooks/useScrollOverflow';

interface WheelItem {
  id: string;
  label: string;
}

interface WheelProps {
  items: WheelItem[];
  activeItemId: string;
  onItemClick: (id: string) => void;
}

export const Wheel: React.FC<WheelProps> = ({ items, activeItemId, onItemClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  
  const isOverflowing = useScrollOverflow(scrollRef);

  // This effect dynamically styles tabs ONLY when overflowing.
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // If we are NOT overflowing, reset all styles to default and stop.
    if (!isOverflowing) {
      itemRefs.current.forEach(el => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const rootRect = scrollElement.getBoundingClientRect();
        const rootCenter = rootRect.left + rootRect.width / 2;

        entries.forEach(entry => {
          const targetElement = entry.target as HTMLButtonElement;
          const targetRect = entry.boundingClientRect;
          const targetCenter = targetRect.left + targetRect.width / 2;
          
          const distance = Math.abs(rootCenter - targetCenter);
          const proximity = Math.max(0, 1 - distance / (rootRect.width / 2));

          const scale = 0.85 + (proximity * 0.15); // Scale from 0.85 to 1.0
          const opacity = 0.6 + (proximity * 0.4);  // Opacity from 0.6 to 1.0
          
          // Direct DOM manipulation for performance.
          targetElement.style.opacity = `${opacity}`;
          targetElement.style.transform = `scale(${scale})`;
        });
      },
      {
        root: scrollElement,
        threshold: Array.from({ length: 21 }, (_, i) => i * 0.05),
      }
    );

    const refsToObserve = Array.from(itemRefs.current.values());
    refsToObserve.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      refsToObserve.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isOverflowing, items]);

  // Effect to scroll the active tab to the center.
  useEffect(() => {
    const activeItemRef = itemRefs.current.get(activeItemId);
    if (activeItemRef) {
      activeItemRef.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeItemId]);

  const containerClasses = [
    'flex w-full items-center py-2 transition-all duration-300',
    // If overflowing, it's a scrollable container with a mask.
    // FIXED: Removed the layout-breaking padding.
    isOverflowing 
      ? 'overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]' 
      // If not overflowing, it's a simple centered flexbox.
      : 'justify-center gap-2'
  ].join(' ');

  return (
    <div ref={scrollRef} className={containerClasses}>
      {items.map((item) => {
        const isActive = item.id === activeItemId;
        
        const tabClasses = [
          'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap',
          'border transition-all duration-200 ease-out',
          isActive
            ? 'opacity-100 scale-100 bg-accent-primary/20 text-accent-primary border-accent-primary/30 shadow-md'
            : `text-text-muted border-transparent hover:text-accent-primary ${!isOverflowing ? 'hover:bg-accent-primary/10' : ''}`
        ].join(' ');

        return (
          // A containing div for spacing, separate from the button itself.
          <div key={item.id} className="p-1">
            <button
              // DEFINITIVE FIX for the ref callback error.
              ref={(el) => { itemRefs.current.set(item.id, el); }}
              data-item-id={item.id}
              onClick={() => onItemClick(item.id)}
              className={tabClasses}
              aria-selected={isActive}
            >
              {item.label}
            </button>
          </div>
        );
      })}
    </div>
  );
};