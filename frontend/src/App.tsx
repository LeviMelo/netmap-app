// src/App.tsx
/**
 * Main application component. Sets up the overall layout structure including
 * TopBar, resizable Sidebar, GraphCanvas area, and overlay Sidebars (Metrics, Share).
 * Manages the state for sidebar visibility, left sidebar width, and the active overlay type.
 * Renders the HaloOverlayCanvas directly over the graph area when active.
 * Passes the Cytoscape instance reference down where needed.
 * ---
 * ✅ Refactoring Note (Overlay Canvas):
 *  - App now manages the `overlayType` state.
 *  - It conditionally renders `<HaloOverlayCanvas>` as a direct child of the
 *    graph area container (`div.flex-1.relative`), ensuring correct positioning.
 *  - `MetricsSidebar` receives `overlayType` and `setOverlayType` as props
 *    to control the state from its dropdown.
 * ---
 * ✅ Debugging Notes (Overlay Rendering):
 *  - Added console logs to track overlayType state changes.
 *  - Added console logs to track the rendering decision for HaloOverlayCanvas.
 * ---
 */
// Added useEffect for logging
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Core } from 'cytoscape'; // Still need Core type

// Import layout components
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import MetricsSidebar, { OverlayType } from './components/MetricsSidebar'; // Import OverlayType
import ShareSidebar from './components/ShareSidebar';
import HaloOverlayCanvas from './components/metrics/HaloOverlayCanvas'; // Import the overlay canvas

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

  // --- State for active overlay type (Lifted from MetricsSidebar) ---
  const [overlayType, setOverlayType] = useState<OverlayType>('none');

  // --- DEBUG: Log overlayType changes ---
  useEffect(() => {
    console.log(`[App] overlayType changed to: ${overlayType}`);
  }, [overlayType]);
  // --- END DEBUG ---


  // Callback passed to GraphCanvas to receive the cy instance
  const handleCyInit = useCallback((cy: Core) => {
    console.log("[App] Cytoscape instance initialized"); // Keep existing log
    cyRef.current = cy;
  }, []); // Empty dependency array, this callback itself doesn't change

  // Toggle functions for sidebars (now also handle resetting overlayType)
  const toggleMetrics = () => {
    const closing = metricsOpen; // Check state *before* update
    const newState = !metricsOpen;
    console.log(`[App] Toggling metrics. New state will be: ${newState}`); // Log intent
    setMetricsOpen(newState);
    if (newState && shareOpen) setShareOpen(false); // Close share if opening metrics
    // Reset overlay only if *closing* the sidebar
    if (closing) {
        console.log("[App] Metrics sidebar closing, resetting overlayType to 'none'"); // Log reset reason
        setOverlayType('none');
    }
  };
  const toggleShare = () => {
    const newState = !shareOpen;
    console.log(`[App] Toggling share. New state will be: ${newState}`); // Log intent
    setShareOpen(newState);
    // If closing metrics sidebar because share is opening, reset overlay
    if (newState && metricsOpen) {
        console.log("[App] Share opening, closing metrics and resetting overlayType to 'none'"); // Log reset reason
        setMetricsOpen(false);
        setOverlayType('none');
    }
  };

  // --- Resizing Logic (remains the same) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX; const startW = leftWidth;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = moveEvent.clientX - startX;
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
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftWidth]);


  // --- Determine if the overlay should be rendered ---
  const shouldRenderOverlay = metricsOpen && overlayType === 'degree';
  // --- DEBUG: Log rendering decision ---
  useEffect(() => {
       // Log whenever the decision factors change
       console.log(`[App] Should render overlay? ${shouldRenderOverlay} (metricsOpen: ${metricsOpen}, overlayType: ${overlayType})`);
  }, [shouldRenderOverlay, metricsOpen, overlayType]);
  // --- END DEBUG ---


  return (
    // Use flex column for overall structure
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-primary text-text-base">
      {/* Top Bar (fixed height, z-20 implied by sticky) */}
      <TopBar onMetricsToggle={toggleMetrics} onShareToggle={toggleShare} />

      {/* Main Content Area (flexible height) */}
      <div className="flex flex-1 overflow-hidden"> {/* Use flex-1 to fill remaining height */}

        {/* Left Sidebar (Resizable) */}
        <div
          style={{ width: `${leftWidth}px` }}
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
        {/* Apply position: relative here to be the positioning context for the overlay */}
        <div className="flex-1 relative overflow-hidden z-0"> {/* Added z-0 */}
          {/* GraphCanvas needs the cy initialization callback */}
          <GraphCanvas onCyInit={handleCyInit} />

           {/* --- Render Halo Overlay Canvas Conditionally HERE --- */}
           {/* Rendered as a direct child, positioned absolutely relative to this div */}
           {/* Only render if the specific overlay should be active */}
           {shouldRenderOverlay && (
                <>
                {/* DEBUG: Log when attempting to render */}
                {console.log("[App] Rendering HaloOverlayCanvas...")}
                <HaloOverlayCanvas
                    cyRef={cyRef}
                    // isActive prop is true only if this component renders
                    isActive={true}
                />
                </>
           )}
           {/* ---------------------------------------------------- */}
        </div>
      </div>

      {/* Right Sidebars (Overlays - Render conditionally, z-30) */}
      {/* Pass the overlay state and setter down to MetricsSidebar */}
      <MetricsSidebar
        open={metricsOpen}
        // Modify onClose to also reset overlay type
        onClose={() => {
            console.log("[App] MetricsSidebar onClose called, setting metricsOpen=false, overlayType='none'"); // Log close action
            setMetricsOpen(false); setOverlayType('none');
        }}
        cyRef={cyRef}
        overlayType={overlayType} // Pass state down
        setOverlayType={setOverlayType} // Pass setter down
      />
      <ShareSidebar // z-30 implied by being rendered after MetricsSidebar
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        cyRef={cyRef}
      />
    </div>
  );
};

export default App;