/**
 * Main Application Component
 * 
 * The root component that orchestrates the entire concept map builder interface.
 * Implements the glassmorphism design system with proper responsive layout:
 * - Primary Sidebar with main navigation
 * - Contextual Topbar with secondary navigation
 * - Central Canvas area for the graph
 * - Utility Panel for context-sensitive controls
 * - Theme management and responsive behavior
 */

import React, { useEffect } from 'react'
import { useAppStore } from './stores/appState'
import { Sidebar } from './components/layout/Sidebar'
import { ContextualTopbar } from './components/layout/ContextualTopbar'
import { UtilityPanel } from './components/layout/UtilityPanel'

const App: React.FC = () => {
  const { 
    settings, 
    sidebarCollapsed,
    elements 
  } = useAppStore()

  // Initialize theme on mount
  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  // Canvas Area - Shows different content based on whether graph data exists
  const CanvasArea = () => {
    const hasGraphData = elements.nodes.length > 0 || elements.edges.length > 0
    
    if (hasGraphData) {
      // Show graph canvas when data exists
      return (
        <div className="flex-1 relative overflow-hidden bg-bg-primary">
          {/* Graph will be rendered here by Cytoscape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <img 
                  src="/src/assets/netmap_logo.png" 
                  alt="NetMap Logo" 
                  className="w-full h-full object-contain opacity-50"
                />
              </div>
              <p className="text-body text-text-muted">Graph rendering will be implemented here</p>
              <p className="text-small text-text-muted mt-2">
                {elements.nodes.length} nodes, {elements.edges.length} edges
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Show welcome/empty state when no graph data
    return (
      <div className="flex-1 relative overflow-hidden">
        {/* Dynamic Background with Animated Gradient */}
        <div className="absolute inset-0 bg-bg-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/5 via-accent-tertiary/3 to-accent-primary/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(14,165,233,0.1),transparent_50%)]"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
        </div>
        
        {/* Welcome Content */}
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="text-center max-w-2xl">
            {/* App Icon with Animation */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto relative group">
                <img 
                  src="/src/assets/netmap_logo.png" 
                  alt="NetMap Logo" 
                  className="w-full h-full object-contain filter drop-shadow-2xl transition-transform group-hover:scale-110 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-accent-secondary to-accent-tertiary opacity-20 blur-xl"></div>
              </div>
            </div>
            
            <h1 className="text-display font-bold mb-4 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
              Welcome to NetMap
            </h1>
            <p className="text-body-large text-text-muted mb-8 leading-relaxed">
              Create, visualize, and analyze concept maps with intuitive drag & drop editing, 
              smart layouts, and powerful export options.
            </p>
            
            {/* Primary Action */}
            <div className="mb-8">
              <button 
                onClick={() => {/* TODO: Implement create new graph */}}
                className="btn-base btn-primary text-lg px-8 py-4"
              >
                <span className="relative z-10">Create New Concept Map</span>
              </button>
            </div>
            
            {/* Secondary Actions */}
            <div className="text-small text-text-muted">
              or{' '}
              <button 
                onClick={() => {/* TODO: Implement load from file */}}
                className="text-accent-secondary hover:text-accent-secondary-hover underline"
              >
                load from file
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex bg-bg-primary text-text-base">
      {/* Primary Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 pt-16 md:pt-0 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Contextual Secondary Navigation */}
        <ContextualTopbar />
        
        {/* Canvas and Utility Panel Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Central Canvas Area */}
          <div className="flex-1 relative">
            <main 
              className="w-full h-full"
              role="region" 
              aria-label="Concept Map Canvas"
            >
              <CanvasArea />
            </main>
          </div>
          
          {/* Utility Panel - Desktop: Right side, Mobile: Bottom drawer */}
          <UtilityPanel />
        </div>
      </div>
    </div>
  )
}

export default App
