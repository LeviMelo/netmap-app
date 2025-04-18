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
    title?: string; // Keep title for accessibility
}

const Button: React.FC<ButtonProps> = ({
    children, variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', className = '', title = '', ...props
}) => {
    // Map props to component class names defined in index.css
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`; // Apply the size class

    const iconSizeStyles: Record<ButtonSize, string> = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    const iconMargin = children ? (iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5') : '';
    const accessibleTitle = title || (typeof children === 'string' ? children : undefined);

    return (
        <button
            // Combine base 'btn' class with variant AND size classes
            className={`btn ${variantClass} ${sizeClass} ${className}`}
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