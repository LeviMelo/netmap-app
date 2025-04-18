import { create } from 'zustand';
import cytoscape, { ElementDefinition } from 'cytoscape';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type CyStyle = Partial<cytoscape.StylesheetStyle>;

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
  edgeColor?: string;
  width?: number;
}

interface StyleRule {
  selector: string;
  style: CyStyle;
}

interface LayoutParams {
  repulsion: number;
  gravity: number;
  edgeLength: number;
  layerSpacing: number;
}

interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: StyleRule[];

  selectedElementId: string | null;
  stylesResolved: boolean;
  layoutName: string;
  layoutParams: LayoutParams;
  constructorMode: boolean;

  setNodes: (n: ElementDefinition[]) => void;
  setEdges: (e: ElementDefinition[]) => void;
  addNode: (n: ElementDefinition) => void;
  addEdge: (e: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateElementData: (id: string, d: Partial<NodeData & EdgeData>) => void;
  setSelectedElementId: (id: string | null) => void;

  setLayoutName: (n: string) => void;
  setLayoutParams: (p: Partial<LayoutParams>) => void;
  toggleConstructor: () => void;
}

/* ------------------------------------------------------------------ */
/*  Store                                                             */
/* ------------------------------------------------------------------ */
export const useGraphStore = create<GraphState>((set) => ({
  /* ---------- graph data ---------- */
  nodes: [],
  edges: [],

  /* ---------- stylesheet ---------- */
  style: [
    /* node defaults */
    {
      selector: 'node',
      style: {
        'background-color': 'var(--color-accent-tertiary)',
        label: 'data(label)',
        color: '#ffffff',
        'text-outline-width': 2,
        'text-outline-color': 'var(--color-bg-secondary)',
        'font-size': '12px',
        width: '50px',
        height: '50px',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        shape: 'ellipse',
        'border-width': 0,
      },
    },
    {
      selector: 'node[color]',
      style: {
        'background-color': 'data(color)',
      },
    },
    { selector: 'node[shape]', style: { shape: 'data(shape)' as any } },
    {
      selector: 'node:selected',
      style: {
        'overlay-color': 'var(--color-accent-secondary)',
        'overlay-opacity': 0.35,
        'overlay-padding': 6,
      },
    },

    /* edge defaults */
    {
      selector: 'edge',
      style: {
        width: 2,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': 'var(--color-accent-primary)',
        'target-arrow-color': 'var(--color-accent-primary)',
        label: 'data(label)',
        color: 'var(--color-text-muted)',
        'font-size': '10px',
        'text-background-color': 'var(--color-bg-secondary)',
        'text-background-opacity': 0.85,
        'text-background-padding': 2,
      },
    },
    {
      selector: 'edge[edgeColor]',
      style: {
        'line-color': 'data(edgeColor)',
        'target-arrow-color': 'data(edgeColor)',
      },
    },
    {
      selector: 'edge[width]',
      style: { width: 'data(width)' as any },
    },
    {
      selector: 'edge:selected',
      style: {
        width: 4,
        'line-color': 'var(--color-accent-secondary)',
        'target-arrow-color': 'var(--color-accent-secondary)',
      },
    },
  ],

  /* ---------- UI state ---------- */
  selectedElementId: null,
  stylesResolved: true,

  layoutName: 'cose',
  layoutParams: {
    repulsion: 4500,
    gravity: 0.3,
    edgeLength: 120,
    layerSpacing: 60,
  },

  constructorMode: false,

  /* ---------- mutators ---------- */
  setNodes: (nodes) => set({ nodes, selectedElementId: null }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge: (edge) =>
    set((s) => {
      // infer edgeColor from source if needed
      if (!edge.data.edgeColor && !edge.data.color) {
        const srcId = (edge.data as any).source;
        const src = s.nodes.find((n) => n.data?.id === srcId);
        if (src?.data?.color) (edge.data as any).edgeColor = src.data.color;
      }
      return { edges: [...s.edges, edge] };
    }),
  removeElement: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.data?.id !== id),
      edges: s.edges.filter(
        (e) =>
          e.data?.id !== id &&
          e.data?.source !== id &&
          e.data?.target !== id,
      ),
      selectedElementId:
        s.selectedElementId === id ? null : s.selectedElementId,
    })),
  updateElementData: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.data?.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
      edges: s.edges.map((e) =>
        e.data?.id === id ? { ...e, data: { ...e.data, ...data } } : e,
      ),
    })),
  setSelectedElementId: (id) => set({ selectedElementId: id }),

  setLayoutName: (name) => set({ layoutName: name }),
  setLayoutParams: (p) =>
    set((s) => ({ layoutParams: { ...s.layoutParams, ...p } })),

  toggleConstructor: () =>
    set((s) => ({ constructorMode: !s.constructorMode })),
}));
