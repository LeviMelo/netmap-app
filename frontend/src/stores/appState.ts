/**
 * Main Application State Store (Zustand)
 * 
 * This store manages the complete application state including:
 * - Graph elements (nodes and edges)
 * - Layout metadata for different layout modes
 * - Current interaction mode and layout
 * - Snapshots/checkpoints system
 * - App settings and preferences
 * - Edge color inheritance rules and connector node logic
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ===== TYPE DEFINITIONS =====

export type InteractionMode = 
  | 'view' 
  | 'manualEdit' 
  | 'paint' 
  | 'layout' 
  | 'dataIO' 
  | 'analyze'

export type LayoutMode = 
  | 'preset' 
  | 'physics' 
  | 'concentric' 
  | 'dagre' 
  | 'grid'

export interface NodeData {
  id: string
  label: string
  color?: string
  shape?: 'ellipse' | 'rectangle' | 'diamond' | 'triangle'
  tags?: string[]
  locked?: boolean
  isConnectorNode?: boolean // Special flag for connector nodes that don't inherit edge colors
  position?: { x: number; y: number }
}

export interface EdgeData {
  id: string
  source: string
  target: string
  label?: string
  color?: string
  length?: number
  weight?: number
}

export interface LayoutMeta {
  nodePositions?: Record<string, { x: number; y: number }>
  lockedNodes?: string[]
  edgeLengths?: Record<string, number>
  modeParams?: Record<string, any> // Layout-specific parameters
}

export interface Snapshot {
  id: string
  name: string
  timestamp: number
  elements: {
    nodes: NodeData[]
    edges: EdgeData[]
  }
  layouts: Record<LayoutMode, LayoutMeta>
  description?: string
}

export interface AppSettings {
  theme: 'light' | 'dark'
  inputMode: 'auto' | 'mobile' | 'desktop'
  useConnectorNodes: boolean // Whether to use connector nodes instead of edge labels
  canvasLocked: boolean // Whether canvas pan/zoom is locked
  autoSave: boolean
  gridSnapping: boolean
}

export interface AppState {
  // Graph Data
  elements: {
    nodes: NodeData[]
    edges: EdgeData[]
  }
  
  // Layout Management
  layouts: Record<LayoutMode, LayoutMeta>
  currentLayout: LayoutMode
  
  // Interaction State
  mode: InteractionMode
  selectedNodes: string[]
  selectedEdges: string[]
  
  // Paint Mode State
  selectedColor: string
  propagateToEdges: boolean
  
  // Snapshots
  snapshots: Snapshot[]
  
  // App Settings
  settings: AppSettings
  
  // UI State
  sidebarCollapsed: boolean
  utilityPanelVisible: boolean
  utilityPanelWidth: number // Desktop
  utilityPanelHeight: number // Mobile
  
  // Data I/O State
  importMode: 'merge' | 'replace'
  validationErrors: string[]
  
  // ===== ACTIONS =====
  
  // Mode Management
  setMode: (mode: InteractionMode) => void
  setLayout: (layout: LayoutMode) => void
  
  // Graph Element Management
  addNode: (node: Omit<NodeData, 'id'> & { id?: string }) => void
  updateNode: (id: string, updates: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: Omit<EdgeData, 'id'> & { id?: string }) => void
  updateEdge: (id: string, updates: Partial<EdgeData>) => void
  deleteEdge: (id: string) => void
  
  // Selection Management
  selectNode: (id: string, addToSelection?: boolean) => void
  selectEdge: (id: string, addToSelection?: boolean) => void
  clearSelection: () => void
  
  // Layout Management
  saveLayoutMeta: (layout: LayoutMode, meta: LayoutMeta) => void
  applyLayout: (layout: LayoutMode) => void
  lockNode: (id: string) => void
  unlockNode: (id: string) => void
  
  // Paint Mode Actions
  setSelectedColor: (color: string) => void
  setPropagateToEdges: (propagate: boolean) => void
  paintNode: (id: string, color: string) => void
  paintEdge: (id: string, color: string) => void
  
  // Snapshot Management
  saveSnapshot: (name: string, description?: string) => void
  restoreSnapshot: (id: string) => void
  deleteSnapshot: (id: string) => void
  renameSnapshot: (id: string, name: string) => void
  
  // Data I/O Actions
  setImportMode: (mode: 'merge' | 'replace') => void
  validateAndImportData: (data: any) => Promise<boolean>
  exportData: (format: 'json' | 'csv') => any
  
  // Settings Management
  updateSettings: (updates: Partial<AppSettings>) => void
  toggleTheme: () => void
  
  // UI State Management
  toggleSidebar: () => void
  setUtilityPanelVisible: (visible: boolean) => void
  setUtilityPanelWidth: (width: number) => void
  setUtilityPanelHeight: (height: number) => void
  
  // Utility Functions
  reset: () => void
  getNodeById: (id: string) => NodeData | undefined
  getEdgeById: (id: string) => EdgeData | undefined
}

// ===== DEFAULT STATE =====

const defaultState = {
  elements: {
    nodes: [],
    edges: [],
  },
  layouts: {
    preset: {},
    physics: {},
    concentric: {},
    dagre: {},
    grid: {},
  } as Record<LayoutMode, LayoutMeta>,
  currentLayout: 'preset' as LayoutMode,
  mode: 'view' as InteractionMode,
  selectedNodes: [],
  selectedEdges: [],
  selectedColor: '#f59e0b', // Default orange
  propagateToEdges: true,
  snapshots: [],
  settings: {
    theme: 'dark' as const,
    inputMode: 'auto' as const,
    useConnectorNodes: false,
    canvasLocked: false,
    autoSave: true,
    gridSnapping: false,
  },
  sidebarCollapsed: false,
  utilityPanelVisible: false,
  utilityPanelWidth: 300,
  utilityPanelHeight: 300,
  importMode: 'replace' as const,
  validationErrors: [],
}

// ===== STORE IMPLEMENTATION =====

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,
        
        // Mode Management
        setMode: (mode) => set({ mode }),
        setLayout: (layout) => set({ currentLayout: layout }),
        
        // Graph Element Management
        addNode: (nodeData) => {
          const id = nodeData.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const node: NodeData = {
            id,
            label: nodeData.label || id,
            color: nodeData.color || '#cccccc',
            shape: nodeData.shape || 'ellipse',
            tags: nodeData.tags || [],
            locked: false,
            isConnectorNode: nodeData.isConnectorNode || false,
            position: nodeData.position,
          }
          
          set((state) => ({
            elements: {
              ...state.elements,
              nodes: [...state.elements.nodes, node],
            },
          }))
        },
        
        updateNode: (id, updates) => {
          set((state) => ({
            elements: {
              ...state.elements,
              nodes: state.elements.nodes.map((node) =>
                node.id === id ? { ...node, ...updates } : node
              ),
            },
          }))
        },
        
        deleteNode: (id) => {
          set((state) => ({
            elements: {
              nodes: state.elements.nodes.filter((node) => node.id !== id),
              edges: state.elements.edges.filter((edge) => edge.source !== id && edge.target !== id),
            },
            selectedNodes: state.selectedNodes.filter((nodeId) => nodeId !== id),
          }))
        },
        
        addEdge: (edgeData) => {
          const state = get()
          const id = edgeData.id || `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          // Find source node for color inheritance
          const sourceNode = state.elements.nodes.find(n => n.id === edgeData.source)
          let edgeColor = edgeData.color
          
          // Apply color inheritance rule: edges inherit source color unless source is a connector node
          if (!edgeColor && sourceNode && !sourceNode.isConnectorNode) {
            edgeColor = sourceNode.color
          }
          
          const edge: EdgeData = {
            id,
            source: edgeData.source,
            target: edgeData.target,
            label: edgeData.label || '',
            color: edgeColor || '#888888',
            length: edgeData.length || 100,
            weight: edgeData.weight || 1,
          }
          
          set((state) => ({
            elements: {
              ...state.elements,
              edges: [...state.elements.edges, edge],
            },
          }))
        },
        
        updateEdge: (id, updates) => {
          set((state) => ({
            elements: {
              ...state.elements,
              edges: state.elements.edges.map((edge) =>
                edge.id === id ? { ...edge, ...updates } : edge
              ),
            },
          }))
        },
        
        deleteEdge: (id) => {
          set((state) => ({
            elements: {
              ...state.elements,
              edges: state.elements.edges.filter((edge) => edge.id !== id),
            },
            selectedEdges: state.selectedEdges.filter((edgeId) => edgeId !== id),
          }))
        },
        
        // Selection Management
        selectNode: (id, addToSelection = false) => {
          set((state) => ({
            selectedNodes: addToSelection 
              ? [...state.selectedNodes, id]
              : [id],
            selectedEdges: addToSelection ? state.selectedEdges : [],
          }))
        },
        
        selectEdge: (id, addToSelection = false) => {
          set((state) => ({
            selectedEdges: addToSelection 
              ? [...state.selectedEdges, id]
              : [id],
            selectedNodes: addToSelection ? state.selectedNodes : [],
          }))
        },
        
        clearSelection: () => {
          set({ selectedNodes: [], selectedEdges: [] })
        },
        
        // Layout Management
        saveLayoutMeta: (layout, meta) => {
          set((state) => ({
            layouts: {
              ...state.layouts,
              [layout]: meta,
            },
          }))
        },
        
        applyLayout: (layout) => {
          set({ currentLayout: layout })
        },
        
        lockNode: (id) => {
          get().updateNode(id, { locked: true })
        },
        
        unlockNode: (id) => {
          get().updateNode(id, { locked: false })
        },
        
        // Paint Mode Actions
        setSelectedColor: (color) => set({ selectedColor: color }),
        setPropagateToEdges: (propagate) => set({ propagateToEdges: propagate }),
        
        paintNode: (id, color) => {
          const state = get()
          get().updateNode(id, { color })
          
          // If propagateToEdges is enabled and node is not a connector, paint its outgoing edges
          if (state.propagateToEdges) {
            const node = state.elements.nodes.find(n => n.id === id)
            if (node && !node.isConnectorNode) {
              const outgoingEdges = state.elements.edges.filter(edge => edge.source === id)
              outgoingEdges.forEach(edge => {
                get().updateEdge(edge.id, { color })
              })
            }
          }
        },
        
        paintEdge: (id, color) => {
          get().updateEdge(id, { color })
        },
        
        // Snapshot Management
        saveSnapshot: (name, description) => {
          const state = get()
          const snapshot: Snapshot = {
            id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            timestamp: Date.now(),
            elements: structuredClone(state.elements),
            layouts: structuredClone(state.layouts),
            description,
          }
          
          set((state) => ({
            snapshots: [...state.snapshots, snapshot],
          }))
        },
        
        restoreSnapshot: (id) => {
          const state = get()
          const snapshot = state.snapshots.find(s => s.id === id)
          if (snapshot) {
            set({
              elements: structuredClone(snapshot.elements),
              layouts: structuredClone(snapshot.layouts),
              currentLayout: 'preset',
            })
          }
        },
        
        deleteSnapshot: (id) => {
          set((state) => ({
            snapshots: state.snapshots.filter(s => s.id !== id),
          }))
        },
        
        renameSnapshot: (id, name) => {
          set((state) => ({
            snapshots: state.snapshots.map(s => 
              s.id === id ? { ...s, name } : s
            ),
          }))
        },
        
        // Data I/O Actions
        setImportMode: (mode) => set({ importMode: mode }),
        
        validateAndImportData: async (data) => {
          // TODO: Implement comprehensive validation logic
          try {
            if (data.nodes && Array.isArray(data.nodes)) {
              const state = get()
              if (state.importMode === 'replace') {
                set({ elements: { nodes: data.nodes, edges: data.edges || [] } })
              } else {
                // Merge logic - TODO: implement conflict resolution
                set((state) => ({
                  elements: {
                    nodes: [...state.elements.nodes, ...data.nodes],
                    edges: [...state.elements.edges, ...(data.edges || [])],
                  },
                }))
              }
              return true
            }
            return false
          } catch (error) {
            console.error('Import error:', error)
            return false
          }
        },
        
        exportData: (format) => {
          const state = get()
          if (format === 'json') {
            return {
              elements: state.elements,
              layouts: state.layouts,
              snapshots: state.snapshots,
              settings: state.settings,
            }
          }
          // TODO: Implement CSV export
          return null
        },
        
        // Settings Management
        updateSettings: (updates) => {
          set((state) => ({
            settings: { ...state.settings, ...updates },
          }))
        },
        
        toggleTheme: () => {
          const state = get()
          const newTheme = state.settings.theme === 'light' ? 'dark' : 'light'
          get().updateSettings({ theme: newTheme })
          
          // Update document class for CSS
          const html = document.documentElement
          html.classList.toggle('dark', newTheme === 'dark')
        },
        
        // UI State Management
        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
        },
        
        setUtilityPanelVisible: (visible) => set({ utilityPanelVisible: visible }),
        setUtilityPanelWidth: (width) => set({ utilityPanelWidth: width }),
        setUtilityPanelHeight: (height) => set({ utilityPanelHeight: height }),
        
        // Utility Functions
        reset: () => set(defaultState),
        
        getNodeById: (id) => {
          const state = get()
          return state.elements.nodes.find(node => node.id === id)
        },
        
        getEdgeById: (id) => {
          const state = get()
          return state.elements.edges.find(edge => edge.id === id)
        },
      }),
      {
        name: 'concept-map-app-state',
        partialize: (state) => ({
          elements: state.elements,
          layouts: state.layouts,
          snapshots: state.snapshots,
          settings: state.settings,
        }),
      }
    ),
    {
      name: 'concept-map-builder',
    }
  )
) 