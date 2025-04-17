// src/App.tsx
// Remove useResolveCytoscapeStyles entirely and just render GraphCanvas with our new
// always‑ready stylesheet.

import React, { useRef, useState } from 'react';
import { Core } from 'cytoscape';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import MetricsSidebar from './components/MetricsSidebar';
import ShareSidebar from './components/ShareSidebar';

const App: React.FC = () => {
  // keep ref to Cytoscape instance
  const cyRef = useRef<Core | null>(null);

  // control right‑side panels
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // left pane resizer
  const [leftWidth, setLeftWidth] = useState(300);
  const startX = useRef(0);
  const startW = useRef(300);
  const onMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startW.current = leftWidth;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX.current;
    setLeftWidth(Math.max(200, startW.current + dx));
  };
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  // callbacks from GraphCanvas
  const handleCyInit = (cy: Core) => {
    cyRef.current = cy;
  };

  // keep only one sidebar open at a time
  const toggleMetrics = () => {
    setMetricsOpen((o) => !o);
    if (shareOpen) setShareOpen(false);
  };
  const toggleShare = () => {
    setShareOpen((s) => !s);
    if (metricsOpen) setMetricsOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <TopBar onMetricsToggle={toggleMetrics} onShareToggle={toggleShare} />

      <div className="flex flex-1 overflow-hidden">
        <div
          style={{ width: leftWidth }}
          className="min-w-[200px] bg-bg-secondary border-r border-border overflow-auto"
        >
          <Sidebar />
        </div>
        <div
          className="w-1 cursor-col-resize bg-border hover:bg-accent-primary"
          onMouseDown={onMouseDown}
        />
        <div className="flex-1">
          <GraphCanvas onCyInit={handleCyInit} />
        </div>
      </div>

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
