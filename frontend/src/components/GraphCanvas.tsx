import React, { useRef, useCallback, memo, useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, {
    Core,
    LayoutOptions,
    NodeSingular,
    EdgeSingular
} from 'cytoscape';
import { useGraphStore } from '../store';

// --- Require and Register layout extensions ---
let layoutsRegistered = false;
if (typeof window !== 'undefined' && !layoutsRegistered) {
    try {
        // Use require for better compatibility with how extensions often expect to be loaded
        const coseBilkent = require('cytoscape-cose-bilkent');
        const dagre = require('cytoscape-dagre');
        // const cola = require('cytoscape-cola'); // If needed

        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        // cytoscape.use(cola);

        layoutsRegistered = true;
        console.log("Cytoscape layouts registered via require().");
    } catch (e) {
        console.warn("Could not register layout extension(s):", e);
    }
}

const GraphCanvas: React.FC = memo(() => {
  // Select state individually
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const style = useGraphStore((state) => state.style);
  const setSelectedElement = useGraphStore((state) => state.setSelectedElement);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);
  const layoutName = useGraphStore((state) => state.layoutName);

  const cyRef = useRef<Core | null>(null);

  // Memoize elements calculation
  const elements = useMemo(() => {
      return CytoscapeComponent.normalizeElements({ nodes, edges });
  }, [nodes, edges]);

  // Define layout options dynamically based on selected name
  const graphLayout = useMemo((): LayoutOptions => {
      // console.log(`Setting layout options for: ${layoutName}`);
      const baseOptions = {
            padding: 30,
            animate: true, // Use animation for layout transitions
            animationDuration: 500, // Duration in ms
            fit: true, // Whether to fit the viewport to the graph
      };
      let specificOptions: any = {};
      let currentLayoutName = layoutName;

      switch(layoutName) {
          case 'cose':
              currentLayoutName = 'cose-bilkent'; // Prefer cose-bilkent if registered
              specificOptions = {
                  nodeRepulsion: (_node: NodeSingular) => 4500,
                  idealEdgeLength: (_edge: EdgeSingular) => 100,
                  gravity: 0.1,
                  numIter: 1000,
                  randomize: true,
                  nodeDimensionsIncludeLabels: true, // Important for label overlap avoidance
                  uniformNodeDimensions: false,
              };
              break;
          case 'dagre':
              currentLayoutName = 'dagre';
              specificOptions = {
                  rankDir: 'TB', // Top to bottom
                  spacingFactor: 1.2,
                  nodeDimensionsIncludeLabels: true,
              };
              break;
           case 'grid':
                currentLayoutName = 'grid';
                specificOptions = { spacingFactor: 1.2 };
                break;
           case 'circle':
                currentLayoutName = 'circle';
                specificOptions = { spacingFactor: 1.2 };
                break;
            case 'breadthfirst':
                currentLayoutName = 'breadthfirst';
                specificOptions = { spacingFactor: 1.2, directed: true };
                break;
          default:
              console.warn(`Unknown layout name "${layoutName}", falling back to grid.`);
              currentLayoutName = 'grid';
              specificOptions = { spacingFactor: 1.2 };
      }
      return { name: currentLayoutName, ...baseOptions, ...specificOptions } as LayoutOptions;
  }, [layoutName]);

  // Function to run layout
  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`Running layout: ${graphLayout.name}`);
          cy.stop(true, true); // Stop previous animations
          cy.layout(graphLayout).run();
      }
  }, [graphLayout]);

  // Effect to run layout when elements or layout changes
  useEffect(() => {
    if (cyRef.current && stylesResolved) {
      runLayout();
    }
  }, [elements, runLayout, stylesResolved]); // dependencies determine when layout runs

  // Cytoscape core initialization and event binding
  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Registering Cytoscape instance...");
    cyRef.current = cyInstance;
    cyInstance.ready(() => {
         console.log("Cytoscape core ready. Applying events.");
         // Layout is handled by useEffect, just center initially
         cyInstance.center();

         // Event Listeners
         cyInstance.removeAllListeners(); // Ensure clean listeners on re-init (dev mode)
         cyInstance.on('tap', (event) => {
           if (event.target === cyInstance) setSelectedElement(null);
         });
         cyInstance.on('tap', 'node', (event) => setSelectedElement(event.target.id()));
         cyInstance.on('tap', 'edge', (event) => setSelectedElement(event.target.id()));
    });
  }, [setSelectedElement]); // Dependency on setter


  // Render loading state until styles are resolved
  if (!stylesResolved) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-text-secondary-dark">
              <p>Loading Styles...</p>
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden"> {/* Standard bg */}
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        layout={{ name: 'preset' }} // Layouts controlled via useEffect/runLayout
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;