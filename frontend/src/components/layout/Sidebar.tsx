/**
 * Primary Navigation Sidebar Component
 * 
 * The main navigation sidebar implementing glassmorphism Level 1 (opaque).
 * Contains primary tabs for Home/Load, Edit, Layout, Analyze, Export, Settings.
 * Responsive behavior: always visible on desktop, collapsible drawer on mobile.
 */

import React from 'react'
import { 
  Home, 
  Edit3, 
  LayoutGrid, 
  BarChart3, 
  Palette
} from 'lucide-react'
import { useAppStore } from '../../stores/appState'
import { InteractionMode } from '../../stores/appState'

interface SidebarProps {
  className?: string
}

interface TabItem {
  id: InteractionMode
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  description: string
}

const primaryTabs: TabItem[] = [
  {
    id: 'dataIO',
    label: 'Data I/O',
    icon: Home,
    description: 'Load and export graph data'
  },
  {
    id: 'manualEdit',
    label: 'Edit',
    icon: Edit3,
    description: 'Edit nodes and edges manually'
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: LayoutGrid,
    description: 'Apply different layout algorithms'
  },
  {
    id: 'analyze',
    label: 'Analyze',
    icon: BarChart3,
    description: 'Analyze graph metrics and structure'
  },
  {
    id: 'paint',
    label: 'Paint',
    icon: Palette,
    description: 'Style nodes and edges with colors'
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { 
    mode, 
    setMode, 
    sidebarCollapsed, 
    toggleSidebar
  } = useAppStore()

  const handleTabClick = (tabId: InteractionMode) => {
    setMode(tabId)
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768 && !sidebarCollapsed) {
      toggleSidebar()
    }
  }

  const sidebarClasses = [
    'glass-level-1',
    'fixed left-0 top-0 h-full z-50',
    'flex flex-col',
    'transition-all duration-300 ease-in-out',
    // Desktop only: responsive width based on collapsed state  
    'hidden md:flex',
    sidebarCollapsed ? 'md:w-16' : 'md:w-64',
    className
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Sidebar - Desktop Only */}
      <nav className={sidebarClasses} role="navigation" aria-label="Primary Navigation">
        {/* Logo Header */}
        <div className="flex items-center p-4 border-b border-border relative overflow-hidden h-16">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/8 to-accent-tertiary/8"></div>
          <div className="flex items-center gap-3 relative z-10 flex-1">
            <div className="w-10 h-10 relative flex-shrink-0">
              <img 
                src="/src/assets/netmap_logo.png" 
                alt="NetMap Logo" 
                className="w-full h-full object-contain transition-transform hover:scale-105"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-h3 font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent truncate">
                  NetMap
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {primaryTabs.map((tab, index) => {
              const isActive = mode === tab.id
              const Icon = tab.icon
              
              return (
                <div key={tab.id}>
                  <button
                    onClick={() => handleTabClick(tab.id)}
                    className={[
                      'w-full flex items-center rounded-xl',
                      'transition-all duration-300',
                      'text-left min-h-[44px] relative overflow-hidden group',
                      sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3',
                      isActive 
                        ? [
                            'bg-gradient-to-r from-accent-secondary/20 via-accent-tertiary/15 to-accent-secondary/20',
                            'text-accent-secondary border border-accent-secondary/30',
                            'shadow-md backdrop-blur-sm'
                          ].join(' ')
                        : [
                            'text-text-muted border border-transparent',
                            'hover:text-accent-secondary',
                            'hover:bg-gradient-to-r hover:from-accent-secondary/10 hover:to-accent-tertiary/10',
                            'hover:border-accent-secondary/20',
                            'hover:shadow-sm hover:backdrop-blur-sm'
                          ].join(' ')
                    ].join(' ')}
                    aria-label={sidebarCollapsed ? tab.label : tab.description}
                    title={sidebarCollapsed ? `${tab.label}: ${tab.description}` : undefined}
                  >
                    {/* Icon */}
                    <Icon 
                      size={20} 
                      className={[
                        'transition-all duration-300 flex-shrink-0 relative z-10',
                        isActive 
                          ? 'text-accent-secondary' 
                          : 'text-text-muted group-hover:text-accent-secondary'
                      ].join(' ')} 
                    />
                    
                    {/* Text Content */}
                    {!sidebarCollapsed && (
                      <div className="flex-1 relative z-10 min-w-0">
                        <div className={[
                          'text-sm font-semibold truncate transition-all duration-300',
                          isActive ? 'text-accent-secondary' : 'group-hover:text-accent-secondary'
                        ].join(' ')}>
                          {tab.label}
                        </div>
                        <div className={[
                          'text-xs transition-all duration-300 truncate',
                          isActive 
                            ? 'text-accent-secondary/80' 
                            : 'text-text-muted group-hover:text-accent-secondary/80'
                        ].join(' ')}>
                          {tab.description}
                        </div>
                      </div>
                    )}
                  </button>
                  {/* Separator line */}
                  {index < primaryTabs.length - 1 && (
                    <div className="mx-3 my-2 h-px bg-border/50"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>


      </nav>

      {/* Mobile Topbar - Replaces Sidebar on Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass-level-1 border-b border-border h-16 flex items-center px-4">
        {/* Left: Logo Only */}
        <div className="flex items-center flex-shrink-0">
          <div className="w-10 h-10 relative">
            <img 
              src="/src/assets/netmap_logo.png" 
              alt="NetMap Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* Center: Scrollable Primary Navigation Tabs */}
        <div className="flex-1 mx-4 overflow-hidden">
          <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            {primaryTabs.map((tab) => {
              const isActive = mode === tab.id
              const Icon = tab.icon
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={[
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0',
                    'transition-all duration-300 border whitespace-nowrap',
                    'min-h-[44px] relative overflow-hidden group',
                    isActive
                      ? [
                          'bg-gradient-to-r from-accent-secondary/20 via-accent-tertiary/15 to-accent-secondary/20',
                          'text-accent-secondary border-accent-secondary/30',
                          'shadow-md backdrop-blur-sm'
                        ].join(' ')
                      : [
                          'text-text-muted border-transparent',
                          'hover:text-accent-secondary',
                          'hover:bg-gradient-to-r hover:from-accent-secondary/10 hover:via-accent-tertiary/8 hover:to-accent-secondary/10',
                          'hover:border-accent-secondary/20',
                          'hover:shadow-sm hover:backdrop-blur-sm'
                        ].join(' ')
                  ].join(' ')}
                >
                  <Icon 
                    size={18} 
                    className={[
                      'relative z-10 transition-all duration-300',
                      isActive ? 'text-accent-secondary' : 'group-hover:text-accent-secondary'
                    ].join(' ')}
                  />
                  <span className={[
                    'text-sm font-semibold relative z-10 transition-all duration-300',
                    isActive ? 'text-accent-secondary' : 'group-hover:text-accent-secondary'
                  ].join(' ')}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Right: Empty space for balance */}
        <div className="w-10 flex-shrink-0"></div>
      </div>
    </>
  )
} 