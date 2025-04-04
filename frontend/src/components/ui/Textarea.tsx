import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', ...props }) => {
    const finalId = id || label?.replace(/\s+/g, '-').toLowerCase();
    return (
         <div className={`w-full ${className}`}>
             {label && (
                <label htmlFor={finalId} className="block text-xs font-medium text-text-dim mb-1">
                    {label}
                </label>
             )}
            <textarea
                id={finalId}
                className="block w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-vertical min-h-[60px]" // Allow vertical resize
                {...props}
            />
         </div>
    );
};