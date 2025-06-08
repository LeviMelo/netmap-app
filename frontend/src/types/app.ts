/**
 * Type Definitions for Netmap Application
 *
 * This file contains all the core data structures, type aliases,
 * and interface definitions used throughout the application.
 * It serves as the single source of truth for the application's data model.
 *
 * UPDATED:
 * - Added all missing actions to AppActions to match the implementation in appState.ts.
 * - Added optional `pastStates` and `futureStates` to AppState to work correctly with zundo middleware.
 */

// ===== CORE DATA STRUCTURES =====
export type InteractionMode =
  | 'view'
  | 'manualEdit'
  | 'paint'
  | 'layout'
  | 'dataIO'
  | 'analyze';

export type LayoutMode =
  | 'preset'
  | 'cola'
  | 'dagre'
  | 'concentric'
  | 'grid';

export interface NodeData {
  id: string;
  label: string;
  color?: string;
  shape?: 'ellipse' | 'rectangle' | 'diamond' | 'triangle';
  tags?: string[];
  locked?: boolean;
  isConnectorNode?: boolean;
  position?: { x: number; y: number };
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
  length?: number;
  weight?: number;
}

// ===== LAYOUT & SETTINGS =====

export interface LayoutMeta {
  nodePositions?: Record<string, { x: number; y: number }>;
  lockedNodes?: string[];
  edgeLengths?: Record<string, number>;
  modeParams?: Record<string, any>;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  inputMode: 'auto' | 'mobile' | 'desktop';
  useConnectorNodes: boolean;
  canvasLocked: boolean;
  autoSave: boolean;
  gridSnapping: boolean;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  elements: {
    nodes: NodeData[];
    edges: EdgeData[];
  };
  layouts: Record<string, LayoutMeta>;
  description?: string;
}

// ===== LAYOUT CONFIGURATIONS =====

export interface ColaLayoutConfig {
  name: 'cola';
  animate: boolean;
  padding: number;
  nodeSpacing: number;
  edgeLength: number;
  infinite: boolean;
}

export interface DagreLayoutConfig {
  name: 'dagre';
  nodeSep: number;
  rankSep: number;
  rankDir: 'TB' | 'LR' | 'BT' | 'RL';
  padding: number;
}

export interface ConcentricLayoutConfig {
  name: 'concentric';
  padding: number;
  startAngle: number;
  sweep: number | undefined;
  clockwise: boolean;
  equidistant: boolean;
  minNodeSpacing: number;
}

export interface GridLayoutConfig {
  name: 'grid';
  padding: number;
  rows: number | undefined;
  cols: number | undefined;
}

export interface LayoutConfigs {
  cola: ColaLayoutConfig;
  dagre: DagreLayoutConfig;
  concentric: ConcentricLayoutConfig;
  grid: GridLayoutConfig;
}

// ===== ZUSTAND STORE DEFINITIONS =====

export interface AppState {
  // Graph Data
  elements: {
    nodes: NodeData[];
    edges: EdgeData[];
  };

  // Layout Management
  layouts: Record<string, LayoutMeta>;
  currentLayout: LayoutMode;
  layoutConfigs: LayoutConfigs;

  // Interaction State
  mode: InteractionMode;
  selectedNodes: string[];
  selectedEdges: string[];

  // Paint Mode State
  selectedColor: string;
  propagateToEdges: boolean;

  // Snapshots
  snapshots: Snapshot[];

  // App Settings
  settings: AppSettings;

  // UI State
  sidebarCollapsed: boolean;
  utilityPanelVisible: boolean;
  utilityPanelWidth: number;
  utilityPanelHeight: number;

  // Data I/O State
  importMode: 'merge' | 'replace';
  validationErrors: any[];
  
  // Temporal State (Injected by zundo)
  pastStates: Partial<AppState>[];
  futureStates: Partial<AppState>[];
}

export interface AppActions {
  // Mode Management
  setMode: (mode: InteractionMode) => void;
  setLayout: (layout: LayoutMode) => void;
  updateLayoutConfig: <K extends keyof LayoutConfigs>(
    layout: K,
    config: Partial<LayoutConfigs[K]>
  ) => void;

  // Graph Element Management
  addNode: (node: Omit<NodeData, 'id'> & { id?: string }) => NodeData;
  updateNode: (id: string, updates: Partial<Omit<NodeData, 'id'>>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  getNodeById: (id: string) => NodeData | undefined;
  lockNode: (id: string) => void;
  unlockNode: (id: string) => void;

  addEdge: (edge: Omit<EdgeData, 'id'> & { id?: string }) => EdgeData;
  updateEdge: (id: string, updates: Partial<Omit<EdgeData, 'id'>>) => void;
  deleteEdge: (id: string) => void;
  deleteEdges: (ids: string[]) => void;
  getEdgeById: (id: string) => EdgeData | undefined;

  // Selection Management
  selectNode: (id: string, addToSelection?: boolean) => void;
  selectEdge: (id: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  
  // Paint Mode Actions
  setSelectedColor: (color: string) => void;
  setPropagateToEdges: (propagate: boolean) => void;
  paintNode: (id: string, color?: string) => void;
  paintEdge: (id: string, color?: string) => void;

  // Snapshot Management
  saveSnapshot: (name: string, description?: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;

  // Data I/O Actions
  importData: (
    data: { nodes: NodeData[]; edges: EdgeData[] },
    mode?: 'merge' | 'replace'
  ) => void;
  validateAndImportData: (data: { nodes: any[]; edges: any[] }) => void;
  setImportMode: (mode: 'merge' | 'replace') => void;

  // Settings Management
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // UI State Management
  toggleSidebar: () => void;
  setUtilityPanelVisible: (visible: boolean, mode?: InteractionMode) => void;
  setUtilityPanelWidth: (width: number) => void;
  setUtilityPanelHeight: (height: number) => void;

  // Store-wide Actions
  reset: () => void;

  // Temporal (Undo/Redo) Actions - Injected by zundo
  undo: () => void;
  redo: () => void;
}

export type AppStore = AppState & AppActions;