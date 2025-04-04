// frontend/src/hooks/useCytoscape.tsx
import { useRef, useEffect, useCallback } from 'react';
import cytoscape, {
  Core,
  LayoutOptions as CyLayoutOptions,
  NodeSingular,
  Position,
  ElementDefinition,
} from 'cytoscape';
import cola from 'cytoscape-cola';
import {
  ConstructorTool,
  GraphNodeData,
  GraphEdgeData,
  GraphElement,
  GraphNode,
  GraphEdge,
} from '@/types/graph';

cytoscape.use(cola);

interface UseCytoscapeProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  elements: GraphElement[];
  style: cytoscape.StylesheetStyle[];
  layout: CyLayoutOptions;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  initialPan?: Position;
  isConstructorMode: boolean;
  activeTool: ConstructorTool;
  onGraphUpdate: (elements: GraphElement[]) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onEdgeSelect?: (edgeId: string | null) => void;
  onCanvasTap?: (position: Position) => void;
  onNodeTap?: (nodeId: string) => void;
  onEdgeTap?: (edgeId: string) => void;
  onNodeDblTap?: (nodeId: string) => void;
  onEdgeDblTap?: (edgeId: string) => void;
  onNodeCtx?: (nodeId: string, position: Position) => void;
  requestEdgeCreation?: (sourceId: string, targetId: string) => void;
  updateNodePosition?: (nodeId: string, position: Position) => void;
}

