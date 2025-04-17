// src/components/RightSidebar.tsx
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  nodeCount: number;
  edgeCount: number;
}

const RightSidebar: React.FC<Props> = ({ open, onClose, nodeCount, edgeCount }) => (
  <aside
    className={`fixed right-0 top-0 h-full w-80 bg-bg-secondary border-l border-border transform transition-transform ${
      open ? 'translate-x-0' : 'translate-x-full'
    }`}
  >
    <div className="flex items-center justify-between p-4 border-b border-border">
      <h2 className="text-lg font-semibold">Graph Metrics</h2>
      <button onClick={onClose} className="text-text-muted text-xl leading-none">×</button>
    </div>
    <div className="p-4 space-y-4">
      <p><strong>Nodes:</strong> {nodeCount}</p>
      <p><strong>Edges:</strong> {edgeCount}</p>
      {/* Future: centrality heatmaps, degree distributions, etc. */}
    </div>
  </aside>
);

export default RightSidebar;
