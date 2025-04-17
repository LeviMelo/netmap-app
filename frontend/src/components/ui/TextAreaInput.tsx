import React, { ReactNode } from 'react';

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    // Label prop is now optional as content can be handled outside
    label?: ReactNode;
    id: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, id, className = '', ...props }) => {
    return (
        // If label is provided, render it. Otherwise, label association must be handled externally.
        // Consumers might prefer to handle the label entirely outside this component now.
        <>
            {label && (
                 <label htmlFor={id} className="label-text">
                     {label}
                 </label>
            )}
            <textarea
                id={id}
                className={`input-text ${label ? 'mt-1' : ''} ${className}`} // Add margin only if label exists
                {...props}
            />
        </>
    );
};

export default TextAreaInput;