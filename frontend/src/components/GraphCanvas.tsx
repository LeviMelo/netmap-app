// frontend/src/components/GraphCanvas.tsx
import React, { useRef, useCallback, memo } from 'react'; // Import memo
import CytoscapeComponent from 'react-cytoscapejs';
import { Core } from 'cytoscape';
import { useGraphStore } from '../store';

// Wrap component in memo to prevent re-renders if props haven't changed
const GraphCanvas: React.FC = memo(() => {
  const { nodes, edges, style, setSelectedElement, stylesResolved } = useGraphStore(
    (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        style: state.style,
        setSelectedElement: state.setSelectedElement,
        stylesResolved: state.stylesResolved, // Get the flag
    })
  );

  const cyRef = useRef<Core | null>(null);
  const elements = CytoscapeComponent.normalizeElements({ nodes, edges });

  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Cytoscape instance registered:", cyInstance);
    cyRef.current = cyInstance;

    cyInstance.ready(() => {
      const layout = cyInstance.layout({ name: 'preset' });
      layout.run();
      cyInstance.fit(undefined, 30);
      cyInstance.center();

      // Event Listeners
      cyInstance.on('tap', (event) => {
        if (event.target === cyInstance) setSelectedElement(null);
      });
      cyInstance.on('tap', 'node', (event) => setSelectedElement(event.target.id()));
      cyInstance.on('tap', 'edge', (event) => setSelectedElement(event.target.id()));
    });
  }, [setSelectedElement]);

  // Render loading state or null until styles are resolved
  if (!stylesResolved) {
      console.log("Styles not resolved yet, rendering loading/null");
      return <div className="w-full h-full flex items-center justify-center bg-gray-900"><p>Loading Styles...</p></div>; // Or return null
  }

  console.log("Styles resolved, rendering CytoscapeComponent with stylesheet:", style);

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        // Key might still be useful if elements themselves need forced updates
        // key={JSON.stringify(elements)}
        style={{ width: '100%', height: '100%' }}
        stylesheet={style} // Use the resolved style
        layout={{ name: 'preset' }}
        cy={handleCyInit}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
}); // Close the memo wrapper

export default GraphCanvas;