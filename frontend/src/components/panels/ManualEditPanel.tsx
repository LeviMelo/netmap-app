import React, { useState } from 'react';
import { useAppStore } from '../../stores/appState';
import { Plus, Edit3, Trash2, Lock, Unlock, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const ManualEditPanel: React.FC = () => {
  const { 
    addNode, 
    deleteNode, 
    deleteEdge, 
    selectedNodes, 
    selectedEdges, 
    getNodeById,
    getEdgeById,
    updateNode,
    updateEdge,
    lockNode,
    unlockNode,
    clearSelection
  } = useAppStore();

  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeColor, setNewNodeColor] = useState('#0ea5e9');
  
  const selectedNode = selectedNodes.length === 1 ? getNodeById(selectedNodes[0]) : null;
  const selectedEdge = selectedEdges.length === 1 ? getEdgeById(selectedEdges[0]) : null;

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    
    addNode({
      label: newNodeLabel,
      color: newNodeColor,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }
    });
    
    setNewNodeLabel('');
    setIsAddingNode(false);
  };

  const handleDeleteSelected = () => {
    if (selectedNodes.length > 0) {
      const confirmMessage = `Delete ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}? This will also remove connected edges.`;
      if (confirm(confirmMessage)) {
        selectedNodes.forEach(nodeId => deleteNode(nodeId));
        clearSelection();
      }
    }
    
    if (selectedEdges.length > 0) {
      const confirmMessage = `Delete ${selectedEdges.length} edge${selectedEdges.length > 1 ? 's' : ''}?`;
      if (confirm(confirmMessage)) {
        selectedEdges.forEach(edgeId => deleteEdge(edgeId));
        clearSelection();
      }
    }
  };

  const handleToggleNodeLock = () => {
    if (!selectedNode) return;
    
    if (selectedNode.locked) {
      unlockNode(selectedNode.id);
    } else {
      lockNode(selectedNode.id);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Edit3 size={18} className="text-accent-primary" />
        <h3 className="text-h3 font-semibold">Manual Edit</h3>
      </div>

      {/* Add Node Section */}
      <div className="space-y-3">
        <h4 className="text-small font-medium text-text-muted">Add New Node</h4>
        
        {!isAddingNode ? (
          <Button
            onClick={() => setIsAddingNode(true)}
            icon={Plus}
            variant="secondary"
            className="w-full"
          >
            Add Node
          </Button>
        ) : (
          <div className="space-y-3 p-3 rounded-lg bg-bg-secondary/50 border border-border">
            <Input
              label="Node Label"
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              placeholder="Enter node label..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
            />
            
            <div className="space-y-2">
              <label className="text-small font-medium text-text-muted">Color</label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border"
                  style={{ backgroundColor: newNodeColor }}
                />
                <input
                  type="color"
                  value={newNodeColor}
                  onChange={(e) => setNewNodeColor(e.target.value)}
                  className="flex-1 h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAddNode}
                disabled={!newNodeLabel.trim()}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Create
              </Button>
              <Button
                onClick={() => {
                  setIsAddingNode(false);
                  setNewNodeLabel('');
                }}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Selection Actions */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-small font-medium text-text-muted">Selection Actions</h4>
          
          <div className="space-y-2">
            {selectedNodes.length > 0 && (
              <div className="p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
                <p className="text-small font-medium text-accent-primary">
                  {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
                </p>
                {selectedNode && (
                  <p className="text-xs text-text-muted mt-1">
                    "{selectedNode.label}" {selectedNode.locked ? '(locked)' : ''}
                  </p>
                )}
              </div>
            )}
            
            {selectedEdges.length > 0 && (
              <div className="p-3 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20">
                <p className="text-small font-medium text-accent-secondary">
                  {selectedEdges.length} edge{selectedEdges.length > 1 ? 's' : ''} selected
                </p>
                {selectedEdge && (
                  <p className="text-xs text-text-muted mt-1">
                    {selectedEdge.label || 'No label'}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              {selectedNode && (
                <Button
                  onClick={handleToggleNodeLock}
                  icon={selectedNode.locked ? Unlock : Lock}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  {selectedNode.locked ? 'Unlock' : 'Lock'}
                </Button>
              )}
              
              <Button
                onClick={handleDeleteSelected}
                icon={Trash2}
                variant="ghost"
                size="sm"
                className="flex-1 text-danger hover:bg-danger/10"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Selected Node */}
      {selectedNode && (
        <div className="space-y-3">
          <h4 className="text-small font-medium text-text-muted">Edit Node</h4>
          
          <div className="space-y-3 p-3 rounded-lg bg-bg-secondary/50 border border-border">
            <Input
              label="Label"
              value={selectedNode.label}
              onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            />
            
            <div className="space-y-2">
              <label className="text-small font-medium text-text-muted">Color</label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border"
                  style={{ backgroundColor: selectedNode.color || '#0ea5e9' }}
                />
                <input
                  type="color"
                  value={selectedNode.color || '#0ea5e9'}
                  onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
                  className="flex-1 h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-small font-medium text-text-muted">Shape</label>
              <select
                value={selectedNode.shape || 'ellipse'}
                onChange={(e) => updateNode(selectedNode.id, { shape: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-border bg-bg-secondary text-text-base"
              >
                <option value="ellipse">Ellipse</option>
                <option value="rectangle">Rectangle</option>
                <option value="diamond">Diamond</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNode.isConnectorNode || false}
                onChange={(e) => updateNode(selectedNode.id, { isConnectorNode: e.target.checked })}
                className="w-4 h-4 text-accent-primary bg-bg-secondary border-border rounded focus:ring-accent-primary focus:ring-2"
              />
              <div className="flex-1">
                <span className="text-small font-medium">Connector Node</span>
                <p className="text-xs text-text-muted">
                  Connector nodes don't pass their color to outgoing edges
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Edit Selected Edge */}
      {selectedEdge && (
        <div className="space-y-3">
          <h4 className="text-small font-medium text-text-muted">Edit Edge</h4>
          
          <div className="space-y-3 p-3 rounded-lg bg-bg-secondary/50 border border-border">
            <Input
              label="Label"
              value={selectedEdge.label || ''}
              onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
              placeholder="Optional edge label..."
            />
            
            <div className="space-y-2">
              <label className="text-small font-medium text-text-muted">Color</label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-border"
                  style={{ backgroundColor: selectedEdge.color || '#64748b' }}
                />
                <input
                  type="color"
                  value={selectedEdge.color || '#64748b'}
                  onChange={(e) => updateEdge(selectedEdge.id, { color: e.target.value })}
                  className="flex-1 h-10 rounded-lg border border-border cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
        <h4 className="text-small font-medium text-accent-primary mb-2">How to Edit</h4>
        <div className="space-y-1 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Drag nodes to reposition them</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Double-click a node to rename it quickly</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Click a node to see the edge handle, then drag to create edges</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight size={12} />
            <span>Right-click elements for quick delete options</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 