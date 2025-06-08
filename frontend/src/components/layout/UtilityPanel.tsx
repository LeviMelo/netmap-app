/**
 * Utility Panel Component
 * 
 * Context-sensitive panel implementing glassmorphism Level 3 (highly transparent).
 * Shows different content based on current interaction mode.
 * Responsive: left panel (next to sidebar) on desktop, bottom drawer on mobile.
 */

import React, { useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { useAppStore } from '../../stores/appState'
import { useResponsive } from '../../hooks/useResponsive'
import { PaintModePanel } from '../panels/PaintModePanel'
import { ManualEditPanel } from '../panels/ManualEditPanel'
import { DataIOPanel } from '../panels/DataIOPanel'

export const UtilityPanel: React.FC = () => {
  const { 
    mode, 
    utilityPanelVisible, 
    setUtilityPanelVisible,
    selectedNodes,
    selectedEdges,
    elements,
    utilityPanelWidth,
    setUtilityPanelWidth
  } = useAppStore()
  const { isDesktop } = useResponsive()
  const [isResizing, setIsResizing] = useState(false)

  // Don't show panel for view mode unless there are selections
  if (mode === 'view' && selectedNodes.length === 0 && selectedEdges.length === 0) {
    return null
  }

  if (!utilityPanelVisible && mode !== 'paint' && mode !== 'manualEdit') {
    return null
  }

  const renderModeContent = () => {
    switch (mode) {
      case 'paint':
        return <PaintModePanel />
      
      case 'manualEdit':
        return <ManualEditPanel />
      
      case 'dataIO':
        return <DataIOPanel />
      
      case 'layout':
        return (
          <div className="p-4">
            <h3 className="text-h3 font-semibold mb-4">Layout Controls</h3>
            <p className="text-text-muted">Layout controls coming soon...</p>
          </div>
        )
      
      case 'analyze':
        return (
          <div className="p-4">
            <h3 className="text-h3 font-semibold mb-4">Graph Analysis</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-bg-secondary/50 border border-border">
                <h4 className="text-small font-medium mb-2">Graph Statistics</h4>
                <div className="space-y-1 text-xs text-text-muted">
                  <div>Nodes: {elements.nodes.length}</div>
                  <div>Edges: {elements.edges.length}</div>
                  <div>Density: {elements.nodes.length > 1 ? ((elements.edges.length * 2) / (elements.nodes.length * (elements.nodes.length - 1))).toFixed(3) : '0'}</div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'view':
      default:
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          return (
            <div className="p-4">
              <h3 className="text-h3 font-semibold mb-4">Selection Info</h3>
              <div className="space-y-3">
                {selectedNodes.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
                    <p className="text-small font-medium text-accent-primary">
                      {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                {selectedEdges.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20">
                    <p className="text-small font-medium text-accent-secondary">
                      {selectedEdges.length} edge{selectedEdges.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        }
        return null
    }
  }

  const content = renderModeContent()
  if (!content) return null

  // Resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startWidth = utilityPanelWidth
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const newWidth = Math.max(280, Math.min(600, startWidth + deltaX))
      setUtilityPanelWidth(newWidth)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  if (isDesktop) {
    // Desktop: Left panel with enhanced transparency and resize handle
    return (
      <div className="h-full relative">
        {/* Enhanced glassmorphism background */}
        <div className="h-full w-full bg-bg-secondary/20 backdrop-blur-xl border-r border-border/30 shadow-2xl overflow-y-auto custom-scrollbar">
          {/* Header with mode description */}
          <div className="p-4 border-b border-border/20 bg-bg-secondary/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-base">
                  {mode === 'dataIO' && 'Data Import/Export'}
                  {mode === 'manualEdit' && 'Manual Editing Tools'}
                  {mode === 'paint' && 'Paint & Styling'}
                  {mode === 'layout' && 'Layout Controls'}
                  {mode === 'analyze' && 'Graph Analysis'}
                  {mode === 'view' && 'Selection Details'}
                </h3>
                <p className="text-xs text-text-muted">
                  {mode === 'dataIO' && 'Load and export graph data'}
                  {mode === 'manualEdit' && 'Add, edit, and manage graph elements'}
                  {mode === 'paint' && 'Apply colors and visual styles'}
                  {mode === 'layout' && 'Arrange and organize the graph'}
                  {mode === 'analyze' && 'Compute metrics and insights'}
                  {mode === 'view' && 'View selected element properties'}
                </p>
              </div>
              <button
                onClick={() => setUtilityPanelVisible(false)}
                className="p-1.5 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-all"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {content}
          </div>
        </div>
        
        {/* Resize handle */}
        <div 
          className={`absolute top-0 right-0 bottom-0 w-1 cursor-col-resize bg-accent-primary/20 hover:bg-accent-primary/40 transition-all ${
            isResizing ? 'bg-accent-primary/60' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <GripVertical size={12} className="text-accent-primary/60" />
          </div>
        </div>
      </div>
    )
  } else {
    // Mobile: Bottom drawer with enhanced transparency
    return (
      <div className="bg-bg-secondary/20 backdrop-blur-xl border-t border-border/30 shadow-2xl max-h-96 overflow-y-auto custom-scrollbar animate-slide-in-bottom">
        {/* Header with drag handle */}
        <div className="p-3 border-b border-border/20 bg-bg-secondary/30">
          <div className="flex items-center justify-between">
            {/* Drag handle */}
            <div className="flex justify-center flex-1">
              <div className="w-12 h-1 bg-text-muted/40 rounded-full"></div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setUtilityPanelVisible(false)}
              className="p-1.5 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-all"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Mode description */}
          <div className="mt-2">
            <h3 className="text-sm font-semibold text-text-base">
              {mode === 'dataIO' && 'Data Import/Export'}
              {mode === 'manualEdit' && 'Manual Editing Tools'}
              {mode === 'paint' && 'Paint & Styling'}
              {mode === 'layout' && 'Layout Controls'}
              {mode === 'analyze' && 'Graph Analysis'}
              {mode === 'view' && 'Selection Details'}
            </h3>
          </div>
        </div>
        
        {/* Content */}
        {content}
      </div>
    )
  }
} 