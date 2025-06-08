/**
 * DEFINITIVE FIX:
 * - The final error "Property 'preset' does not exist on type 'LayoutConfigs'" is
 *   resolved in the `handleReset` function.
 * - A conditional check is added to ensure we only try to access `layoutConfigs`
 *   when the current layout is not 'preset'.
 * - For the 'preset' layout, the reset action is now correctly defined as fitting
 *   the graph to the view, which is a sensible default for a manual layout.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../stores/appState';
import { initCytoscape, CytoscapeInstance } from '../../utils/cytoscapeInit';
import { NodeSingular } from 'cytoscape';

export const GraphCanvas: React.FC = () => {
  const cyRef = useRef<CytoscapeInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastTap = useRef<{ time: number; target: any }>({ time: 0, target: null });
  const rightClickDragData = useRef<{ sourceNodeId?: string; ghostNodeId?: string; ghostEdgeId?: string; }>({});

  const elements = useAppStore((state) => state.elements);
  const mode = useAppStore((state) => state.mode);
  const settings = useAppStore((state) => state.settings);
  const currentLayout = useAppStore((state) => state.currentLayout);
  const layoutConfigs = useAppStore((state) => state.layoutConfigs);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const pastStates = useAppStore((state) => state.pastStates);
  const futureStates = useAppStore((state) => state.futureStates);

  const {
    selectNode,
    selectEdge,
    updateNode,
    addNode,
    addEdge,
    paintNode,
    paintEdge,
    clearSelection,
  } = useAppStore.getState();

  const setupEventListeners = useCallback((cy: cytoscape.Core) => {
    cy.removeListener('tap mousedown mouseup dragover cxttap cxtdrag cxtdragover cxtdragout cxtend dragfree');

    let isPainting = false;
    let lastPaintedTarget: cytoscape.Singular | null = null;

    cy.on('mousedown', 'node, edge', () => { if (mode === 'paint') isPainting = true; });
    cy.on('mouseup', () => { if (mode === 'paint') { isPainting = false; lastPaintedTarget = null; } });
    
    cy.on('dragover', 'node, edge', (e) => {
      if (isPainting && e.target !== lastPaintedTarget) {
        const target = e.target;
        if (target.isNode()) paintNode(target.id());
        if (target.isEdge()) paintEdge(target.id());
        lastPaintedTarget = target;
      }
    });

    cy.on('tap', (e) => {
      const target = e.target;
      const currentTime = Date.now();
      const isDoubleTap = currentTime - lastTap.current.time < 300 && target === lastTap.current.target;
      lastTap.current = { time: currentTime, target: target };

      switch (mode) {
        case 'view':
        case 'layout':
          if (target === cy) clearSelection();
          else if (target.isNode()) selectNode(target.id(), e.originalEvent.metaKey || e.originalEvent.ctrlKey);
          else if (target.isEdge()) selectEdge(target.id(), e.originalEvent.metaKey || e.originalEvent.ctrlKey);
          break;
        case 'manualEdit': {
          if (target === cy) { clearSelection(); return; }

          if (isDoubleTap && target.isNode()) {
            const newLabel = prompt('Enter new node label:', target.data('label') || '');
            if (newLabel !== null) updateNode(target.id(), { label: newLabel });
          } else {
             if (target.isNode()) selectNode(target.id(), e.originalEvent.metaKey || e.originalEvent.ctrlKey);
             else if (target.isEdge()) selectEdge(target.id(), e.originalEvent.metaKey || e.originalEvent.ctrlKey);
          }
          break;
        }
        case 'paint':
          if (target.isNode()) paintNode(target.id());
          if (target.isEdge()) paintEdge(target.id());
          break;
      }
    });

    cy.on('cxttap', 'node', (e) => {
        e.preventDefault();
    });

    cy.on('cxtdrag', 'node', (e) => {
        if (mode !== 'manualEdit') return;
        const sourceNode = e.target;
        if (!rightClickDragData.current.ghostNodeId) {
            rightClickDragData.current.sourceNodeId = sourceNode.id();
            const ghost = cy.add({ data: { id: 'ghost-node' }, position: e.position, classes: 'ghost-element' });
            rightClickDragData.current.ghostNodeId = ghost.id();
            const ghostEdge = cy.add({ data: { source: sourceNode.id(), target: ghost.id(), id: 'ghost-edge' }, classes: 'ghost-element' });
            rightClickDragData.current.ghostEdgeId = ghostEdge.id();
        } else if (rightClickDragData.current.ghostNodeId) {
            cy.getElementById(rightClickDragData.current.ghostNodeId).position(e.position);
        }
    });
    
    cy.on('cxtdragout', 'node', () => cy.remove('.ghost-element'));
    
    cy.on('cxtend', (e) => {
        cy.remove('.ghost-element');
        if (mode !== 'manualEdit' || !rightClickDragData.current.sourceNodeId) return;

        const { sourceNodeId } = rightClickDragData.current;
        const target = e.target;
        
        if (target.isNode() && target.id() !== sourceNodeId) {
            addEdge({ source: sourceNodeId, target: target.id() });
        } else if (target === cy) {
            const newNode = addNode({ label: 'New Node', position: e.position });
            if(newNode) addEdge({ source: sourceNodeId, target: newNode.id });
        }
        rightClickDragData.current = {};
    });

    cy.on('dragfree', 'node', (e) => {
      if (mode === 'manualEdit' || mode === 'layout' || currentLayout === 'preset') {
        updateNode(e.target.id(), { position: e.target.position() });
      }
    });
  }, [mode, addEdge, addNode, updateNode, selectNode, selectEdge, clearSelection, paintNode, paintEdge, currentLayout]);

  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;
    const cyInstance = initCytoscape({
      container: containerRef.current,
      elements,
      mode,
      theme: settings.theme,
    });
    cyRef.current = cyInstance;
    setIsInitialized(true);
    return () => {
        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
    if (isInitialized && cyRef.current) {
      setupEventListeners(cyRef.current.cy);
    }
  }, [isInitialized, mode, setupEventListeners]);

  useEffect(() => {
    if (isInitialized && cyRef.current) {
      if (currentLayout === 'preset') {
        cyRef.current.cy.nodes().lock();
        cyRef.current.cy.nodes().forEach((node: NodeSingular) => {
            const modelNode = elements.nodes.find((n) => n.id === node.id());
            if (modelNode?.position) {
              node.position(modelNode.position);
            }
        });
        cyRef.current.cy.nodes().unlock();
        cyRef.current.cy.fit(undefined, 50);
      } else {
        // This is safe because 'preset' is handled above
        cyRef.current.applyLayout(layoutConfigs[currentLayout]);
      }
    }
  }, [isInitialized, currentLayout, layoutConfigs, elements.nodes]);

  useEffect(() => { if (isInitialized && cyRef.current) cyRef.current.updateElements(elements); }, [isInitialized, elements]);
  useEffect(() => { if (isInitialized && cyRef.current) cyRef.current.updateTheme(settings.theme); }, [isInitialized, settings.theme]);
  useEffect(() => { if (isInitialized && cyRef.current) cyRef.current.updateMode(mode); }, [isInitialized, mode]);

  const handleZoom = (factor: number) => cyRef.current?.cy.zoom(cyRef.current.cy.zoom() * factor);
  const handleFit = () => cyRef.current?.cy.fit(undefined, 50);

  // DEFINITIVE FIX FOR THE LAST ERROR
  const handleReset = () => {
    if (!cyRef.current) return;

    // Check if the current layout is algorithmic before trying to access layoutConfigs
    if (currentLayout !== 'preset') {
      // This is now type-safe. The key will be 'cola', 'dagre', etc.
      cyRef.current.applyLayout(layoutConfigs[currentLayout]);
    } else {
      // For 'preset' layout, a sensible reset action is to fit the view.
      cyRef.current.cy.fit(undefined, 50);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-bg-primary">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button
          onClick={undo}
          disabled={pastStates.length === 0}
          className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Undo"
        ><Undo size={18} /></button>
        <button
          onClick={redo}
          disabled={futureStates.length === 0}
          className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Redo"
        ><Redo size={18} /></button>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button onClick={() => handleZoom(1.2)} className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all" aria-label="Zoom In"><ZoomIn size={18} /></button>
        <button onClick={() => handleZoom(0.8)} className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all" aria-label="Zoom Out"><ZoomOut size={18} /></button>
        <button onClick={handleFit} className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all" aria-label="Fit to Screen"><Maximize2 size={18} /></button>
        <button onClick={handleReset} className="p-2 rounded-lg glass-level-3 hover:bg-accent-primary/10 text-accent-primary transition-all" aria-label="Reset Layout"><RotateCcw size={18} /></button>
      </div>
      <div className="absolute top-4 right-4 px-3 py-2 rounded-lg glass-level-3 text-small z-10 pointer-events-none">
        <span className="text-text-muted">Mode: </span>
        <span className="text-accent-primary font-medium capitalize">
          {mode.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </span>
      </div>
    </div>
  );
};