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
    const sizeClass = `btn-${size}`; // Define btn-sm, btn-md, btn-lg in index.css if needed

    const iconSizeStyles: Record<ButtonSize, string> = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    const iconMargin = children ? (iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5') : '';
    const accessibleTitle = title || (typeof children === 'string' ? children : undefined);

    return (
        <button
            // Combine base 'btn' class with variant/size specific classes from index.css
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
// Add size classes to index.css if not already defined by Tailwind defaults used in @apply
/*
@layer components {
  .btn-sm { @apply px-3 py-1.5 text-xs; }
  .btn-md { @apply px-4 py-2 text-sm; }
  .btn-lg { @apply px-6 py-3 text-base; }
}
*/

export default Button;