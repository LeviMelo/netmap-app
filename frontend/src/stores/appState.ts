/**
 * Comprehensive Application State Management with Undo/Redo
 *
 * This file establishes the Zustand store, correctly combining `temporal` for
 * undo/redo with `persist` for localStorage persistence.
 *
 * DEFINITIVE FIX:
 * The persistent issue was a type mismatch in the store creator. The creator
 * function MUST return an object that perfectly matches the `AppStore` type,
 * including the properties added by the `temporal` middleware (`pastStates`,
 * `futureStates`, `undo`, `redo`). This version defines the entire state
 * object inline within the creator, ensuring TypeScript can verify the type
 * compatibility and correctly infer the store's type for all components.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { StateCreator } from 'zustand';
import type {
  NodeData,
  EdgeData,
  LayoutMeta,
  Snapshot,
  LayoutConfigs,
  AppStore,
  AppSettings,
  InteractionMode,
} from '../types/app';

// ===== HELPER FUNCTIONS =====
const generateId = (prefix: string = 'item'): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getDefaultLayoutMeta = (): LayoutMeta => ({
  nodePositions: {},
  lockedNodes: [],
});

export const initialLayoutConfigs: LayoutConfigs = {
  cola: { name: 'cola', animate: true, padding: 30, nodeSpacing: 50, edgeLength: 100, infinite: false },
  dagre: { name: 'dagre', nodeSep: 50, rankSep: 100, rankDir: 'TB', padding: 30 },
  concentric: { name: 'concentric', padding: 30, startAngle: (3 / 2) * Math.PI, sweep: undefined, clockwise: true, equidistant: false, minNodeSpacing: 10 },
  grid: { name: 'grid', padding: 30, rows: undefined, cols: undefined },
};

// This is a clean version of the initial state, used for the `reset` action.
const cleanInitialState = {
  elements: { nodes: [], edges: [] },
  layouts: {
    preset: getDefaultLayoutMeta(),
    cola: getDefaultLayoutMeta(),
    dagre: getDefaultLayoutMeta(),
    concentric: getDefaultLayoutMeta(),
    grid: getDefaultLayoutMeta(),
  },
  layoutConfigs: initialLayoutConfigs,
  currentLayout: 'preset' as const,
  mode: 'view' as const,
  selectedNodes: [],
  selectedEdges: [],
  selectedColor: '#0ea5e9',
  propagateToEdges: true,
  snapshots: [],
  settings: { theme: 'dark' as const, inputMode: 'auto' as const, useConnectorNodes: false, canvasLocked: false, autoSave: true, gridSnapping: false },
  sidebarCollapsed: false,
  utilityPanelVisible: false,
  utilityPanelWidth: 320,
  utilityPanelHeight: 300,
  importMode: 'replace' as const,
  validationErrors: [],
};


// ===== STORE IMPLEMENTATION =====

const storeCreator: StateCreator<AppStore> = (set, get) => ({
  // --- STATE PROPERTIES (must match AppState) ---
  ...cleanInitialState,
  pastStates: [], // Dummy property for type compliance with zundo
  futureStates: [], // Dummy property for type compliance with zundo

  // --- ACTION IMPLEMENTATIONS ---
  setMode: (mode) => set({ mode }),
  setLayout: (layout) => set({ currentLayout: layout, mode: 'layout' }),
  updateLayoutConfig: (layout, config) =>
    set((state) => ({
      layoutConfigs: { ...state.layoutConfigs, [layout]: { ...state.layoutConfigs[layout], ...config } },
    })),
  addNode: (nodeInput) => {
    const id = nodeInput.id || generateId('node');
    const newNode: NodeData = { ...nodeInput, id, label: nodeInput.label || `Node`, color: nodeInput.color || get().selectedColor || '#0ea5e9', position: nodeInput.position || { x: Math.random() * 800, y: Math.random() * 600 } };
    set((state) => ({ elements: { ...state.elements, nodes: [...state.elements.nodes, newNode] } }));
    return newNode;
  },
  updateNode: (id, updates) =>
    set((state) => ({
      elements: { ...state.elements, nodes: state.elements.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)) },
    })),
  deleteNode: (id) => get().deleteNodes([id]),
  deleteNodes: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      return {
        elements: {
          nodes: state.elements.nodes.filter((n) => !idSet.has(n.id)),
          edges: state.elements.edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)),
        },
        selectedNodes: state.selectedNodes.filter((nid) => !idSet.has(nid)),
      };
    }),
  getNodeById: (id) => get().elements.nodes.find(n => n.id === id),
  lockNode: (id) => get().updateNode(id, { locked: true }),
  unlockNode: (id) => get().updateNode(id, { locked: false }),
  addEdge: (edgeInput) => {
    const id = edgeInput.id || generateId('edge');
    const sourceNode = get().elements.nodes.find(n => n.id === edgeInput.source);
    const newEdge: EdgeData = { ...edgeInput, id, label: edgeInput.label || '', color: edgeInput.color || (sourceNode && !sourceNode.isConnectorNode ? sourceNode.color : '#64748b') };
    set((state) => ({ elements: { ...state.elements, edges: [...state.elements.edges, newEdge] } }));
    return newEdge;
  },
  updateEdge: (id, updates) =>
    set((state) => ({
      elements: { ...state.elements, edges: state.elements.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)) },
    })),
  deleteEdge: (id) => get().deleteEdges([id]),
  deleteEdges: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      return {
        elements: { ...state.elements, edges: state.elements.edges.filter((e) => !idSet.has(e.id)) },
        selectedEdges: state.selectedEdges.filter((eid) => !idSet.has(eid)),
      };
    }),
  getEdgeById: (id) => get().elements.edges.find(e => e.id === id),
  selectNode: (id, addToSelection = false) =>
    set((state) => ({
      selectedNodes: addToSelection ? (state.selectedNodes.includes(id) ? state.selectedNodes.filter((nid) => nid !== id) : [...state.selectedNodes, id]) : [id],
      selectedEdges: addToSelection ? state.selectedEdges : [],
    })),
  selectEdge: (id, addToSelection = false) =>
    set((state) => ({
      selectedEdges: addToSelection ? (state.selectedEdges.includes(id) ? state.selectedEdges.filter((eid) => eid !== id) : [...state.selectedEdges, id]) : [id],
      selectedNodes: addToSelection ? state.selectedNodes : [],
    })),
  clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setPropagateToEdges: (propagate) => set({ propagateToEdges: propagate }),
  paintNode: (id, color) => {
    const paintColor = color || get().selectedColor;
    get().updateNode(id, { color: paintColor });
    if (get().propagateToEdges) {
      const sourceNode = get().elements.nodes.find(n => n.id === id);
      if (sourceNode && !sourceNode.isConnectorNode) {
        get().elements.edges.forEach((edge) => {
          if (edge.source === id) get().updateEdge(edge.id, { color: paintColor });
        });
      }
    }
  },
  paintEdge: (id, color) => {
    const paintColor = color || get().selectedColor;
    get().updateEdge(id, { color: paintColor });
  },
  saveSnapshot: (name, description) =>
    set((state) => {
      const newSnapshot: Snapshot = { id: generateId('snapshot'), name, description, timestamp: Date.now(), elements: JSON.parse(JSON.stringify(state.elements)), layouts: JSON.parse(JSON.stringify(state.layouts)) };
      return { snapshots: [...state.snapshots, newSnapshot] };
    }),
  restoreSnapshot: (id) =>
    set((state) => {
      const snapshot = state.snapshots.find((s) => s.id === id);
      if (!snapshot) return {};
      return { elements: JSON.parse(JSON.stringify(snapshot.elements)), layouts: JSON.parse(JSON.stringify(snapshot.layouts)), currentLayout: 'preset' };
    }),
  deleteSnapshot: (id) =>
    set((state) => ({ snapshots: state.snapshots.filter((s) => s.id !== id) })),
  importData: (data, mode) => {
    const importMode = mode || get().importMode;
    if (importMode === 'replace') {
      set({ elements: data, selectedNodes: [], selectedEdges: [] });
      return;
    }
    set(state => {
      const existingNodeIds = new Set(state.elements.nodes.map((n) => n.id));
      const newNodes = data.nodes.filter((n) => !existingNodeIds.has(n.id));
      const existingEdgeIds = new Set(state.elements.edges.map((e) => e.id));
      const newEdges = data.edges.filter((e) => !existingEdgeIds.has(e.id));
      return { elements: { nodes: [...state.elements.nodes, ...newNodes], edges: [...state.elements.edges, ...newEdges] } };
    });
  },
  validateAndImportData: (data) => {
    if (data && (data.nodes?.length > 0 || data.edges?.length > 0)) {
        get().importData(data, 'replace');
    }
  },
  setImportMode: (mode) => set({ importMode: mode }),
  updateSettings: (updates: Partial<AppSettings>) => set((state) => ({ settings: { ...state.settings, ...updates } })),
  toggleTheme: () => set(state => ({ settings: { ...state.settings, theme: state.settings.theme === 'dark' ? 'light' : 'dark' } })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setUtilityPanelVisible: (visible: boolean, mode?: InteractionMode) => {
    if (visible) {
      if (mode) {
        set({ utilityPanelVisible: true, mode });
      } else {
        set({ utilityPanelVisible: true });
      }
    } else {
      set({ utilityPanelVisible: false });
    }
  },
  setUtilityPanelWidth: (width) => set({ utilityPanelWidth: width }),
  setUtilityPanelHeight: (height) => set({ utilityPanelHeight: height }),
  reset: () => set(cleanInitialState),
  // Placeholders that will be overwritten by zundo
  undo: () => {},
  redo: () => {},
});

export const useAppStore = create<AppStore>()(
  temporal(
    persist(
      storeCreator,
      {
        name: 'concept-map-storage',
        partialize: (state) => {
          const { pastStates, futureStates, undo, redo, ...rest } = state;
          return rest;
        },
      }
    )
  )
);