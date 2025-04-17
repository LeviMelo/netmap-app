import React, { useRef, useCallback, memo, useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, {
    Core,
    LayoutOptions,
    NodeSingular, // Import for node type
    EdgeSingular  // Import for edge type
} from 'cytoscape';
import { useGraphStore } from '../store';

// Import layout extensions - TS should now find these due to d.ts files
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
// import cola from 'cytoscape-cola'; // Example layout extension (install if needed)

// Register layout extensions - Use a flag to prevent multiple registrations
let layoutsRegistered = false;
if (typeof window !== 'undefined' && !layoutsRegistered) {
    try {
        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        // cytoscape.use(cola); // Register if installed and needed
        layoutsRegistered = true;
        console.log("Cytoscape layouts registered.");
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
      // console.log("Calculating normalized elements..."); // Less noisy log
      return CytoscapeComponent.normalizeElements({ nodes, edges });
  }, [nodes, edges]);

  // Define layout options dynamically based on selected name
  const graphLayout = useMemo((): LayoutOptions => {
      // console.log(`Setting layout options for: ${layoutName}`); // Less noisy log

      // Base options common to many layouts (or defaults)
      const baseOptions = {
            padding: 30,
            animate: true,
            animationDuration: 500,
            fit: true, // Include fit here, will assert type later
      };

      // Layout specific options
      let specificOptions: any = {}; // Use 'any' temporarily for flexibility
      let currentLayoutName = layoutName; // Use a local variable

      switch(layoutName) {
          case 'cose':
              // Check if cose-bilkent was registered (best effort, no static type check possible)
              // We assume registration worked if no error was thrown above.
              currentLayoutName = 'cose-bilkent'; // Prefer cose-bilkent
              specificOptions = {
                  // Options specific to cose-bilkent / cose
                  nodeRepulsion: (_node: NodeSingular) => 4500, // Type param, use _ if not needed
                  idealEdgeLength: (_edge: EdgeSingular) => 100, // Type param, use _ if not needed
                  gravity: 0.1,
                  numIter: 1000, // Example specific option
                  randomize: true,
              };
              break;
          case 'dagre':
              currentLayoutName = 'dagre'; // Ensure name matches
              specificOptions = {
                  rankDir: 'TB', // Top to bottom
                  spacingFactor: 1.2,
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
          // Add cases for other layouts (e.g., 'cola')
          default:
              console.warn(`Unknown layout name "${layoutName}", falling back to grid.`);
              currentLayoutName = 'grid'; // Fallback to grid
              specificOptions = { spacingFactor: 1.2 };
      }

      // Combine base and specific options, ensuring 'name' is correct
      // Assert the final object as LayoutOptions to satisfy TS regarding 'fit' etc.
      return { name: currentLayoutName, ...baseOptions, ...specificOptions } as LayoutOptions;

  }, [layoutName]); // Recompute only when layoutName changes

  // Function to run layout (memoized)
  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`Running layout: ${graphLayout.name}`);
          // Stop any previous layout animations before starting new one
          cy.stop(true, true);
          // Run the layout
          cy.layout(graphLayout).run();
      }
  }, [graphLayout]); // Dependency on the computed graphLayout object

  // Effect to run layout when elements or layout options change
  useEffect(() => {
    if (cyRef.current && stylesResolved) {
      console.log("Elements or layout changed, running layout...");
      runLayout();
    }
  // Run when the graph data changes or the layout definition changes
  }, [elements, runLayout, stylesResolved]);


  // Memoize the core initialization callback
  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Registering Cytoscape instance...");
    cyRef.current = cyInstance;
    cyInstance.ready(() => {
         console.log("Cytoscape core ready. Applying events.");
         cyInstance.center(); // Center initially

         // --- Event Listeners ---
         cyInstance.removeAllListeners(); // Clear previous listeners
         cyInstance.on('tap', (event) => {
           if (event.target === cyInstance) {
               console.log("Tap background -> Deselect");
               setSelectedElement(null);
           }
         });
         cyInstance.on('tap', 'node', (event) => {
             const id = event.target.id();
             console.log(`Tap node ${id} -> Select`);
             setSelectedElement(id);
           });
         cyInstance.on('tap', 'edge', (event) => {
             const id = event.target.id();
             console.log(`Tap edge ${id} -> Select`);
             setSelectedElement(id);
         });
         // --- End Event Listeners ---
    });
  // Dependency only on the state setter function
  }, [setSelectedElement]);


  // Render loading state until styles are resolved
  if (!stylesResolved) {
      console.log("Styles not resolved yet, rendering loading indicator.");
      return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-text-secondary-dark">
              <p>Loading Styles...</p>
          </div>
      );
  }

  // console.log(`Rendering CytoscapeComponent with effective layout name: ${graphLayout.name}`); // More detailed log

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden"> {/* Standard background */}
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        // Layout prop only sets initial config before JS takes over
        layout={{ name: 'preset' }} // Use preset so nodes appear near initial positions before layout runs
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }} // Standard style
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;