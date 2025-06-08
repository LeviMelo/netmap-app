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
  const { settings, sidebarCollapsed, elements } = useAppStore();
  const { isDesktop } = useResponsive();

  // FIXED: The responsibility of applying the theme class to the document
  // is now here, in a top-level component, not in the state store.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const hasGraphData = elements.nodes.length > 0 || elements.edges.length > 0;

  // FIXED: The layout is now an "overlay" style.
  // The main content area uses padding to prevent content from being hidden
  // under the fixed-position UI elements (Sidebar on desktop, Mobile Topbar on mobile).
  // This eliminates the "pushing" and unwanted movement of the main viewport.
  const mainContentPadding = isDesktop
    ? (sidebarCollapsed ? 'pl-16' : 'pl-64')
    : 'pt-16'; // Padding top to account for the mobile top bar

  return (
    <div className="w-full h-screen bg-bg-primary text-text-base overflow-hidden">
      {/* The Sidebar component now handles rendering either the desktop
          sidebar or the mobile top bar based on the `isDesktop` hook. */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`h-full flex flex-col transition-all duration-300 ${mainContentPadding}`}>
        <ContextualTopbar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* This is the primary viewport for your application's content. */}
          <main className="flex-1 relative" role="main" aria-label="Main Viewport">
            {hasGraphData ? <GraphCanvas /> : <WelcomeScreen />}
          </main>
          
          <UtilityPanel />
        </div>
      </div>
    </div>
  );
};

export default App;