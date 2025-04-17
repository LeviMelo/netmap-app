// src/store.tsx
// Replaces the old stub styles and useResolveCytoscapeStyles completely.
// Now we declare a full Cytoscape stylesheet up‑front, with labels,
// shapes, colors, arrows, selection styles, etc., and mark stylesResolved = true.

import { create } from 'zustand';
import { ElementDefinition, Css } from 'cytoscape';

export interface NodeData {
  id: string;
  label: string;
  color?: string;
  shape?: string;
}
export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
  width?: number;
}

interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: Css.Stylesheet[];        // full Cytoscape stylesheet
  selectedElementId: string | null;
  stylesResolved: boolean;        // always true now
  layoutName: string;

  setNodes: (nodes: ElementDefinition[]) => void;
  setEdges: (edges: ElementDefinition[]) => void;
  addNode: (node: ElementDefinition) => void;
  addEdge: (edge: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateElementData: (
    id: string,
    data: Partial<NodeData> | Partial<EdgeData>
  ) => void;
  setSelectedElementId: (id: string | null) => void;
  setLayoutName: (name: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  // start empty; Sidebar “Load Graph” will populate these
  nodes: [],
  edges: [],

  // This is the **full** stylesheet Cytoscape will use:
  style: [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#666',
        color: '#fff',
        shape: 'roundrectangle',
        width: 'label',
        height: 'label',
        padding: '10px',
        'font-size': '12px',
        'text-wrap': 'wrap',
        'text-max-width': '120px'
      } as Css.Node
    },
    {
      selector: 'node[color]',
      style: {
        'background-color': 'data(color)'
      } as Css.Node
    },
    {
      selector: 'node[shape]',
      style: {
        shape: 'data(shape)' as any
      } as Css.Node
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': '2px',
        'border-color': '#f00'
      } as Css.Node
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        width: 2,
        label: 'data(label)',
        'font-size': '10px',
        'text-background-color': '#fff',
        'text-background-opacity': 0.8,
        'text-background-padding': '2px'
      } as Css.Edge
    },
    {
      selector: 'edge[color]',
      style: {
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)'
      } as Css.Edge
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#f00',
        'target-arrow-color': '#f00',
        width: 3
      } as Css.Edge
    }
  ],

  // since we load styles synchronously above, we're resolved immediately
  selectedElementId: null,
  stylesResolved: true,
  layoutName: 'grid',

  // store mutations
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
  setLayoutName: (name) => set({ layoutName: name })
}));
