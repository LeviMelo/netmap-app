import React, { useRef, useCallback, memo, useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, {
    Core,
    LayoutOptions,
    NodeSingular,
    EdgeSingular
} from 'cytoscape';
import { useGraphStore } from '../store';
import { useTranslations } from '../hooks/useTranslations';

// --- Use standard ES Imports for layout extensions ---
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
// import cola from 'cytoscape-cola';

// --- Register layout extensions ---
let layoutsRegistered = false;
if (typeof window !== 'undefined' && !layoutsRegistered) {
    try {
        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        layoutsRegistered = true;
        console.log("Cytoscape layouts registered.");
    } catch (e) {
        console.warn("Could not register layout extension(s):", e);
    }
}

const GraphCanvas: React.FC = memo(() => {
  const { t } = useTranslations();
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
      const baseOptions = {
            padding: 30,
            animate: true,
            animationDuration: 500,
            fit: true,
      };
      let specificOptions: any = {};
      let currentLayoutName = layoutName;

      switch(layoutName) {
          case 'cose':
              currentLayoutName = 'cose-bilkent';
              specificOptions = {
                  // --- Start with fewer/default options for Cose-Bilkent ---
                  // nodeRepulsion: (_node: NodeSingular) => 4500, // TRY commenting out
                  // idealEdgeLength: (_edge: EdgeSingular) => 100, // TRY commenting out
                  // gravity: 0.1, // Default is often okay
                  // numIter: 1000, // Default is 2500
                  randomize: true, // Default is true
                  nodeDimensionsIncludeLabels: false, // <-- TRY false first
                  // uniformNodeDimensions: false, // Default is false
              };
              break;
          case 'dagre':
              currentLayoutName = 'dagre';
              specificOptions = {
                  rankDir: 'TB',
                  spacingFactor: 1.2,
                  nodeDimensionsIncludeLabels: false, // <-- TRY false first
              };
              break;
           // Other cases: grid, circle, breadthfirst
           case 'grid': specificOptions = { name: 'grid', spacingFactor: 1.2 }; break;
           case 'circle': specificOptions = { name: 'circle', spacingFactor: 1.2 }; break;
           case 'breadthfirst': specificOptions = { name: 'breadthfirst', spacingFactor: 1.2, directed: true }; break;
          default:
              currentLayoutName = 'grid';
              specificOptions = { spacingFactor: 1.2 };
      }
      // Assign name explicitly before merging
      specificOptions.name = currentLayoutName;
      // Assert final type
      return { ...baseOptions, ...specificOptions } as LayoutOptions;
  }, [layoutName]);

  // Function to run layout
  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`Running layout: ${graphLayout.name} with options:`, graphLayout);
          cy.stop(true, true); // Stop previous layout/animations
          try {
              cy.layout(graphLayout).run();
          } catch (error) {
              console.error(`Error running layout ${graphLayout.name}:`, error);
              // TODO: Add user feedback about layout error
              alert(`Layout Error: Failed to apply '${graphLayout.name}' layout. Check console.`);
               // Optionally try falling back to a safe layout like grid
               // cy.layout({ name: 'grid', fit: true, padding: 30 }).run();
          }
      }
  }, [graphLayout]);

  // Effect to run layout when elements or layout changes
  useEffect(() => {
    if (cyRef.current && stylesResolved) {
      runLayout();
    }
  }, [elements, runLayout, stylesResolved]);

  // Cytoscape core initialization and event binding
  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Registering Cytoscape instance...");
    cyRef.current = cyInstance;
    cyInstance.ready(() => {
         console.log("Cytoscape core ready. Applying events.");
         cyInstance.center();
         // Event Listeners
         cyInstance.removeAllListeners();
         cyInstance.on('tap', (event) => { if (event.target === cyInstance) setSelectedElement(null); });
         cyInstance.on('tap', 'node', (event) => setSelectedElement(event.target.id()));
         cyInstance.on('tap', 'edge', (event) => setSelectedElement(event.target.id()));
    });
  }, [setSelectedElement]);


  // Render loading state until styles are resolved
  if (!stylesResolved) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-text-secondary-dark">
              <p>{t('loadingStyles')}</p>
          </div>
      );
  }

  // Add console log for elements right before render for debugging
  // console.log("Rendering elements:", JSON.stringify(elements.slice(0, 5))); // Log first few elements

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        layout={{ name: 'preset' }} // Initial layout only
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;