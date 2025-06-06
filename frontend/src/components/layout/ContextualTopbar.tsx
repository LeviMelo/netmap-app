/**
 * Contextual Topbar Component
 * 
 * Secondary navigation bar implementing glassmorphism Level 2 (semi-transparent).
 * Displays context-sensitive tabs based on the current interaction mode.
 * Horizontally scrollable on mobile with proper accessibility.
 */

import React from 'react'
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
  const { mode } = useAppStore()
  const [activeSecondaryTab, setActiveSecondaryTab] = React.useState<string>('')
  
  const secondaryTabs = secondaryTabsMap[mode] || []
  
  // Set default active tab when mode changes
  React.useEffect(() => {
    if (secondaryTabs.length > 0) {
      setActiveSecondaryTab(secondaryTabs[0].id)
    }
  }, [mode, secondaryTabs])

  if (secondaryTabs.length === 0) {
    return null
  }

  const topbarClasses = [
    'glass-level-2',
    'border-b border-border',
    'px-4 py-2 h-16 flex items-center',
    'md:ml-64', // Account for sidebar on desktop
    'relative overflow-hidden',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={topbarClasses}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/3 to-accent-tertiary/3 opacity-50"></div>
      
      <div 
        className="tab-container custom-scrollbar relative z-10 flex-1"
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
                'tab-button relative group',
                isActive ? 'active' : '',
                'hover:scale-105 transition-all duration-300'
              ].join(' ')}
              role="tab"
              aria-selected={isActive}
              aria-describedby={`${tab.id}-description`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              )}
              <span className="relative z-10 font-medium">{tab.label}</span>
              
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
      
      {/* Enhanced Mode Indicator */}
      <div className="hidden md:flex items-center gap-3 text-small relative z-10 ml-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20">
          <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse"></div>
          <span className="text-text-muted">Mode:</span>
          <span className="font-bold text-accent-secondary capitalize tracking-wide">
            {mode.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  )
} 