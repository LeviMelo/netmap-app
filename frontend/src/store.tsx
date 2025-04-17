import { create } from 'zustand';
import { useEffect } from 'react';
import {
    ElementDefinition,
    LayoutOptions,
    Css
} from 'cytoscape';

// Use 'any' as a workaround for the incorrect TS error TS2724 regarding Stylesheet export
type CytoscapeStylesheet = any;

// Initial styles with placeholders/fallbacks
const initialStyleSheet: CytoscapeStylesheet = [
     { selector: 'node', style: { 'background-color': '#888', 'label': 'data(label)' } as Css.Node },
     { selector: 'edge', style: { 'line-color': '#ccc', 'target-arrow-color': '#ccc' } as Css.Edge },
];

// --- Data Interfaces ---
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

// --- State Interface ---
interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: CytoscapeStylesheet; // Using 'any' workaround
  selectedElementId: string | null;
  stylesResolved: boolean;
  layoutName: string; // Name of the selected layout

  // Actions
  setNodes: (nodes: ElementDefinition[]) => void;
  setEdges: (edges: ElementDefinition[]) => void;
  addNode: (node: ElementDefinition) => void;
  addEdge: (edge: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateElementData: (id: string, data: Partial<NodeData> | Partial<EdgeData>) => void;
  setSelectedElement: (id: string | null) => void;
  setResolvedStyle: (style: CytoscapeStylesheet) => void; // Use 'any' workaround
  setLayoutName: (name: string) => void;
}

// --- Zustand Store Definition ---
export const useGraphStore = create<GraphState>((set) => ({
  // Initial State
  nodes: [
    { data: { id: 'a', label: 'Node A' }, position: { x: 50, y: 50 } },
    { data: { id: 'b', label: 'Node B' }, position: { x: 150, y: 150 } },
  ],
  edges: [
    { data: { id: 'ab', source: 'a', target: 'b', label: 'Edge A->B' } },
  ],
  style: initialStyleSheet, // Start with basic styles
  selectedElementId: null,
  stylesResolved: false, // Styles start unresolved
  layoutName: 'grid', // Default layout

  // Actions Implementation
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  removeElement: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.data.id !== id),
        edges: state.edges.filter(e => e.data.id !== id || e.data.source === id || e.data.target === id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),
  updateElementData: (id, data) => set((state) => ({
        nodes: state.nodes.map(n => n.data.id === id ? { ...n, data: { ...n.data, ...data } } : n),
        edges: state.edges.map(e => e.data.id === id ? { ...e, data: { ...e.data, ...data } } : e)
  })),
  setSelectedElement: (id) => set({ selectedElementId: id }),
  setResolvedStyle: (style) => set({ style: style, stylesResolved: true }),
  setLayoutName: (name) => set({ layoutName: name }),
}));

// --- Hook to resolve CSS Variables ---
export const useResolveCytoscapeStyles = () => {
    const setResolvedStyle = useGraphStore((state) => state.setResolvedStyle);
    const stylesResolved = useGraphStore((state) => state.stylesResolved);

    useEffect(() => {
        if (typeof window === 'undefined' || stylesResolved) {
            return;
        }

        const getCssVar = (varName: string, fallback: string): string => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(varName.trim()).trim();
            return value || fallback;
        };

        console.log("Running style resolution effect...");

        const resolvedStyleSheet: CytoscapeStylesheet = [
             {
                selector: 'node',
                style: {
                    'background-color': getCssVar('--color-primary-dark', '#4f46e5'),
                    'label': 'data(label)',
                    'color': getCssVar('--color-text-primary-dark', '#f3f4f6'),
                    'text-outline-color': getCssVar('--color-secondary-dark', '#111827'),
                    'text-outline-width': 1,
                    'font-size': '12px',
                    'shape': 'ellipse',
                    'width': 'label', // Reverted to label for auto-sizing
                    'height': 'label',
                    'padding': '10px',
                } as Css.Node,
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 3,
                    'border-color': getCssVar('--color-accent-gold', '#facc15'),
                } as Css.Node,
            },
             {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': getCssVar('--color-accent-cyan', '#22d3ee'),
                    'target-arrow-color': getCssVar('--color-accent-cyan', '#22d3ee'),
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'color': getCssVar('--color-text-secondary-dark', '#9ca3af'),
                    'font-size': '10px',
                    'text-background-opacity': 1,
                    'text-background-color': getCssVar('--color-secondary-dark', '#111827'),
                    'text-background-padding': '2px',
                } as Css.Edge,
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': getCssVar('--color-accent-gold', '#facc15'),
                    'target-arrow-color': getCssVar('--color-accent-gold', '#facc15'),
                    'width': 4,
                } as Css.Edge,
            },
        ];

        setResolvedStyle(resolvedStyleSheet);

    }, [setResolvedStyle, stylesResolved]);
};