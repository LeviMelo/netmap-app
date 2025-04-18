import React, { useState, useEffect } from 'react';
import { useGraphStore, NodeData, EdgeData } from '../store';
import TextInput from './ui/TextInput';
import SelectInput, { SelectOption } from './ui/SelectInput';

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
];

const EditPanel: React.FC = () => {
  const selectedId = useGraphStore((s) => s.selectedElementId);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const update = useGraphStore((s) => s.updateElementData);

  const selected = React.useMemo(() => {
    if (!selectedId) return null;
    const n = nodes.find((x) => x.data?.id === selectedId);
    if (n) return { type: 'node', data: n.data as NodeData };
    const e = edges.find((x) => x.data?.id === selectedId);
    if (e) return { type: 'edge', data: e.data as EdgeData };
    return null;
  }, [selectedId, nodes, edges]);

  const [label, setLabel] = useState('');
  const [color, setColor] = useState('');
  const [shape, setShape] = useState('');

  useEffect(() => {
    if (selected) {
      setLabel(selected.data.label || '');
      setColor(
        (selected.data as NodeData & EdgeData).color ||
          (selected.data as NodeData & EdgeData).edgeColor ||
          ''
      );
      if (selected.type === 'node') {
        setShape((selected.data as NodeData).shape || 'ellipse');
      } else {
        setShape('');
      }
    } else {
      setLabel('');
      setColor('');
      setShape('');
    }
  }, [selected]);

  if (!selected) return null;

  const onChange = (field: string, val: string) => {
    update(selectedId!, { [field]: val });
  };

  return (
    <div className="border-t border-border pt-4 space-y-3">
      <TextInput
        id="edit-label"
        label="Label"
        value={label}
        onChange={(e) => {
          setLabel(e.target.value);
          onChange('label', e.target.value);
        }}
      />
      <TextInput
        id="edit-color"
        label="Color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          onChange('color', e.target.value);
        }}
      />
      {selected.type === 'node' && (
        <SelectInput
          id="edit-shape"
          label="Shape"
          options={nodeShapes}
          value={shape}
          onChange={(e) => {
            setShape(e.target.value);
            onChange('shape', e.target.value);
          }}
        />
      )}
    </div>
  );
};

export default EditPanel;
