/**
 * Cytoscape Initialization and Management
 *
 * This file handles the setup, configuration, and lifecycle of the
 * Cytoscape.js instance. It includes style definitions, element
 * conversion, and an instance manager that exposes functions to
 * update the graph's mode, elements, theme, and apply layouts.
 */
import cytoscape, { Core, EdgeSingular, NodeSingular, EdgeDefinition, NodeDefinition, LayoutOptions } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import dagre from 'cytoscape-dagre';
import cola from 'cytoscape-cola'; // Physics-based layout
import { NodeData, EdgeData, InteractionMode } from '../types/app';

// Register extensions
cytoscape.use(edgehandles);
cytoscape.use(dagre);
cytoscape.use(cola);

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
  applyLayout: (config: LayoutOptions) => void;
}

const getCursorForMode = (mode: InteractionMode): string => {
  switch (mode) {
    case 'manualEdit':
    case 'paint':
      return 'crosshair';
    case 'view':
    case 'layout':
    case 'analyze':
      return 'grab';
    default:
      return 'default';
  }
};

const getBaseStyle = (theme: 'light' | 'dark'): any[] => [
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
      'font-weight': 600,
      'text-outline-width': 2,
      'text-outline-color': theme === 'dark' ? '#1e293b' : '#ffffff',
      'width': 60,
      'height': 60,
      'border-width': 2,
      'border-color': theme === 'dark' ? '#334155' : '#e2e8f0',
      'shape': 'ellipse',
      'transition-property': 'background-color, border-color',
      'transition-duration': 0.3,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#f97316',
    },
  },
  {
    selector: 'node[locked="true"]',
    style: {
      'border-style': 'dashed',
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 1.2,
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '10px',
      'color': theme === 'dark' ? '#f8fafc' : '#0f172a',
      'text-background-color': theme === 'dark' ? '#1e293b' : '#ffffff',
      'text-background-opacity': 0.8,
      'transition-property': 'line-color, target-arrow-color',
      'transition-duration': 0.3,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'width': 5,
      'line-color': '#f97316',
      'target-arrow-color': '#f97316',
    },
  },
];

const convertToElements = (nodes: NodeData[], edges: EdgeData[]): (NodeDefinition | EdgeDefinition)[] => {
  const nodeElements: NodeDefinition[] = nodes.map(node => ({
    data: {
      id: node.id,
      label: node.label,
      color: node.color,
      locked: node.locked,
    },
    position: node.position,
    grabbable: true,
    selectable: true,
  }));

  const edgeElements: EdgeDefinition[] = edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      color: edge.color,
    },
    selectable: true,
  }));

  return [...nodeElements, ...edgeElements];
};

export const initCytoscape = (config: CytoscapeConfig): CytoscapeInstance => {
  const { container, elements, mode, theme } = config;

  const cy = cytoscape({
    container,
    elements: convertToElements(elements.nodes, elements.edges),
    style: getBaseStyle(theme),
    layout: { name: 'preset' },
    userZoomingEnabled: true,
    boxSelectionEnabled: true,
  });

  const edgeHandles = cy.edgehandles({
    handleSize: 12,
    handleColor: '#0ea5e9',
    edgeType: () => 'flat',
    complete: (_sourceNode: NodeSingular, _targetNode: NodeSingular, addedEdge: EdgeSingular) => {
      cy.trigger('edgeAdded', [addedEdge]);
    },
  });

  const updateMode = (newMode: InteractionMode) => {
    cy.scratch('mode', newMode);
    container.style.cursor = getCursorForMode(newMode);

    if (newMode === 'manualEdit') {
      edgeHandles.enable();
    } else {
      edgeHandles.disable();
    }
    
    if (newMode === 'manualEdit' || newMode === 'layout') {
      cy.nodes().grabify();
    } else {
      cy.nodes().ungrabify();
    }

    if (newMode === 'view' || newMode === 'analyze') {
        cy.userPanningEnabled(true);
    } else {
        cy.userPanningEnabled(false);
    }
  };

  const updateElements = (newElements: { nodes: NodeData[]; edges: EdgeData[] }) => {
    const cytoscapeElements = convertToElements(newElements.nodes, newElements.edges);
    cy.json({ elements: cytoscapeElements });
    updateMode(cy.scratch('mode') || 'view');
  };

  const updateTheme = (newTheme: 'light' | 'dark') => {
    cy.style(getBaseStyle(newTheme));
  };
  
  const applyLayout = (layoutConfig: LayoutOptions) => {
    if (cy.nodes().length > 0) {
      cy.layout(layoutConfig).run();
    }
  };

  const destroy = () => {
    edgeHandles.destroy();
    cy.destroy();
  };

  updateMode(mode);

  return {
    cy,
    edgeHandles,
    destroy,
    updateMode,
    updateElements,
    updateTheme,
    applyLayout,
  };
}; 