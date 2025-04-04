// frontend/src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'custom'; // Add variants
    customClasses?: string; // For truly custom one-off styles
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'secondary', // Default variant
    customClasses = '',
    className = '', // Allow passing additional classes
    ...props
}) => {
    // Map variant prop to the CSS class defined in index.css
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        custom: '', // No predefined class for custom
    };

    // Combine the variant class with any other passed classes
    const combinedClassName = `${variantClasses[variant]} ${customClasses} ${className}`.trim();

    return (
        <button
            className={combinedClassName}
            {...props}
        >
            {children}
        </button>
    );
};