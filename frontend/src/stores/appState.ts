/**
 * Comprehensive Application State Management
 * 
 * This Zustand store manages the entire application state including:
 * - Graph elements (nodes and edges)
 * - Layout management and snapshots
 * - Interaction modes and UI state
 * - Settings and persistence
 * - Color inheritance logic for edges
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

// ===== HELPER FUNCTIONS =====

// Generate unique ID
const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Apply edge color inheritance logic
const applyEdgeColorInheritance = (sourceNodeId: string, nodes: NodeData[]): string | undefined => {
  const sourceNode = nodes.find(n => n.id === sourceNodeId)
  if (!sourceNode || sourceNode.isConnectorNode) {
    return undefined // No inheritance for connector nodes
  }
  return sourceNode.color
}

// Default layout metadata
const getDefaultLayoutMeta = (): LayoutMeta => ({
  nodePositions: {},
  lockedNodes: [],
  edgeLengths: {},
  modeParams: {}
})

// ===== STORE IMPLEMENTATION =====

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ===== INITIAL STATE =====
      elements: {
        nodes: [],
        edges: []
      },
      
      layouts: {
        preset: getDefaultLayoutMeta(),
        physics: getDefaultLayoutMeta(),
        concentric: getDefaultLayoutMeta(),
        dagre: getDefaultLayoutMeta(),
        grid: getDefaultLayoutMeta()
      },
      currentLayout: 'preset',
      
      mode: 'view',
      selectedNodes: [],
      selectedEdges: [],
      
      selectedColor: '#0ea5e9',
      propagateToEdges: true,
      
      snapshots: [],
      
      settings: {
        theme: 'dark',
        inputMode: 'auto',
        useConnectorNodes: false,
        canvasLocked: false,
        autoSave: true,
        gridSnapping: false
      },
      
      sidebarCollapsed: false,
      utilityPanelVisible: false,
      utilityPanelWidth: 320,
      utilityPanelHeight: 300,
      
      importMode: 'replace',
      validationErrors: [],

      // ===== MODE MANAGEMENT =====
      setMode: (mode) => set({ mode }),
      setLayout: (layout) => set({ currentLayout: layout }),

      // ===== GRAPH ELEMENT MANAGEMENT =====
      addNode: (nodeInput) => set((state) => {
        const id = nodeInput.id || generateId('node')
        const newNode: NodeData = {
          id,
          label: nodeInput.label || `Node ${id}`,
          color: nodeInput.color || '#0ea5e9',
          shape: nodeInput.shape || 'ellipse',
          tags: nodeInput.tags || [],
          locked: nodeInput.locked || false,
          isConnectorNode: nodeInput.isConnectorNode || false,
          position: nodeInput.position || { x: Math.random() * 400, y: Math.random() * 400 }
        }
        
        return {
          elements: {
            ...state.elements,
            nodes: [...state.elements.nodes, newNode]
          }
        }
      }),

      updateNode: (id, updates) => set((state) => {
        const updatedNodes = state.elements.nodes.map(node =>
          node.id === id ? { ...node, ...updates } : node
        )
        
        // If color changed and node is not a connector, update outgoing edges
        if (updates.color && !state.elements.nodes.find(n => n.id === id)?.isConnectorNode) {
          const updatedEdges = state.elements.edges.map(edge =>
            edge.source === id ? { ...edge, color: updates.color } : edge
          )
          
          return {
            elements: {
              nodes: updatedNodes,
              edges: updatedEdges
            }
          }
        }
        
        return {
          elements: {
            ...state.elements,
            nodes: updatedNodes
          }
        }
      }),

      deleteNode: (id) => set((state) => ({
        elements: {
          nodes: state.elements.nodes.filter(node => node.id !== id),
          edges: state.elements.edges.filter(edge => 
            edge.source !== id && edge.target !== id
          )
        },
        selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id)
      })),

      addEdge: (edgeInput) => set((state) => {
        const id = edgeInput.id || generateId('edge')
        
        // Apply color inheritance if no color specified
        const inheritedColor = edgeInput.color || 
          applyEdgeColorInheritance(edgeInput.source, state.elements.nodes) ||
          '#64748b'
        
        const newEdge: EdgeData = {
          id,
          source: edgeInput.source,
          target: edgeInput.target,
          label: edgeInput.label || '',
          color: inheritedColor,
          length: edgeInput.length || 100,
          weight: edgeInput.weight || 1
        }
        
        return {
          elements: {
            ...state.elements,
            edges: [...state.elements.edges, newEdge]
          }
        }
      }),

      updateEdge: (id, updates) => set((state) => ({
        elements: {
          ...state.elements,
          edges: state.elements.edges.map(edge =>
            edge.id === id ? { ...edge, ...updates } : edge
          )
        }
      })),

      deleteEdge: (id) => set((state) => ({
        elements: {
          ...state.elements,
          edges: state.elements.edges.filter(edge => edge.id !== id)
        },
        selectedEdges: state.selectedEdges.filter(edgeId => edgeId !== id)
      })),

      // ===== SELECTION MANAGEMENT =====
      selectNode: (id, addToSelection = false) => set((state) => ({
        selectedNodes: addToSelection 
          ? state.selectedNodes.includes(id)
            ? state.selectedNodes.filter(nodeId => nodeId !== id)
            : [...state.selectedNodes, id]
          : [id],
        selectedEdges: addToSelection ? state.selectedEdges : []
      })),

      selectEdge: (id, addToSelection = false) => set((state) => ({
        selectedEdges: addToSelection
          ? state.selectedEdges.includes(id)
            ? state.selectedEdges.filter(edgeId => edgeId !== id)
            : [...state.selectedEdges, id]
          : [id],
        selectedNodes: addToSelection ? state.selectedNodes : []
      })),

      clearSelection: () => set({
        selectedNodes: [],
        selectedEdges: []
      }),

      // ===== LAYOUT MANAGEMENT =====
      saveLayoutMeta: (layout, meta) => set((state) => ({
        layouts: {
          ...state.layouts,
          [layout]: meta
        }
      })),

      applyLayout: (layout) => set((_state) => {
        // This would trigger layout in the UI component
        return { currentLayout: layout }
      }),

      lockNode: (id) => set((state) => ({
        elements: {
          ...state.elements,
          nodes: state.elements.nodes.map(node =>
            node.id === id ? { ...node, locked: true } : node
          )
        }
      })),

      unlockNode: (id) => set((state) => ({
        elements: {
          ...state.elements,
          nodes: state.elements.nodes.map(node =>
            node.id === id ? { ...node, locked: false } : node
          )
        }
      })),

      // ===== PAINT MODE ACTIONS =====
      setSelectedColor: (color) => set({ selectedColor: color }),
      setPropagateToEdges: (propagate) => set({ propagateToEdges: propagate }),

      paintNode: (id, color) => set((state) => {
        const updatedNodes = state.elements.nodes.map(node =>
          node.id === id ? { ...node, color } : node
        )
        
        // Apply to outgoing edges if propagation enabled and not connector node
        let updatedEdges = state.elements.edges
        if (state.propagateToEdges) {
          const node = state.elements.nodes.find(n => n.id === id)
          if (node && !node.isConnectorNode) {
            updatedEdges = state.elements.edges.map(edge =>
              edge.source === id ? { ...edge, color } : edge
            )
          }
        }
        
        return {
          elements: {
            nodes: updatedNodes,
            edges: updatedEdges
          }
        }
      }),

      paintEdge: (id, color) => set((state) => ({
        elements: {
          ...state.elements,
          edges: state.elements.edges.map(edge =>
            edge.id === id ? { ...edge, color } : edge
          )
        }
      })),

      // ===== SNAPSHOT MANAGEMENT =====
      saveSnapshot: (name, description) => set((state) => {
        const snapshot: Snapshot = {
          id: generateId('snapshot'),
          name,
          description,
          timestamp: Date.now(),
          elements: {
            nodes: [...state.elements.nodes],
            edges: [...state.elements.edges]
          },
          layouts: { ...state.layouts }
        }
        
        return {
          snapshots: [...state.snapshots, snapshot]
        }
      }),

      restoreSnapshot: (id) => set((state) => {
        const snapshot = state.snapshots.find(s => s.id === id)
        if (!snapshot) return state
        
        return {
          elements: snapshot.elements,
          layouts: snapshot.layouts,
          currentLayout: 'preset'
        }
      }),

      deleteSnapshot: (id) => set((state) => ({
        snapshots: state.snapshots.filter(s => s.id !== id)
      })),

      renameSnapshot: (id, name) => set((state) => ({
        snapshots: state.snapshots.map(s =>
          s.id === id ? { ...s, name } : s
        )
      })),

      // ===== DATA I/O ACTIONS =====
      setImportMode: (mode) => set({ importMode: mode }),

      validateAndImportData: async (data) => {
        // Basic validation - could be enhanced
        try {
          if (!data || typeof data !== 'object') {
            set({ validationErrors: ['Invalid data format'] })
            return false
          }
          
          const { nodes = [], edges = [] } = data
          
          // Validate nodes
          const nodeErrors: string[] = []
          nodes.forEach((node: any, index: number) => {
            if (!node.id || !node.label) {
              nodeErrors.push(`Node ${index}: Missing id or label`)
            }
          })
          
          // Validate edges
          const edgeErrors: string[] = []
          const nodeIds = new Set(nodes.map((n: any) => n.id))
          edges.forEach((edge: any, index: number) => {
            if (!edge.source || !edge.target) {
              edgeErrors.push(`Edge ${index}: Missing source or target`)
            } else if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
              edgeErrors.push(`Edge ${index}: References non-existent nodes`)
            }
          })
          
          const allErrors = [...nodeErrors, ...edgeErrors]
          
          if (allErrors.length > 0) {
            set({ validationErrors: allErrors })
            return false
          }
          
          // Import data
          const state = get()
          if (state.importMode === 'replace') {
            set({
              elements: { nodes, edges },
              validationErrors: []
            })
          } else {
            // Merge mode
            const existingNodeIds = new Set(state.elements.nodes.map(n => n.id))
            const existingEdgeIds = new Set(state.elements.edges.map(e => e.id))
            
            const newNodes = nodes.filter((n: any) => !existingNodeIds.has(n.id))
            const newEdges = edges.filter((e: any) => !existingEdgeIds.has(e.id))
            
            set({
              elements: {
                nodes: [...state.elements.nodes, ...newNodes],
                edges: [...state.elements.edges, ...newEdges]
              },
              validationErrors: []
            })
          }
          
          return true
        } catch (error) {
          set({ validationErrors: ['Failed to parse data'] })
          return false
        }
      },

      exportData: (format) => {
        const state = get()
        
        if (format === 'json') {
          return {
            nodes: state.elements.nodes,
            edges: state.elements.edges,
            layouts: state.layouts,
            snapshots: state.snapshots
          }
        } else if (format === 'csv') {
          // Return CSV data structure
          return {
            nodes: state.elements.nodes,
            edges: state.elements.edges
          }
        }
        
        return null
      },

      // ===== SETTINGS MANAGEMENT =====
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      toggleTheme: () => set((state) => ({
        settings: {
          ...state.settings,
          theme: state.settings.theme === 'light' ? 'dark' : 'light'
        }
      })),

      // ===== UI STATE MANAGEMENT =====
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),

      setUtilityPanelVisible: (visible) => set({ utilityPanelVisible: visible }),
      setUtilityPanelWidth: (width) => set({ utilityPanelWidth: width }),
      setUtilityPanelHeight: (height) => set({ utilityPanelHeight: height }),

      // ===== UTILITY FUNCTIONS =====
      reset: () => set({
        elements: { nodes: [], edges: [] },
        selectedNodes: [],
        selectedEdges: [],
        snapshots: [],
        mode: 'view',
        currentLayout: 'preset',
        validationErrors: []
      }),

      getNodeById: (id) => {
        const state = get()
        return state.elements.nodes.find(node => node.id === id)
      },

      getEdgeById: (id) => {
        const state = get()
        return state.elements.edges.find(edge => edge.id === id)
      }
    }),
    {
      name: 'concept-map-app-state',
      partialize: (state) => ({
        elements: state.elements,
        layouts: state.layouts,
        snapshots: state.snapshots,
        settings: state.settings,
        sidebarCollapsed: state.sidebarCollapsed,
        utilityPanelWidth: state.utilityPanelWidth,
        utilityPanelHeight: state.utilityPanelHeight
      })
    }
  )
) 