import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { useGraphStore, NodeData, EdgeData } from '../store'; // Need store types
// Import UI components directly
import TextInput from './ui/TextInput';
import SelectInput, { SelectOption } from './ui/SelectInput'; // Import SelectOption type
// Don't need Panel or Pencil icon here as it's rendered inside a Panel

// Explicitly type the nodeShapes array
const nodeShapes: SelectOption[] = [ // Use SelectOption type
    { value: 'ellipse', label: 'Ellipse' }, { value: 'triangle', label: 'Triangle' },
    { value: 'rectangle', label: 'Rectangle' }, { value: 'roundrectangle', label: 'Round Rectangle' },
    { value: 'diamond', label: 'Diamond' }, { value: 'pentagon', label: 'Pentagon' },
    { value: 'hexagon', label: 'Hexagon' }, { value: 'heptagon', label: 'Heptagon' },
    { value: 'octagon', label: 'Octagon' }, { value: 'star', label: 'Star' },
    { value: 'barrel', label: 'Barrel' }, { value: 'vee', label: 'Vee' },
];

const EditPanel: React.FC = () => {
    // No 't' needed if labels are passed as props or hardcoded below
    // const { t } = useTranslations();
    // Access state correctly
    const selectedElementId = useGraphStore((state) => state.selectedElementId); // Get ID
    const nodes = useGraphStore((state) => state.nodes);
    const edges = useGraphStore((state) => state.edges);
    const updateElementData = useGraphStore((state) => state.updateElementData);

    // Find selected element data using ID
    const selectedElementData = useMemo(() => {
        if (!selectedElementId) return null;
        const node = nodes.find(n => n.data?.id === selectedElementId);
        if (node) return { type: 'node', data: node.data as NodeData };
        const edge = edges.find(e => e.data?.id === selectedElementId);
        if (edge) return { type: 'edge', data: edge.data as EdgeData };
        return null;
    }, [selectedElementId, nodes, edges]);

    // Local state for form inputs
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('');
    const [shape, setShape] = useState('');

    // Effect to update form when selected element changes
    useEffect(() => {
        if (selectedElementData?.data) {
            setLabel(selectedElementData.data.label || '');
            setColor((selectedElementData.data as NodeData | EdgeData).color || '');
            if (selectedElementData.type === 'node') {
                 setShape((selectedElementData.data as NodeData).shape || 'ellipse');
            } else { setShape(''); }
        } else { setLabel(''); setColor(''); setShape(''); }
    }, [selectedElementData]);

    // Input change handler
    const handleInputChange = (field: keyof NodeData | keyof EdgeData, value: string) => {
        if (selectedElementId) {
            if (field === 'label') setLabel(value);
            if (field === 'color') setColor(value);
            if (field === 'shape') setShape(value);
            updateElementData(selectedElementId, { [field]: value });
        }
    };

    // Don't render anything if nothing is selected
    if (!selectedElementId || !selectedElementData) {
        return null;
    }

    const isNode = selectedElementData.type === 'node';

    return (
        // Renders INSIDE the parent Panel in Sidebar
        <div className="border-t border-border pt-4 space-y-3">
             <h4 className="text-sm font-medium text-text-muted mb-3">
                {/* Add translation key if needed, or keep simple */}
                Edit Properties ({selectedElementId.substring(0, 6)}... {isNode ? 'Node' : 'Edge'})
            </h4>
            <TextInput
                id="edit-label" label="Label" value={label}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('label', e.target.value)}
            />
             <TextInput
                id="edit-color" label="Color (Hex/Name)" value={color}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('color', e.target.value)}
                placeholder="#aabbcc or blue"
            />
            {isNode && (
                <SelectInput
                    id="edit-shape" label="Shape" value={shape}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange('shape', e.target.value)}
                    options={nodeShapes} // Use typed array
                />
            )}
        </div>
    );
};

export default EditPanel;