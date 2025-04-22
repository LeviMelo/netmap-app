// src/components/GraphCanvas.tsx
/**
 * Renders the main Cytoscape graph canvas using react-cytoscapejs.
 * It fetches graph data (nodes, edges), settings (layout, style params),
 * and interaction state from their respective Zustand stores.
 * It initializes Cytoscape, sets up event listeners for user interactions
 * (selection, node/edge creation/deletion based on mode), runs layouts,
 * and applies base styles generated from settings.
 */
import React, { useRef, useMemo, useCallback, useEffect, memo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, ElementDefinition, LayoutOptions, NodeSingular } from 'cytoscape';

// Import stores
import { useGraphDataStore } from '../stores/graphDataStore';
import { useGraphSettingsStore } from '../stores/graphSettingsStore';
import { useGraphInteractionStore, InteractionMode } from '../stores/graphInteractionStore';

// Import style builder and CSS var getter
import { buildCytoscapeStyles, getCssVar } from '../utils/cytoscapeStyles';

// ID Generators (consider moving to a util if used elsewhere)
let nodeCtr = 0;
let edgeCtr = 0;
const genNodeId = () => `n${Date.now()}_${nodeCtr++}`;
const genEdgeId = () => `e${Date.now()}_${edgeCtr++}`;

interface Props { onCyInit?: (cy: Core) => void; }

