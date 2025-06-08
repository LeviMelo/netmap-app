/**
 * Contextual Topbar Component
 * REFACTORED: This component is now simpler. It no longer manages the theme toggle.
 * Its sole responsibility is to display context-sensitive tabs.
 */
import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/appState';
import { InteractionMode } from '../../stores/appState';
import { useResponsive } from '../../hooks/useResponsive';

interface ContextualTopbarProps {
  className?: string;
}

interface SecondaryTab {
  id: string;
  label: string;
  description: string;
}

// ... (secondaryTabsMap remains the same)
const secondaryTabsMap: Record<InteractionMode, SecondaryTab[]> = {
  view: [
    { id: 'overview', label: 'Overview', description: 'Graph overview and navigation' },
  ],
  dataIO: [
    { id: 'import', label: 'Import', description: 'Load graph data from JSON/CSV' },
    { id: 'export', label: 'Export', description: 'Export graph in various formats' },
    { id: 'validate', label: 'Validate', description: 'Validate and fix data issues' },
  ],
  manualEdit: [
    { id: 'nodes', label: 'Nodes', description: 'Add, edit, and delete nodes' },
    { id: 'edges', label: 'Edges', description: 'Add, edit, and delete edges' },
    { id: 'properties', label: 'Properties', description: 'Edit node and edge properties' },
  ],
  paint: [
    { id: 'colors', label: 'Colors', description: 'Apply colors to nodes and edges' },
    { id: 'styles', label: 'Styles', description: 'Apply visual styles and themes' },
    { id: 'presets', label: 'Presets', description: 'Save and load style presets' },
  ],
  layout: [
    { id: 'manual', label: 'Manual', description: 'Manual positioning and arrangement' },
    { id: 'physics', label: 'Physics', description: 'Force-directed layout simulation' },
    { id: 'hierarchy', label: 'Hierarchy', description: 'Hierarchical and radial layouts' },
    { id: 'flow', label: 'Flow', description: 'Directed flow and tree layouts' },
    { id: 'grid', label: 'Grid', description: 'Grid and matrix arrangements' },
    { id: 'snapshots', label: 'Snapshots', description: 'Save and restore layout snapshots' },
  ],
  analyze: [
    { id: 'summary', label: 'Summary', description: 'Basic graph statistics' },
    { id: 'components', label: 'Components', description: 'Connected components analysis' },
    { id: 'metrics', label: 'Metrics', description: 'Centrality and importance metrics' },
    { id: 'clusters', label: 'Clusters', description: 'Community detection and clustering' },
  ],
}


export const ContextualTopbar: React.FC<ContextualTopbarProps> = ({ className = '' }) => {
  const { mode, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [activeSecondaryTab, setActiveSecondaryTab] = React.useState<string>('');
  const { isDesktop } = useResponsive();

  const secondaryTabs = secondaryTabsMap[mode] || [];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (secondaryTabs.length > 0) {
      setActiveSecondaryTab(secondaryTabs[0].id);
    }
  }, [mode, secondaryTabs]);

  useEffect(() => {
    const activeIndex = secondaryTabs.findIndex(tab => tab.id === activeSecondaryTab);
    if (activeIndex !== -1) {
      const activeTabElement = tabRefs.current[activeIndex];
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeSecondaryTab, secondaryTabs]);

  if (secondaryTabs.length === 0) {
    // If no tabs, render a minimal bar on desktop to house the collapse button
    if (!isDesktop) return null; // Render nothing on mobile
    return (
      <div className="glass-level-2 border-b border-border px-4 h-16 flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all text-accent-primary"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className={`glass-level-2 border-b border-border h-16 flex items-center relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/3 to-accent-tertiary/3 opacity-50"></div>
      
      <div className="flex items-center w-full px-4 relative z-10 gap-4">
        {isDesktop && (
          <div className="flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all duration-300 text-accent-primary"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex justify-center">
          <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]" role="tablist" aria-label={`${mode} options`}>
              {secondaryTabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={el => { tabRefs.current[index] = el }}
                  onClick={() => setActiveSecondaryTab(tab.id)}
                  className={[
                    'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-300 border border-transparent whitespace-nowrap',
                    'min-h-[36px]',
                    activeSecondaryTab === tab.id
                      ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/30 shadow-md'
                      : 'text-text-muted hover:text-accent-primary hover:bg-accent-primary/8'
                  ].join(' ')}
                  role="tab"
                  aria-selected={activeSecondaryTab === tab.id}
                  aria-describedby={`${tab.id}-description`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  <span id={`${tab.id}-description`} className="sr-only">{tab.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isDesktop && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20">
              <div className="w-2 h-2 rounded-full bg-accent-secondary"></div>
              <span className="text-text-muted text-xs">Mode:</span>
              <span className="font-bold text-accent-secondary capitalize tracking-wide text-xs">
                {mode.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};