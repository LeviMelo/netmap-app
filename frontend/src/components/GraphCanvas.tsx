// frontend/src/components/GraphCanvas.tsx
import React, { useRef, useCallback, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs'; // Keep simplified import
import { Core, LayoutOptions } from 'cytoscape';
import { useGraphStore } from '../store';

const GraphCanvas: React.FC = memo(() => {
  const { nodes, edges, style, setSelectedElement, stylesResolved } = useGraphStore(
    (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        style: state.style,
        setSelectedElement: state.setSelectedElement,
        stylesResolved: state.stylesResolved,
    })
  );

  const cyRef = useRef<Core | null>(null);
  const elements = CytoscapeComponent.normalizeElements({ nodes, edges });

  // Define the layout separately
  const graphLayout: LayoutOptions = {
      name: 'grid', // Use grid layout for initial testing
      fit: true,
      padding: 30
  };

  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Cytoscape instance registered:", cyInstance);
    cyRef.current = cyInstance;

    cyInstance.ready(() => {
      const layout = cyInstance.layout(graphLayout);
      layout.run();
      cyInstance.center();

      // Event Listeners
      cyInstance.on('tap', (event) => {
        if (event.target === cyInstance) setSelectedElement(null);
      });
      cyInstance.on('tap', 'node', (event) => setSelectedElement(event.target.id()));
      cyInstance.on('tap', 'edge', (event) => setSelectedElement(event.target.id()));
    });
  // Only depend on items used *inside* the callback
  }, [setSelectedElement, graphLayout]);

  // *** REMOVE THE ERRONEOUS getCssVar function declaration if it exists here ***
  // It should NOT be present in this file. The errors indicate it was mistakenly added around line 77 previously.

  if (!stylesResolved) {
      return <div className="w-full h-full flex items-center justify-center bg-gray-900 text-text-secondary-dark"><p>Loading Styles...</p></div>;
  }

  return (
    // Add a distinct temporary background to the direct container for debugging
    <div className="w-full h-full bg-red-900/20 overflow-hidden"> {/* Debug background */}
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%', background: 'rgba(0, 20, 0, 0.1)' }} // Debug background
        stylesheet={style} // Use the resolved style
        layout={graphLayout} // Pass layout options
        cy={handleCyInit}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;