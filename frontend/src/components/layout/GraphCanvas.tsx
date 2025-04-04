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
  requestUpdateElementData: (elementId: string, data: Partial<GraphNodeData | GraphEdgeData>) => void;
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

    const handleGraphUpdateFromHook = useCallback((updatedCyElements: GraphElement[]) => {
      const updatedNodes = updatedCyElements.filter(
        (el) => el.group === 'nodes'
      ) as GraphNode[];
      const updatedEdges = updatedCyElements.filter(
        (el) => el.group === 'edges'
      ) as GraphEdge[];
      onGraphUpdate({ nodes: updatedNodes, edges: updatedEdges });
    }, [onGraphUpdate]);

    const handleCanvasTap = useCallback((position: Position) => {
      if (isConstructorMode && activeTool === 'select') {
        requestAddNode(position);
      }
    }, [isConstructorMode, activeTool, requestAddNode]);

    const handleNodeTap = useCallback((nodeId: string) => {
      if (isConstructorMode && activeTool === 'delete') {
        requestDeleteElement(nodeId);
      }
    }, [isConstructorMode, activeTool, requestDeleteElement]);

    const handleEdgeTap = useCallback((edgeId: string) => {
      if (isConstructorMode && activeTool === 'delete') {
        requestDeleteElement(edgeId);
      }
    }, [isConstructorMode, activeTool, requestDeleteElement]);

    const handleNodeDblTap = useCallback((nodeId: string) => {
      if (isConstructorMode && activeTool !== 'delete') {
        const node = elements.nodes.find((n) => n.data.id === nodeId);
        const newLabel = prompt(`Edit label for node "${node?.data.label || nodeId}"`, node?.data.label || '');
        if (newLabel !== null)
          requestUpdateElementData(nodeId, { label: newLabel });
      }
    }, [isConstructorMode, activeTool, elements.nodes, requestUpdateElementData]);

    const handleEdgeDblTap = useCallback((edgeId: string) => {
      if (isConstructorMode && activeTool !== 'delete') {
        const cyEdge = cyInstanceRef.current?.getElementById(edgeId);
        if (cyEdge && cyEdge.length) {
          const currentLabel = cyEdge.data('label');
          const newLabel = prompt(`Edit label for edge "${currentLabel || edgeId}"`, currentLabel || '');
          if (newLabel !== null)
            requestUpdateElementData(cyEdge.id(), { label: newLabel });
        }
      }
    }, [isConstructorMode, activeTool, requestUpdateElementData, cyInstanceRef]);

    const { cyInstanceRef: hookCyRef } = useCytoscape({
      containerRef: cyContainerRef,
      elements: [...elements.nodes, ...elements.edges],
      style: cyStylesheet,
      layout: cyLayoutOptions,
      isConstructorMode,
      activeTool,
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

// Replace the existing buildCytoscapeStylesheet function

function buildCytoscapeStylesheet(styleOpts: StyleOptions): cytoscape.StylesheetStyle[] {
    // Define darkenColor helper directly inside or move it outside if preferred elsewhere
    function darkenColor(hex?: string, factor = 0.7): string {
        // If hex is undefined or invalid, return a default dark color
        if (!hex || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
            // Special case: if the input is 'data(edgeColor)', we can't darken it here,
            // so return a generic dark outline color. Cytoscape's function mapper
            // is needed for data-driven colors within the style definition itself.
            if (typeof hex === 'string' && hex.startsWith('data(')) {
                return '#555555'; // Generic dark color for outline when input is dynamic
            }
            return '#333333'; // Default dark color for invalid hex
        }

        // Normalize 3-digit hex to 6-digit
        let normalizedHex = hex.startsWith('#') ? hex.slice(1) : hex;
        if (normalizedHex.length === 3) {
            normalizedHex = normalizedHex[0].repeat(2) + normalizedHex[1].repeat(2) + normalizedHex[2].repeat(2);
        }

        // Convert to RGB and apply factor
        const num = parseInt(normalizedHex, 16);
        let r = (num >> 16) & 0xff;
        let g = (num >> 8) & 0xff;
        let b = num & 0xff;

        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);

        // Clamp and convert back to hex
        const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
        const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Return the style array directly, using the 'styleOpts' parameter
    return [
        {
            selector: 'node',
            style: {
                'background-color': 'data(color)', // Use color from node data
                label: 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                color: '#ffffff', // White text
                'font-size': `${styleOpts.nodeFontSize}px`,
                'text-outline-width': `${styleOpts.nodeOutlineWidth}px`,
                'text-outline-color': '#555', // Fixed dark outline
                'text-wrap': 'wrap',
                'text-max-width': '100px', // Adjust as needed
                width: 'label',
                height: 'label',
                shape: 'round-rectangle',
                padding: `${styleOpts.nodePadding}px`,
                'border-width': '1px',
                // Use function mapper for dynamic border color based on background
                'border-color': (ele: cytoscape.NodeSingular) => darkenColor(ele.data('color'), 0.7),
            },
        },
        {
            selector: 'node:selected',
            style: {
                'border-width': '3px', // Thicker border
                'border-color': '#facc15', // Yellow highlight
                'border-opacity': 0.9,
                // REMOVED shadow-* properties
            },
        },
        {
            selector: 'edge',
            style: {
                'width': `${styleOpts.edgeWidth}px`, // Use edgeWidth from props
                'line-color': 'data(edgeColor)', // Use color from edge data
                'target-arrow-color': 'data(edgeColor)', // Match arrow to line
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                label: 'data(label)',
                'font-size': `${styleOpts.edgeFontSize}px`, // Use edgeFontSize from props
                color: '#e5e7eb', // Light text color
                'text-rotation': 'autorotate',
                'text-outline-width': `${styleOpts.edgeOutlineWidth}px`, // Use edgeOutlineWidth from props
                'text-outline-color': '#333', // Fixed dark outline
                'text-background-color': 'var(--color-canvas-bg)', // Match background
                'text-background-opacity': 0.7, // Make it slightly opaque
                'text-background-padding': '2px',
                'arrow-scale': 1.2,
                'overlay-padding': '6px', // Easier to select edges
                'overlay-opacity': 0, // Keep overlay invisible
            },
        },
        {
            selector: 'edge:selected',
            style: {
                'line-color': '#facc15', // Yellow highlight
                'target-arrow-color': '#facc15', // Match arrow
                'width': `${styleOpts.edgeWidth + 1.5}px`, // Slightly thicker
                'z-index': 100, // Bring selected edges to front
                 // Optional: Change text color on selection
                 color: '#fef08a', // Lighter yellow text
                 'text-outline-color': darkenColor('#facc15', 0.5), // Darker yellow outline
                 // REMOVED shadow-* properties
            },
        },
    ];
}

function buildCytoscapeLayoutOptions(appOptions: AppLayoutOptions): CyLayoutOptions {
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
}
