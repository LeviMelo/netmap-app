/**
 * Primary Navigation Sidebar Component
 * FINAL REFACTOR: This component is now a pure layout container.
 * The complex logic for each tab has been extracted to the SidebarTab component,
 * solving the React Hook crash and simplifying maintenance.
 */
import React from 'react';
import { Home, Edit3, LayoutGrid, BarChart3, Palette } from 'lucide-react';
import { useAppStore, InteractionMode } from '../../stores/appState';
import { useResponsive } from '../../hooks/useResponsive';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import { SidebarTab } from './SidebarTab'; // Import the new component

interface TabItem {
  id: InteractionMode;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const primaryTabs: TabItem[] = [
  { id: 'dataIO', label: 'Data I/O', icon: Home, description: 'Load and export graph data' },
  { id: 'manualEdit', label: 'Edit', icon: Edit3, description: 'Edit nodes and edges manually' },
  { id: 'layout', label: 'Layout', icon: LayoutGrid, description: 'Apply different layout algorithms' },
  { id: 'analyze', label: 'Analyze', icon: BarChart3, description: 'Analyze graph metrics and structure' },
  { id: 'paint', label: 'Paint', icon: Palette, description: 'Style nodes and edges with colors' },
];

export const Sidebar: React.FC = () => {
  const { mode, setMode, sidebarCollapsed, setUtilityPanelVisible } = useAppStore();
  const { isDesktop } = useResponsive();

  const handleMobileTabClick = (tabId: InteractionMode) => {
    setMode(tabId);
    
    // Auto-show utility panel for modes that need it
    if (tabId === 'paint' || tabId === 'manualEdit' || tabId === 'dataIO' || tabId === 'layout' || tabId === 'analyze') {
      setUtilityPanelVisible(true);
    }
  };

  const MobileNav = (
    <nav className="md:hidden fixed top-0 left-0 right-0 z-40 glass-level-1 border-b border-border h-16 flex items-center px-4">
      <div className="flex-shrink-0 w-10 h-10 relative">
        <img src="/src/assets/netmap_logo.png" alt="NetMap Logo" className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 mx-2 min-w-0">
        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
          {primaryTabs.map((tab) => {
            const isActive = mode === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleMobileTabClick(tab.id)}
                className={[
                  'flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0',
                  'transition-all duration-300 border whitespace-nowrap min-w-max',
                  isActive ? 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30' : 'text-text-muted border-transparent hover:text-accent-secondary hover:bg-accent-secondary/10'
                ].join(' ')}
                aria-label={tab.label}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-shrink-0"><ThemeToggleButton /></div>
    </nav>
  );

  const DesktopSidebar = (
    <nav className={`glass-level-1 fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center p-4 border-b border-border relative overflow-hidden h-16">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/8 to-accent-tertiary/8"></div>
        <div className="flex items-center gap-3 relative z-10 flex-1">
          <div className="w-10 h-10 relative flex-shrink-0">
            <img src="/src/assets/netmap_logo.png" alt="NetMap Logo" className="w-full h-full object-contain transition-transform hover:scale-105" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-h3 font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent truncate">NetMap</h1>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {primaryTabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <SidebarTab tab={tab} />
              {index < primaryTabs.length - 1 && <div className="mx-3 my-2 h-px bg-border/50"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-auto p-2 border-t border-border flex items-center justify-center">
        <ThemeToggleButton />
      </div>
    </nav>
  );

  return isDesktop ? DesktopSidebar : MobileNav;
};