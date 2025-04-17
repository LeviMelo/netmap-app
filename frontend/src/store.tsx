import { create } from 'zustand';
import { useEffect } from 'react';
import {
    ElementDefinition,
    Css
} from 'cytoscape';

type CytoscapeStylesheet = any; // Keep 'any' workaround

const initialStyleSheet: CytoscapeStylesheet = [
     { selector: 'node', style: { 'background-color': '#888', 'label': 'data(label)' } as Css.Node },
     { selector: 'edge', style: { 'line-color': '#ccc', 'target-arrow-color': '#ccc' } as Css.Edge },
];

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
  setSelectedElement: (id: string | null) => void;
  setResolvedStyle: (style: CytoscapeStylesheet) => void;
  setLayoutName: (name: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [
    { data: { id: 'n0', label: 'Welcome!' }, position: { x: 100, y: 100 } },
    { data: { id: 'n1', label: 'Load graph in sidebar ->' }, position: { x: 300, y: 100 } },
  ],
  edges: [ {data: { id: 'e0', source: 'n0', target: 'n1', label: 'Example'}} ],
  style: initialStyleSheet,
  selectedElementId: null,
  stylesResolved: false,
  layoutName: 'grid',
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  removeElement: (id) => set((state) => ({ nodes: state.nodes.filter(n => n.data.id !== id), edges: state.edges.filter(e => e.data.id !== id || e.data.source === id || e.data.target === id), selectedElementId: state.selectedElementId === id ? null : state.selectedElementId })),
  updateElementData: (id, data) => set((state) => ({ nodes: state.nodes.map(n => n.data.id === id ? { ...n, data: { ...n.data, ...data } } : n), edges: state.edges.map(e => e.data.id === id ? { ...e, data: { ...e.data, ...data } } : e) })),
  setSelectedElement: (id) => set({ selectedElementId: id }),
  setResolvedStyle: (style) => set({ style: style, stylesResolved: true }),
  setLayoutName: (name) => set({ layoutName: name }),
}));

export const useResolveCytoscapeStyles = () => {
    const setResolvedStyle = useGraphStore((state) => state.setResolvedStyle);
    const stylesResolved = useGraphStore((state) => state.stylesResolved);
    useEffect(() => {
        if (typeof window === 'undefined' || stylesResolved) return;
        const getCssVar = (varName: string, fallback: string): string => { const value = getComputedStyle(document.documentElement).getPropertyValue(varName.trim()).trim(); return value || fallback; };
        console.log("Running style resolution effect...");
        const resolvedStyleSheet: CytoscapeStylesheet = [
             { selector: 'node', style: { 'background-color': getCssVar('--color-primary-dark', '#4f46e5'), 'label': 'data(label)', 'color': getCssVar('--color-text-primary-dark', '#f3f4f6'), 'text-outline-color': getCssVar('--color-secondary-dark', '#111827'), 'text-outline-width': 1, 'font-size': '12px', 'shape': 'ellipse', 'padding': '12px', 'text-halign': 'center', 'text-valign': 'center' } as Css.Node },
             { selector: 'node:selected', style: { 'border-width': 3, 'border-color': getCssVar('--color-accent-gold', '#facc15'), 'overlay-color': getCssVar('--color-accent-gold', '#facc15'), 'overlay-opacity': 0.2 } as Css.Node },
             { selector: 'edge', style: { 'width': 2, 'line-color': getCssVar('--color-accent-cyan', '#22d3ee'), 'target-arrow-color': getCssVar('--color-accent-cyan', '#22d3ee'), 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', 'label': 'data(label)', 'color': getCssVar('--color-text-secondary-dark', '#9ca3af'), 'font-size': '10px', 'text-background-opacity': 1, 'text-background-color': getCssVar('--color-secondary-dark', '#111827'), 'text-background-padding': '2px', 'arrow-scale': 1.2 } as Css.Edge },
             { selector: 'edge:selected', style: { 'line-color': getCssVar('--color-accent-gold', '#facc15'), 'target-arrow-color': getCssVar('--color-accent-gold', '#facc15'), 'width': 4, 'overlay-color': getCssVar('--color-accent-gold', '#facc15'), 'overlay-opacity': 0.2 } as Css.Edge },
        ];
        setResolvedStyle(resolvedStyleSheet);
    }, [setResolvedStyle, stylesResolved]);
};