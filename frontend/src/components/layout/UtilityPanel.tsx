/**
 * Utility Panel Component
 * 
 * Context-sensitive utility panel implementing glassmorphism Level 3 (highly transparent).
 * Provides controls and information relevant to the current interaction mode.
 * Responsive: Right-docked resizable panel on desktop, bottom drawer on mobile.
 */

import React from 'react'
import { X, ChevronRight, ChevronDown } from 'lucide-react'
import { useAppStore } from '../../stores/appState'
import { Card } from '../ui/Card'

interface UtilityPanelProps {
  className?: string
}

export const UtilityPanel: React.FC<UtilityPanelProps> = ({ className = '' }) => {
  const { 
    mode, 
    utilityPanelVisible, 
    setUtilityPanelVisible,
    utilityPanelWidth,
    utilityPanelHeight
  } = useAppStore()

  if (!utilityPanelVisible) {
    return (
      <button
        onClick={() => setUtilityPanelVisible(true)}
        className="fixed bottom-4 right-4 md:top-4 md:right-4 p-3 glass-level-3 rounded-lg shadow-lg z-30 transition-all hover:shadow-glow-primary"
        aria-label="Open utility panel"
      >
        <ChevronRight size={20} className="text-text-base md:hidden" />
        <ChevronDown size={20} className="text-text-base hidden md:block" />
      </button>
    )
  }

  const renderModeContent = () => {
    switch (mode) {
      case 'dataIO':
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-text-base">Data Import/Export</h3>
            <Card variant="base" className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button className="btn-base btn-secondary flex-1 text-xs">
                    Import JSON
                  </button>
                  <button className="btn-base btn-secondary flex-1 text-xs">
                    Export PNG
                  </button>
                </div>
                <div className="text-small text-text-muted">
                  Load graph data or export your work in various formats.
                </div>
              </div>
            </Card>
          </div>
        )

      case 'manualEdit':
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-text-base">Manual Editing</h3>
            <Card variant="base" className="p-4">
              <div className="space-y-3">
                <div className="text-small text-text-muted">
                  Double-tap nodes to rename, drag to reposition, 
                  use node handles to create edges.
                </div>
                <div className="flex gap-2">
                  <button className="btn-base btn-primary flex-1 text-xs">
                    Add Node
                  </button>
                  <button className="btn-base btn-secondary flex-1 text-xs">
                    Delete Selected
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'paint':
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-text-base">Paint & Style</h3>
            <Card variant="base" className="p-4">
              <div className="space-y-3">
                <div className="text-small text-text-muted mb-3">
                  Select colors and apply to nodes and edges.
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {['#f97316', '#0ea5e9', '#ec4899', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b', '#6b7280'].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-xl border-2 border-white/20 hover:scale-125 hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: `0 4px 12px ${color}40`
                      }}
                      aria-label={`Select color ${color}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="propagate-edges" 
                    className="rounded"
                    defaultChecked
                  />
                  <label htmlFor="propagate-edges" className="text-small text-text-base">
                    Propagate to edges
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'layout':
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-text-base">Layout Controls</h3>
            <Card variant="base" className="p-4">
              <div className="space-y-3">
                <div className="text-small text-text-muted">
                  Adjust layout parameters and apply different arrangements.
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-small font-medium text-text-base mb-1">
                      Edge Length
                    </label>
                    <input 
                      type="range" 
                      min="50" 
                      max="300" 
                      defaultValue="150"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-small font-medium text-text-base mb-1">
                      Node Spacing
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      defaultValue="50"
                      className="w-full"
                    />
                  </div>
                  <button className="btn-base btn-primary w-full">
                    Apply Layout
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'analyze':
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-text-base">Graph Analysis</h3>
            <Card variant="base" className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-bg-tertiary rounded-lg">
                    <div className="text-h3 text-accent-secondary">0</div>
                    <div className="text-small text-text-muted">Nodes</div>
                  </div>
                  <div className="p-2 bg-bg-tertiary rounded-lg">
                    <div className="text-h3 text-accent-secondary">0</div>
                    <div className="text-small text-text-muted">Edges</div>
                  </div>
                </div>
                <button className="btn-base btn-secondary w-full text-xs">
                  Calculate Metrics
                </button>
              </div>
            </Card>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-h3 text-text-base">Welcome</h3>
            <Card variant="base" className="p-4">
              <div className="text-small text-text-muted">
                Select a tool from the sidebar to see relevant controls here.
              </div>
            </Card>
          </div>
        )
    }
  }

  const panelClasses = [
    'glass-level-3',
    'border-l border-border',
    'p-4',
    'custom-scrollbar overflow-y-auto',
    'animate-slide-in-right',
    // Desktop: right-docked resizable panel
    'fixed right-0 top-0 h-full z-30',
    'hidden md:block',
    className
  ].filter(Boolean).join(' ')

  const mobilePanelClasses = [
    'glass-level-3',
    'border-t border-border',
    'p-4',
    'custom-scrollbar overflow-y-auto',
    'animate-slide-in-bottom',
    // Mobile: bottom drawer
    'fixed bottom-0 left-0 right-0 z-30',
    'md:hidden',
    className
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Desktop Panel */}
      <aside 
        className={panelClasses}
        style={{ width: utilityPanelWidth }}
        role="complementary"
        aria-label="Utility panel"
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/5 to-accent-tertiary/5 rounded-lg"></div>
          <div className="relative z-10">
            <h2 className="text-body-large font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Controls
            </h2>
            <p className="text-small text-text-muted capitalize">
              {mode.replace(/([A-Z])/g, ' $1').toLowerCase()} mode
            </p>
          </div>
          <button
            onClick={() => setUtilityPanelVisible(false)}
            className="relative z-10 p-2 hover:bg-bg-tertiary rounded-lg transition-all hover:scale-105 group"
            aria-label="Close utility panel"
          >
            <X size={16} className="text-text-muted group-hover:text-accent-secondary transition-colors" />
          </button>
        </div>
        
        {renderModeContent()}
      </aside>

      {/* Mobile Panel */}
      <aside 
        className={mobilePanelClasses}
        style={{ height: utilityPanelHeight }}
        role="complementary"
        aria-label="Utility panel"
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/50 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/5 to-accent-tertiary/5 rounded-lg"></div>
          <div className="relative z-10">
            <h2 className="text-body-large font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Controls
            </h2>
            <p className="text-small text-text-muted capitalize">
              {mode.replace(/([A-Z])/g, ' $1').toLowerCase()} mode
            </p>
          </div>
          <button
            onClick={() => setUtilityPanelVisible(false)}
            className="relative z-10 p-2 hover:bg-bg-tertiary rounded-lg transition-all hover:scale-105 group"
            aria-label="Close utility panel"
          >
            <X size={16} className="text-text-muted group-hover:text-accent-secondary transition-colors" />
          </button>
        </div>
        
        {renderModeContent()}
      </aside>

      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/20 z-20 md:hidden"
        onClick={() => setUtilityPanelVisible(false)}
      />
    </>
  )
} 