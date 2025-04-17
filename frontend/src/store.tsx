import { create } from 'zustand';
import cytoscape, { ElementDefinition, Css } from 'cytoscape'; // Import Css namespace

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

interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: Css.Rule[]; // Correct type: cytoscape.Css.Rule[]
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

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  // Styles remain the same definition as before
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'var(--color-accent-tertiary)',
        'label': 'data(label)',
        'color': 'var(--color-text-base)',
        'text-outline-color': 'var(--color-bg-secondary)',
        'text-outline-width': 2,
        'font-size': '12px',
        'width': '50px',
        'height': '50px',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        'shape': 'ellipse',
        'border-width': 0,
        'border-color': 'transparent',
      },
    },
    {
        selector: 'node[color]',
        style: { 'background-color': 'data(color)' }
    },
    {
        selector: 'node[shape]',
        style: { 'shape': 'data(shape)' as any } // Keep 'as any' for flexibility if shape values aren't strictly Css.NodeShape
    },
    {
      selector: 'node:selected',
      style: {
        'overlay-color': 'var(--color-accent-secondary)',
        'overlay-padding': '6px',
        'overlay-opacity': 0.3,
        // Keep border defaults unless overlaying
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': 'var(--color-accent-primary)',
        'target-arrow-color': 'var(--color-accent-primary)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'color': 'var(--color-text-muted)',
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
            'width': 4,
            'z-index': 99
        }
    },
    {
        selector: 'edge[color]',
        style: {
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)'
         }
    },
     {
        selector: 'edge[width]',
        style: { 'width': 'data(width)' as any } // Use 'as any' if width isn't strictly number
    }
  ],
  selectedElementId: null,
  stylesResolved: true,
  layoutName: 'cose',

  // Actions
  setNodes: (nodes) => set({ nodes, selectedElementId: null }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge] })),
  removeElement: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.data?.id !== id),
      edges: s.edges.filter((e) => e.data?.source !== id && e.data?.target !== id && e.data?.id !== id),
      selectedElementId: s.selectedElementId === id ? null : s.selectedElementId,
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
  setLayoutName: (name) => set({ layoutName: name }),
}));