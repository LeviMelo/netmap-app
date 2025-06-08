/**
 * Utility Panel Component
 *
 * DEFINITIVE FIX: The persistent "Property does not exist on type 'unknown'" errors
 * are resolved by changing the state selection pattern. Instead of using a single
 * selector that returns an object, we now use multiple, individual selectors for each
 * piece of state. This is a more robust and type-safe pattern for Zustand that
 * ensures correct type inference.
 */
import React, { useState } from 'react';
import { X, GripVertical } from 'lucide-react';
import { useAppStore } from '../../stores/appState';
import { useResponsive } from '../../hooks/useResponsive';
import { PaintModePanel } from '../panels/PaintModePanel';
import { ManualEditPanel } from '../panels/ManualEditPanel';
import { DataIOPanel } from '../panels/DataIOPanel';
import { LayoutControlsPanel } from '../panels/LayoutControlsPanel';

const AnalyzePanel: React.FC = () => {
  // This single-property selector is already correct
  const elements = useAppStore((state) => state.elements);
  return (
    <div className="p-4">
      <h3 className="text-body-large font-semibold mb-4">Graph Analysis</h3>
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-bg-secondary/50 border border-border">
          <h4 className="text-small font-medium mb-2">Graph Statistics</h4>
          <div className="space-y-1 text-xs text-text-muted">
            <div>Nodes: {elements.nodes.length}</div>
            <div>Edges: {elements.edges.length}</div>
            <div>Density: {elements.nodes.length > 1 ? ((elements.edges.length * 2) / (elements.nodes.length * (elements.nodes.length - 1))).toFixed(3) : '0'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UtilityPanel: React.FC = () => {
  // DEFINITIVE FIX: Select each piece of state individually.
  // This is type-safe and avoids the inference issues of object selectors.
  const mode = useAppStore((state) => state.mode);
  const utilityPanelVisible = useAppStore((state) => state.utilityPanelVisible);
  const selectedNodes = useAppStore((state) => state.selectedNodes);
  const selectedEdges = useAppStore((state) => state.selectedEdges);
  const utilityPanelWidth = useAppStore((state) => state.utilityPanelWidth);
  
  // Actions are fetched separately and correctly via getState
  const { setUtilityPanelVisible, setUtilityPanelWidth } = useAppStore.getState();
  
  const { isDesktop } = useResponsive();
  const [isResizing, setIsResizing] = useState(false);

  if (!utilityPanelVisible) {
    return null;
  }

  if (mode === 'view' && selectedNodes.length === 0 && selectedEdges.length === 0) {
    return null;
  }

  const renderModeContent = () => {
    switch (mode) {
      case 'paint':
        return <PaintModePanel />;
      case 'manualEdit':
        return <ManualEditPanel />;
      case 'dataIO':
        return <DataIOPanel />;
      case 'layout':
        return <LayoutControlsPanel />;
      case 'analyze':
        return <AnalyzePanel />;
      case 'view':
      default:
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          return (
            <div className="p-4">
              <h3 className="text-body-large font-semibold mb-4">Selection Info</h3>
              <div className="space-y-3">
                {selectedNodes.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
                    <p className="text-small font-medium text-accent-primary">
                      {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                {selectedEdges.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20">
                    <p className="text-small font-medium text-accent-secondary">
                      {selectedEdges.length} edge{selectedEdges.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return null;
    }
  };

  const content = renderModeContent();
  if (!content) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = utilityPanelWidth;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(280, Math.min(600, startWidth + deltaX));
      setUtilityPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (isDesktop) {
    return (
      <div className="h-full relative">
        <div className="h-full w-full bg-bg-secondary/20 backdrop-blur-xl border-r border-border/30 shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-border/20 bg-bg-secondary/30 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-base">
                  {mode === 'dataIO' && 'Data Import/Export'}
                  {mode === 'manualEdit' && 'Manual Editing Tools'}
                  {mode === 'paint' && 'Paint & Styling'}
                  {mode === 'layout' && 'Layout Controls'}
                  {mode === 'analyze' && 'Graph Analysis'}
                  {mode === 'view' && 'Selection Details'}
                </h3>
              </div>
              <button
                onClick={() => setUtilityPanelVisible(false)}
                className="p-1.5 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-all"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1">{content}</div>
        </div>
        <div
          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize group"
          onMouseDown={handleMouseDown}
        >
          <div className={`w-full h-full bg-accent-primary/0 group-hover:bg-accent-primary/20 transition-all ${isResizing ? 'bg-accent-primary/40' : ''}`}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={12} className="text-accent-primary/60" />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-bg-secondary/20 backdrop-blur-xl border-t border-border/30 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar animate-slide-in-bottom">
        <div className="sticky top-0 p-3 border-b border-border/20 bg-bg-secondary/30 z-10">
          <div className="w-full h-5 flex justify-center items-center">
            <div className="w-12 h-1 bg-text-muted/40 rounded-full"></div>
            <button
              onClick={() => setUtilityPanelVisible(false)}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-all"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-1">
            <h3 className="text-sm font-semibold text-text-base">
              {mode === 'dataIO' && 'Data Import/Export'}
              {mode === 'manualEdit' && 'Manual Editing Tools'}
              {mode === 'paint' && 'Paint & Styling'}
              {mode === 'layout' && 'Layout Controls'}
              {mode === 'analyze' && 'Graph Analysis'}
              {mode === 'view' && 'Selection Details'}
            </h3>
          </div>
        </div>
        {content}
      </div>
    );
  }
};