import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    valueLabel?: string | number; // Display value next to slider
}

export const Slider: React.FC<SliderProps> = ({ label, id, valueLabel, className = '', ...props }) => {
    const finalId = id || label.replace(/\s+/g, '-').toLowerCase();
    return (
        <div className={`control-item ${className}`}>
            <label htmlFor={finalId} className="text-text-dim mr-2 whitespace-nowrap flex-shrink-0">
                {label}:
            </label>
            <input
                type="range"
                id={finalId}
                className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary flex-grow mx-2"
                {...props}
            />
            {valueLabel !== undefined && (
                <span className="text-text-main font-mono text-right min-w-[30px] ml-2 flex-shrink-0">
                    {valueLabel}
                </span>
            )}
        </div>
    );
};