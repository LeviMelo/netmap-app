import React, { useRef, useMemo, useCallback, useEffect, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, ElementDefinition, LayoutOptions, NodeSingular } from 'cytoscape';
import { useGraphStore } from '../store';

/* id helpers ------------------------------------------------------- */
let nodeCtr = 0, edgeCtr = 0;
const genNodeId = () => `n${Date.now()}_${nodeCtr++}`;
const genEdgeId = () => `e${Date.now()}_${edgeCtr++}`;

interface Props { onCyInit?: (cy: Core) => void; }

const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  /* state slices --------------------------------------------------- */
  const nodes      = useGraphStore((s) => s.nodes);
  const edges      = useGraphStore((s) => s.edges);
  const style      = useGraphStore((s) => s.style);
  const layoutName = useGraphStore((s) => s.layoutName);
  const lp         = useGraphStore((s) => s.layoutParams);
  const mode       = useGraphStore((s) => s.mode);

  const setSelected = useGraphStore((s) => s.setSelectedElementId);
  const addNode     = useGraphStore((s) => s.addNode);
  const addEdge     = useGraphStore((s) => s.addEdge);
  const remove      = useGraphStore((s) => s.removeElement);

  /* refs ----------------------------------------------------------- */
  const cyRef     = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);

  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges]
  );

  /* layout opts ---------------------------------------------------- */
  const layoutOpts = useMemo<LayoutOptions>(() => {
    const base = { padding: 40, animate: true, animationDuration: 500, fit: true, infinite: lp.infinite };
    switch (layoutName) {
      case 'cose':         return { name: 'cose-bilkent', ...base, nodeRepulsion: lp.repulsion, idealEdgeLength: lp.edgeLength, gravity: lp.gravity, numIter: lp.infinite ? 0 : 2500 };
      case 'dagre':        return { name: 'dagre', ...base, rankDir: 'TB', spacingFactor: 1.3 };
      case 'breadthfirst': return { name: 'breadthfirst', ...base, directed: true, spacingFactor: lp.layerSpacing / 40 };
      case 'circle':       return { name: 'circle', ...base, spacingFactor: 1.4 };
      case 'grid':         return { name: 'grid', ...base, spacingFactor: 1.2 };
      case 'preset':       return { name: 'preset', ...base };
      default:             return { name: 'grid', ...base };
    }
  }, [layoutName, lp]);

  /* run layout whenever elements or params change ----------------- */
  const runLayout = useCallback(() => {
    const cy = cyRef.current; if (!cy || cy.elements().empty()) return;
    layoutRef.current?.stop();
    (layoutRef.current = cy.layout(layoutOpts as any)).run();
  }, [layoutOpts]);
  useEffect(runLayout, [elements, runLayout]);

  /* initialise Cytoscape instance --------------------------------- */
  const initCy = useCallback((cy: Core) => {
    cyRef.current = cy; onCyInit?.(cy);

    /* click / double‑click */
    cy.on('tap', 'node,edge', (ev) => {
      const { constructor, del } = mode;
      if (constructor && del) remove(ev.target.id());
      else setSelected(ev.target.id());
    });
    cy.on('tap', (ev) => { if (ev.target === cy) setSelected(null); });
    cy.on('dbltap', (ev) => {
      if (ev.target === cy && mode.constructor) {
        const pos = ev.position;
        const lbl = window.prompt('New node label:', 'Node');
        if (lbl) addNode({ data: { id: genNodeId(), label: lbl }, position: pos } as ElementDefinition);
      }
    });

    /* edgehandles, if extension present --------------------------- */
    if ((cy as any).edgehandles) {
      const eh = (cy as any).edgehandles({
        preview: false,
        handleSize: 10,
        edgeType: () => (mode.constructor && !mode.drag ? 'flat' : null),
        complete: (s: NodeSingular, t: NodeSingular) => {
          /* prevent duplicates */
          if (s.edgesTo(t).length) return;
          const lbl = window.prompt('Edge label:', '');
          addEdge({
            data: { id: genEdgeId(), source: s.id(), target: t.id(), label: lbl || undefined },
          } as ElementDefinition);
          eh.disableDrawMode();
        },
      });
      mode.constructor && !mode.drag ? eh.enableDrawMode() : eh.disableDrawMode();
    }
  }, [mode, addNode, addEdge, remove, setSelected, onCyInit]);

  /* keyboard helpers for drag / delete modifiers ------------------ */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Control') useGraphStore.getState().setDrag(true);
      if (e.key === 'Shift')   useGraphStore.getState().setDelete(true);
    };
    const up   = (e: KeyboardEvent) => {
      if (e.key === 'Control') useGraphStore.getState().setDrag(false);
      if (e.key === 'Shift')   useGraphStore.getState().setDelete(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  /* render --------------------------------------------------------- */
  return (
    <div className="w-full h-full bg-bg-primary">
      <CytoscapeComponent
        elements={elements}
        stylesheet={style}
        cy={initCy}
        layout={{ name: 'preset' }}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
    </div>
  );
});

export default GraphCanvas;
