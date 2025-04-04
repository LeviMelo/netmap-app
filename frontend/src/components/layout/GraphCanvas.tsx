// frontend/src/components/layout/GraphCanvas.tsx
import React, { useRef, useCallback, useEffect } from 'react';
import { useCytoscape } from '@/hooks/useCytoscape';
import {
  StyleOptions,
  GraphElements,
  AppLayoutOptions,
  ConstructorTool,
  GraphNode,
  GraphEdge,
  GraphElement,
  GraphNodeData,
  GraphEdgeData,
} from '@/types/graph';
import cytoscape, { Position, LayoutOptions as CyLayoutOptions } from 'cytoscape';

// Extend the StyleOptions with the required properties.
interface ExtendedStyleOptions extends StyleOptions {
  nodeBackgroundColor: string;
  nodeTextColor: string;
  nodeBorderColor: string;
  edgeLineColor: string;
  edgeTextColor: string;
  edgeWidth: number;
}

const buildCytoscapeStylesheet = (styleOpts: StyleOptions): cytoscape.StylesheetStyle[] => {
  const opts = styleOpts as ExtendedStyleOptions;
  function darkenColor(hex: string | undefined, factor = 0.7): string {
    if (!hex) return '#000000';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  return [
    {
      selector: 'node',
      style: {
        'background-color': opts.nodeBackgroundColor,
        label: 'data(label)',
        color: opts.nodeTextColor,
        'border-color': opts.nodeBorderColor,
        'border-width': 2,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': darkenColor(opts.nodeBorderColor, 0.5),
        'border-width': 4,
      },
    },
    {
      selector: 'edge',
      style: {
        'line-color': opts.edgeLineColor,
        width: opts.edgeWidth,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': opts.edgeLineColor,
        label: 'data(label)',
        'font-size': 10,
        color: opts.edgeTextColor,
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': darkenColor(opts.edgeLineColor, 0.5),
        'target-arrow-color': darkenColor(opts.edgeLineColor, 0.5),
      },
    },
  ];
};

const buildCytoscapeLayoutOptions = (appOptions: AppLayoutOptions): CyLayoutOptions => {
  const baseOptions: CyLayoutOptions = {
    name: appOptions.name,
    animate: appOptions.animate !== undefined ? appOptions.animate : true,
    fit: appOptions.fit !== undefined ? appOptions.fit : true,
    padding: appOptions.padding !== undefined ? appOptions.padding : 50,
  };
  switch (appOptions.name) {
    case 'cola': {
      return {
        ...baseOptions,
        name: 'cola',
        infinite: (appOptions as any).infinite,
        nodeSpacing: (appOptions as any).nodeSpacing,
        edgeLength: (appOptions as any).edgeLengthVal,
        gravity: (appOptions as any).gravity,
        avoidOverlap: (appOptions as any).avoidOverlap,
        nodeDimensionsIncludeLabels:
          (appOptions as any).nodeDimensionsIncludeLabels !== undefined
            ? (appOptions as any).nodeDimensionsIncludeLabels
            : true,
      } as unknown as CyLayoutOptions;
    }
    case 'concentric': {
      return { ...baseOptions, name: 'concentric' };
    }
    case 'breadthfirst': {
      return { ...baseOptions, name: 'breadthfirst' };
    }
    case 'preset':
      return { ...baseOptions, name: 'preset' };
    case 'grid':
    case 'circle':
    default:
      return { ...baseOptions, name: appOptions.name };
  }
};

interface GraphCanvasProps {
  elements: GraphElements;
  styleOptions: StyleOptions;
  layoutOptions: AppLayoutOptions;
  isConstructorMode: boolean;
  activeTool: ConstructorTool;
  onGraphUpdate: (elements: GraphElements) => void;
  onNodeSelect?: (nodeId: string | null) => void;
  onEdgeSelect?: (edgeId: string | null) => void;
  requestAddNode: (position: Position) => void;
  requestAddEdge: (sourceId: string, targetId: string) => void;
  requestDeleteElement: (elementId: string) => void;
  requestUpdateElementData: (
    elementId: string,
    data: Partial<GraphNodeData | GraphEdgeData>
  ) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  cyInstanceRef: React.MutableRefObject<cytoscape.Core | null>;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = React.memo(
  ({
    elements,
    styleOptions,
    layoutOptions,
    isConstructorMode,
    activeTool,
    onGraphUpdate,
    onNodeSelect,
    onEdgeSelect,
    requestAddNode,
    requestAddEdge,
    requestDeleteElement,
    requestUpdateElementData,
    updateNodePosition,
    cyInstanceRef,
  }) => {
    const cyContainerRef = useRef<HTMLDivElement>(null);
    const cyStylesheet = buildCytoscapeStylesheet(styleOptions);
    const cyLayoutOptions = buildCytoscapeLayoutOptions(layoutOptions);

    const handleGraphUpdateFromHook = useCallback(
      (updatedCyElements: GraphElement[]) => {
        const updatedNodes = updatedCyElements.filter(
          (el) => el.group === 'nodes'
        ) as GraphNode[];
        const updatedEdges = updatedCyElements.filter(
          (el) => el.group === 'edges'
        ) as GraphEdge[];
        onGraphUpdate({ nodes: updatedNodes, edges: updatedEdges });
      },
      [onGraphUpdate]
    );

    const handleCanvasTap = useCallback(
      (position: Position) => {
        if (isConstructorMode && activeTool === 'select') {
          requestAddNode(position);
        }
      },
      [isConstructorMode, activeTool, requestAddNode]
    );

    const handleNodeTap = useCallback(
      (nodeId: string) => {
        if (isConstructorMode && activeTool === 'delete') {
          requestDeleteElement(nodeId);
        }
      },
      [isConstructorMode, activeTool, requestDeleteElement]
    );

    const handleEdgeTap = useCallback(
      (edgeId: string) => {
        if (isConstructorMode && activeTool === 'delete') {
          requestDeleteElement(edgeId);
        }
      },
      [isConstructorMode, activeTool, requestDeleteElement]
    );

    const handleNodeDblTap = useCallback(
      (nodeId: string) => {
        if (isConstructorMode && activeTool !== 'delete') {
          const node = elements.nodes.find((n) => n.data.id === nodeId);
          const newLabel = prompt(
            `Edit label for node "${node?.data.label || nodeId}"`,
            node?.data.label || ''
          );
          if (newLabel !== null) requestUpdateElementData(nodeId, { label: newLabel });
        }
      },
      [isConstructorMode, activeTool, elements.nodes, requestUpdateElementData]
    );

    const handleEdgeDblTap = useCallback(
      (edgeId: string) => {
        if (isConstructorMode && activeTool !== 'delete') {
          const cyEdge = cyInstanceRef.current?.getElementById(edgeId);
          if (cyEdge && cyEdge.length) {
            const currentLabel = cyEdge.data('label');
            const newLabel = prompt(
              `Edit label for edge "${currentLabel || edgeId}"`,
              currentLabel || ''
            );
            if (newLabel !== null)
              requestUpdateElementData(cyEdge.id(), { label: newLabel });
          }
        }
      },
      [isConstructorMode, activeTool, requestUpdateElementData, cyInstanceRef]
    );

    const { cyInstanceRef: hookCyRef } = useCytoscape({
      containerRef: cyContainerRef,
      elements: [...elements.nodes, ...elements.edges],
      style: cyStylesheet,
      layout: cyLayoutOptions,
      isConstructorMode: isConstructorMode,
      activeTool: activeTool,
      onGraphUpdate: handleGraphUpdateFromHook,
      onNodeSelect: onNodeSelect,
      onEdgeSelect: onEdgeSelect,
      onCanvasTap: handleCanvasTap,
      onNodeTap: handleNodeTap,
      onEdgeTap: handleEdgeTap,
      onNodeDblTap: handleNodeDblTap,
      onEdgeDblTap: handleEdgeDblTap,
      requestEdgeCreation: requestAddEdge,
      updateNodePosition: updateNodePosition,
    });

    useEffect(() => {
      if (cyInstanceRef) cyInstanceRef.current = hookCyRef.current;
    }, [hookCyRef, cyInstanceRef]);

    return (
      <div
        ref={cyContainerRef}
        className="w-full h-full bg-canvas-bg relative overflow-hidden shadow-inner"
      />
    );
  }
);
