import React, { useRef, useMemo, useCallback, useEffect, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Core, LayoutOptions, ElementDefinition, NodeSingular } from 'cytoscape'; // Import NodeSingular
// Extensions are registered globally in main.tsx now
import { useGraphStore } from '../store';

let newNodeCount = 0, newEdgeCount = 0;
const genNodeId = () => `new_n_${Date.now()}_${newNodeCount++}`;
const genEdgeId = () => `new_e_${Date.now()}_${newEdgeCount++}`;

interface Props { onCyInit?: (cy: Core) => void; }

const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  const nodes = useGraphStore(s => s.nodes);
  const edges = useGraphStore(s => s.edges);
  const style = useGraphStore(s => s.style);
  const layoutName = useGraphStore(s => s.layoutName);
  const setSelectedId = useGraphStore(s => s.setSelectedElementId);
  const addNode = useGraphStore(s => s.addNode);
  const addEdge = useGraphStore(s => s.addEdge);

  const cyRef = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);

  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges]
  );

  // Memoize layout options generation
  const graphLayoutOptions = useMemo<LayoutOptions>(() => {
    const base = { padding: 40, animate: true, animationDuration: 500, fit: true };
    switch (layoutName) {
      case 'cose':
        return {
          name: 'cose-bilkent', // The layout engine name
          ...base,
          nodeDimensionsIncludeLabels: false,
          idealEdgeLength: 120,
          edgeElasticity: 0.45,
          nodeRepulsion: 4500,
          nestingFactor: 0.1,
          gravity: 0.3,
          numIter: 2500,
          tile: false, // IMPORTANT
          randomize: true,
        }; // No cast needed here if types defined correctly
      case 'dagre':
        return {
          name: 'dagre',
          ...base,
          rankDir: 'TB',
          spacingFactor: 1.3,
          nodeDimensionsIncludeLabels: false,
        }; // No cast needed here if types defined correctly
      case 'breadthfirst':
          return { name: 'breadthfirst', ...base, directed: true, spacingFactor: 1.5 };
      case 'circle':
          return { name: 'circle', ...base, spacingFactor: 1.5 };
      case 'grid':
          return { name: 'grid', ...base, spacingFactor: 1.2 };
      default:
          console.warn(`Unknown layout name "${layoutName}", falling back to grid.`);
          return { name: 'grid', ...base, spacingFactor: 1.2 };
    }
  }, [layoutName]);

  // Function to run the layout
  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().empty()) return;

    if (layoutRef.current) {
        layoutRef.current.stop();
    }

    try {
      // Cast to 'any' here as a pragmatic way to bypass TS check for extension options
      // if type augmentation isn't reliably working across the board.
      const currentLayoutOptions = graphLayoutOptions as any;
      const newLayout = cy.layout(currentLayoutOptions);
      layoutRef.current = newLayout;
      newLayout.run();
      console.log(`Running layout: ${currentLayoutOptions.name}`);
    } catch (err) {
      console.error(`Layout "${graphLayoutOptions.name}" failed:`, err);
      // Fallback to basic cose
      if (graphLayoutOptions.name !== 'cose') {
          try {
              console.warn("Falling back to basic cose layout.");
              // Construct fallback explicitly, don't spread potentially problematic options
              const fallbackOptions: LayoutOptions = {
                  name: 'cose',
                  padding: 40, animate: true, animationDuration: 500, fit: true,
                  nodeDimensionsIncludeLabels: false, // Important for consistency
                  spacingFactor: 1.2
              };
              const fallbackLayout = cy.layout(fallbackOptions); // Cast basic cose if needed
              layoutRef.current = fallbackLayout;
              fallbackLayout.run();
          } catch (fallbackErr) {
              console.error("Fallback cose layout also failed:", fallbackErr);
          }
      }
    }
  }, [graphLayoutOptions]); // Depend on the options object

  // Effect to run layout
  useEffect(() => {
      runLayout();
  }, [elements, runLayout]); // Re-run if elements change or runLayout function identity changes (due to options)


  // Cytoscape Initialization
  const handleCyInit = useCallback((cy: Core) => {
    console.log("Cytoscape instance initializing...");
    cyRef.current = cy;
    onCyInit?.(cy);

    // --- Event Listeners ---
    cy.on('tap', 'node, edge', (event) => {
        setSelectedId(event.target.id());
    });
    cy.on('tap', (event) => {
        if (event.target === cy) setSelectedId(null);
    });
    cy.on('dbltap', (event) => {
        if (event.target === cy) {
            const { x, y } = event.position;
            const label = prompt('Enter label for new node:', 'New Node');
            if (label) addNode({ data: { id: genNodeId(), label }, position: { x, y } } as ElementDefinition);
        }
    });

     // --- Edge Handles Initialization ---
    if ((cy as any).edgehandles) {
        const eh = (cy as any).edgehandles({ // Store instance if needed
            preview: true,
            hoverDelay: 150,
            handleNodes: 'node',
            handleSize: 10,
            handleColor: 'var(--color-accent-secondary)',
            edgeType: (_sourceNode: NodeSingular, _targetNode: NodeSingular) => 'flat', // Use underscores
            loopAllowed: (_node: NodeSingular) => false, // Use underscore
            edgeParams: (_sourceNode: NodeSingular, _targetNode: NodeSingular) => ({ group: 'edges' }), // Use underscores
            complete: (sourceNode: NodeSingular, targetNode: NodeSingular, _addedEles: any) => { // Use underscores for unused
                const label = prompt('Enter label for new edge (optional):', '');
                 addEdge({
                    data: {
                      id: genEdgeId(),
                      source: sourceNode.id(),
                      target: targetNode.id(),
                      label: label || undefined
                    }
                 } as ElementDefinition);
                 console.log(`Edge added between ${sourceNode.id()} and ${targetNode.id()}`);
            },
        });
        // Optionally enable draw mode via UI later instead of always on
        // eh.enableDrawMode();
    } else {
        console.warn("Edgehandles extension not available on Cytoscape instance.");
    }

    console.log("Cytoscape instance initialized.");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNode, addEdge, onCyInit, setSelectedId]); // Dependencies


  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        cy={handleCyInit}
        layout={{ name: 'preset' }} // Use preset initially
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;