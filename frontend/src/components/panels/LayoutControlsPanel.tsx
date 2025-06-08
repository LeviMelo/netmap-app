/**
 * Layout Controls Panel
 *
 * This component provides the UI for selecting and configuring
 * different graph layout algorithms. It dynamically displays
 * controls based on the currently selected layout.
 *
 * FIXED: Replaced the single object selector in useAppStore with individual
 * selectors for each piece of state. This prevents the "Maximum update depth exceeded"
 * error by avoiding the creation of a new object on every render, which was causing an
 * infinite re-render loop.
 */
import React from 'react';
import { useAppStore } from '../../stores/appState';
import { Card } from '../ui/Card';
import { LayoutMode } from '../../types/app';

export const LayoutControlsPanel: React.FC = () => {
  // FIXED: Select state individually to prevent re-renders from new object references.
  const currentLayout = useAppStore((state) => state.currentLayout);
  const layoutConfigs = useAppStore((state) => state.layoutConfigs);
  const setLayout = useAppStore((state) => state.setLayout);
  const updateLayoutConfig = useAppStore((state) => state.updateLayoutConfig);

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLayout(e.target.value as LayoutMode);
  };

  const renderLayoutControls = () => {
    switch (currentLayout) {
      case 'cola':
        const colaConfig = layoutConfigs.cola;
        return (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-small">
              <span className="text-text-muted">Node Spacing</span>
              <input
                type="range"
                min="1"
                max="200"
                value={colaConfig.nodeSpacing}
                onChange={(e) => updateLayoutConfig('cola', { nodeSpacing: +e.target.value })}
                className="w-full"
              />
              <span className="text-right text-text-muted">{colaConfig.nodeSpacing}</span>
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="text-text-muted">Edge Length</span>
              <input
                type="range"
                min="1"
                max="500"
                value={colaConfig.edgeLength}
                onChange={(e) => updateLayoutConfig('cola', { edgeLength: +e.target.value })}
                className="w-full"
              />
              <span className="text-right text-text-muted">{colaConfig.edgeLength}</span>
            </label>
            <label className="flex items-center gap-2 text-small">
              <input
                type="checkbox"
                checked={colaConfig.infinite}
                onChange={(e) => updateLayoutConfig('cola', { infinite: e.target.checked })}
              />
              <span className="text-text-muted">Continuous Simulation</span>
            </label>
          </div>
        );
      case 'dagre':
        const dagreConfig = layoutConfigs.dagre;
        return (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-small">
              <span className="text-text-muted">Node Separation</span>
              <input
                type="range"
                min="10"
                max="200"
                value={dagreConfig.nodeSep}
                onChange={(e) => updateLayoutConfig('dagre', { nodeSep: +e.target.value })}
                className="w-full"
              />
               <span className="text-right text-text-muted">{dagreConfig.nodeSep}</span>
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="text-text-muted">Rank Separation</span>
              <input
                type="range"
                min="10"
                max="200"
                value={dagreConfig.rankSep}
                onChange={(e) => updateLayoutConfig('dagre', { rankSep: +e.target.value })}
                className="w-full"
              />
               <span className="text-right text-text-muted">{dagreConfig.rankSep}</span>
            </label>
            <label className="flex flex-col gap-1 text-small">
              <span className="text-text-muted">Direction</span>
              <select
                value={dagreConfig.rankDir}
                onChange={(e) => updateLayoutConfig('dagre', { rankDir: e.target.value as 'TB' | 'LR' })}
                className="w-full p-2 rounded-md bg-bg-tertiary border border-border"
              >
                <option value="TB">Top to Bottom</option>
                <option value="LR">Left to Right</option>
              </select>
            </label>
          </div>
        );
      default:
        return (
          <p className="text-small text-text-muted italic">
            No parameters to configure for this layout.
          </p>
        );
    }
  };

  return (
    <Card className="p-4 flex flex-col gap-4">
      <h3 className="text-body-large font-semibold">Layout Controls</h3>
      <div className="flex flex-col gap-2">
        <label htmlFor="layout-select" className="text-small font-medium text-text-muted">
          Layout Algorithm
        </label>
        <select
          id="layout-select"
          value={currentLayout}
          onChange={handleLayoutChange}
          className="w-full p-2 rounded-md bg-bg-tertiary border border-border"
        >
          <option value="preset">Manual / Preset</option>
          <option value="cola">Physics (Cola)</option>
          <option value="dagre">Flowchart (Dagre)</option>
          <option value="concentric">Concentric</option>
          <option value="grid">Grid</option>
        </select>
      </div>

      <hr className="border-border" />

      <div className="mt-2">
        {renderLayoutControls()}
      </div>
    </Card>
  );
};