// frontend/src/components/layout/Layout.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar'; // Use named imports
import { GraphCanvas } from './GraphCanvas'; // Use named imports
import {
  GraphElements, AppLayoutOptions, StyleOptions, ConstructorTool,
  AnalysisResults, GraphNode, GraphEdge, GraphNodeData, GraphEdgeData // Import types
} from '@/types/graph';
import { runAnalysis } from '@/api/graphApi';
import cytoscape, { Position } from 'cytoscape';

// --- Default Initial State ---
const defaultElements: GraphElements = {
   nodes: [ // Ensure elements match GraphNode structure
     { group: 'nodes', data: { id: 'a', label: 'Node A', color: '#e41a1c' }, position: { x: 100, y: 100 } },
     { group: 'nodes', data: { id: 'b', label: 'Node B', color: '#377eb8' }, position: { x: 250, y: 100 } },
     { group: 'nodes', data: { id: 'c', label: 'Node C', color: '#4daf4a' }, position: { x: 175, y: 250 } },
   ],
   edges: [ // Ensure elements match GraphEdge structure
     { group: 'edges', data: { source: 'a', target: 'b', label: 'A->B', edgeColor: '#e41a1c' } },
     { group: 'edges', data: { source: 'b', target: 'c', label: 'B->C', edgeColor: '#377eb8' } },
     { group: 'edges', data: { source: 'c', target: 'a', label: 'C->A', edgeColor: '#4daf4a' } },
   ]
};
const defaultLayout: AppLayoutOptions = { name: 'cola', nodeSpacing: 60, edgeLengthVal: 120, avoidOverlap: true, infinite: false, animate: true, fit: true, padding: 50 };
const defaultStyle: StyleOptions = { nodeFontSize: 12, nodeOutlineWidth: 1, nodePadding: 10, edgeWidth: 2, edgeFontSize: 10, edgeOutlineWidth: 1 };