const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  /* State slices from stores */
  const nodes = useGraphDataStore((s) => s.nodes);
  const edges = useGraphDataStore((s) => s.edges);
  const addNodeAction = useGraphDataStore((s) => s.addNode);
  const addEdgeAction = useGraphDataStore((s) => s.addEdge);
  const removeElementAction = useGraphDataStore((s) => s.removeElement);

  const layoutName = useGraphSettingsStore((s) => s.layoutName);
  const layoutParams = useGraphSettingsStore((s) => s.layoutParams);
  const styleParams = useGraphSettingsStore((s) => s.styleParams);

  const mode = useGraphInteractionStore((s) => s.mode);
  const setMode = useGraphInteractionStore((s) => s.setMode);
  const setSelectedElementId = useGraphInteractionStore((s) => s.setSelectedElementId);

  /* Refs */
  const cyRef = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const edgeHandlesRef = useRef<any>(null); // Ref to store edge handles instance

  /* Derived Data */
  // Memoize elements array for CytoscapeComponent prop
  const elements = useMemo(
    () => CytoscapeComponent.normalizeElements({ nodes, edges }),
    [nodes, edges]
  );

  // Memoize stylesheet based on styleParams
  const stylesheet = useMemo(() => buildCytoscapeStyles(styleParams), [styleParams]);

  /* Layout Options */
  const layoutOpts = useMemo<LayoutOptions>(() => {
    const base = { padding: 40, animate: true, animationDuration: 500, fit: true, infinite: layoutParams.infinite };
    switch (layoutName) {
      case 'cose':
        return { name: 'cose-bilkent', ...base, nodeRepulsion: layoutParams.repulsion, idealEdgeLength: layoutParams.edgeLength, gravity: layoutParams.gravity, numIter: layoutParams.infinite ? 10000 : 2500 };
      case 'dagre':
        return { name: 'dagre', ...base, rankDir: 'TB', spacingFactor: 1.3 };
      case 'breadthfirst':
        return { name: 'breadthfirst', ...base, directed: true, spacingFactor: layoutParams.layerSpacing / 40 };
      case 'circle':
        return { name: 'circle', ...base, spacingFactor: 1.4 };
      case 'grid':
        return { name: 'grid', ...base, spacingFactor: 1.2 };
      case 'preset':
        return { name: 'preset', ...base };
      default:
        console.warn(`Unknown layout name: ${layoutName}, defaulting to grid.`);
        return { name: 'grid', ...base };
    }
  }, [layoutName, layoutParams]);

  /* Layout Execution */
  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().empty() || layoutName === 'preset') {
        layoutRef.current?.stop(); // Stop if switching to preset
        return;
    };
    // Stop previous layout before starting a new one
    layoutRef.current?.stop();
    layoutRef.current = cy.layout(layoutOpts as any); // Cast needed because layout options are dynamic
    layoutRef.current.run();
  }, [layoutOpts, layoutName]); // Re-run layout when options or name change

  // Trigger layout run when elements change or layout options change
  useEffect(runLayout, [elements, runLayout]); // `runLayout` includes layoutOpts dependency

  /* Cytoscape Initialization and Event Handling */
  const initCy = useCallback((cy: Core) => {
    cyRef.current = cy;
    onCyInit?.(cy); // Pass instance up if needed (e.g., for Metrics/Share sidebars)

    // --- Event Listeners ---
    cy.on('tap', 'node, edge', (ev) => {
      const elementId = ev.target.id();
      // Handle delete in manual-delete mode
      if (mode === 'manual-delete') {
        removeElementAction(elementId);
        setSelectedElementId(null); // Clear selection after delete
      } else {
        // Otherwise, just select the element
        setSelectedElementId(elementId);
      }
    });

    cy.on('tap', (ev) => {
      // Clear selection if background is tapped (unless in delete mode)
      if (ev.target === cy && mode !== 'manual-delete') {
        setSelectedElementId(null);
      }
    });

    cy.on('dbltap', (ev) => {
      // Add node on background double-tap only in manual mode
      if (ev.target === cy && mode === 'manual') {
        const pos = ev.position;
        // Use the dedicated modal later, for now window.prompt is placeholder
        const label = window.prompt('New node label:', 'Node');
        if (label) {
          addNodeAction({ data: { id: genNodeId(), label: label }, position: pos });
        }
      }
    });

    /* Edge Handles Initialization */
    if ((cy as any).edgehandles) {
      edgeHandlesRef.current = (cy as any).edgehandles({
        preview: false, // No ghost edge preview
        handleSize: 10,
        handleColor: getCssVar('--color-accent-primary'), // Use theme color for handle
        handleNodes: 'node', // Attach handles to nodes
        edgeType: (_sourceNode: NodeSingular, _targetNode: NodeSingular) => {
          // Only allow edge creation in 'manual' mode (not 'manual-drag' or 'manual-delete')
          return mode === 'manual' ? 'flat' : null; // Returning null cancels edge creation
        },
        loopAllowed: () => mode === 'manual', // Allow loops only in manual mode
        complete: (sourceNode: NodeSingular, targetNode: NodeSingular, _addedEles: any) => {
          // Prevent duplicate edges (simple check, could be more robust)
          if (sourceNode.edgesTo(targetNode).length > 0 || targetNode.edgesTo(sourceNode).length > 0) {
            console.warn("Edge already exists between", sourceNode.id(), "and", targetNode.id());
            return;
          }
          // Use dedicated modal later
          const label = window.prompt('Edge label (optional):', '');
          addEdgeAction({
            data: {
              id: genEdgeId(),
              source: sourceNode.id(),
              target: targetNode.id(),
              label: label || undefined, // Use label if provided
            },
          });
          // Important: Keep edge handles enabled after completion if still in manual mode
          if (mode === 'manual' && edgeHandlesRef.current) {
             edgeHandlesRef.current.enableDrawMode();
          }
        },
         // Stop edge drawing if mode changes away from 'manual'
        cancel: () => {
             if (mode !== 'manual' && edgeHandlesRef.current) {
                edgeHandlesRef.current.disableDrawMode();
             }
        }
      });
    } else {
      console.warn("Cytoscape edgehandles extension not found or registered.");
    }

    // Clean up listeners when component unmounts or cy changes
    return () => {
        cy.removeAllListeners();
        edgeHandlesRef.current?.destroy(); // Destroy edgehandles instance
    };
  }, [mode, addNodeAction, addEdgeAction, removeElementAction, setSelectedElementId, onCyInit]); // Dependencies for initCy

  // Effect to enable/disable edge handles based on mode
  useEffect(() => {
    if (!edgeHandlesRef.current) return;
    if (mode === 'manual') {
      edgeHandlesRef.current.enableDrawMode();
    } else {
      edgeHandlesRef.current.disableDrawMode();
    }
  }, [mode]); // Run only when mode changes

  /* Keyboard Listeners for Mode Modifiers */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore repeated keydown events

      const currentMode = useGraphInteractionStore.getState().mode;

      if (e.key === 'Shift' && currentMode === 'manual') {
        setMode('manual-delete');
      } else if (e.key === 'Control' && currentMode === 'manual') {
        setMode('manual-drag');
      }
      // Add other keybindings if needed
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const currentMode = useGraphInteractionStore.getState().mode;

      if (e.key === 'Shift' && currentMode === 'manual-delete') {
        setMode('manual'); // Revert to base manual mode
      } else if (e.key === 'Control' && currentMode === 'manual-drag') {
        setMode('manual'); // Revert to base manual mode
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setMode]); // Dependency on setMode action

  /* Render */
  return (
    <div className="w-full h-full bg-bg-primary">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet} // Use the memoized stylesheet
        cy={initCy} // Pass the init function
        layout={{ name: 'preset' }} // Start with preset, runLayout effect handles dynamic layouts
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
        // Pass other CytoscapeComponent props as needed
      />
      {/* Mode Indicator (Optional UI Feedback) */}
       <div className="absolute bottom-4 right-4 bg-bg-secondary text-text-muted px-2 py-1 rounded text-xs opacity-80 select-none">
           Mode: {mode}
       </div>
    </div>
  );
});

export default GraphCanvas;