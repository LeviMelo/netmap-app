import React, {
  useRef,
  useMemo,
  useCallback,
  useEffect,
  memo,
} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import {
  Core,
  ElementDefinition,
  LayoutOptions,
  NodeSingular,
} from 'cytoscape';
import { useGraphStore } from '../store';

let newNodeCount = 0;
let newEdgeCount = 0;
const genNodeId = () => `new_n_${Date.now()}_${newNodeCount++}`;
const genEdgeId = () => `new_e_${Date.now()}_${newEdgeCount++}`;

interface Props {
  onCyInit?: (cy: Core) => void;
}

const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  const nodes           = useGraphStore((s) => s.nodes);
  const edges           = useGraphStore((s) => s.edges);
  const style           = useGraphStore((s) => s.style);
  const layoutName      = useGraphStore((s) => s.layoutName);
  const params          = useGraphStore((s) => s.layoutParams);
  const constructorMode = useGraphStore((s) => s.constructorMode);

  const setSelectedId   = useGraphStore((s) => s.setSelectedElementId);
  const addNode         = useGraphStore((s) => s.addNode);
  const addEdge         = useGraphStore((s) => s.addEdge);

  const cyRef     = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);

  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges],
  );

  const graphLayoutOptions = useMemo<LayoutOptions>(() => {
    const base = {
      padding: 40,
      animate: true,
      animationDuration: 500,
      fit: true,
    };
    switch (layoutName) {
      case 'cose':
        return {
          name: 'cose-bilkent',
          ...base,
          nodeRepulsion: params.repulsion,
          idealEdgeLength: params.edgeLength,
          gravity: params.gravity,
          nodeDimensionsIncludeLabels: false,
          nestingFactor: 0.1,
          numIter: 2500,
          randomize: true,
        };
      case 'dagre':
        return { name: 'dagre', ...base, rankDir: 'TB', spacingFactor: 1.3 };
      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          ...base,
          directed: true,
          spacingFactor: params.layerSpacing / 40,
        };
      case 'circle':
        return { name: 'circle', ...base, spacingFactor: 1.4 };
      case 'grid':
        return { name: 'grid', ...base, spacingFactor: 1.2 };
      case 'preset':
        return { name: 'preset', ...base };
      default:
        return { name: 'grid', ...base };
    }
  }, [layoutName, params]);

  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().empty()) return;
    layoutRef.current?.stop();
    const lay = cy.layout(graphLayoutOptions as any);
    layoutRef.current = lay;
    lay.run();
  }, [graphLayoutOptions]);

  useEffect(runLayout, [elements, runLayout]);

  const handleCyInit = useCallback(
    (cy: Core) => {
      cyRef.current = cy;
      onCyInit?.(cy);

      cy.on('tap', 'node, edge', (ev) => setSelectedId(ev.target.id()));
      cy.on('tap', (ev) => {
        if (ev.target === cy) setSelectedId(null);
      });

      cy.on('dbltap', (ev) => {
        if (ev.target === cy) {
          const { x, y } = ev.position;
          const lbl = prompt('Enter label for new node:', 'New Node');
          if (lbl) addNode({ data: { id: genNodeId(), label: lbl }, position: { x, y } });
        }
      });

      if ((cy as any).edgehandles) {
        const eh = (cy as any).edgehandles({
          preview: true,
          handleSize: 10,
          handleColor: 'var(--color-accent-secondary)',
          edgeType: () => (constructorMode ? 'flat' : null),
          loopAllowed: () => false,
          complete: (s: NodeSingular, t: NodeSingular) => {
            const lbl = prompt('Label for new edge (optional):', '');
            addEdge({
              data: {
                id: genEdgeId(),
                source: s.id(),
                target: t.id(),
                label: lbl || undefined,
              },
            } as ElementDefinition);
            eh.disableDrawMode();
          },
        });
        if (constructorMode) eh.enableDrawMode();
        else eh.disableDrawMode();
      }
    },
    [addNode, addEdge, onCyInit, setSelectedId, constructorMode],
  );

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !(cy as any).edgehandles) return;
    const eh = (cy as any).edgehandles();
    if (constructorMode) {
      cy.boxSelectionEnabled(false);
      cy.nodes().ungrabify();
      eh.enableDrawMode();
    } else {
      cy.boxSelectionEnabled(true);
      cy.nodes().grabify();
      eh.disableDrawMode();
    }
  }, [constructorMode]);

  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        cy={handleCyInit}
        layout={{ name: 'preset' }}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3}
      />
    </div>
  );
});

export default GraphCanvas;
