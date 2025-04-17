import React, { useRef, useCallback, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs'; // Using simplified d.ts or require
import { Core, LayoutOptions } from 'cytoscape';
import { useGraphStore } from '../store';

const GraphCanvas: React.FC = memo(() => {
  // Select state individually to prevent unnecessary re-renders from object reference changes
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const style = useGraphStore((state) => state.style);
  const setSelectedElement = useGraphStore((state) => state.setSelectedElement);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);

  const cyRef = useRef<Core | null>(null);

  // Memoize elements calculation only if nodes/edges actually change
  const elements = React.useMemo(() => {
      console.log("Calculating normalized elements..."); // Debug log
      return CytoscapeComponent.normalizeElements({ nodes, edges });
  }, [nodes, edges]);


  // Define the layout options (using grid for stability)
  const graphLayout = React.useMemo((): LayoutOptions => ({
      name: 'grid',
      fit: true,
      padding: 30
  }), []); // Empty dependency array - layout options don't change


  // Memoize the core initialization callback
  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Registering Cytoscape instance and applying initial layout/events...");
    cyRef.current = cyInstance;

    // Setup runs once the core instance is ready
    cyInstance.ready(() => {
      const layout = cyInstance.layout(graphLayout);
      layout.run(); // Run the defined layout
      cyInstance.center();

      // --- Event Listeners ---
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
  // Dependency includes items needed *inside* the callback
  }, [setSelectedElement, graphLayout]);


  // Render loading state until styles are resolved from the effect hook
  if (!stylesResolved) {
      console.log("Styles not resolved yet, rendering loading indicator.");
      return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-text-secondary-dark">
              <p>Loading Styles...</p>
          </div>
      );
  }

  // *** Isolation Test Point ***
  // If the infinite loop error persists, uncomment the next line, restart,
  // and see if the error still happens. This confirms if the loop involves CytoscapeComponent.
  // return <div className="w-full h-full bg-green-500 text-white flex items-center justify-center"><p>Styles Resolved, Cytoscape Paused for Debugging</p></div>;

  console.log("Styles resolved, rendering CytoscapeComponent...");

  return (
    <div className="w-full h-full bg-red-900/20 overflow-hidden"> {/* Debug background */}
      <CytoscapeComponent
        // Pass memoized elements
        elements={elements}
        // Pass resolved stylesheet
        stylesheet={style}
        // Pass layout options
        layout={graphLayout}
        // Pass initialization callback
        cy={handleCyInit}
        // Component styling
        style={{ width: '100%', height: '100%', background: 'rgba(0, 20, 0, 0.1)' }} // Debug background
        // Other options
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;