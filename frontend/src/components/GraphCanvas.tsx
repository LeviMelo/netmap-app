// src/components/GraphCanvas.tsx
/**
 * Renders the main Cytoscape graph canvas using react-cytoscapejs.
 * Fetches graph data, settings, and interaction state from stores.
 * Initializes Cytoscape, sets up event listeners (including triggering
 * a modal for label editing in manual mode), runs layouts, and applies styles.
 * ---
 * ✅ Manual Mode & Label Editing Notes:
 *  - Tapping a node in 'manual' mode now opens the EditLabelModal.
 *  - Double-tapping background in 'manual' mode adds a node (currently uses prompt, TODO: use modal).
 *  - Edge creation uses `edgehandles` extension, enabled only in 'manual' mode.
 *  - Shift/Ctrl keys modify the 'manual' sub-mode (delete/drag).
 * ---
 */
import React, { useRef, useMemo, useCallback, useEffect, memo, useState } from 'react'; // Added useState
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core, LayoutOptions, NodeSingular } from 'cytoscape';

// Import stores
import { useGraphDataStore, NodeData } from '../stores/graphDataStore'; // Added NodeData
import { useGraphSettingsStore } from '../stores/graphSettingsStore';
import { useGraphInteractionStore } from '../stores/graphInteractionStore';

// Import style builder and CSS var getter
import { buildCytoscapeStyles, getCssVar } from '../utils/cytoscapeStyles';

// Import UI Components
import Modal from './ui/Modal'; // Import the Modal component
import TextInput from './ui/TextInput'; // Needed for modal content
import Button from './ui/Button'; // Needed for modal content

// ID Generators
let nodeCtr = 0;
let edgeCtr = 0;
const genNodeId = () => `n${Date.now()}_${nodeCtr++}`;
const genEdgeId = () => `e${Date.now()}_${edgeCtr++}`;

interface Props { onCyInit?: (cy: Core) => void; }

// --- Label Edit Modal Content ---
interface EditLabelModalProps {
  initialLabel: string;
  onSave: (newLabel: string) => void;
  onClose: () => void;
}
const EditLabelModalContent: React.FC<EditLabelModalProps> = ({ initialLabel, onSave, onClose }) => {
    const [label, setLabel] = useState(initialLabel);

    const handleSave = () => {
        onSave(label);
        onClose();
    };

    return (
        <div className="space-y-4">
            <TextInput
                id="modal-edit-label"
                label="New Node Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                autoFocus // Focus input when modal opens
            />
            <div className="flex justify-end gap-2">
                 <Button variant="secondary" onClick={onClose}>Cancel</Button>
                 <Button variant="primary" onClick={handleSave}>Save Label</Button>
            </div>
        </div>
    );
};
// --- End Label Edit Modal Content ---


