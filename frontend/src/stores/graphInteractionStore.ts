// src/stores/graphInteractionStore.ts
/**
 * Zustand store for managing the state related to user interactions with the
 * graph UI. This includes tracking selected elements, the current editing or
 * interaction mode (e.g., view, manual editing, deleting), and potentially
 * hover states.
 *
 * Responsibilities:
 * - Storing the ID of the currently selected node or edge.
 * - Storing the current interaction mode.
 * - Providing actions to update the selection and interaction mode.
 */
import { create } from 'zustand';
import { useGraphDataStore } from './graphDataStore'; // Import to potentially clear selection on element removal

// Define the possible interaction modes
export type InteractionMode = 'view' | 'manual' | 'manual-delete' | 'manual-drag';

// Define the state shape
interface GraphInteractionState {
  selectedElementId: string | null;
  mode: InteractionMode;
  // Optional: Add hover state if needed later
  // hoveredElementId: string | null;
  // --- Actions ---
  setSelectedElementId: (id: string | null) => void;
  setMode: (mode: InteractionMode) => void;
  toggleManualMode: () => void; // Convenience action
}

export const useGraphInteractionStore = create<GraphInteractionState>((set, get) => ({
  selectedElementId: null,
  mode: 'view', // Default mode is viewing/panning

  setSelectedElementId: (id) => set({ selectedElementId: id }),

  setMode: (newMode) => {
     // Add any logic needed when switching modes (e.g., disabling edge handles)
     console.log("Switching mode to:", newMode);
     set({ mode: newMode });
  },

  toggleManualMode: () => {
    const currentMode = get().mode;
    const nextMode = (currentMode === 'view') ? 'manual' : 'view';
    console.log("Toggling manual mode:", nextMode);
    set({ mode: nextMode, selectedElementId: null }); // Optionally clear selection when toggling mode
  },
}));

// Optional: Subscribe to graphDataStore to clear selection if the selected element is deleted
// This creates a link between stores but can be useful for consistency.
useGraphDataStore.subscribe(
    (state, _prevState) => { // Mark prevState as unused with an underscore
      const selectedId = useGraphInteractionStore.getState().selectedElementId;
      if (!selectedId) return; // No selection, nothing to do
  
      const elementStillExists =
        state.nodes.some(n => n.data?.id === selectedId) ||
        state.edges.some(e => e.data?.id === selectedId);
  
      if (!elementStillExists) {
          console.log(`Selected element ${selectedId} removed, clearing selection.`);
          useGraphInteractionStore.getState().setSelectedElementId(null);
      }
    }
);