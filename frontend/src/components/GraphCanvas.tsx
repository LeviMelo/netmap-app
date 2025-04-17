import React, { useRef, useCallback, memo, useEffect, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, {
    Core,
    LayoutOptions,
    NodeSingular,
    EdgeSingular
} from 'cytoscape';
import { useGraphStore } from '../store';
import { useTranslations } from '../hooks/useTranslations'; // Import i18n hook

// --- Use standard ES Imports for layout extensions ---
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
// import cola from 'cytoscape-cola'; // Keep commented unless installed

// --- Register layout extensions using the imported variables ---
let layoutsRegistered = false;
if (typeof window !== 'undefined' && !layoutsRegistered) {
    try {
        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        // cytoscape.use(cola);
        layoutsRegistered = true;
        console.log("Cytoscape layouts registered via import.");
    } catch (e) {
        console.warn("Could not register layout extension(s):", e);
    }
}

const GraphCanvas: React.FC = memo(() => {
  const { t } = useTranslations(); // Use i18n hook
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
              currentLayoutName = 'cose-bilkent'; // Prefer cose-bilkent if registered
              specificOptions = {
                  nodeRepulsion: (_node: NodeSingular) => 4500,
                  idealEdgeLength: (_edge: EdgeSingular) => 100,
                  gravity: 0.1,
                  numIter: 1000,
                  randomize: true,
                  nodeDimensionsIncludeLabels: true,
                  uniformNodeDimensions: false,
              };
              break;
          case 'dagre':
              currentLayoutName = 'dagre';
              specificOptions = {
                  rankDir: 'TB',
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
              currentLayoutName = 'grid';
              specificOptions = { spacingFactor: 1.2 };
      }
      // Assert final type
      return { name: currentLayoutName, ...baseOptions, ...specificOptions } as LayoutOptions;
  }, [layoutName]);

  // Function to run layout
  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`Running layout: ${graphLayout.name}`);
          cy.stop(true, true);
          cy.layout(graphLayout).run();
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