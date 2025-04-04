// frontend/src/types/graph.ts
import cytoscape from 'cytoscape';

// --- Basic Element Types ---
export type GraphNodeData = {
  id: string;
  label?: string;
  color?: string;
  _savedPos?: cytoscape.Position;
};
export type GraphEdgeData = {
  id?: string;
  source: string;
  target: string;
  label?: string;
  edgeColor?: string;
};
export type GraphNode = { group: 'nodes'; data: GraphNodeData; position?: cytoscape.Position; };
export type GraphEdge = { group: 'edges'; data: GraphEdgeData; };
export type GraphElement = GraphNode | GraphEdge;
export type GraphElements = { nodes: GraphNode[]; edges: GraphEdge[]; };

// --- Layout Related Types (For Application State) ---
export type LayoutName = 'cola' | 'grid' | 'circle' | 'concentric' | 'breadthfirst' | 'preset';
export interface BaseAppLayoutOptions { name: LayoutName; animate?: boolean; fit?: boolean; padding?: number; }
export interface ColaAppLayoutOptions extends BaseAppLayoutOptions { name: 'cola'; nodeSpacing?: number; edgeLengthVal?: number; gravity?: number; infinite?: boolean; avoidOverlap?: boolean; nodeDimensionsIncludeLabels?: boolean; }
export interface ConcentricAppLayoutOptions extends BaseAppLayoutOptions { name: 'concentric'; nodeSpacing?: number; }
export interface BreadthfirstAppLayoutOptions extends BaseAppLayoutOptions { name: 'breadthfirst'; nodeSpacing?: number; directed?: boolean; grid?: boolean; }
export interface PresetAppLayoutOptions extends BaseAppLayoutOptions { name: 'preset'; }
export interface GridCircleAppLayoutOptions extends BaseAppLayoutOptions { name: 'grid' | 'circle'; }
export type AppLayoutOptions = | ColaAppLayoutOptions | ConcentricAppLayoutOptions | BreadthfirstAppLayoutOptions | PresetAppLayoutOptions | GridCircleAppLayoutOptions;

// --- Style Related Types ---
export interface StyleOptions { nodeFontSize: number; nodeOutlineWidth: number; nodePadding: number; edgeWidth: number; edgeFontSize: number; edgeOutlineWidth: number; }

// --- Interaction Related Types ---
export type ConstructorTool = 'select' | 'edge' | 'drag' | 'delete' | 'pan';

// --- Analysis Related Types ---
export type AnalysisResults = { validation?: { errors?: any[]; warnings?: any[]; duplicate_directed?: any[]; unreferenced_nodes?: string[]; } | null; original_graph_metrics?: { [key: string]: any } | null; structure?: { chains?: string[][]; cycles?: string[][]; longest_chain_length?: number; longest_cycle_length?: number; error?: string; } | null; embedding_analysis?: { sentence_transformer?: { num_nodes_embedded?: number; metrics_vs_threshold?: { thresholds?: number[]; density?: number[]; clustering?: number[]; avg_degree?: number[]; num_components?: number[]; } | null; proposed_edges?: any[]; heatmap_data?: { matrix?: number[][]; ids?: string[]; labels?: string[]; error?: string; } | null; } | null; node2vec?: { num_nodes_embedded?: number; comparison_correlation?: number | string | null; } | null; umap_layout?: { [nodeId: string]: { x: number; y: number } } | null | {error?: string}; error?: string; } | null; error?: string; } | null;