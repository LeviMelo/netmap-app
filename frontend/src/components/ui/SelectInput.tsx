import React from 'react';

// Keep SelectOption defined locally or import if moved
export interface SelectOption {
    value: string;
    label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    options: SelectOption[]; // Expects options array
    placeholderOption?: SelectOption; // Optional placeholder object
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, options, placeholderOption, className = '', ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="label-text">
                {label}
            </label>
            <select
                id={id}
                className={`input-base mt-1 pr-8 ${className}`}
                {...props}
            >
                {/* Render placeholder if provided */}
                {placeholderOption && (
                    <option key={`${id}-placeholder`} value={placeholderOption.value} disabled={placeholderOption.value === ''}>
                         {placeholderOption.label}
                    </option>
                )}
                {/* Render actual options */}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectInput;