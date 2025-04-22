// src/components/StyleControls.tsx
/**
 * Renders UI controls for adjusting global graph styling parameters like
 * node font size and edge width. Fetches current style settings from
 * graphSettingsStore and dispatches actions to update them.
 */
import React from 'react';
// Import store
import { useGraphSettingsStore } from '../stores/graphSettingsStore';
// Import UI Components
import Panel from './ui/Panel';
import { Slider } from './ui/Slider';
import { Palette } from 'lucide-react'; // Icon

// Temporary placeholder for translation function
// Replace with actual import: import { useTranslations } from '../hooks/useTranslations';
// const t = (key: string) => key.split('.').pop() || key; // Simple mock

const StyleControls: React.FC = () => {
  // Select state and actions from the settings store
  const styleParams = useGraphSettingsStore((s) => s.styleParams);
  const setStyleParamsAction = useGraphSettingsStore((s) => s.setStyleParams);

  // Type-safe handler for updating style parameters
   const updateStyleParam = <K extends keyof typeof styleParams>(key: K) =>
    (value: (typeof styleParams)[K]) => {
      setStyleParamsAction({ [key]: value } as Partial<typeof styleParams>); // Cast needed for partial update
   };

  return (
    <Panel title="Base Graph Style" icon={Palette}>
      {/* Slider for Node Font Size */}
      <Slider label="Node Font Size (px)" min={8} max={36} step={1}
              value={styleParams.nodeFont} onChange={updateStyleParam('nodeFont')}/>

      {/* Slider for Edge Width */}
      <Slider label="Edge Width (px)" min={0.5} max={10} step={0.5}
              value={styleParams.edgeWidth} onChange={updateStyleParam('edgeWidth')}/>

      {/* Add more global style controls here if needed */}
      {/* e.g., default node color, default edge color, etc. */}
      {/* Note: Element-specific styles (color, shape) are handled in EditPanel */}

    </Panel>
  );
};

export default StyleControls;