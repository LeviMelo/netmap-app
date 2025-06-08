/**
 * The view that holds the graph rendering area (e.g., Cytoscape canvas).
 * Displayed when graph data exists.
 */
import React from 'react';
import { useAppStore } from '../../stores/appState';

export const GraphCanvas: React.FC = () => {
  const { elements } = useAppStore();

  return (
    <div className="flex-1 relative overflow-hidden bg-bg-primary">
      {/* Graph will be rendered here by a library like Cytoscape.js */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <img 
              src="/src/assets/netmap_logo.png" 
              alt="NetMap Logo" 
              className="w-full h-full object-contain opacity-50"
            />
          </div>
          <p className="text-body text-text-muted">Graph rendering will be implemented here</p>
          <p className="text-small text-text-muted mt-2">
            {elements.nodes.length} nodes, {elements.edges.length} edges
          </p>
        </div>
      </div>
    </div>
  );
};