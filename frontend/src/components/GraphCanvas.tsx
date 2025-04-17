import React, { useRef, useCallback, memo, useEffect, useMemo } from 'react'; // Ensure all hooks are imported
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, LayoutOptions } from 'cytoscape'; // Import cytoscape for extension registration
import { useGraphStore } from '../store';
import coseBilkent from 'cytoscape-cose-bilkent'; // Example layout extension
import dagre from 'cytoscape-dagre'; // Example layout extension
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
      console.log("Calculating normalized elements...");
      return CytoscapeComponent.normalizeElements({ nodes, edges });
  }, [nodes, edges]);

  // Define layout options dynamically based on selected name
  const graphLayout = useMemo((): LayoutOptions => {
      console.log(`Setting layout options for: ${layoutName}`);
      const options: LayoutOptions = {
          name: layoutName,
          fit: true, // Generally good default
          padding: 30, // Default padding
          animate: true, // Use animation for layout transitions
          animationDuration: 500, // Duration in ms
          // Add specific options per layout
          nodeRepulsion: (node) => 4500, // For force-directed layouts like cose/cose-bilkent
          idealEdgeLength: (edge) => 100, // For force-directed
          gravity: 0.1, // For force-directed
          rankDir: 'TB', // For dagre
          spacingFactor: 1.2, // For dagre/grid etc.
          // Add more options as needed, consulting cytoscape layout docs
      };
      // Use cose-bilkent if cose is selected and extension is registered
      if (layoutName === 'cose' && cytoscape.extensions && cytoscape.extensions.layout['cose-bilkent']) {
           options.name = 'cose-bilkent';
           console.log("Using cose-bilkent layout.");
      }
      return options;
  }, [layoutName]); // Recompute only when layoutName changes

  // Function to run layout (memoized)
  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`Running layout: ${graphLayout.name}`);
          // Stop any previous layout animations before starting new one
          cy.stop(true, true);
          cy.layout(graphLayout).run();
      }
  }, [graphLayout]); // Dependency on graphLayout object

  // Effect to run layout when elements or layout options change
  useEffect(() => {
    // Only run layout if Cytoscape is initialized and styles are ready
    if (cyRef.current && stylesResolved) {
      runLayout();
    }
    // Run when the graph data changes or the layout type changes
  }, [elements, runLayout, stylesResolved]);


  // Memoize the core initialization callback
  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Registering Cytoscape instance...");
    cyRef.current = cyInstance;
    cyInstance.ready(() => {
         console.log("Cytoscape core ready. Applying events.");
         // Layout is handled by useEffect now
         cyInstance.center();

         // --- Event Listeners ---
         cyInstance.removeAllListeners(); // Clear previous listeners on re-init (belt-and-suspenders)
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

  // *** Isolation Test Point (Keep commented out unless debugging infinite loops) ***
  // return <div className="w-full h-full bg-green-500 text-white flex items-center justify-center"><p>Styles Resolved, Cytoscape Paused for Debugging</p></div>;

  console.log(`Rendering CytoscapeComponent with layout: ${layoutName}`);

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden"> {/* Changed debug bg to standard */}
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        // Layout prop sets initial layout, but useEffect handles subsequent ones
        layout={{ name: 'preset' }} // Use preset initially to respect node positions if provided
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }} // Removed debug background
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;