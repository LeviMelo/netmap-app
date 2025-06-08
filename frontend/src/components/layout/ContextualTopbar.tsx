import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/appState';
import { InteractionMode } from '../../stores/appState';
import { useResponsive } from '../../hooks/useResponsive';
import { Wheel } from '../common/Wheel'; // Import the new, reusable component

interface ContextualTopbarProps {
  className?: string;
}

const secondaryTabsMap: Record<InteractionMode, { id: string; label: string; description: string }[]> = {
  view: [],
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
};

export const ContextualTopbar: React.FC<ContextualTopbarProps> = ({ className = '' }) => {
  const { mode, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<string>('');
  const { isDesktop } = useResponsive();

  const secondaryTabs = secondaryTabsMap[mode] || [];

  useEffect(() => {
    if (secondaryTabs.length > 0) {
      setActiveSecondaryTab(secondaryTabs[0].id);
    } else {
      setActiveSecondaryTab('');
    }
  }, [mode]);

  if (secondaryTabs.length === 0) {
    if (!isDesktop) return null;
    return (
      <div className="glass-level-2 border-b border-border px-4 h-16 flex items-center">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-accent-primary/10 text-accent-primary" aria-label="Toggle Sidebar">
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
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-accent-primary/10 text-accent-primary" aria-label="Toggle Sidebar">
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <Wheel
            items={secondaryTabs}
            activeItemId={activeSecondaryTab}
            onItemClick={setActiveSecondaryTab}
          />
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