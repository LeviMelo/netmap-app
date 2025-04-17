import React, { ReactNode } from 'react';

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: ReactNode; // Accepts ReactNode
    id: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, id, className = '', ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="label-text">
                {label}
            </label>
            <textarea id={id} className={`input-text mt-1 ${className}`} {...props} />
        </div>
    );
};

export default TextAreaInput;