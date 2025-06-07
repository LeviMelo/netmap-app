/**
 * Contextual Topbar Component
 * 
 * Secondary navigation bar implementing glassmorphism Level 2 (semi-transparent).
 * Displays context-sensitive tabs based on the current interaction mode.
 * Horizontally scrollable on mobile with proper accessibility.
 */

import React from 'react'
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../stores/appState'
import { InteractionMode } from '../../stores/appState'

interface ContextualTopbarProps {
  className?: string
}

interface SecondaryTab {
  id: string
  label: string
  description: string
}

// Define secondary tabs for each interaction mode
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
  const { mode, sidebarCollapsed, toggleSidebar, settings, toggleTheme } = useAppStore()
  const [activeSecondaryTab, setActiveSecondaryTab] = React.useState<string>('')
  
  const secondaryTabs = secondaryTabsMap[mode] || []
  
  // Set default active tab when mode changes
  React.useEffect(() => {
    if (secondaryTabs.length > 0) {
      setActiveSecondaryTab(secondaryTabs[0].id)
    }
  }, [mode, secondaryTabs])

  if (secondaryTabs.length === 0) {
    // Show basic topbar with just collapse button and theme toggle
    return (
      <div className={[
        'glass-level-2',
        'border-b border-border',
        'px-4 py-2 h-16 flex items-center justify-between',
        'relative overflow-hidden',
        className
      ].filter(Boolean).join(' ')}>
        <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/3 to-accent-tertiary/3 opacity-50"></div>
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all hover:scale-105 text-accent-primary relative z-10"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all hover:scale-105 text-accent-primary relative z-10"
          aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    )
  }

  const topbarClasses = [
    'glass-level-2',
    'border-b border-border',
    'px-4 py-2 h-16 flex items-center',
    'relative overflow-hidden',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={topbarClasses}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/3 to-accent-tertiary/3 opacity-50"></div>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center w-full relative z-10">
        {/* Left: Sidebar Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all duration-300 text-accent-primary mr-4 flex-shrink-0"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        
        {/* Center: Scrollable Context Tabs Container */}
        <div className="flex-1 min-w-0 mx-4">
          <div 
            className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-hide"
            role="tablist" 
            aria-label={`${mode} options`}
          >
            {secondaryTabs.map((tab, index) => {
              const isActive = activeSecondaryTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSecondaryTab(tab.id)}
                  className={[
                    'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-300 border border-transparent whitespace-nowrap',
                    'min-h-[36px] relative overflow-hidden group',
                    isActive
                      ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/30 shadow-md backdrop-blur-sm'
                      : 'text-text-muted hover:text-accent-primary hover:bg-accent-primary/8 hover:backdrop-blur-sm hover:shadow-md'
                  ].join(' ')}
                  style={{ 
                    animationDelay: `${index * 50}ms`
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-describedby={`${tab.id}-description`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  
                  {/* Hidden description for screen readers */}
                  <span 
                    id={`${tab.id}-description`}
                    className="sr-only"
                  >
                    {tab.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Right: Mode Indicator + Theme Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mode Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20">
            <div className="w-2 h-2 rounded-full bg-accent-secondary"></div>
            <span className="text-text-muted text-xs">Mode:</span>
            <span className="font-bold text-accent-secondary capitalize tracking-wide text-xs">
              {mode.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all duration-300 text-accent-primary"
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Layout - Only Context Menu in Centered Scrollable Container */}
      <div className="md:hidden flex items-center w-full relative z-10">
        {/* Full-width scrollable context menu container */}
        <div className="flex-1 min-w-0 px-4">
          <div 
            className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-hide"
            role="tablist" 
            aria-label={`${mode} options`}
          >
            {secondaryTabs.map((tab, index) => {
              const isActive = activeSecondaryTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSecondaryTab(tab.id)}
                  className={[
                    'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-300 border border-transparent whitespace-nowrap',
                    'min-h-[36px] relative overflow-hidden group',
                    isActive
                      ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/30 shadow-md backdrop-blur-sm'
                      : 'text-text-muted hover:text-accent-primary hover:bg-accent-primary/8 hover:backdrop-blur-sm hover:shadow-md'
                  ].join(' ')}
                  style={{ 
                    animationDelay: `${index * 50}ms`
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-describedby={`${tab.id}-description`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  
                  {/* Hidden description for screen readers */}
                  <span 
                    id={`${tab.id}-description`}
                    className="sr-only"
                  >
                    {tab.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Right: Theme Toggle (compact for mobile) */}
        <div className="flex-shrink-0 pr-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all duration-300 text-accent-primary"
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
} 