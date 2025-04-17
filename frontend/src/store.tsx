// store.tsx
// Updated: April 17, 2025
// - Removed unused getCssVar helper to clear the warning

import { create } from 'zustand';
import { useEffect } from 'react';
import { ElementDefinition, Css } from 'cytoscape';

type CytoscapeStylesheet = any;

const initialStyleSheet: CytoscapeStylesheet = [ /* ... */ ];

export interface NodeData { id: string; label: string; color?: string; shape?: string; }
export interface EdgeData { id: string; source: string; target: string; label?: string; color?: string; width?: number; }

interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: CytoscapeStylesheet;
  selectedElementId: string | null;
  stylesResolved: boolean;
  layoutName: string;
  setNodes: (nodes: ElementDefinition[]) => void;
  setEdges: (edges: ElementDefinition[]) => void;
  addNode: (node: ElementDefinition) => void;
  addEdge: (edge: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateElementData: (id: string, data: Partial<NodeData> | Partial<EdgeData>) => void;
  setSelectedElementId: (id: string | null) => void;
  setResolvedStyle: (style: CytoscapeStylesheet) => void;
  setLayoutName: (name: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [ /* ... */ ],
  edges: [ /* ... */ ],
  style: initialStyleSheet,
  selectedElementId: null,
  stylesResolved: false,
  layoutName: 'grid',

  setNodes: (nodes) => set({ nodes, selectedElementId: null }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge] })),

  removeElement: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.data?.id !== id),
      edges: s.edges.filter((e) => e.data?.id !== id)
    })),

  updateElementData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.data?.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      edges: s.edges.map((e) =>
        e.data?.id === id ? { ...e, data: { ...e.data, ...data } } : e
      )
    })),

  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setResolvedStyle: (style) => set({ style, stylesResolved: true }),
  setLayoutName: (name) => set({ layoutName: name })
}));

export const useResolveCytoscapeStyles = () => {
  const setResolvedStyle = useGraphStore((s) => s.setResolvedStyle);
  const stylesResolved = useGraphStore((s) => s.stylesResolved);

  useEffect(() => {
    if (typeof window === 'undefined' || stylesResolved) return;

    const resolvedStyleSheet: CytoscapeStylesheet = [
      { selector: 'node', style: { /* ... */ } as Css.Node },
      { selector: 'node[color]', style: { 'background-color': 'data(color)' } as Css.Node },
      { selector: 'node[shape]', style: { shape: 'data(shape)' as any } },
      { selector: 'edge[color]', style: { /* ... */ } as Css.Edge },
      { selector: 'node:selected', style: { /* ... */ } as Css.Node },
      { selector: 'edge', style: { /* ... */ } as Css.Edge },
      { selector: 'edge:selected', style: { /* ... */ } as Css.Edge }
    ];

    setResolvedStyle(resolvedStyleSheet);
  }, [setResolvedStyle, stylesResolved]);
};
