// src/stores/graphSettingsStore.ts
/**
 * Zustand store for managing user-configurable settings related to graph
 * visualization and layout. This store holds abstract parameters that define
 * *how* the graph should look or be arranged, but not the final,
 * engine-specific rendering details (like the Cytoscape stylesheet array).
 *
 * Responsibilities:
 * - Storing the selected layout algorithm name (e.g., 'cose', 'dagre').
 * - Storing parameters specific to layout algorithms (repulsion, gravity, etc.).
 * - Storing general styling parameters (node font size, edge width).
 * - Providing actions to update these settings.
 */
import { create } from 'zustand';

// Parameters specific to different layout algorithms
export interface LayoutParams {
  // CoSE / CoSE-Bilkent specific
  repulsion: number;
  gravity: number;
  edgeLength: number;
  infinite: boolean; // For live updates in CoSE

  // Dagre / Breadthfirst specific (example)
  layerSpacing: number; // Used by multiple hierarchical layouts

  // Add other layout params as needed
}

// Parameters related to base visual styling
export interface StyleParams {
  nodeFont: number;
  edgeWidth: number;
  // Add other style params like default colors, shapes if not data-driven
}

interface GraphSettingsState {
  layoutName: string;
  layoutParams: LayoutParams;
  styleParams: StyleParams;
  // --- Actions ---
  setLayoutName: (name: string) => void;
  setLayoutParams: (params: Partial<LayoutParams>) => void;
  setStyleParams: (params: Partial<StyleParams>) => void;
}

export const useGraphSettingsStore = create<GraphSettingsState>((set) => ({
  layoutName: 'cose', // Default layout
  layoutParams: {
    // Default values matching the old store
    repulsion: 4500,
    gravity: 0.3,
    edgeLength: 120,
    infinite: false,
    layerSpacing: 60, // Default spacing
  },
  styleParams: {
    // Default values matching the old store
    nodeFont: 12,
    edgeWidth: 2,
  },

  setLayoutName: (name) => set({ layoutName: name }),

  setLayoutParams: (params) => set((state) => ({
    // Merge partial updates into existing params
    layoutParams: { ...state.layoutParams, ...params },
  })),

  setStyleParams: (params) => set((state) => ({
    // Merge partial updates into existing params
    styleParams: { ...state.styleParams, ...params },
    // Note: The actual Cytoscape stylesheet generation happens elsewhere (GraphCanvas)
    // based on these params. No 'style' array is stored here.
  })),
}));