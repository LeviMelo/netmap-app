// src/components/GraphCanvas.tsx
// ➤ Preserves style resolution, layout fallback, manual gestures, and selection
import React, { useRef, useMemo, useCallback, useEffect, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, LayoutOptions, ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
import edgehandles from 'cytoscape-edgehandles';
import { useGraphStore } from '../store';

// Register extensions once (HMR/StrictMode safe)
if (typeof window !== 'undefined') {
  cytoscape.use(coseBilkent);
  cytoscape.use(dagre);
  cytoscape.use(edgehandles);
}

// ID generators for new nodes/edges
let newNodeCount = 0, newEdgeCount = 0;
const genNodeId = () => `new_n_${Date.now()}_${newNodeCount++}`;
const genEdgeId = () => `new_e_${Date.now()}_${newEdgeCount++}`;

interface Props { onCyInit?: (cy: Core) => void; }

const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  // Selectors from Zustand store
  const nodes = useGraphStore(s => s.nodes);
  const edges = useGraphStore(s => s.edges);
  const style = useGraphStore(s => s.style);
  const stylesResolved = useGraphStore(s => s.stylesResolved);
  const layoutName = useGraphStore(s => s.layoutName);
  const setSelectedId = useGraphStore(s => s.setSelectedElementId);
  const addNode = useGraphStore(s => s.addNode);
  const addEdge = useGraphStore(s => s.addEdge);

  const cyRef = useRef<Core | null>(null);

  // Normalize elements array
  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges]
  );

  // Build layout options, with CoSE-Bilkent fallback
  const graphLayout = useMemo<LayoutOptions>(() => {
    const base = { padding: 30, animate: true, animationDuration: 500, fit: true };
    if (layoutName === 'cose') {
      return {
        name: 'cose-bilkent',
        ...base,
        tile: false,                      // disable internal tiling to mitigate invalid array length
        nodeRepulsion: () => 4500,
        idealEdgeLength: () => 100,
        edgeElasticity: () => 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        gravityRange: 3.8,
        gravityCompound: 1.0,
        gravityRangeCompound: 1.5,
        numIter: 2500,
        randomize: true,
        nodeDimensionsIncludeLabels: true,
        uniformNodeDimensions: false,
        refresh: 30
      } as LayoutOptions;
    }
    if (layoutName === 'dagre') {
      return ({
        name: 'dagre',
        ...base,
        rankDir: 'TB',
        spacingFactor: 1.2,
        nodeDimensionsIncludeLabels: true
      } as any) as LayoutOptions;
    }
    return { name: layoutName, ...base, spacingFactor: 1.2 } as LayoutOptions;
  }, [layoutName]);

  // Layout runner with fallback to built-in cose
  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;
    try {
      cy.stop();
      cy.layout(graphLayout).run();
    } catch (err) {
      console.warn('CoSE‑Bilkent failed; falling back to basic cose:', err);
      cy.layout({
        name: 'cose',
        padding: 30,
        animate: true,
        animationDuration: 500,
        fit: true,
        spacingFactor: 1.2
      } as any).run();
    }
  }, [graphLayout]);

  // Re-run layout when elements or styles change
  useEffect(() => {
    if (stylesResolved) runLayout();
  }, [elements, stylesResolved, runLayout]);

  // Initialize Cytoscape instance: selection, double-tap, edgehandles
  const handleCyInit = useCallback((cy: Core) => {
    cyRef.current = cy;
    onCyInit?.(cy);

    // Selection logic
    cy.on('tap', evt => {
      setSelectedId(evt.target === cy ? null : evt.target.id());
    });

    // Double-tap to add a node at that position
    cy.on('dbltap', evt => {
      if (evt.target === cy) {
        const { x, y } = evt.position;
        const label = prompt('Enter label for new node:', 'New Node');
        if (label) addNode({ data: { id: genNodeId(), label }, position: { x, y } } as ElementDefinition);
      }
    });

    // Edgehandles: drag from node to node or node to blank
    const eh = (cy as any).edgehandles({
      toggleOffOnLeave: true,
      complete: (source: any, target: any) => {
        const label = prompt('Enter label for new edge:', '');
        if (label !== null) {
          addEdge({
            data: {
              id: genEdgeId(),
              source: source.id(),
              target: target.id(),
              label: label || undefined
            }
          } as ElementDefinition);
        }
        eh.disableDrawMode();
      }
    });
    eh.enableDrawMode();

    // Center if elements exist
    if (cy.elements().length > 0) cy.center();
  }, [addNode, addEdge, onCyInit, setSelectedId]);

  // Show loading until stylesResolved
  if (!stylesResolved) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-muted">
        <p>Loading Styles...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        cy={handleCyInit}
        layout={{ name: 'preset' }}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;
