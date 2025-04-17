import React, { useRef, useCallback, memo, useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, {
    Core,
    LayoutOptions,
    NodeSingular, // Keep types for potential future use in options
    EdgeSingular
} from 'cytoscape';
import { useGraphStore } from '../store';
import { useTranslations } from '../hooks/useTranslations';

// --- Layout Registration ---
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
let layoutsRegistered = false;
if (typeof window !== 'undefined' && !layoutsRegistered) { /* ... registration try/catch ... */ }

const GraphCanvas: React.FC = memo(() => {
  const { t } = useTranslations();
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const style = useGraphStore((state) => state.style);
  const setSelectedElement = useGraphStore((state) => state.setSelectedElement);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);
  const layoutName = useGraphStore((state) => state.layoutName);

  const cyRef = useRef<Core | null>(null);
  const elements = useMemo(() => { return CytoscapeComponent.normalizeElements({ nodes, edges }); }, [nodes, edges]);

  // Define layout options dynamically
  const graphLayout = useMemo((): LayoutOptions => {
      console.log(`[GraphLayout] Setting options for: ${layoutName}`);

      // Define base/common options separately
      const baseOptions = {
          padding: 30,
          animate: true, // Animate layout changes
          animationDuration: 500,
          fit: true, // Fit the graph to the viewport after layout
      };

      let layoutConfig: any = { name: 'grid' }; // Default/fallback

      switch(layoutName) {
          case 'cose':
              // ** STEP 1: START WITH MINIMAL COSE-BILKENT OPTIONS **
              layoutConfig = {
                  name: 'cose-bilkent',
                  // Add common options back
                  ...baseOptions,
                  // ---- Start commenting out/simplifying specific cose options ----
                  // nodeDimensionsIncludeLabels: false, // Start with false
                  // idealEdgeLength: 100, // Use default
                  // nodeRepulsion: 400000, // Use default (or try simpler number)
                  // numIter: 1000, // Use default (2500)
                  // randomize: true, // Default is true
              };
              break;
          case 'dagre':
              layoutConfig = {
                  name: 'dagre',
                  ...baseOptions, // Include common options
                  rankDir: 'TB',
                  spacingFactor: 1.2,
                  // nodeDimensionsIncludeLabels: false, // Start with false
              };
              break;
           case 'grid':
                layoutConfig = { name: 'grid', ...baseOptions, spacingFactor: 1.2 };
                break;
           case 'circle':
                layoutConfig = { name: 'circle', ...baseOptions, spacingFactor: 1.2 };
                break;
            case 'breadthfirst':
                layoutConfig = { name: 'breadthfirst', ...baseOptions, spacingFactor: 1.2, directed: true };
                break;
          default:
              console.warn(`[GraphLayout] Unknown layout name "${layoutName}", falling back to grid.`);
              layoutConfig = { name: 'grid', ...baseOptions, spacingFactor: 1.2 }; // Ensure base options applied to fallback
      }
      // Assert final type (LayoutOptions includes BaseLayoutOptions + specific)
      return layoutConfig as LayoutOptions;
  }, [layoutName]);

  // Function to run layout
  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`[RunLayout] Running layout: ${graphLayout.name} with options:`, JSON.parse(JSON.stringify(graphLayout))); // Log deep copy for inspection
          cy.stop(true, true);
          try {
              // Check if elements exist before running layout
              if (cy.elements().length > 0) {
                 cy.layout(graphLayout).run();
              } else {
                  console.log("[RunLayout] No elements to layout.");
              }
          } catch (error) {
              console.error(`[RunLayout] Error running layout ${graphLayout.name}:`, error);
              alert(`Layout Error: Failed to apply '${graphLayout.name}' layout. Check console.`);
          }
      } else {
          console.warn("[RunLayout] Cytoscape core (cyRef.current) not available.");
      }
  }, [graphLayout]); // Depend on the computed layout options

  // Effect to run layout when elements or layout options change
  useEffect(() => {
    if (cyRef.current && stylesResolved) {
        console.log("[Effect] Elements or Layout changed, triggering runLayout.");
      runLayout();
    }
  }, [elements, runLayout, stylesResolved]); // Correct dependencies

  // Cytoscape core initialization and event binding
  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("[CyInit] Registering Cytoscape instance...");
    cyRef.current = cyInstance;
    cyInstance.ready(() => {
         console.log("[CyInit] Cytoscape core ready. Applying events.");
         // Layout is handled by useEffect, just center initially if needed
         if (cyInstance.elements().length > 0) {
            cyInstance.center();
         }
         // Event Listeners
         cyInstance.removeAllListeners();
         cyInstance.on('tap', (event) => { if (event.target === cyInstance) setSelectedElement(null); });
         cyInstance.on('tap', 'node', (event) => setSelectedElement(event.target.id()));
         cyInstance.on('tap', 'edge', (event) => setSelectedElement(event.target.id()));
    });
  }, [setSelectedElement]); // Dependency remains correct


  // Render loading state until styles are resolved
  if (!stylesResolved) { /* ... loading indicator ... */ }

  // console.log(`[Render] Styles resolved, rendering CytoscapeComponent. Layout to run: ${graphLayout.name}`);

  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        layout={{ name: 'preset' }} // Preset prevents initial default layout flash
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;