// src/components/EditPanel.tsx
/**
 * Renders input fields for editing the properties (label, color, shape)
 * of the currently selected graph element (node or edge). It fetches the
 * selected element's ID from the interaction store and its data from the
 * data store. It dispatches update actions to the data store.
 */
import React, { useState, useEffect, useMemo } from 'react';

// Import stores
import { useGraphDataStore, NodeData, EdgeData } from '../stores/graphDataStore';
import { useGraphInteractionStore } from '../stores/graphInteractionStore';

// Import UI components
import TextInput from './ui/TextInput';
import SelectInput, { SelectOption } from './ui/SelectInput';
import { SlidersHorizontal } from 'lucide-react'; // Icon

// Node shape options (could be moved to constants)
const nodeShapes: SelectOption[] = [
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'roundrectangle', label: 'Round Rectangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'pentagon', label: 'Pentagon' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'heptagon', label: 'Heptagon' },
  { value: 'octagon', label: 'Octagon' },
  { value: 'star', label: 'Star' },
  { value: 'barrel', label: 'Barrel' },
  { value: 'vee', label: 'Vee' },
  // Add other cytoscape shapes as needed
];

// Temporary placeholder for translation function
// Replace with actual import: import { useTranslations } from '../hooks/useTranslations';
const t = (key: string, params?: Record<string, string>) => {
    let str = key.split('.').pop() || key;
    if (params) {
        Object.keys(params).forEach(pKey => {
            str = str.replace(`{${pKey}}`, params[pKey]);
        });
    }
    return str;
};


const EditPanel: React.FC = () => {
  // Get state and actions from stores
  const selectedId = useGraphInteractionStore((s) => s.selectedElementId);
  const nodes = useGraphDataStore((s) => s.nodes);
  const edges = useGraphDataStore((s) => s.edges);
  const updateNodeDataAction = useGraphDataStore((s) => s.updateNodeData);
  const updateEdgeDataAction = useGraphDataStore((s) => s.updateEdgeData);

  // Memoize finding the selected element's data and type
  const selectedElement = useMemo(() => {
    if (!selectedId) return null;

    const node = nodes.find((n) => n.data?.id === selectedId);
    if (node) return { type: 'node', data: node.data as NodeData }; // Cast assumes NodeData structure

    const edge = edges.find((e) => e.data?.id === selectedId);
    if (edge) return { type: 'edge', data: edge.data as EdgeData }; // Cast assumes EdgeData structure

    return null; // Should not happen if selectedId is valid
  }, [selectedId, nodes, edges]);

  // Local state for input fields, synced with selected element data
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(''); // For node background or edge line
  const [shape, setShape] = useState(''); // Only for nodes

  // Effect to update local state when the selected element changes
  useEffect(() => {
    if (selectedElement) {
      // Use empty string as fallback if properties are undefined
      setLabel(selectedElement.data.label || '');

      if (selectedElement.type === 'node') {
         setColor((selectedElement.data as NodeData).color || '');
         setShape((selectedElement.data as NodeData).shape || 'ellipse'); // Default to ellipse if no shape defined
      } else { // Edge
         // Edges use 'edgeColor' in our data structure
         setColor((selectedElement.data as EdgeData).edgeColor || '');
         setShape(''); // Shape is not applicable to edges
      }
    } else {
      // Reset fields if nothing is selected
      setLabel('');
      setColor('');
      setShape('');
    }
  }, [selectedElement]); // Re-run only when selectedElement changes

  // Handler to update store when an input changes
  // Debouncing could be added here for performance if needed
  const handleDataChange = (field: keyof NodeData | keyof EdgeData, value: string) => {
      if (!selectedId || !selectedElement) return;

      const updatedData = { [field]: value || undefined }; // Set to undefined if value is empty string

      if (selectedElement.type === 'node') {
        updateNodeDataAction(selectedId, updatedData as Partial<NodeData>);
      } else {
        updateEdgeDataAction(selectedId, updatedData as Partial<EdgeData>);
      }
  };

  // Render nothing if no element is selected
  if (!selectedElement) {
    return null; // Or return the placeholder message from Sidebar
  }

  return (
    // Added border and spacing consistent with Add Edge section
    <div className="border-t border-border pt-3 mt-3 space-y-3">
       <h4 className="text-sm font-medium text-text-muted flex items-center gap-1.5 mb-1">
           <SlidersHorizontal size={14}/>
           {t('editPropertiesTitle')}
           <span className="font-mono text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">
                ({selectedElement.type}: {selectedId.slice(0, 6)}...)
           </span>
       </h4>
      {/* Label Input (Common to Nodes and Edges) */}
      <TextInput
        id="edit-label"
        label={t('editLabelLabel')}
        value={label}
        onChange={(e) => {
          setLabel(e.target.value); // Update local state immediately
          handleDataChange('label', e.target.value); // Update store
        }}
      />

      {/* Color Input (Node 'color', Edge 'edgeColor') */}
      <TextInput
        id="edit-color"
        label={t('editColorLabel')}
        value={color}
        placeholder="#RRGGBB or name"
        onChange={(e) => {
            const newColor = e.target.value;
            setColor(newColor); // Update local state
            if (selectedElement.type === 'node') {
               handleDataChange('color', newColor);
            } else {
                // Update 'edgeColor' for edges. The store will handle darken() if needed on add/load.
               handleDataChange('edgeColor', newColor);
            }
        }}
      />

      {/* Shape Select (Only for Nodes) */}
      {selectedElement.type === 'node' && (
        <SelectInput
          id="edit-shape"
          label={t('editShapeLabel')}
          options={nodeShapes}
          value={shape}
          onChange={(e) => {
            setShape(e.target.value); // Update local state
            handleDataChange('shape', e.target.value); // Update store
          }}
        />
      )}

       {/* Add other editable properties here */}
       {/* e.g., Edge Width, Node Size (if not automatic) */}

    </div>
  );
};

export default EditPanel;