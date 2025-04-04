// frontend/src/components/layout/Sidebar.tsx
import React, { useMemo, useCallback } from 'react';
import { JsonInput } from '../controls/JsonInput';
import { LayoutControls } from '../controls/LayoutControls';
import { AestheticsControls } from '../controls/AestheticsControls';
import { ActionButtons } from '../controls/ActionButtons';
import { ConstructorModeControls } from '../controls/ConstructorModeControls';
import { AnalysisDisplay } from '../controls/AnalysisDisplay';
import {
  GraphElements,
  AppLayoutOptions,
  StyleOptions,
  ConstructorTool,
  AnalysisResults,
} from '@/types/graph';

interface SidebarProps {
  graphData: GraphElements;
  layoutOptions: AppLayoutOptions;
  styleOptions: StyleOptions;
  isConstructorMode: boolean;
  activeTool: ConstructorTool;
  analysisResults: AnalysisResults;
  isAnalysisLoading: boolean;
  onGraphDataChange: (data: GraphElements) => void;
  onLayoutChange: (options: AppLayoutOptions) => void;
  onStyleChange: (options: StyleOptions) => void;
  onToggleConstructorMode: () => void;
  onToolChange: (tool: ConstructorTool) => void;
  onLoadGraph: () => void;
  onResetZoom: () => void;
  onExportPng: () => void;
  onRunAnalysis: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  graphData,
  layoutOptions,
  styleOptions,
  isConstructorMode,
  activeTool,
  analysisResults,
  isAnalysisLoading,
  onGraphDataChange,
  onLayoutChange,
  onStyleChange,
  onToggleConstructorMode,
  onToolChange,
  onLoadGraph,
  onResetZoom,
  onExportPng,
  onRunAnalysis,
}) => {
  // Create a formatted JSON string of the graph data.
  const jsonString = useMemo(() => {
    return JSON.stringify(graphData, null, 2);
  }, [graphData]);

  // Parse new JSON and update graph data.
  const handleJsonLoad = useCallback(
    (newJsonString: string) => {
      try {
        const parsed = JSON.parse(newJsonString);
        onGraphDataChange(parsed);
        onLoadGraph();
      } catch (error) {
        alert('Invalid JSON!');
      }
    },
    [onGraphDataChange, onLoadGraph]
  );

  return (
    <div className="h-full w-72 md:w-80 lg:w-96 bg-sidebar-bg backdrop-blur-sm border-r border-sidebar-border shadow-lg overflow-y-auto p-4 flex flex-col space-y-4 text-sm scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/30">
      <h1 className="text-xl font-semibold text-text-main mb-2 pb-2 border-b border-gray-700">
        Concept Map Builder
      </h1>
      <ConstructorModeControls
        isConstructorMode={isConstructorMode}
        activeTool={activeTool}
        onToggleConstructorMode={onToggleConstructorMode}
        onToolChange={onToolChange}
      />
      <JsonInput initialJson={jsonString} onLoadGraph={handleJsonLoad} />
      <LayoutControls options={layoutOptions} onChange={onLayoutChange} />
      <AestheticsControls options={styleOptions} onChange={onStyleChange} />
      <ActionButtons
        onResetZoom={onResetZoom}
        onExportPng={onExportPng}
        onRunAnalysis={onRunAnalysis}
        isAnalysisLoading={isAnalysisLoading}
      />
      <AnalysisDisplay results={analysisResults} isLoading={isAnalysisLoading} />
      <div className="flex-grow"></div>
      <p className="text-xs text-text-dim text-center mt-auto pt-2">v4 Final Fix v3</p>
    </div>
  );
};