const GraphCanvas: React.FC<Props> = memo(({ onCyInit }) => {
  /* State slices from stores */
  const nodes = useGraphDataStore((s) => s.nodes);
  const edges = useGraphDataStore((s) => s.edges);
  const addNodeAction = useGraphDataStore((s) => s.addNode);
  const addEdgeAction = useGraphDataStore((s) => s.addEdge);
  const removeElementAction = useGraphDataStore((s) => s.removeElement);
  const updateNodeDataAction = useGraphDataStore((s) => s.updateNodeData); // Action to update node data

  const layoutName = useGraphSettingsStore((s) => s.layoutName);
  const layoutParams = useGraphSettingsStore((s) => s.layoutParams);
  const styleParams = useGraphSettingsStore((s) => s.styleParams);

  const mode = useGraphInteractionStore((s) => s.mode);
  const setMode = useGraphInteractionStore((s) => s.setMode);
  const setSelectedElementId = useGraphInteractionStore((s) => s.setSelectedElementId);

  /* Refs */
  const cyRef = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const edgeHandlesRef = useRef<any>(null);

  /* Local State for Modal */
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [editingNodeInfo, setEditingNodeInfo] = useState<{ id: string; label: string } | null>(null);


  /* Derived Data (Elements, Stylesheet) */
  const elements = useMemo(() => CytoscapeComponent.normalizeElements({ nodes, edges }), [nodes, edges]);
  const stylesheet = useMemo(() => buildCytoscapeStyles(styleParams), [styleParams]);

  /* Layout Options & Execution */
  const layoutOpts = useMemo<LayoutOptions>(() => {
    // ... (layout options logic remains the same)
    const base = { padding: 40, animate: true, animationDuration: 500, fit: true, infinite: layoutParams.infinite };
    switch (layoutName) {
      case 'cose': return { name: 'cose-bilkent', ...base, nodeRepulsion: layoutParams.repulsion, idealEdgeLength: layoutParams.edgeLength, gravity: layoutParams.gravity, numIter: layoutParams.infinite ? 10000 : 2500 };
      case 'dagre': return { name: 'dagre', ...base, rankDir: 'TB', spacingFactor: 1.3 };
      case 'breadthfirst': return { name: 'breadthfirst', ...base, directed: true, spacingFactor: layoutParams.layerSpacing / 40 };
      case 'circle': return { name: 'circle', ...base, spacingFactor: 1.4 };
      case 'grid': return { name: 'grid', ...base, spacingFactor: 1.2 };
      case 'preset': return { name: 'preset', ...base };
      default: console.warn(`Unknown layout name: ${layoutName}, defaulting to grid.`); return { name: 'grid', ...base };
    }
  }, [layoutName, layoutParams]);

  const runLayout = useCallback(() => {
    // ... (runLayout logic remains the same)
    const cy = cyRef.current;
    if (!cy || cy.elements().empty() || layoutName === 'preset') { layoutRef.current?.stop(); return; };
    layoutRef.current?.stop();
    layoutRef.current = cy.layout(layoutOpts as any);
    layoutRef.current.run();
  }, [layoutOpts, layoutName]);

  useEffect(runLayout, [elements, runLayout]);


  /* Cytoscape Initialization and Event Handling */
  const initCy = useCallback((cy: Core) => {
    cyRef.current = cy;
    onCyInit?.(cy);

    // --- Event Listeners ---
    cy.on('tap', 'node', (ev) => { // Specific listener for nodes
      const node = ev.target as NodeSingular;
      const nodeId = node.id();
      const nodeData = node.data() as NodeData; // Assume NodeData structure

      if (mode === 'manual-delete') {
        removeElementAction(nodeId);
        setSelectedElementId(null);
      } else if (mode === 'manual') {
        // Open the label editing modal
        setEditingNodeInfo({ id: nodeId, label: nodeData.label || '' });
        setIsLabelModalOpen(true);
        setSelectedElementId(nodeId); // Also select the node being edited
      } else { // 'view' or 'manual-drag' mode
        setSelectedElementId(nodeId);
      }
    });

    cy.on('tap', 'edge', (ev) => { // Specific listener for edges
      const edgeId = ev.target.id();
      if (mode === 'manual-delete') {
        removeElementAction(edgeId);
        setSelectedElementId(null);
      } else {
        setSelectedElementId(edgeId); // Select edge in view/manual/manual-drag
      }
    });

    cy.on('tap', (ev) => {
      if (ev.target === cy && mode !== 'manual-delete') {
        setSelectedElementId(null);
      }
    });

    cy.on('dbltap', (ev) => {
      if (ev.target === cy && mode === 'manual') {
        const pos = ev.position;
        // TODO: Replace prompt with a proper modal for adding nodes too
        const label = window.prompt('(TODO: Use Modal) New node label:', 'Node');
        if (label) {
          addNodeAction({ data: { id: genNodeId(), label: label }, position: pos });
        }
      }
    });

     /* Edge Handles Initialization */
     if ((cy as any).edgehandles) {
      edgeHandlesRef.current = (cy as any).edgehandles({
        preview: false, handleSize: 10, handleColor: getCssVar('--color-accent-primary'), handleNodes: 'node',
        edgeType: () => mode === 'manual' ? 'flat' : null,
        loopAllowed: () => mode === 'manual',
        complete: (sourceNode: NodeSingular, targetNode: NodeSingular, _addedEles: any) => {
          // Prevent duplicate edges (simple check, could be more robust)
          if (sourceNode.edgesTo(targetNode).length > 0 || targetNode.edgesTo(sourceNode).length > 0) {
            // FIX: Provide actual arguments to console.warn
            console.warn("Edge already exists between", sourceNode.id(), "and", targetNode.id());
            return;
          }
          // TODO: Replace prompt with modal for edge label
          const label = window.prompt('(TODO: Use Modal) Edge label (optional):', '');
          addEdgeAction({ data: { id: genEdgeId(), source: sourceNode.id(), target: targetNode.id(), label: label || undefined }});
          // Important: Keep edge handles enabled after completion if still in manual mode
          if (mode === 'manual' && edgeHandlesRef.current) { edgeHandlesRef.current.enableDrawMode(); }
        },
        cancel: () => { if (mode !== 'manual' && edgeHandlesRef.current) { edgeHandlesRef.current.disableDrawMode(); } }
      });
     } else { console.warn("Cytoscape edgehandles extension not found or registered."); }

    return () => { cy.removeAllListeners(); edgeHandlesRef.current?.destroy(); };
  }, [mode, addNodeAction, addEdgeAction, removeElementAction, updateNodeDataAction, setSelectedElementId, onCyInit]); // Added updateNodeDataAction

  // Effect to enable/disable edge handles based on mode
  useEffect(() => {
    // ... (edge handles enable/disable logic remains the same)
    if (!edgeHandlesRef.current) return;
    if (mode === 'manual') { edgeHandlesRef.current.enableDrawMode(); }
    else { edgeHandlesRef.current.disableDrawMode(); }
  }, [mode]);

  /* Keyboard Listeners for Mode Modifiers */
  useEffect(() => {
    // ... (keydown/keyup logic remains the same)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const currentMode = useGraphInteractionStore.getState().mode;
      if (e.key === 'Shift' && currentMode === 'manual') { setMode('manual-delete'); }
      else if (e.key === 'Control' && currentMode === 'manual') { setMode('manual-drag'); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const currentMode = useGraphInteractionStore.getState().mode;
      if (e.key === 'Shift' && currentMode === 'manual-delete') { setMode('manual'); }
      else if (e.key === 'Control' && currentMode === 'manual-drag') { setMode('manual'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [setMode]);

  // --- Modal Action Handlers ---
  const handleSaveLabel = (newLabel: string) => {
      if (editingNodeInfo) {
          updateNodeDataAction(editingNodeInfo.id, { label: newLabel });
      }
      // Modal close is handled within EditLabelModalContent calls
  };

  const handleCloseModal = () => {
    setIsLabelModalOpen(false);
    setEditingNodeInfo(null);
  }


  /* Render */
  return (
    <div className="w-full h-full bg-bg-primary">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        cy={initCy}
        layout={{ name: 'preset' }}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.1}
        maxZoom={3.0}
      />
      {/* Mode Indicator */}
       <div className="absolute bottom-4 right-4 bg-bg-secondary text-text-muted px-2 py-1 rounded text-xs opacity-80 select-none">
           Mode: {mode}
       </div>

       {/* Label Editing Modal */}
       <Modal
            isOpen={isLabelModalOpen}
            onClose={handleCloseModal}
            title={`Edit Label for Node (${editingNodeInfo?.id.slice(0,6)}...)`}
        >
           {editingNodeInfo && ( // Only render content if we have node info
               <EditLabelModalContent
                   initialLabel={editingNodeInfo.label}
                   onSave={handleSaveLabel}
                   onClose={handleCloseModal}
               />
           )}
        </Modal>
    </div>
  );
});

export default GraphCanvas;