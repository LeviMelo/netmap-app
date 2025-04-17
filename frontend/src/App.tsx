import React, { useRef, useState } from 'react'; // Keep React import for MouseEvent type hint
import { Core } from 'cytoscape';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar'; // Corrected filename casing
import GraphCanvas from './components/GraphCanvas'; // Corrected filename casing
import MetricsSidebar from './components/MetricsSidebar';
import ShareSidebar from './components/ShareSidebar';

const App: React.FC = () => {
  const cyRef = useRef<Core | null>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(300);
  const isResizing = useRef(false); // Track resizing state

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection during resize
    isResizing.current = true;
    const startX = e.clientX;
    const startW = leftWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = moveEvent.clientX - startX;
      setLeftWidth(Math.max(200, Math.min(startW + dx, window.innerWidth - 200))); // Min/Max width
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  const handleCyInit = (cy: Core) => {
    cyRef.current = cy;
  };

  const toggleMetrics = () => {
    setMetricsOpen((o) => !o);
    if (shareOpen) setShareOpen(false);
  };
  const toggleShare = () => {
    setShareOpen((s) => !s);
    if (metricsOpen) setMetricsOpen(false);
  };

  return (
    // Use CSS variables directly for potentially dynamic styles if needed
    <div className="flex flex-col h-screen w-screen bg-bg-primary text-text-base">
      <TopBar onMetricsToggle={toggleMetrics} onShareToggle={toggleShare} />

      <div className="flex flex-1 overflow-hidden"> {/* Prevent content overflow */}
        {/* Left Sidebar */}
        <div
          style={{ width: `${leftWidth}px` }}
          className="flex-shrink-0 bg-bg-secondary border-r border-border overflow-y-auto no-scrollbar" // Allow scrolling
        >
          <Sidebar />
        </div>

        {/* Resizer Handle */}
        <div
          className="w-1.5 cursor-col-resize bg-border hover:bg-accent-primary transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
          title="Resize sidebar" // Accessibility
        />

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-hidden"> {/* Prevent canvas overflow */}
          <GraphCanvas onCyInit={handleCyInit} />
        </div>
      </div>

      {/* Right Sidebars (Overlays) */}
      <MetricsSidebar
        open={metricsOpen}
        onClose={() => setMetricsOpen(false)}
        cyRef={cyRef}
      />
      <ShareSidebar
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        cyRef={cyRef}
      />
    </div>
  );
};

export default App;