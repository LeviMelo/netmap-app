// src/store.tsx
import { create } from 'zustand';
import cytoscape, { ElementDefinition } from 'cytoscape';

// --- Data types for nodes and edges ---
export interface NodeData {
  id: string;
  label: string;
  color?: string;
  shape?: cytoscape.Css.NodeShape;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
  width?: number;
}

// --- Custom type for our stylesheet rules ---
interface StyleRule {
  selector: string;
  // We're using a partial mapping of Cytoscape's CSS properties
  style: Partial<cytoscape.Css.Styles>;
}

// --- Graph state interface ---
interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: StyleRule[];
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
  setLayoutName: (name: string) => void;
}

// --- Create the Zustand store ---
export const useGraphStore = create<GraphState>((set) => ({
  // --- Initial state ---
  nodes: [],
  edges: [],
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'var(--color-accent-tertiary)',
        label: 'data(label)',
        color: 'var(--color-text-base)',
        'text-outline-color': 'var(--color-bg-secondary)',
        'text-outline-width': 2,
        'font-size': '12px',
        width: '50px',
        height: '50px',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        shape: 'ellipse',
        'border-width': 0,
        'border-color': 'transparent',
      },
    },
    {
      selector: 'node[color]',
      style: { 'background-color': 'data(color)' },
    },
    {
      selector: 'node[shape]',
      style: { shape: 'data(shape)' as any },
    },
    {
      selector: 'node:selected',
      style: {
        'overlay-color': 'var(--color-accent-secondary)',
        'overlay-padding': '6px',
        'overlay-opacity': 0.3,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': 'var(--color-accent-primary)',
        'target-arrow-color': 'var(--color-accent-primary)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        color: 'var(--color-text-muted)',
        'font-size': '10px',
        'text-background-color': 'var(--color-bg-secondary)',
        'text-background-opacity': 0.85,
        'text-background-padding': '2px',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': 'var(--color-accent-secondary)',
        'target-arrow-color': 'var(--color-accent-secondary)',
        width: 4,
        'z-index': 99,
      },
    },
    {
      selector: 'edge[color]',
      style: {
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
      },
    },
    {
      selector: 'edge[width]',
      style: { width: 'data(width)' as any },
    },
  ],
  selectedElementId: null,
  stylesResolved: true,
  layoutName: 'cose',

  // --- Actions ---
  setNodes: (nodes) => set({ nodes, selectedElementId: null }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge] })),
  removeElement: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.data?.id !== id),
      edges: s.edges.filter(
        (e) =>
          e.data?.id !== id &&
          e.data?.source !== id &&
          e.data?.target !== id
      ),
      selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
    })),
  updateElementData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.data?.id === id
          ? { ...n, data: { ...n.data, ...data } }
          : n
      ),
      edges: s.edges.map((e) =>
        e.data?.id === id
          ? { ...e, data: { ...e.data, ...data } }
          : e
      ),
    })),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setLayoutName: (name) => set({ layoutName: name }),
}));
