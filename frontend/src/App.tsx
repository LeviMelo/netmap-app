// src/App.tsx
import { useRef, useState } from 'react';
import { Core } from 'cytoscape';
import { useResolveCytoscapeStyles } from './store';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import MetricsSidebar from './components/MetricsSidebar';
import ShareSidebar from './components/ShareSidebar';

const App: React.FC = () => {
  useResolveCytoscapeStyles();

  const cyRef = useRef<Core | null>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(300);
  const startX = useRef(0);
  const startW = useRef(300);

  const handleCyInit = (cy: Core) => { cyRef.current = cy; };

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

  return (
    <div className="flex flex-col h-screen w-screen">
      <TopBar
        onMetricsToggle={() => setMetricsOpen(m => !m)}
        onShareToggle={() => setShareOpen(s => !s)}
      />

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

      <MetricsSidebar open={metricsOpen} onClose={() => setMetricsOpen(false)} />
      <ShareSidebar open={shareOpen} onClose={() => setShareOpen(false)} cyRef={cyRef} />
    </div>
  );
};

export default App;
