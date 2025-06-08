import cytoscape, { Core, EdgeSingular, NodeSingular, EdgeDefinition, NodeDefinition } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import { NodeData, EdgeData, InteractionMode } from '../stores/appState';

// Register extensions
cytoscape.use(edgehandles);
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

export interface CytoscapeConfig {
  container: HTMLElement;
  elements: {
    nodes: NodeData[];
    edges: EdgeData[];
  };
  mode: InteractionMode;
  theme: 'light' | 'dark';
}

export interface CytoscapeInstance {
  cy: Core;
  edgeHandles: any;
  destroy: () => void;
  updateMode: (mode: InteractionMode) => void;
  updateElements: (elements: { nodes: NodeData[]; edges: EdgeData[] }) => void;
  updateTheme: (theme: 'light' | 'dark') => void;
}

// Default style configuration with valid Cytoscape properties
const getBaseStyle = (theme: 'light' | 'dark'): any => [
  // Node styles
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'color': theme === 'dark' ? '#f8fafc' : '#0f172a',
      'font-size': '12px',
      'font-family': 'system-ui, sans-serif',
      'font-weight': '600',
      'text-outline-width': 2,
      'text-outline-color': theme === 'dark' ? '#1e293b' : '#ffffff',
      'width': 60,
      'height': 60,
      'border-width': 2,
      'border-color': theme === 'dark' ? '#334155' : '#e2e8f0',
      'border-opacity': 0.8,
      'shape': 'ellipse',
    }
  },
  
  // Selected node
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#f97316',
      'border-opacity': 1,
    }
  },

  // Locked node indicator
  {
    selector: 'node[locked="true"]',
    style: {
      'border-style': 'dashed',
    }
  },

  // Connector nodes (smaller, different shape)
  {
    selector: 'node[isConnectorNode="true"]',
    style: {
      'width': 40,
      'height': 40,
      'shape': 'diamond',
      'background-color': theme === 'dark' ? '#64748b' : '#94a3b8',
      'font-size': '10px',
    }
  },

  // Rectangle nodes
  {
    selector: 'node[shape="rectangle"]',
    style: {
      'shape': 'rectangle',
    }
  },

  // Triangle nodes
  {
    selector: 'node[shape="triangle"]',
    style: {
      'shape': 'triangle',
    }
  },

  // Edge styles
  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.2,
      'curve-style': 'bezier',
      'control-point-step-size': 40,
      'edge-text-rotation': 'autorotate',
      'label': 'data(label)',
      'font-size': '10px',
      'font-family': 'system-ui, sans-serif',
      'color': theme === 'dark' ? '#f8fafc' : '#0f172a',
      'text-background-color': theme === 'dark' ? '#1e293b' : '#ffffff',
      'text-background-opacity': 0.8,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle',
    }
  },

  // Selected edge
  {
    selector: 'edge:selected',
    style: {
      'width': 5,
      'line-color': '#f97316',
      'target-arrow-color': '#f97316',
    }
  },
];

// Convert our data format to Cytoscape format
const convertToElements = (nodes: NodeData[], edges: EdgeData[]): (NodeDefinition | EdgeDefinition)[] => {
  const nodeElements: NodeDefinition[] = nodes.map(node => ({
    data: {
      id: node.id,
      label: node.label,
      color: node.color || (node.isConnectorNode ? '#94a3b8' : '#0ea5e9'),
      locked: node.locked?.toString() || 'false',
      isConnectorNode: node.isConnectorNode?.toString() || 'false',
      shape: node.shape || 'ellipse',
      tags: node.tags?.join(',') || '',
    },
    position: node.position,
  }));

  const edgeElements: EdgeDefinition[] = edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      color: edge.color || '#64748b',
      weight: edge.weight || 1,
      length: edge.length || 100,
    },
  }));

  return [...nodeElements, ...edgeElements];
};

export const initCytoscape = (config: CytoscapeConfig): CytoscapeInstance => {
  const { container, elements, mode, theme } = config;

  // Ensure container has proper dimensions
  if (container.offsetWidth === 0 || container.offsetHeight === 0) {
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minHeight = '400px';
  }

  // Initialize Cytoscape
  const cy = cytoscape({
    container,
    elements: convertToElements(elements.nodes, elements.edges),
    style: getBaseStyle(theme),
    layout: {
      name: 'preset',
      padding: 20,
    },
    // Interaction settings
    userPanningEnabled: mode === 'view' || mode === 'analyze',
    userZoomingEnabled: true,
    boxSelectionEnabled: mode === 'manualEdit' || mode === 'paint',
    selectionType: mode === 'paint' ? 'single' : 'additive',
    // Performance settings
    motionBlur: true,
    motionBlurOpacity: 0.2,
    // Remove custom wheel sensitivity to avoid warnings
  });

  // Initialize edge handles for manual editing
  const edgeHandles = cy.edgehandles({
    canConnect: () => true,
    edgeParams: () => ({
      data: {
        color: '#64748b',
      },
    }),
    hoverDelay: 150,
    snap: true,
    snapThreshold: 50,
    snapFrequency: 15,
    noEdgeEventsInDraw: true,
    disableBrowserGestures: true,
    handleSize: 12,
    handleColor: '#0ea5e9',
    handleLineColor: '#0ea5e9',
    handleLineWidth: 2,
    handleNodes: 'node',
    handlePosition: 'middle top',
    edgeType: () => 'flat',
    loopAllowed: () => false,
    nodeLoopOffset: -50,
    complete: (sourceNode: NodeSingular, _targetNode: NodeSingular, addedEdge: EdgeSingular) => {
      // Apply color inheritance logic
      const sourceData = sourceNode.data();
      const isConnectorSource = sourceData.isConnectorNode === 'true';
      
      if (!isConnectorSource && sourceData.color) {
        addedEdge.data('color', sourceData.color);
      }
      
      // Trigger update callback if provided
      cy.trigger('edgeAdded', [addedEdge]);
    },
  });

  // Update mode function
  const updateMode = (newMode: InteractionMode) => {
    // Enable/disable interactions based on mode
    cy.userPanningEnabled(newMode === 'view' || newMode === 'analyze');
    cy.boxSelectionEnabled(newMode === 'manualEdit' || newMode === 'paint');
    
    // Enable/disable edge handles
    if (newMode === 'manualEdit') {
      edgeHandles.enable();
    } else {
      edgeHandles.disable();
    }

    // Update selection type
    if (newMode === 'paint') {
      cy.selectionType('single');
    } else {
      cy.selectionType('additive');
    }

    // Update node dragging
    if (newMode === 'manualEdit' || newMode === 'layout') {
      cy.nodes().ungrabify();
    } else {
      cy.nodes().grabify();
    }
  };

  // Update elements function
  const updateElements = (newElements: { nodes: NodeData[]; edges: EdgeData[] }) => {
    const cytoscapeElements = convertToElements(newElements.nodes, newElements.edges);
    cy.json({ elements: cytoscapeElements });
  };

  // Update theme function
  const updateTheme = (newTheme: 'light' | 'dark') => {
    cy.style(getBaseStyle(newTheme));
  };

  // Set initial mode
  updateMode(mode);

  // Cleanup function
  const destroy = () => {
    if (edgeHandles) {
      edgeHandles.destroy();
    }
    cy.destroy();
  };

  return {
    cy,
    edgeHandles,
    destroy,
    updateMode,
    updateElements,
    updateTheme,
  };
}; 