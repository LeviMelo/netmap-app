import React from 'react';
import { Slider } from '../ui';
import { StyleOptions } from '@/types/graph';

interface AestheticsControlsProps {
    options: StyleOptions;
    onChange: (newOptions: StyleOptions) => void;
}

export const AestheticsControls: React.FC<AestheticsControlsProps> = ({ options, onChange }) => {

    const handleChange = (key: keyof StyleOptions, value: string | number) => {
        onChange({ ...options, [key]: Number(value) });
    };

    return (
        <div className="control-group">
            <h3>Aesthetics</h3>
            <Slider
                label="Node Font" min="8" max="36" step="1"
                value={options.nodeFontSize} valueLabel={options.nodeFontSize}
                onChange={(e) => handleChange('nodeFontSize', e.target.value)}
            />
            <Slider
                label="Node Padding" min="0" max="50" step="1"
                value={options.nodePadding} valueLabel={options.nodePadding}
                onChange={(e) => handleChange('nodePadding', e.target.value)}
            />
            <Slider
                label="Node Out. W" min="0" max="5" step="0.5" // Outline Width
                value={options.nodeOutlineWidth} valueLabel={options.nodeOutlineWidth}
                onChange={(e) => handleChange('nodeOutlineWidth', e.target.value)}
            />
             <Slider
                label="Edge Width" min="0.5" max="10" step="0.5"
                value={options.edgeWidth} valueLabel={options.edgeWidth}
                onChange={(e) => handleChange('edgeWidth', e.target.value)}
            />
            <Slider
                label="Edge Font" min="6" max="24" step="1"
                value={options.edgeFontSize} valueLabel={options.edgeFontSize}
                onChange={(e) => handleChange('edgeFontSize', e.target.value)}
            />
            <Slider
                label="Edge Out. W" min="0" max="5" step="0.5" // Outline Width
                value={options.edgeOutlineWidth} valueLabel={options.edgeOutlineWidth}
                onChange={(e) => handleChange('edgeOutlineWidth', e.target.value)}
            />
        </div>
    );
};