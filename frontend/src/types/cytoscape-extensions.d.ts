declare module 'cytoscape-edgehandles' {
  import { Core, NodeSingular, EdgeSingular } from 'cytoscape';
  
  interface EdgeHandlesOptions {
    canConnect?: (sourceNode: NodeSingular, targetNode: NodeSingular) => boolean;
    edgeParams?: (sourceNode: NodeSingular, targetNode: NodeSingular) => any;
    hoverDelay?: number;
    snap?: boolean;
    snapThreshold?: number;
    snapFrequency?: number;
    noEdgeEventsInDraw?: boolean;
    disableBrowserGestures?: boolean;
    handleSize?: number;
    handleColor?: string;
    handleLineColor?: string;
    handleLineWidth?: number;
    handleNodes?: string;
    handlePosition?: string;
    edgeType?: (sourceNode: NodeSingular, targetNode: NodeSingular) => string;
    loopAllowed?: (node: NodeSingular) => boolean;
    nodeLoopOffset?: number;
    complete?: (sourceNode: NodeSingular, targetNode: NodeSingular, addedEdge: EdgeSingular) => void;
  }

  interface EdgeHandlesApi {
    enable(): void;
    disable(): void;
    destroy(): void;
  }

  declare module 'cytoscape' {
    interface Core {
      edgehandles(options?: EdgeHandlesOptions): EdgeHandlesApi;
    }
  }

  const extension: (cytoscape: any) => void;
  export = extension;
}

declare module 'cytoscape-dagre' {
  const extension: (cytoscape: any) => void;
  export = extension;
}

declare module 'cytoscape-cose-bilkent' {
  const extension: (cytoscape: any) => void;
  export = extension;
}

// ADDED: Type definition for cytoscape-cola
declare module 'cytoscape-cola' {
  const extension: (cytoscape: any) => void;
  export = extension;
}