export const Layout: React.FC = () => {
    const [graphData, setGraphData] = useState<GraphElements>(defaultElements);
    const [layoutOptions, setLayoutOptions] = useState<AppLayoutOptions>(defaultLayout);
    const [styleOptions, setStyleOptions] = useState<StyleOptions>(defaultStyle);
    const [isConstructorMode, setIsConstructorMode] = useState<boolean>(false);
    const [activeTool, setActiveTool] = useState<ConstructorTool>('select');
    // Correct initialization for AnalysisResults (allow null)
    const [analysisResults, setAnalysisResults] = useState<AnalysisResults>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);

    // Ref to hold the Cytoscape instance, managed via GraphCanvas prop
    const cyInstanceRef = useRef<cytoscape.Core | null>(null);

    // --- State Update Callbacks ---
    const handleGraphDataChange = useCallback((newData: GraphElements) => {
        setGraphData(newData);
    }, []);
    const handleLayoutChange = useCallback((newOptions: AppLayoutOptions) => {
        setLayoutOptions(newOptions);
        // Trigger layout run explicitly if desired after options change
        // Consider adding a delay or specific button if layouts are slow
        // cyInstanceRef.current?.layout(buildCytoscapeLayoutOptions(newOptions)).run(); // Need build helper
    }, []);
    const handleStyleChange = useCallback((newOptions: StyleOptions) => {
        setStyleOptions(newOptions);
    }, []);
    const handleToggleConstructorMode = useCallback(() => {
        setIsConstructorMode(prev => !prev);
        setActiveTool('select');
    }, []);
    const handleToolChange = useCallback((tool: ConstructorTool) => {
         setActiveTool(tool);
    }, []);

    // --- Graph Actions ---
    const handleResetZoom = useCallback(() => {
        cyInstanceRef.current?.fit(undefined, 50); // Use the ref
    }, []);
    const handleExportPng = useCallback(() => {
        const cy = cyInstanceRef.current;
        if (!cy) { alert("Graph instance not available!"); return; }
        try {
             const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas-bg').trim() || '#1f2937';
             const pngData = cy.png({ full: true, scale: 2, bg: bgColor });
             if (pngData) {
                 const link = document.createElement('a');
                 link.href = pngData;
                 link.download = 'concept_map.png';
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
             }
        } catch (error) { console.error("Failed to export PNG:", error); /* ... */ }
    }, []);
    const handleRunAnalysis = useCallback(async () => {
        setIsAnalysisLoading(true);
        setAnalysisResults(null); // Reset state correctly
         try {
             const nodesForApi: { [key: string]: any } = {};
             graphData.nodes.forEach((n: GraphNode) => { nodesForApi[n.data.id] = { label: n.data.label, color: n.data.color }; });
             const edgesForApi = graphData.edges.map((e: GraphEdge) => ({ source: e.data.source, target: e.data.target, label: e.data.label }));
             const results: AnalysisResults = await runAnalysis({ nodes: nodesForApi, edges: edgesForApi });
             setAnalysisResults(results); // Assign result
          } catch (error: any) { setAnalysisResults({ error: error.message || 'Unknown analysis error' }); }
          finally { setIsAnalysisLoading(false); }
    }, [graphData]);

    // --- Element Modification Handlers (passed to GraphCanvas) ---
    const requestAddNode = useCallback((position: Position) => {
        const label = prompt('Enter label for new node:');
        if (label === null) return;
        setGraphData((prev: GraphElements) => {
            const newId = `n${Date.now()}`;
            const newNode: GraphNode = { group: 'nodes', data: { id: newId, label: label || newId, color: '#3b82f6' }, position };
            if (prev.nodes.some(n => n.data.id === newId)) return prev;
            return { ...prev, nodes: [...prev.nodes, newNode] };
        });
    }, []);
    const requestAddEdge = useCallback((sourceId: string, targetId: string) => {
        setGraphData((prev: GraphElements) => {
            if (prev.edges.some(e => e.data.source === sourceId && e.data.target === targetId)) return prev;
            const sourceNode = prev.nodes.find(n => n.data.id === sourceId);
            const newEdge: GraphEdge = { group: 'edges', data: { source: sourceId, target: targetId, edgeColor: sourceNode?.data.color || '#6b7280' } };
            return { ...prev, edges: [...prev.edges, newEdge] };
        });
    }, []);
    const requestDeleteElement = useCallback((elementId: string) => {
        setGraphData((prev: GraphElements) => ({
            nodes: prev.nodes.filter(n => n.data.id !== elementId),
            edges: prev.edges.filter(e => e.data.source !== elementId && e.data.target !== elementId && e.data.id !== elementId)
        }));
    }, []);
    const requestUpdateElementData = useCallback((elementId: string, dataUpdate: Partial<GraphNodeData | GraphEdgeData>) => {
         setGraphData((prev: GraphElements) => ({
             nodes: prev.nodes.map(n => n.data.id === elementId ? { ...n, data: { ...n.data, ...dataUpdate } } : n),
             edges: prev.edges.map(e => e.data.id === elementId // Prefer checking managed ID if available
                                        ? { ...e, data: { ...e.data, ...dataUpdate } } : e)
         }));
    }, []);
     const updateNodePosition = useCallback((nodeId: string, position: Position) => {
         setGraphData((prev: GraphElements) => {
             const newNodes = prev.nodes.map(n =>
                n.data.id === nodeId ? { ...n, position: position, data: { ...n.data, _savedPos: position } } : n
             );
             const oldNode = prev.nodes.find(n => n.data.id === nodeId);
             if (oldNode?.position?.x === position.x && oldNode?.position?.y === position.y) return prev;
             return { ...prev, nodes: newNodes };
         });
     }, []);

    // --- Global Key Listener ---
    useEffect(() => {
         const handleKeyDown = (event: KeyboardEvent) => {
             if (!isConstructorMode || document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
             // Prefix unused 'event' if needed by linter rules, or use it
             if (event.key === 'Control') { setActiveTool('drag'); event.preventDefault(); }
             else if (event.key === 'Shift') { setActiveTool('delete'); event.preventDefault(); }
             else if (event.key === 'e') { setActiveTool('edge'); event.preventDefault(); }
             else if (event.key === 's') { setActiveTool('select'); event.preventDefault(); }
             else if (event.key === 'p') { setActiveTool('pan'); event.preventDefault(); }
             else if (event.key === 'Escape') { setActiveTool('select'); event.preventDefault(); }
         };
         const handleKeyUp = (event: KeyboardEvent) => {
             if (!isConstructorMode || document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
             // Prefix unused 'event' if needed by linter rules
             if (event.key === 'Control' && activeTool === 'drag') setActiveTool('select');
             else if (event.key === 'Shift' && activeTool === 'delete') setActiveTool('select');
         };
         window.addEventListener('keydown', handleKeyDown);
         window.addEventListener('keyup', handleKeyUp);
         return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }, [isConstructorMode, activeTool]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-900">
            {/* Pass all required props to Sidebar */}
            <Sidebar
                graphData={graphData}
                layoutOptions={layoutOptions}
                styleOptions={styleOptions}
                isConstructorMode={isConstructorMode}
                activeTool={activeTool}
                analysisResults={analysisResults}
                isAnalysisLoading={isAnalysisLoading}
                onGraphDataChange={handleGraphDataChange}
                onLayoutChange={handleLayoutChange} // Pass correct handlers
                onStyleChange={handleStyleChange}   // Pass correct handlers
                onToggleConstructorMode={handleToggleConstructorMode} // Pass correct handlers
                onToolChange={handleToolChange}         // Pass correct handlers
                onLoadGraph={handleResetZoom} // Keep or change as needed
                onResetZoom={handleResetZoom}         // Pass correct handlers
                onExportPng={handleExportPng}         // Pass correct handlers
                onRunAnalysis={handleRunAnalysis}       // Pass correct handlers
             />
            <main className="flex-1 relative">
                <GraphCanvas
                    elements={graphData}
                    styleOptions={styleOptions}
                    layoutOptions={layoutOptions}
                    isConstructorMode={isConstructorMode}
                    activeTool={activeTool}
                    onGraphUpdate={handleGraphDataChange}
                    // onNodeSelect, onEdgeSelect omitted for brevity, add if needed
                    requestAddNode={requestAddNode}
                    requestAddEdge={requestAddEdge}
                    requestDeleteElement={requestDeleteElement}
                    requestUpdateElementData={requestUpdateElementData}
                    updateNodePosition={updateNodePosition}
                    cyInstanceRef={cyInstanceRef} // Pass the ref down
                />
            </main>
        </div>
    );
};