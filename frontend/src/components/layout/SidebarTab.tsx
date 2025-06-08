import React from 'react';
import { useAppStore, InteractionMode } from '../../stores/appState';
import { Tooltip } from '../ui/Tooltip';

interface TabItem {
  id: InteractionMode;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

interface SidebarTabProps {
  tab: TabItem;
}

export const SidebarTab: React.FC<SidebarTabProps> = ({ tab }) => {
  const { mode, setMode, sidebarCollapsed, setUtilityPanelVisible } = useAppStore();

  const isActive = mode === tab.id;
  const Icon = tab.icon;

  const buttonClasses = [
    'w-full flex items-center rounded-xl', 'transition-all duration-300',
    'text-left min-h-[44px] relative group',
    sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3',
    isActive 
      ? 'bg-gradient-to-r from-accent-secondary/20 to-accent-secondary/20 text-accent-secondary border border-accent-secondary/30 shadow-md' 
      : 'text-text-muted border border-transparent hover:text-accent-secondary hover:bg-gradient-to-r hover:from-accent-secondary/10 hover:to-accent-tertiary/10'
  ].join(' ');

  const handleTabClick = () => {
    setMode(tab.id);
    
    // Auto-show utility panel for modes that need it
    if (tab.id === 'paint' || tab.id === 'manualEdit' || tab.id === 'dataIO' || tab.id === 'layout' || tab.id === 'analyze') {
      setUtilityPanelVisible(true);
    }
  };

  // The logic is now much simpler. The Tooltip handles its own hover state.
  return (
    <Tooltip content={tab.description}>
      <button onClick={handleTabClick} className={buttonClasses} aria-label={tab.label}>
        <Icon size={20} className={`transition-all duration-300 flex-shrink-0 relative z-10 ${isActive ? 'text-accent-secondary' : 'text-text-muted group-hover:text-accent-secondary'}`} />
        {!sidebarCollapsed && (
          <div className="flex-1 relative z-10 min-w-0">
            <div className={`text-sm font-semibold truncate transition-all duration-300 ${isActive ? 'text-accent-secondary' : 'group-hover:text-accent-secondary'}`}>{tab.label}</div>
          </div>
        )}
      </button>
    </Tooltip>
  );
};