/**
 * The view that holds the graph rendering area (e.g., Cytoscape canvas).
 * Displayed when graph data exists.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../stores/appState';
import { initCytoscape, CytoscapeInstance } from '../../utils/cytoscapeInit';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

export const GraphCanvas: React.FC = () => {
  const { 
    elements, 
    mode, 
    settings, 
    addEdge, 
    updateNode, 
    updateEdge, 
    selectNode, 
    selectEdge, 
    clearSelection,
    selectedNodes,
    selectedEdges
  } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cytoscapeInstanceRef = useRef<CytoscapeInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // FIX: Changed dependency array to [] to ensure this effect runs only ONCE on mount.
  // The check for `containerRef.current` inside the effect is the correct way to handle timing.
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    try {
      const cytoscapeInstance = initCytoscape({
        container: containerRef.current,
        elements,
        mode,
        theme: settings.theme,
      });

      cytoscapeInstanceRef.current = cytoscapeInstance;

      // Set up event listeners
      setupEventListeners(cytoscapeInstance.cy);

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Cytoscape:', error);
    }

    // Cleanup on unmount
    return () => {
      if (cytoscapeInstanceRef.current) {
        cytoscapeInstanceRef.current.destroy();
        cytoscapeInstanceRef.current = null;
        setIsInitialized(false);
      }
    };
  }, []); // Empty dependency array is correct here.

  // Update mode when it changes
  useEffect(() => {
    if (cytoscapeInstanceRef.current && isInitialized) {
      cytoscapeInstanceRef.current.updateMode(mode);
    }
  }, [mode, isInitialized]);

  // Update theme when it changes
  useEffect(() => {
    if (cytoscapeInstanceRef.current && isInitialized) {
      cytoscapeInstanceRef.current.updateTheme(settings.theme);
    }
  }, [settings.theme, isInitialized]);

  // Update elements when they change
  useEffect(() => {
    if (cytoscapeInstanceRef.current && isInitialized) {
      cytoscapeInstanceRef.current.updateElements(elements);
    }
  }, [elements, isInitialized]);

  // Set up Cytoscape event listeners
  const setupEventListeners = (cy: any) => {
    // Node selection
    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const nodeId = node.id();
      
      if (mode === 'view' || mode === 'manualEdit') {
        selectNode(nodeId, evt.originalEvent.ctrlKey || evt.originalEvent.metaKey);
      } else if (mode === 'paint') {
        // Paint mode: apply current color
        const currentColor = useAppStore.getState().selectedColor;
        updateNode(nodeId, { color: currentColor });
        
        // Apply to outgoing edges if propagation is enabled
        if (useAppStore.getState().propagateToEdges) {
          const sourceNode = elements.nodes.find(n => n.id === nodeId);
          if (sourceNode && !sourceNode.isConnectorNode) {
            elements.edges
              .filter(e => e.source === nodeId)
              .forEach(e => updateEdge(e.id, { color: currentColor }));
          }
        }
      }
    });

    // Edge selection
    cy.on('tap', 'edge', (evt: any) => {
      const edge = evt.target;
      const edgeId = edge.id();
      
      if (mode === 'view' || mode === 'manualEdit') {
        selectEdge(edgeId, evt.originalEvent.ctrlKey || evt.originalEvent.metaKey);
      } else if (mode === 'paint') {
        const currentColor = useAppStore.getState().selectedColor;
        updateEdge(edgeId, { color: currentColor });
      }
    });

    // Background tap (clear selection)
    cy.on('tap', (evt: any) => {
      if (evt.target === cy) {
        clearSelection();
      }
    });

    // Double-tap to rename (manual edit mode)
    let lastTapTime = 0;
    cy.on('tap', 'node', (evt: any) => {
      if (mode !== 'manualEdit') return;
      
      const currentTime = Date.now();
      if (currentTime - lastTapTime < 300) {
        // Double tap detected
        const node = evt.target;
        const nodeId = node.id();
        const currentLabel = node.data('label');
        
        // Simple prompt for now - could be enhanced with inline editing
        const newLabel = prompt('Enter new label:', currentLabel);
        if (newLabel && newLabel !== currentLabel) {
          updateNode(nodeId, { label: newLabel });
        }
      }
      lastTapTime = currentTime;
    });

    // Node position changes (dragging)
    cy.on('dragfree', 'node', (evt: any) => {
      if (mode === 'manualEdit' || mode === 'layout') {
        const node = evt.target;
        const position = node.position();
        updateNode(node.id(), { position });
      }
    });

    // Edge creation (from edgehandles)
    cy.on('edgeAdded', (_evt: any, addedEdge: any) => {
      const edgeData = addedEdge.data();
      const newEdge = {
        source: edgeData.source,
        target: edgeData.target,
        color: edgeData.color,
      };
      
      // Generate unique ID
      const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addEdge({ ...newEdge, id: edgeId });
    });

    // Right-click context menu (desktop)
    cy.on('cxttap', 'node', (evt: any) => {
      if (mode === 'manualEdit') {
        const node = evt.target;
        const nodeId = node.id();
        
        // Simple confirmation for now - could be enhanced with proper context menu
        if (confirm('Delete this node?')) {
          useAppStore.getState().deleteNode(nodeId);
        }
      }
    });

    cy.on('cxttap', 'edge', (evt: any) => {
      if (mode === 'manualEdit') {
        const edge = evt.target;
        const edgeId = edge.id();
        
        if (confirm('Delete this edge?')) {
          useAppStore.getState().deleteEdge(edgeId);
        }
      }
    });
  };

  // Canvas control functions
  const handleZoomIn = () => {
    if (cytoscapeInstanceRef.current) {
      cytoscapeInstanceRef.current.cy.zoom(cytoscapeInstanceRef.current.cy.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cytoscapeInstanceRef.current) {
      cytoscapeInstanceRef.current.cy.zoom(cytoscapeInstanceRef.current.cy.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cytoscapeInstanceRef.current) {
      cytoscapeInstanceRef.current.cy.fit(undefined, 50);
    }
  };

  const handleReset = () => {
    if (cytoscapeInstanceRef.current) {
      cytoscapeInstanceRef.current.cy.zoom(1);
      cytoscapeInstanceRef.current.cy.center();
    }
  };

  return (
    // FIX: The root div now provides the relative positioning context and fills the available flex space.
    <div className="w-full h-full relative overflow-hidden bg-bg-primary">
      {/* Canvas Container */}
      {/* FIX: This div is now positioned absolutely to guarantee it fills its parent,
          ensuring it has non-zero dimensions for Cytoscape to initialize. */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
      />
      
      {/* Canvas Controls */}
      {/* FIX: Added z-10 to ensure controls appear on top of the absolutely positioned canvas */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all"
          aria-label="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all"
          aria-label="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleFit}
          className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all"
          aria-label="Fit to Screen"
        >
          <Maximize2 size={18} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all"
          aria-label="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Status Bar */}
      {/* FIX: Added z-10 */}
      <div className="absolute bottom-4 left-4 px-3 py-2 rounded-lg glass-level-3 text-small text-text-muted z-10">
        {elements.nodes.length} nodes, {elements.edges.length} edges
        {selectedNodes.length > 0 && ` • ${selectedNodes.length} nodes selected`}
        {selectedEdges.length > 0 && ` • ${selectedEdges.length} edges selected`}
      </div>

      {/* Mode Indicator */}
      {/* FIX: Added z-10 */}
      <div className="absolute top-4 right-4 px-3 py-2 rounded-lg glass-level-3 text-small z-10">
        <span className="text-text-muted">Mode: </span>
        <span className="text-accent-primary font-medium capitalize">
          {mode.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </span>
      </div>
    </div>
  );
};