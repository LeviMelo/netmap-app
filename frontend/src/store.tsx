// src/store.tsx
import { create } from 'zustand';
import cytoscape, { ElementDefinition } from 'cytoscape';

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
  edgeColor?: string;
  outlineColor?: string;
}

type CyStyle = Partial<cytoscape.StylesheetStyle>;

interface LayoutParams {
  repulsion: number;
  gravity: number;
  edgeLength: number;
  layerSpacing: number;
  infinite: boolean;
}

interface StyleParams {
  nodeFont: number;
  edgeWidth: number;
}

interface ModeState {
  constructor: boolean;
  drag: boolean;
  del: boolean;
}

interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: CyStyle[];

  selectedElementId: string | null;
  layoutName: string;
  layoutParams: LayoutParams;
  styleParams: StyleParams;
  mode: ModeState;

  setNodes: (n: ElementDefinition[]) => void;
  setEdges: (e: ElementDefinition[]) => void;
  addNode: (n: ElementDefinition) => void;
  addEdge: (e: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateElementData: (id: string, d: Partial<NodeData & EdgeData>) => void;
  setSelectedElementId: (id: string | null) => void;

  setLayoutName: (n: string) => void;
  setLayoutParams: (p: Partial<LayoutParams>) => void;
  setStyleParams: (p: Partial<StyleParams>) => void;

  toggleConstructor: () => void;
  setDrag: (v: boolean) => void;
  setDelete: (v: boolean) => void;
}

const darken = (hex: string, f = 0.5) => {
  const h = hex.replace('#', '');
  const num = parseInt(
    h.length === 3
      ? h.split('').map((c) => c + c).join('')
      : h,
    16
  );
  const r = Math.max(0, ((num >> 16) & 255) * f);
  const g = Math.max(0, ((num >> 8) & 255) * f);
  const b = Math.max(0, (num & 255) * f);
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')
  );
};

const buildStyles = (sp: StyleParams): CyStyle[] => [
  {
    selector: 'node',
    style: {
      'background-color': 'var(--color-accent-tertiary)',
      label: 'data(label)',
      color: '#ffffff',
      'text-outline-width': 2,
      'text-outline-color': 'var(--color-bg-secondary)',
      'font-size': `${sp.nodeFont}px`,
      width: 'label',
      height: 'label',
      padding: '10px',
      shape: 'ellipse',
    },
  },
  {
    selector: 'node[color]',
    style: {
      'background-color': 'data(color)',
    },
  },
  {
    selector: 'edge',
    style: {
      width: `${sp.edgeWidth}px`,           // ← now a string, fixes TS2322
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      label: 'data(label)',
      color: 'var(--color-text-muted)',
      'font-size': '10px',
      'text-background-color': 'var(--color-bg-secondary)',
      'text-background-opacity': 0.85,
    },
  },
  {
    selector: 'edge[edgeColor]',
    style: {
      'line-color': 'data(edgeColor)',
      'target-arrow-color': 'data(edgeColor)',
      'text-outline-color': 'data(outlineColor)',
      'text-outline-width': 2,
    },
  },
];

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  selectedElementId: null,

  layoutName: 'cose',
  layoutParams: {
    repulsion: 4500,
    gravity: 0.3,
    edgeLength: 120,
    layerSpacing: 60,
    infinite: false,
  },

  styleParams: { nodeFont: 12, edgeWidth: 2 },
  style: buildStyles({ nodeFont: 12, edgeWidth: 2 }),

  mode: { constructor: false, drag: false, del: false },

  setNodes: (nodes) => set({ nodes, selectedElementId: null }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge: (edge) =>
    set((s) => {
      const srcId = (edge.data as any).source;
      const src = s.nodes.find((n) => n.data?.id === srcId);
      const col = (edge.data as any).edgeColor || src?.data?.color || '#888';
      (edge.data as any).edgeColor = col;
      (edge.data as any).outlineColor = darken(col, 0.4);
      return { edges: [...s.edges, edge] };
    }),
  removeElement: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.data?.id !== id),
      edges: s.edges.filter(
        (e) =>
          e.data?.id !== id &&
          e.data?.source !== id &&
          e.data?.target !== id
      ),
      selectedElementId:
        s.selectedElementId === id
          ? null
          : s.selectedElementId,
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
  setLayoutParams: (p) =>
    set((s) => ({
      layoutParams: { ...s.layoutParams, ...p },
    })),
  setStyleParams: (p) =>
    set((s) => {
      const next = { ...s.styleParams, ...p };
      return { styleParams: next, style: buildStyles(next) };
    }),

  toggleConstructor: () =>
    set((s) => ({
      mode: { ...s.mode, constructor: !s.mode.constructor },
    })),
  setDrag: (v) =>
    set((s) => ({ mode: { ...s.mode, drag: v } })),
  setDelete: (v) =>
    set((s) => ({ mode: { ...s.mode, del: v } })),
}));
