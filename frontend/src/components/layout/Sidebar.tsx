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
  Download, 
  Settings,
  Menu,
  X
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
    label: 'Load',
    icon: Home,
    description: 'Load and import graph data'
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
    id: 'dataIO', // Note: Export will be a secondary tab under dataIO
    label: 'Export',
    icon: Download,
    description: 'Export graph in various formats'
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { 
    mode, 
    setMode, 
    sidebarCollapsed, 
    toggleSidebar,
    settings,
    toggleTheme 
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
    // Desktop: always visible, fixed width
    'md:translate-x-0 md:w-64',
    // Mobile: overlay drawer
    sidebarCollapsed 
      ? '-translate-x-full w-64' 
      : 'translate-x-0 w-64 md:w-64',
    className
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <nav className={sidebarClasses} role="navigation" aria-label="Primary Navigation">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary/5 to-accent-tertiary/5"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 relative group">
              <img 
                src="/src/assets/netmap_logo.png" 
                alt="NetMap Logo" 
                className="w-full h-full object-contain rounded-xl shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-h3 font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                NetMap
              </h1>
              <p className="text-small text-text-muted font-medium">Concept Builder</p>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-bg-tertiary transition-all hover:scale-105 relative z-10"
            aria-label="Close navigation"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {primaryTabs.map((tab) => {
              const isActive = mode === tab.id
              const Icon = tab.icon
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'transition-all duration-300 ease-out',
                    'text-left min-h-[44px] relative overflow-hidden group',
                    isActive 
                      ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow-primary transform scale-105'
                      : 'text-text-muted hover:text-accent-secondary hover:bg-bg-tertiary hover:scale-102 hover:shadow-lg'
                  ].join(' ')}
                  aria-label={tab.description}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}
                  <Icon 
                    size={20} 
                    className={[
                      'transition-all duration-300',
                      isActive ? 'text-white' : 'text-text-muted group-hover:text-accent-secondary group-hover:scale-110'
                    ].join(' ')} 
                  />
                  <div className="flex-1 relative z-10">
                    <div className="text-sm font-semibold">{tab.label}</div>
                    <div className={[
                      'text-xs transition-colors',
                      isActive ? 'text-white/80' : 'text-text-muted group-hover:text-accent-secondary/80'
                    ].join(' ')}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer with Settings and Theme Toggle */}
        <div className="p-4 border-t border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-accent-secondary"
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Settings size={20} />
            <span className="text-sm font-medium">
              {settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-level-2 shadow-lg"
        aria-label="Open navigation menu"
      >
        <Menu size={20} className="text-text-base" />
      </button>
    </>
  )
} 