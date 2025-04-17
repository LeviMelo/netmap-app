import React from 'react';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    children?: React.ReactNode;
    title?: string; // Add title prop for accessibility/tooltips
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    className = '',
    title = '', // Default title
    ...props
}) => {
    const baseClass = 'btn'; // Uses .btn from index.css

    // ** CORRECTED MAPPINGS **
    const variantClass: Record<ButtonVariant, string> = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        warning: 'btn-warning',
        danger: 'btn-danger',
        ghost: 'btn-ghost',
    };

    const sizeStyles: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const iconSizeStyles: Record<ButtonSize, string> = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    // ** END CORRECTIONS **

    const iconMargin = children ? (iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5') : '';

    // Determine accessible title: use explicit title prop, or children if it's a simple string
    const accessibleTitle = title || (typeof children === 'string' ? children : undefined);

    return (
        <button
            className={`${baseClass} ${variantClass[variant]} ${sizeStyles[size]} ${className}`}
            title={accessibleTitle} // Add title attribute
            {...props}
        >
            {Icon && iconPosition === 'left' && <Icon className={`${iconSizeStyles[size]} ${iconMargin}`} aria-hidden="true" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className={`${iconSizeStyles[size]} ${iconMargin}`} aria-hidden="true" />}
        </button>
    );
};

export default Button;