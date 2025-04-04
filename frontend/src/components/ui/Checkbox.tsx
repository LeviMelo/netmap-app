import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = '', ...props }) => {
    const finalId = id || label?.replace(/\s+/g, '-').toLowerCase();
    return (
        <div className={`flex items-center ${className}`}>
            <input
                type="checkbox"
                id={finalId}
                className="control-item input[type='checkbox']" // Use class from index.css
                {...props}
            />
            {label && (
                <label htmlFor={finalId} className="ml-2 text-xs text-text-dim cursor-pointer">
                    {label}
                </label>
            )}
        </div>
    );
};