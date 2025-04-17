import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, id, className = '', ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="label-text">
                {label}
            </label>
            <input
                id={id}
                type="text" // Default to text
                className={`input-base mt-1 ${className}`}
                {...props}
            />
        </div>
    );
};

export default TextInput;