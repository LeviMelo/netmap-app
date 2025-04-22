// src/App.tsx
/**
 * Main application component. Sets up the overall layout structure including
 * TopBar, resizable Sidebar, GraphCanvas area, and overlay Sidebars (Metrics, Share).
 * Manages the state for sidebar visibility and the resizable width of the left sidebar.
 * Passes the Cytoscape instance reference down to components that need direct access.
 */
import React, { useRef, useState, useCallback } from 'react';
import { Core } from 'cytoscape'; // Still need Core type

// Import layout components
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import MetricsSidebar from './components/MetricsSidebar';
import ShareSidebar from './components/ShareSidebar';

// No store imports needed directly in App.tsx anymore

const App: React.FC = () => {
  // Ref to hold the Cytoscape Core instance, passed down from GraphCanvas
  const cyRef = useRef<Core | null>(null);

  // Local state for overlay sidebar visibility
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Local state for resizable left sidebar width
  const [leftWidth, setLeftWidth] = useState(300); // Initial width
  const isResizing = useRef(false); // Track resizing state

  // Callback passed to GraphCanvas to receive the cy instance
  const handleCyInit = useCallback((cy: Core) => {
    console.log("Cytoscape instance initialized in App");
    cyRef.current = cy;
  }, []); // Empty dependency array, this callback itself doesn't change

  // Toggle functions for sidebars
  const toggleMetrics = () => {
    setMetricsOpen((o) => !o);
    if (!metricsOpen && shareOpen) setShareOpen(false); // Close share if opening metrics
  };
  const toggleShare = () => {
    setShareOpen((s) => !s);
    if (!shareOpen && metricsOpen) setMetricsOpen(false); // Close metrics if opening share
  };

  // --- Resizing Logic ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection during resize
    isResizing.current = true;
    const startX = e.clientX;
    const startW = leftWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = moveEvent.clientX - startX;
      // Constrain width: min 200px, max window width - 200px (for canvas)
      const newWidth = Math.max(200, Math.min(startW + dx, window.innerWidth - 200));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    // Add listeners to the document to handle dragging outside the handle element
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftWidth]); // Dependency on leftWidth to calculate new width correctly


  return (
    // Use flex column for overall structure
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-primary text-text-base">
      {/* Top Bar (fixed height) */}
      <TopBar onMetricsToggle={toggleMetrics} onShareToggle={toggleShare} />

      {/* Main Content Area (flexible height) */}
      <div className="flex flex-1 overflow-hidden"> {/* Use flex-1 to fill remaining height */}

        {/* Left Sidebar (Resizable) */}
        <div
          // Use inline style for dynamic width
          style={{ width: `${leftWidth}px` }}
          // flex-shrink-0 prevents the sidebar from shrinking when content overflows
          className="flex-shrink-0 bg-bg-secondary border-r border-border overflow-y-auto no-scrollbar"
        >
          <Sidebar />
        </div>

        {/* Resizer Handle */}
        <div
          className="w-1.5 cursor-col-resize bg-border hover:bg-accent-primary transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
          title="Resize sidebar" // Accessibility
        />

        {/* Main Canvas Area (takes remaining space) */}
        <div className="flex-1 relative overflow-hidden"> {/* Use flex-1 to fill remaining width */}
          {/* GraphCanvas needs the cy initialization callback */}
          <GraphCanvas onCyInit={handleCyInit} />
           {/* Position overlay canvas container absolutely */}
           {/* This element isn't strictly needed if MetricsSidebar positions its own canvas, but can be useful */}
           {/* <div id="overlay-container" className="absolute inset-0 pointer-events-none z-10"></div> */}
        </div>
      </div>

      {/* Right Sidebars (Overlays - Render conditionally) */}
      {/* Pass the cyRef down to sidebars that need direct Cytoscape access */}
      <MetricsSidebar
        open={metricsOpen}
        onClose={() => setMetricsOpen(false)}
        cyRef={cyRef} // Pass the ref
      />
      <ShareSidebar
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        cyRef={cyRef} // Pass the ref
      />
    </div>
  );
};

export default App;