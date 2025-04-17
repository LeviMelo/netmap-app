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
    title?: string;
}

const Button: React.FC<ButtonProps> = ({
    children, variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', className = '', title = '', ...props
}) => {
    const baseClass = 'btn'; // Base class from index.css

    // Map variant prop to the corresponding class defined in index.css
    const variantClass: Record<ButtonVariant, string> = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        warning: 'btn-warning',
        danger: 'btn-danger',
        ghost: 'btn-ghost',
    };

    // Define size-specific padding/text size classes directly
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

    const iconMargin = children ? (iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5') : '';
    const accessibleTitle = title || (typeof children === 'string' ? children : undefined);

    return (
        <button
            // Apply base, variant, size, and custom classes
            className={`${baseClass} ${variantClass[variant]} ${sizeStyles[size]} ${className}`}
            title={accessibleTitle}
            {...props}
        >
            {Icon && iconPosition === 'left' && <Icon className={`${iconSizeStyles[size]} ${iconMargin}`} aria-hidden="true" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className={`${iconSizeStyles[size]} ${iconMargin}`} aria-hidden="true" />}
        </button>
    );
};

export default Button;