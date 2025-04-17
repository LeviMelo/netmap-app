// GraphCanvas.tsx
// Updated: 2025‑04‑17
import React, {
  memo, useRef, useMemo, useCallback, useEffect
} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, LayoutOptions, ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
import edgehandles from 'cytoscape-edgehandles';
import { useGraphStore } from '../store';

// Single‐registration
if (typeof window !== 'undefined') {
  cytoscape.use(coseBilkent);
  cytoscape.use(dagre);
  cytoscape.use(edgehandles);
}

let newNodeCount = 0, newEdgeCount = 0;
const genNodeId = () => `new_n_${Date.now()}_${newNodeCount++}`;
const genEdgeId = () => `new_e_${Date.now()}_${newEdgeCount++}`;

const GraphCanvas: React.FC = memo(() => {
  // Separate selectors to avoid infinite renders
  const nodes = useGraphStore(s => s.nodes);
  const edges = useGraphStore(s => s.edges);
  const stylesheet = useGraphStore(s => s.style);
  const stylesResolved = useGraphStore(s => s.stylesResolved);
  const layoutName = useGraphStore(s => s.layoutName);
  const setSelectedElementId = useGraphStore(s => s.setSelectedElementId);
  const addNode = useGraphStore(s => s.addNode);
  const addEdge = useGraphStore(s => s.addEdge);

  const cyRef = useRef<Core | null>(null);

  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges]
  );

  // Build layout options with CoSE‑Bilkent first
  const graphLayout = useMemo<LayoutOptions>(() => {
    const base = { padding: 30, animate: true, animationDuration: 500, fit: true };
    if (layoutName === 'cose') {
      return {
        name: 'cose-bilkent',
        ...base,
        tile: false,
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
        refresh: 30,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10
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

  // Attempt Bilkent, fallback to basic cose on error
  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;
    try {
      cy.stop();
      cy.layout(graphLayout).run();
    } catch (err) {
      console.warn('CoSE‑Bilkent failed, falling back to basic cose:', err);
      cy.layout({
        name: 'cose',
        padding: 30,
        animate: true,
        animationDuration: 500,
        fit: true,
        spacingFactor: 1.2
      }).run();
    }
  }, [graphLayout]);

  useEffect(() => {
    if (stylesResolved) runLayout();
  }, [elements, runLayout, stylesResolved]);

  // Initialize Cytoscape with manual editing UX
  const handleCyInit = useCallback((cy: Core) => {
    cyRef.current = cy;
    cy.on('tap', e => {
      setSelectedElementId(e.target === cy ? null : e.target.id());
    });
    cy.on('dbltap', e => {
      if (e.target === cy) {
        const { x, y } = e.position;
        const label = prompt('Enter label for new node:', 'New Node');
        if (label) {
          addNode({ data: { id: genNodeId(), label }, position: { x, y } } as ElementDefinition);
        }
      }
    });
    const eh = (cy as any).edgehandles({
      toggleOffOnLeave: true,
      complete: (s: any, t: any) => {
        const label = prompt('Enter label for new edge:', '');
        if (label !== null) {
          addEdge({ data: { id: genEdgeId(), source: s.id(), target: t.id(), label: label || undefined } } as ElementDefinition);
        }
        eh.disableDrawMode();
      }
    });
    eh.enableDrawMode();
    if (cy.elements().length > 0) cy.center();
  }, [addNode, addEdge, setSelectedElementId]);

  if (!stylesResolved) {
    return <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-muted"><p>Loading styles…</p></div>;
  }

  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }}
        layout={{ name: 'preset' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;
