import React, {
  useRef,
  useMemo,
  useCallback,
  useEffect,
  memo,
} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Core, LayoutOptions, ElementDefinition, NodeSingular } from 'cytoscape';
import { useGraphStore } from '../store';

let newNodeCount = 0,
  newEdgeCount = 0;
const genNodeId = () => `new_n_${Date.now()}_${newNodeCount++}`;
const genEdgeId = () => `new_e_${Date.now()}_${newEdgeCount++}`;

interface Props {
  onCyInit?: (cy: Core) => void;
}

const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const style = useGraphStore((s) => s.style);
  const layoutName = useGraphStore((s) => s.layoutName);
  const setSelectedId = useGraphStore((s) => s.setSelectedElementId);
  const addNode = useGraphStore((s) => s.addNode);
  const addEdge = useGraphStore((s) => s.addEdge);

  const cyRef = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);

  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges]
  );

  const graphLayoutOptions = useMemo<LayoutOptions>(() => {
    // ... layout options generation remains the same ...
    const base = { padding: 40, animate: true, animationDuration: 500, fit: true };
    switch (layoutName) {
      case 'cose':
        return { name: 'cose-bilkent', ...base, nodeDimensionsIncludeLabels: false, idealEdgeLength: 120, edgeElasticity: 0.45, nodeRepulsion: 4500, nestingFactor: 0.1, gravity: 0.3, numIter: 2500, tile: false, randomize: true };
      case 'dagre':
        return { name: 'dagre', ...base, rankDir: 'TB', spacingFactor: 1.3, nodeDimensionsIncludeLabels: false };
      case 'breadthfirst':
          return { name: 'breadthfirst', ...base, directed: true, spacingFactor: 1.5 };
      case 'circle':
          return { name: 'circle', ...base, spacingFactor: 1.5 };
      case 'grid':
          return { name: 'grid', ...base, spacingFactor: 1.2 };
      default:
          console.warn(`Unknown layout "${layoutName}", using grid.`);
          return { name: 'grid', ...base, spacingFactor: 1.2 };
    }
  }, [layoutName]);

  const runLayout = useCallback(() => {
    // ... runLayout implementation remains the same ...
     const cy = cyRef.current;
    if (!cy || cy.elements().empty()) return;
    if (layoutRef.current) layoutRef.current.stop();
    try {
      const currentLayoutOptions = graphLayoutOptions as any; // Keep cast if needed
      const newLayout = cy.layout(currentLayoutOptions);
      layoutRef.current = newLayout;
      newLayout.run();
    } catch (err) {
      console.error(`Layout failed:`, err);
      if (graphLayoutOptions.name !== 'cose') {
        try {
          console.warn('Fallback to basic cose.');
          const fallback: LayoutOptions = { name: 'cose', padding: 40, animate: true, animationDuration: 500, fit: true, nodeDimensionsIncludeLabels: false, spacingFactor: 1.2 };
          const f = cy.layout(fallback as any); // Keep cast if needed
          layoutRef.current = f;
          f.run();
        } catch (e2) {
          console.error('Fallback also failed:', e2);
        }
      }
    }
  }, [graphLayoutOptions]);

  useEffect(() => {
    runLayout();
  }, [elements, runLayout]);

  const handleCyInit = useCallback(
    (cy: Core) => {
      cyRef.current = cy;
      onCyInit?.(cy);

      cy.on('tap', 'node, edge', (ev) => setSelectedId(ev.target.id()));
      cy.on('tap', (ev) => {
        if (ev.target === cy) setSelectedId(null);
      });
      cy.on('dbltap', (ev) => {
        if (ev.target === cy) {
          const { x, y } = ev.position;
          const label = prompt('Enter label for new node:', 'New Node');
          if (label) {
            addNode({ data: { id: genNodeId(), label }, position: { x, y } } as ElementDefinition);
          }
        }
      });

      if ((cy as any).edgehandles) {
        const eh = (cy as any).edgehandles({ // Assign to eh
          preview: true,
          hoverDelay: 150,
          handleNodes: 'node',
          handleSize: 10,
          handleColor: 'var(--color-accent-secondary)',
          edgeType: (_s: NodeSingular, _t: NodeSingular) => 'flat', // Use underscores
          loopAllowed: (_n: NodeSingular) => false, // Use underscore
          edgeParams: (_s: NodeSingular, _t: NodeSingular) => ({ group: 'edges' }), // Use underscores
          complete: (s: NodeSingular, t: NodeSingular, _added: any) => { // Use underscore for addedEles
            const lbl = prompt('Label for new edge (optional):', '');
            addEdge({
              data: { id: genEdgeId(), source: s.id(), target: t.id(), label: lbl || undefined },
            } as ElementDefinition);
            eh.disableDrawMode(); // Disable after completion
          },
          cancel: (_s: NodeSingular, _c: any) => { // Handle cancel event
             eh.disableDrawMode();
          },
          start: (_s: NodeSingular) => { // Optionally handle start event
            // e.g., dim other nodes
          },
          stop: (_s: NodeSingular) => { // Optionally handle stop event
             eh.disableDrawMode(); // Ensure it's disabled if drag stops without completing
          }
        });
        // Don't enable draw mode by default, maybe trigger via UI button?
        // eh.enableDrawMode();
      } else {
        console.warn("Edgehandles extension not available.");
      }
    },
    [addNode, addEdge, onCyInit, setSelectedId] // Keep dependencies
  );

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