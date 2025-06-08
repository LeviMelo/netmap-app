import React from 'react';

interface WheelTabProps {
  onClick: () => void;
  isActive: boolean;
  style: React.CSSProperties;
  children: React.ReactNode;
}

export const WheelTab: React.FC<WheelTabProps> = ({ onClick, isActive, style, children }) => {
  const baseClasses = `
    flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap 
    border transition-all duration-300 ease-out
  `;
  
  const activeClasses = `
    bg-accent-primary/20 text-accent-primary border-accent-primary/30 shadow-md
  `;
  
  const inactiveClasses = `
    text-text-muted border-transparent hover:text-accent-primary hover:bg-accent-primary/10
  `;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      style={style}
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};