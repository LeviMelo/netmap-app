import React from 'react';
import { useAppStore } from '../../stores/appState';
import { Palette, ChevronRight } from 'lucide-react';

const PRESET_COLORS = [
  '#f97316', // Orange
  '#0ea5e9', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#ef4444', // Red
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#64748b', // Slate
  '#374151', // Gray
];

export const PaintModePanel: React.FC = () => {
  const { 
    selectedColor, 
    propagateToEdges, 
    setSelectedColor, 
    setPropagateToEdges,
    selectedNodes,
    selectedEdges,
    paintNode,
    paintEdge
  } = useAppStore();

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    
    // Apply to selected elements immediately
    selectedNodes.forEach(nodeId => paintNode(nodeId, color));
    selectedEdges.forEach(edgeId => paintEdge(edgeId, color));
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    
    // Apply to selected elements immediately
    selectedNodes.forEach(nodeId => paintNode(nodeId, color));
    selectedEdges.forEach(edgeId => paintEdge(edgeId, color));
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette size={18} className="text-accent-primary" />
        <h3 className="text-h3 font-semibold">Paint Mode</h3>
      </div>

      {/* Current Color */}
      <div className="space-y-2">
        <label className="text-small font-medium text-text-muted">Current Color</label>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="flex-1">
            <input
              type="color"
              value={selectedColor}
              onChange={handleCustomColorChange}
              className="w-full h-10 rounded-lg border border-border cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-3">
        <label className="text-small font-medium text-text-muted">Preset Colors</label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`
                w-12 h-12 rounded-lg border-2 transition-all duration-200
                hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-primary
                ${selectedColor === color 
                  ? 'border-accent-primary shadow-lg ring-2 ring-accent-primary/30' 
                  : 'border-border hover:border-accent-primary/50'
                }
              `}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Propagation Options */}
      <div className="space-y-3">
        <label className="text-small font-medium text-text-muted">Paint Options</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary/50 cursor-pointer">
            <input
              type="checkbox"
              checked={propagateToEdges}
              onChange={(e) => setPropagateToEdges(e.target.checked)}
              className="w-4 h-4 text-accent-primary bg-bg-secondary border-border rounded focus:ring-accent-primary focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-small font-medium">Propagate to Edges</span>
              <p className="text-xs text-text-muted mt-1">
                When painting a node, also color its outgoing edges (except from connector nodes)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
        <h4 className="text-small font-medium text-accent-primary mb-2">How to Paint</h4>
        <div className="space-y-1 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Click any node or edge to apply the selected color</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Select multiple elements first, then pick a color</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Drag across nodes to paint multiple in sequence</span>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <div className="p-3 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20">
          <p className="text-small font-medium text-accent-secondary">
            {selectedNodes.length > 0 && `${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''} selected`}
            {selectedNodes.length > 0 && selectedEdges.length > 0 && ', '}
            {selectedEdges.length > 0 && `${selectedEdges.length} edge${selectedEdges.length > 1 ? 's' : ''} selected`}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Changing color will apply to all selected elements
          </p>
        </div>
      )}
    </div>
  );
}; 