// frontend/src/store.ts
import { create } from 'zustand';
import { useEffect } from 'react';
import { // <-- Import directly from cytoscape
    ElementDefinition,
    Stylesheet, // <-- Use the direct export based on type definitions
    Css         // <-- Import Css namespace for inner types
} from 'cytoscape';

// Initial styles with placeholders/fallbacks
const initialStyleSheet: Stylesheet = [ // Type annotation uses the alias directly
     { selector: 'node', style: { 'background-color': '#888', 'label': 'data(label)' } as Css.Node }, // Cast inner object
     { selector: 'edge', style: { 'line-color': '#ccc', 'target-arrow-color': '#ccc' } as Css.Edge }, // Cast inner object
];

// Interfaces (NodeData, EdgeData)
export interface NodeData { id: string; label: string; color?: string; shape?: string; }
export interface EdgeData { id: string; source: string; target: string; label?: string; color?: string; width?: number; }

interface GraphState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  style: Stylesheet; // Use the alias directly (it includes the array case)
  selectedElementId: string | null;
  stylesResolved: boolean;

  setNodes: (nodes: ElementDefinition[]) => void;
  setEdges: (edges: ElementDefinition[]) => void;
  addNode: (node: ElementDefinition) => void;
  addEdge: (edge: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateElementData: (id: string, data: Partial<NodeData> | Partial<EdgeData>) => void;
  setSelectedElement: (id: string | null) => void;
  setResolvedStyle: (style: Stylesheet) => void; // Use the alias
}

export const useGraphStore = create<GraphState>((set) => ({
  // Initial State
  nodes: [
    { data: { id: 'a', label: 'Node A' } },
    { data: { id: 'b', label: 'Node B' } },
  ],
  edges: [
    { data: { id: 'ab', source: 'a', target: 'b', label: 'Edge A->B' } },
  ],
  style: initialStyleSheet,
  selectedElementId: null,
  stylesResolved: false,

  // Actions
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
}));

// --- Hook to resolve CSS Variables ---
export const useResolveCytoscapeStyles = () => {
    const setResolvedStyle = useGraphStore((state) => state.setResolvedStyle);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const getCssVar = (varName: string, fallback: string): string => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(varName.trim()).trim();
            return value || fallback;
        };

        // Define the resolved stylesheet using the Stylesheet type alias
        const resolvedStyleSheet: Stylesheet = [
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
                    'width': 'auto',
                    'height': 'auto',
                    'padding': '10px',
                } as Css.Node, // Cast inner style object
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
                } as Css.Edge, // Cast inner style object
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

        // console.log("Attempting to set resolved styles..."); // Keep for debugging if needed
        setResolvedStyle(resolvedStyleSheet);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};