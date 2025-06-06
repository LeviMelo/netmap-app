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
  const { settings, toggleTheme, setUtilityPanelVisible } = useAppStore()

  // Initialize theme on mount
  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  // Enhanced Canvas Area with Dynamic Background
  const CanvasArea = () => (
    <div className="flex-1 relative overflow-hidden">
      {/* Dynamic Background with Animated Gradient */}
      <div className="absolute inset-0 bg-bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/5 via-accent-tertiary/3 to-accent-primary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(14,165,233,0.1),transparent_50%)]"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </div>
      
      {/* Welcome Content */}
      <div className="relative z-10 flex items-center justify-center h-full p-8">
        <div className="text-center max-w-2xl">
          {/* App Icon with Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative group">
              <img 
                src="/src/assets/netmap_logo.png" 
                alt="NetMap Logo" 
                className="w-full h-full object-contain filter drop-shadow-2xl transition-transform group-hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-secondary to-accent-tertiary opacity-20 blur-xl animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-display font-bold mb-4 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
            Concept Map Canvas
          </h1>
          <p className="text-body-large text-text-muted mb-8 leading-relaxed">
            Your interactive graph will appear here. Use the navigation panel to load data, 
            edit nodes and edges, apply layouts, and analyze your concept map.
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              onClick={toggleTheme}
              className="btn-base btn-secondary group"
            >
              <span className="relative z-10">
                Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'} Mode
              </span>
            </button>
            <button 
              onClick={() => setUtilityPanelVisible(true)}
              className="btn-base btn-primary group"
            >
              <span className="relative z-10">Open Controls</span>
            </button>
          </div>
          
          {/* Feature Highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Smart Import', desc: 'Load from JSON/CSV with validation', icon: '📥' },
              { title: 'Visual Editor', desc: 'Intuitive drag & drop editing', icon: '✏️' },
              { title: 'Export Ready', desc: 'PNG, SVG, CSV output formats', icon: '📤' }
            ].map((feature, index) => (
              <div key={index} className="card-base text-center group hover:scale-105 transition-all duration-300">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="text-body font-semibold text-text-base mb-1">{feature.title}</h3>
                <p className="text-small text-text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full flex bg-bg-primary text-text-base">
      {/* Primary Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
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
