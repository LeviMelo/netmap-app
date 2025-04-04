// frontend/src/components/controls/LayoutControls.tsx
import React from 'react';
import { Select, Slider, Checkbox } from '../ui';
// Import ALL specific option types directly, removing unused warnings
import {
    AppLayoutOptions, LayoutName,
    ColaAppLayoutOptions, ConcentricAppLayoutOptions, BreadthfirstAppLayoutOptions
} from '@/types/graph';

interface LayoutControlsProps {
    options: AppLayoutOptions;
    onChange: (newOptions: AppLayoutOptions) => void;
}

const layoutOptionsList: { value: LayoutName; label: string }[] = [
    { value: 'cola', label: 'Cola (Force Directed)' }, { value: 'breadthfirst', label: 'Breadthfirst' },
    { value: 'concentric', label: 'Concentric' }, { value: 'grid', label: 'Grid' },
    { value: 'circle', label: 'Circle' }, { value: 'preset', label: 'Preset (Manual)' },
];

export const LayoutControls: React.FC<LayoutControlsProps> = ({ options, onChange }) => {

    const handleLayoutNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newName = e.target.value as LayoutName;
        let newOptions: AppLayoutOptions;
        const baseDefaults = { padding: 50, animate: true, fit: true };
        switch (newName) {
            // Define complete default objects for each type
            case 'cola': newOptions = { ...baseDefaults, name: 'cola', nodeSpacing: 60, edgeLengthVal: 120, avoidOverlap: true, infinite: false, gravity: 1.0, nodeDimensionsIncludeLabels: true }; break;
            case 'breadthfirst': newOptions = { ...baseDefaults, name: 'breadthfirst', nodeSpacing: 80, directed: true, grid: false }; break;
            case 'concentric': newOptions = { ...baseDefaults, name: 'concentric', nodeSpacing: 70 }; break;
            case 'grid': newOptions = { ...baseDefaults, name: 'grid' }; break;
            case 'circle': newOptions = { ...baseDefaults, name: 'circle' }; break;
            case 'preset': newOptions = { ...baseDefaults, name: 'preset' }; break;
            default: newOptions = { ...baseDefaults, name: 'cola', nodeSpacing: 60, edgeLengthVal: 120, avoidOverlap: true, infinite: false, gravity: 1.0, nodeDimensionsIncludeLabels: true }; // Fallback
        }
        onChange(newOptions);
    };

    // --- Specific Handlers for each layout type ---
    // This avoids the generic typing issue by ensuring 'options' is the correct subtype

    const handleColaChange = <K extends keyof ColaAppLayoutOptions>(key: K, value: ColaAppLayoutOptions[K]) => {
        if (options.name === 'cola') {
            onChange({ ...options, [key]: value });
        }
    };

    const handleConcentricChange = <K extends keyof ConcentricAppLayoutOptions>(key: K, value: ConcentricAppLayoutOptions[K]) => {
         if (options.name === 'concentric') {
            onChange({ ...options, [key]: value });
         }
    };

    const handleBreadthfirstChange = <K extends keyof BreadthfirstAppLayoutOptions>(key: K, value: BreadthfirstAppLayoutOptions[K]) => {
         if (options.name === 'breadthfirst') {
             onChange({ ...options, [key]: value });
         }
    };


    return (
        <div className="control-group">
            <h3>Layout</h3>
            <Select label="Algorithm" options={layoutOptionsList} value={options.name} onChange={handleLayoutNameChange} className="mb-3"/>

            {/* Cola Specific Options */}
            {options.name === 'cola' && (
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
                     <p className="text-xs font-medium text-text-dim mb-1">Cola Options:</p>
                    {/* Use specific handler */}
                    <Slider label="Node Spacing" min="10" max="200" step="5"
                        value={options.nodeSpacing ?? 60} valueLabel={options.nodeSpacing ?? 60}
                        onChange={(e) => handleColaChange('nodeSpacing', Number(e.target.value))} />
                     <Slider label="Edge Length" min="10" max="300" step="10"
                        value={options.edgeLengthVal ?? 120} valueLabel={options.edgeLengthVal ?? 120}
                        onChange={(e) => handleColaChange('edgeLengthVal', Number(e.target.value))} />
                    <Slider label="Gravity" min="0.1" max="10" step="0.1"
                        value={options.gravity ?? 1.0} valueLabel={options.gravity?.toFixed(1) ?? '1.0'}
                        onChange={(e) => handleColaChange('gravity', Number(e.target.value))} />
                    <Checkbox label="Avoid Overlap"
                         checked={options.avoidOverlap ?? true}
                         onChange={(e) => handleColaChange('avoidOverlap', e.target.checked)} />
                     <Checkbox label="Infinite (Live)"
                         checked={options.infinite ?? false}
                         onChange={(e) => handleColaChange('infinite', e.target.checked)} />
                </div>
            )}

             {/* Concentric Specific Options */}
             {options.name === 'concentric' && (
                 <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
                     <p className="text-xs font-medium text-text-dim mb-1">Concentric Options:</p>
                     {/* Use specific handler */}
                     <Slider label="Min Node Spacing" min="10" max="200" step="5"
                         value={options.nodeSpacing ?? 70} valueLabel={options.nodeSpacing ?? 70}
                         onChange={(e) => handleConcentricChange('nodeSpacing', Number(e.target.value))} />
                 </div>
             )}

              {/* Breadthfirst Specific Options */}
              {options.name === 'breadthfirst' && (
                 <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
                     <p className="text-xs font-medium text-text-dim mb-1">Breadthfirst Options:</p>
                      {/* Use specific handler */}
                      <Slider label="Node Spacing" min="10" max="200" step="5"
                         value={options.nodeSpacing ?? 80} valueLabel={options.nodeSpacing ?? 80}
                         onChange={(e) => handleBreadthfirstChange('nodeSpacing', Number(e.target.value))} />
                      <Checkbox label="Directed"
                         checked={options.directed ?? true}
                         onChange={(e) => handleBreadthfirstChange('directed', e.target.checked)} />
                 </div>
             )}
        </div>
    );
};