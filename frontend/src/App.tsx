/**
 * Main Application Component
 * REFACTORED: This component is now the "Layout Orchestrator".
 * It uses the `useResponsive` hook to determine the overall layout structure
 * and handles the placement of the main UI regions. It no longer contains
 * business logic for views, which have been extracted.
 */
import React, { useEffect } from 'react';
import { useAppStore } from './stores/appState';
import { useResponsive } from './hooks/useResponsive';

import { Sidebar } from './components/layout/Sidebar';
import { ContextualTopbar } from './components/layout/ContextualTopbar';
import { UtilityPanel } from './components/layout/UtilityPanel';
import { WelcomeScreen } from './components/views/WelcomeScreen';
import { GraphCanvas } from './components/views/GraphCanvas';

const App: React.FC = () => {
  const { settings, sidebarCollapsed, elements, utilityPanelVisible, utilityPanelWidth } = useAppStore();
  const { isDesktop } = useResponsive();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const hasGraphData = elements.nodes.length > 0 || elements.edges.length > 0;

  // Calculate sidebar width in pixels for consistent layout
  const sidebarWidthPx = isDesktop ? (sidebarCollapsed ? 64 : 256) : 0;

  return (
    <div className="w-full h-screen bg-bg-primary text-text-base overflow-hidden">
      {/* Sidebar - always on the far left */}
      <Sidebar />
      
      {/* Main Content Area - fixed positioning to prevent shifting */}
      <div 
        className="fixed top-0 right-0 bottom-0 flex flex-col"
        style={{ 
          left: isDesktop ? `${sidebarWidthPx}px` : '0',
          paddingTop: isDesktop ? 0 : '4rem' // Mobile top padding for topbar
        }}
      >
        <ContextualTopbar />
        
        <div className="flex-1 relative overflow-hidden">
          {/* Main viewport for graph canvas */}
          <main className="absolute inset-0" role="main" aria-label="Main Viewport">
            {hasGraphData ? <GraphCanvas /> : <WelcomeScreen />}
          </main>
          
          {/* Utility Panel - overlays main viewport */}
          {isDesktop && utilityPanelVisible && (
            <div 
              className="absolute top-0 bottom-0 z-50 transition-all duration-300"
              style={{ 
                left: '0',
                width: `${utilityPanelWidth}px`
              }}
            >
              <UtilityPanel />
            </div>
          )}
          
          {/* Mobile utility panel at bottom */}
          {!isDesktop && utilityPanelVisible && (
            <div className="absolute bottom-0 left-0 right-0 z-50">
              <UtilityPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;