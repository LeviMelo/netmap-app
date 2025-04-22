// src/stores/graphDataStore.ts
/**
 * Zustand store for managing the core graph structure data (nodes and edges).
 * This store holds the fundamental definition of the graph, independent of its
 * appearance, layout, or user interaction state. Components requiring access
 * to the raw graph elements or needing to modify the graph structure will
 * interact with this store.
 *
 * Responsibilities:
 * - Storing node and edge definitions (`ElementDefinition[]`).
 * - Providing actions to load a complete graph (`loadGraph`).
 * - Providing actions to add/remove individual nodes and edges.
 * - Providing actions to update the `data` payload of existing nodes/edges.
 */
import { create } from 'zustand';
import cytoscape, { ElementDefinition } from 'cytoscape';

// Re-define necessary data types or import them if centralized
export interface NodeData {
  id: string;
  label?: string; // Make label optional as it might be generated
  color?: string;
  shape?: string;
  // Add any other node-specific data fields here
}
export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  edgeColor?: string; // Keep color separate if desired
  width?: number; // Keep width separate if desired
  // Add any other edge-specific data fields here
}

interface GraphDataState {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
  // --- Actions ---
  loadGraph: (nodes: ElementDefinition[], edges: ElementDefinition[]) => void;
  addNode: (node: ElementDefinition) => void;
  addEdge: (edge: ElementDefinition) => void;
  removeElement: (id: string) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  updateEdgeData: (id: string, data: Partial<EdgeData>) => void;
}

// Helper to darken color for edge outline, keep it local or move to utils
const darken = (hex: string, f = 0.5) => {
  if (!hex || typeof hex !== 'string') return '#555555'; // Fallback for invalid input
  const h = hex.replace('#', '');
  try {
    const num = parseInt(
      h.length === 3 ? h.split('').map((c) => c + c).join('') : h,
      16
    );
    // Ensure RGB components are within valid range 0-255
    const r = Math.max(0, Math.min(255, Math.floor(((num >> 16) & 255) * f)));
    const g = Math.max(0, Math.min(255, Math.floor(((num >> 8) & 255) * f)));
    const b = Math.max(0, Math.min(255, Math.floor((num & 255) * f)));
    return (
      '#' +
      [r, g, b]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')
    );
  } catch (e) {
      console.error("Failed to darken color:", hex, e);
      return '#555555'; // Fallback on error
  }
};

export const useGraphDataStore = create<GraphDataState>((set, get) => ({
  nodes: [],
  edges: [],

  loadGraph: (nodes, edges) => set({ nodes: nodes || [], edges: edges || [], selectedElementId: null }), // Reset selection on load

  addNode: (node) => {
    // Ensure node has a data object and id
    if (!node.data || !node.data.id) {
        console.error("Attempted to add node without data or id:", node);
        return;
    }
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  addEdge: (edge) => {
    // Ensure edge has data, id, source, target
    if (!edge.data || !edge.data.id || !edge.data.source || !edge.data.target) {
        console.error("Attempted to add edge without required data fields:", edge);
        return;
    }
    const { nodes } = get(); // Get current nodes to find source color if needed
    const sourceNode = nodes.find((n) => n.data?.id === edge.data.source);

    // Automatically set edge color based on source node or default
    // You might want to make this logic more sophisticated or configurable
    const edgeColor = edge.data.color || sourceNode?.data?.color || '#a3a3a3'; // Default to muted gray

    // Update the edge's data object before adding
    const updatedEdge: ElementDefinition = {
        ...edge,
        data: {
            ...edge.data,
            edgeColor: edgeColor, // Store the calculated/default color
            outlineColor: darken(edgeColor, 0.4), // Store the outline color
        }
    };
    set((state) => ({ edges: [...state.edges, updatedEdge] }));
  },

  removeElement: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.data?.id !== id),
    // Also remove edges connected to the removed node
    edges: state.edges.filter(
      (e) =>
        e.data?.id !== id &&
        e.data?.source !== id &&
        e.data?.target !== id
    ),
    // Note: Resetting selection if the removed element was selected happens in the interaction store
  })),

  updateNodeData: (id, data) => set((state) => ({
    nodes: state.nodes.map((n) =>
      n.data?.id === id
        ? { ...n, data: { ...n.data, ...data } } // Merge new data into existing data
        : n
    ),
  })),

  updateEdgeData: (id, data) => set((state) => ({
    edges: state.edges.map((e) =>
      e.data?.id === id
        ? { ...e, data: { ...e.data, ...data } } // Merge new data into existing data
        : e
    ),
  })),
}));