export const useCytoscape = ({
  containerRef,
  elements,
  style,
  layout,
  minZoom,
  maxZoom,
  initialZoom,
  initialPan,
  isConstructorMode,
  activeTool,
  onGraphUpdate,
  onNodeSelect,
  onEdgeSelect,
  onCanvasTap,
  onNodeTap,
  onEdgeTap,
  onNodeDblTap,
  onEdgeDblTap,
  onNodeCtx,
  requestEdgeCreation,
  updateNodePosition,
}: UseCytoscapeProps) => {
  const cyRef = useRef<Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const edgeSourceNodeRef = useRef<NodeSingular | null>(null);

  // Runs the layout; if "preset", it uses saved positions from current elements.
  const runLayout = useCallback(
    (layoutOverride?: CyLayoutOptions) => {
      const cy = cyRef.current;
      if (!cy || cy.nodes().length === 0) return;
      layoutRef.current?.stop();
      const optionsToRun = { ...(layoutOverride || layout) };
      if (optionsToRun.name === 'preset') {
        (optionsToRun as any).positions = (n: NodeSingular): Position | undefined => {
          const nodeState = elements.find(
            (el) => el.group === 'nodes' && el.data.id === n.id()
          ) as GraphNode | undefined;
          return nodeState?.position;
        };
      }
      layoutRef.current = cy.layout(optionsToRun);
      layoutRef.current
        .run()
        .promiseOn('layoutstop')
        .then(() => {
          if (updateNodePosition && optionsToRun.name !== 'preset') {
            cy.nodes().forEach((n) => updateNodePosition(n.id(), n.position()));
          }
        });
    },
    [layout, elements, updateNodePosition]
  );

  // Trigger a graph update by reading all elements from Cytoscape.
  const triggerGraphUpdate = useCallback(() => {
    if (cyRef.current) {
      const currentElements: GraphElement[] = cyRef.current.elements().map((el) => {
        const json = el.json();
        const elDef = json as ElementDefinition;
        if (el.isNode && el.isNode()) {
          const data = elDef.data as Partial<GraphNodeData>;
          return {
            group: 'nodes',
            data: { id: data.id!, label: data.label, color: data.color, _savedPos: data._savedPos },
            position: el.position(),
          } as GraphNode;
        } else {
          const edge = el as cytoscape.EdgeSingular;
          const data = elDef.data as Partial<GraphEdgeData>;
          return {
            group: 'edges',
            data: {
              id: edge.id(),
              source: edge.source().id(),
              target: edge.target().id(),
              label: data.label,
              edgeColor: data.edgeColor,
            },
          } as GraphEdge;
        }
      });
      onGraphUpdate(currentElements);
    }
  }, [onGraphUpdate]);

  // Set up Cytoscape event listeners.
  const setupEventListeners = useCallback(
    (cy: Core) => {
      cy.removeAllListeners();

      // Tap events on canvas, node, or edge.
      cy.on('tap', (event) => {
        if (event.target === cy) {
          onCanvasTap?.(event.position);
          onNodeSelect?.(null);
          onEdgeSelect?.(null);
        } else if (event.target.isNode && event.target.isNode()) {
          if (onNodeTap) onNodeTap(event.target.id());
          onNodeSelect?.(event.target.id());
        } else if (event.target.isEdge && event.target.isEdge()) {
          if (onEdgeTap) onEdgeTap(event.target.id());
          onEdgeSelect?.(event.target.id());
        }
      });

      // Double tap events.
      cy.on('dbltap', (event) => {
        if (event.target === cy) return;
        else if (event.target.isNode && event.target.isNode()) {
          onNodeDblTap?.(event.target.id());
        } else if (event.target.isEdge && event.target.isEdge()) {
          onEdgeDblTap?.(event.target.id());
        }
      });

      // Context tap events on nodes.
      cy.on('cxttap', 'node', (event) => {
        if (event.target.isNode && event.target.isNode() && onNodeCtx) {
          onNodeCtx(event.target.id(), event.position);
        }
      });

      // Edge creation: record source node on mousedown.
      cy.on('mousedown', 'node', (event) => {
        if (event.target.isNode && event.target.isNode()) {
          edgeSourceNodeRef.current = event.target;
        }
      });

      // On mouseup, if releasing on a different node, create an edge.
      cy.on('mouseup', (event) => {
        if (edgeSourceNodeRef.current && event.target.isNode && event.target.isNode()) {
          if (edgeSourceNodeRef.current.id() !== event.target.id() && requestEdgeCreation) {
            requestEdgeCreation(edgeSourceNodeRef.current.id(), event.target.id());
          }
          edgeSourceNodeRef.current = null;
        }
      });

      // On node drag end, update node position and trigger a graph update.
      cy.on('dragfreeon', 'node', (event) => {
        if (event.target.isNode && event.target.isNode()) {
          if (activeTool === 'drag' || !isConstructorMode) {
            updateNodePosition && updateNodePosition(event.target.id(), event.target.position());
          }
          triggerGraphUpdate();
        }
      });
    },
    [
      isConstructorMode,
      activeTool,
      onCanvasTap,
      onNodeTap,
      onEdgeTap,
      onNodeDblTap,
      onEdgeDblTap,
      onNodeCtx,
      onNodeSelect,
      onEdgeSelect,
      requestEdgeCreation,
      updateNodePosition,
      triggerGraphUpdate,
    ]
  );

  // Initialization useEffect.
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;
    const currentContainer = containerRef.current;
    const cyInstance = cytoscape({
      container: currentContainer,
      elements: JSON.parse(JSON.stringify(elements)),
      style: style,
      layout: { name: 'preset' },
      minZoom: minZoom,
      maxZoom: maxZoom,
      zoom: initialZoom,
      pan: initialPan,
      boxSelectionEnabled: !isConstructorMode && activeTool === 'select',
      autoungrabify: isConstructorMode && activeTool !== 'drag',
    });
    cyRef.current = cyInstance;
    if (layout && cyInstance.nodes().length > 0) {
      runLayout(layout);
    }
    setupEventListeners(cyInstance);
    return () => {
      layoutRef.current?.stop();
      const instanceToDestroy = cyRef.current;
      if (instanceToDestroy && !instanceToDestroy.destroyed()) {
        instanceToDestroy.destroy();
      }
      cyRef.current = null;
    };
  }, [
    containerRef,
    style,
    minZoom,
    maxZoom,
    initialZoom,
    initialPan,
    isConstructorMode,
    activeTool,
    layout,
    runLayout,
    setupEventListeners,
  ]);

  // Element update useEffect.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      const incomingElementsMap = new Map(elements.map((el) => [el.data.id, el]));
      cy.elements().filter((el) => !incomingElementsMap.has(el.id())).remove();
      elements.forEach((elData) => {
        const elId = elData.data.id;
        if (!elId) return;
        const cyEl = cy.getElementById(elId);
        if (cyEl.empty()) {
          cy.add(elData as ElementDefinition);
        } else {
          cyEl.data(elData.data);
          if (elData.group === 'nodes' && elData.position && cyEl.isNode && cyEl.isNode()) {
            const currentPos = cyEl.position();
            if (currentPos.x !== elData.position.x || currentPos.y !== elData.position.y) {
              cyEl.position(elData.position);
            }
          }
        }
      });
    });
  }, [elements]);

  // Style update useEffect.
  useEffect(() => {
    if (cyRef.current) cyRef.current.style(style);
  }, [style]);

  // Update interaction mode and reattach event listeners.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !containerRef.current) return;
    cy.boxSelectionEnabled(!isConstructorMode && activeTool === 'select');
    cy.nodes().forEach((node) => {
      if (activeTool === 'drag' || !isConstructorMode) node.grabify();
      else node.ungrabify();
    });
    cy.autoungrabify(isConstructorMode && activeTool !== 'drag');
    containerRef.current.style.cursor = getCursorForTool(activeTool, isConstructorMode);
    setupEventListeners(cy);
  }, [isConstructorMode, activeTool, containerRef, setupEventListeners]);

  // Helper: get cursor style based on tool.
  const getCursorForTool = (tool: ConstructorTool, isConstructor: boolean): string => {
    if (!isConstructor) return 'default';
    switch (tool) {
      case 'delete':
        return 'crosshair';
      case 'edge':
        return 'copy';
      case 'drag':
        return 'grab';
      case 'pan':
        return 'move';
      case 'select':
        return 'default';
      default:
        return 'default';
    }
  };

  const fit = useCallback(() => cyRef.current?.fit(undefined, 50), []);
  const center = useCallback(() => cyRef.current?.center(), []);

  const zoomIn = useCallback(() => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom({
        level: currentZoom * 1.2,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2,
        },
      });
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (cyRef.current) {
      const currentZoom = cyRef.current.zoom();
      cyRef.current.zoom({
        level: currentZoom * 0.8,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2,
        },
      });
    }
  }, []);

  const getPng = useCallback((options?: cytoscape.ExportOptions) => {
    if (!document || !cyRef.current) return undefined;
    const bgColor =
      getComputedStyle(document.documentElement).getPropertyValue('--color-canvas-bg').trim() ||
      '#1f2937';
    return cyRef.current.png({ full: true, bg: bgColor, scale: 2, ...options });
  }, []);

  return { cyInstanceRef: cyRef, fit, center, zoomIn, zoomOut, runLayout, getPng };
};
