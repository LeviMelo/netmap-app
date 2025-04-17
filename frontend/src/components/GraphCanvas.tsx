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

// --- Register layout extensions ---
let layoutsRegistered = false;
if (typeof window !== 'undefined' && !layoutsRegistered) {
    try {
        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        layoutsRegistered = true;
        console.log("Cytoscape layouts registered via import.");
    } catch (e) { console.warn("Could not register layout extension(s):", e); }
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
  const elements = useMemo(() => { return CytoscapeComponent.normalizeElements({ nodes, edges }); }, [nodes, edges]);

  const graphLayout = useMemo((): LayoutOptions => {
      const baseOptions = { padding: 30, animate: true, animationDuration: 500, fit: true, };
      let specificOptions: any = {}; let currentLayoutName = layoutName;
      switch(layoutName) {
          case 'cose': currentLayoutName = 'cose-bilkent'; specificOptions = { nodeRepulsion: (_node: NodeSingular) => 4500, idealEdgeLength: (_edge: EdgeSingular) => 100, gravity: 0.1, numIter: 1000, randomize: true, nodeDimensionsIncludeLabels: true, uniformNodeDimensions: false, }; break;
          case 'dagre': currentLayoutName = 'dagre'; specificOptions = { rankDir: 'TB', spacingFactor: 1.2, nodeDimensionsIncludeLabels: true, }; break;
          case 'grid': currentLayoutName = 'grid'; specificOptions = { spacingFactor: 1.2 }; break;
          case 'circle': currentLayoutName = 'circle'; specificOptions = { spacingFactor: 1.2 }; break;
          case 'breadthfirst': currentLayoutName = 'breadthfirst'; specificOptions = { spacingFactor: 1.2, directed: true }; break;
          default: currentLayoutName = 'grid'; specificOptions = { spacingFactor: 1.2 };
      }
      return { name: currentLayoutName, ...baseOptions, ...specificOptions } as LayoutOptions;
  }, [layoutName]);

  const runLayout = useCallback(() => {
      const cy = cyRef.current;
      if (cy) {
          console.log(`Running layout: ${graphLayout.name} with options:`, graphLayout);
          cy.stop(true, true);
          try { cy.layout(graphLayout).run(); } catch (error) { console.error(`Error running layout ${graphLayout.name}:`, error); alert(`Layout Error: Failed to apply '${graphLayout.name}' layout. Check console.`); }
      }
  }, [graphLayout]);

  useEffect(() => { if (cyRef.current && stylesResolved) { runLayout(); } }, [elements, runLayout, stylesResolved]);

  const handleCyInit = useCallback((cyInstance: Core) => {
    console.log("Registering Cytoscape instance...");
    cyRef.current = cyInstance;
    cyInstance.ready(() => {
         console.log("Cytoscape core ready. Applying events.");
         cyInstance.center();
         cyInstance.removeAllListeners();
         cyInstance.on('tap', (event) => { if (event.target === cyInstance) setSelectedElement(null); });
         cyInstance.on('tap', 'node', (event) => setSelectedElement(event.target.id()));
         cyInstance.on('tap', 'edge', (event) => setSelectedElement(event.target.id()));
    });
  }, [setSelectedElement]);

  if (!stylesResolved) { return ( <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-muted"> <p>{t('loadingStyles')}</p> </div> ); }

  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        layout={{ name: 'preset' }}
        cy={handleCyInit}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;