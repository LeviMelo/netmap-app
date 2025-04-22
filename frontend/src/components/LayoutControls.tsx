// src/components/LayoutControls.tsx
/**
 * Renders UI controls for selecting and configuring Cytoscape layout algorithms.
 * Fetches current layout settings from graphSettingsStore and dispatches actions
 * to update them based on user input.
 */
import React from 'react';
// Import store
import { useGraphSettingsStore } from '../stores/graphSettingsStore';
// Import UI Components
import Panel from './ui/Panel';
import Button from './ui/Button';
import { Slider } from './ui/Slider';
import { Settings } from 'lucide-react'; // Icon

// Define available layout names explicitly
const AVAILABLE_LAYOUTS = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre', 'preset'] as const;
type LayoutName = typeof AVAILABLE_LAYOUTS[number]; // Type for layout names


const LayoutControls: React.FC = () => {
  // Select state and actions from the settings store
  const layoutName = useGraphSettingsStore((s) => s.layoutName);
  const setLayoutNameAction = useGraphSettingsStore((s) => s.setLayoutName);
  const layoutParams = useGraphSettingsStore((s) => s.layoutParams);
  const setLayoutParamsAction = useGraphSettingsStore((s) => s.setLayoutParams);

  // Type-safe handler for updating layout parameters
  const updateLayoutParam = <K extends keyof typeof layoutParams>(key: K) =>
    (value: (typeof layoutParams)[K]) => {
      setLayoutParamsAction({ [key]: value } as Partial<typeof layoutParams>); // Cast needed for partial update
  };

  // Handler for layout button clicks
  const handleLayoutButtonClick = (name: LayoutName) => {
      setLayoutNameAction(name);
  };

  return (
    <Panel title={t('layoutTitle')} icon={Settings}>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {AVAILABLE_LAYOUTS.map((name) => (
          <Button
            key={name}
            size="sm"
            // Highlight the active layout button
            variant={layoutName === name ? 'primary' : 'secondary'}
            onClick={() => handleLayoutButtonClick(name)}
            title={`Switch to ${name} layout`}
          >
            {/* Capitalize first letter for display */}
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
        ))}
      </div>

      {/* --- CoSE Specific Controls --- */}
      {layoutName === 'cose' && (
        <>
          <Slider label="Repulsion" min={1000} max={10000} step={100}
                  value={layoutParams.repulsion} onChange={updateLayoutParam('repulsion')} />
          <Slider label="Edge Length"  min={20} max={300} step={5}
                  value={layoutParams.edgeLength} onChange={updateLayoutParam('edgeLength')} />
          <Slider label="Gravity"   min={0} max={1} step={0.01}
                  value={layoutParams.gravity} onChange={updateLayoutParam('gravity')} />
          {/* Checkbox for CoSE 'infinite' mode (live update) */}
          <label className="flex items-center gap-2 text-sm mt-2 cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-accent-primary rounded border-border focus:ring-accent-primary"
                   checked={layoutParams.infinite}
                   onChange={(e)=>updateLayoutParam('infinite')(e.target.checked)} />
            Live Update
          </label>
        </>
      )}

      {/* --- Spacing controls for relevant layouts --- */}
      {(layoutName === 'breadthfirst' || layoutName === 'grid' || layoutName === 'circle' || layoutName === 'dagre') && (
        <Slider label="Node Spacing" min={10} max={300} step={5}
                // Note: We use 'layerSpacing' for consistency, but it acts as general spacing here
                value={layoutParams.layerSpacing} onChange={updateLayoutParam('layerSpacing')} />
      )}

      {/* Preset layout button acts like 'Freeze' */}
      {/* Only show Freeze button if not already on preset */}
      {layoutName !== 'preset' && (
          <Button className="w-full mt-3" size="sm" variant="ghost"
                  onClick={() => handleLayoutButtonClick('preset')}
                  title="Freeze current node positions">
            Freeze Layout
          </Button>
      )}
    </Panel>
  );
};

// Temporary placeholder for translation function
// Replace with actual import: import { useTranslations } from '../hooks/useTranslations';
const t = (key: string) => key.split('.').pop() || key; // Simple mock

export default LayoutControls;