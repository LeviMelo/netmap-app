import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, id, options, className = '', ...props }) => {
    const finalId = id || label?.replace(/\s+/g, '-').toLowerCase();
    return (
        <div className={`w-full ${className}`}>
             {label && (
                <label htmlFor={finalId} className="block text-xs font-medium text-text-dim mb-1">
                    {label}
                </label>
             )}
            <select
                id={finalId}
                className="block w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};