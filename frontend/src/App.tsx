// src/App.tsx
// Fully updated with stylesheet resolution hook and resizable sidebar

import { useRef, useState, useEffect } from 'react';
import { Core } from 'cytoscape';
import { useResolveCytoscapeStyles } from './store';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import RightSidebar from './components/RightSidebar';

const App: React.FC = () => {
  // Trigger the CSS‑variable resolution into Cytoscape stylesheet
  useResolveCytoscapeStyles();

  // Reference to the Cytoscape core instance
  const cyRef = useRef<Core | null>(null);

  // Metrics drawer open state
  const [metricsOpen, setMetricsOpen] = useState(false);

  // Sidebar width state and drag refs
  const [leftWidth, setLeftWidth] = useState(300);
  const startX = useRef(0);
  const startWidth = useRef(300);

  // Called by GraphCanvas once Cytoscape is initialized
  const handleCyInit = (cy: Core) => {
    cyRef.current = cy;
  };

  // JSON Export handler
  const exportJSON = () => {
    const cy = cyRef.current;
    if (!cy) return;
    // cytoscape.json() returns full state; elements holds nodes+edges
    const elements = (cy.json() as any).elements;
    const blob = new Blob([JSON.stringify(elements, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'netmap.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // PNG export handler
  const exportPNG = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const uri = cy.png({ full: true });
    const a = document.createElement('a');
    a.href = uri;
    a.download = 'netmap.png';
    a.click();
  };

  // Count nodes and edges for metrics panel
  const nodeCount = cyRef.current?.nodes().length ?? 0;
  const edgeCount = cyRef.current?.edges().length ?? 0;

  // Begin drag to resize sidebar
  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startWidth.current = leftWidth;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // During drag: update width
  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX.current;
    setLeftWidth(Math.max(200, startWidth.current + dx));
  };

  // End drag
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Top bar: metrics toggle, export JSON/PNG */}
      <TopBar
        onMetricsToggle={() => setMetricsOpen(o => !o)}
        onExportJSON={exportJSON}
        onExportPNG={exportPNG}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar (resizable) */}
        <div
          style={{ width: leftWidth }}
          className="min-w-[200px] bg-bg-secondary border-r border-border overflow-auto"
        >
          <Sidebar />
        </div>

        {/* Divider for drag-to-resize */}
        <div
          className="w-1 cursor-col-resize bg-border hover:bg-accent-primary"
          onMouseDown={onMouseDown}
        />

        {/* Main canvas area */}
        <div className="flex-1">
          <GraphCanvas onCyInit={handleCyInit} />
        </div>
      </div>

      {/* Right‑side metrics drawer */}
      <RightSidebar
        open={metricsOpen}
        onClose={() => setMetricsOpen(false)}
        nodeCount={nodeCount}
        edgeCount={edgeCount}
      />
    </div>
  );
};

export default App;
