import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
    const finalId = id || label?.replace(/\s+/g, '-').toLowerCase();
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={finalId} className="block text-xs font-medium text-text-dim mb-1">
                    {label}
                </label>
            )}
            <input
                id={finalId}
                className="block w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                {...props}
            />
        </div>
    );
};