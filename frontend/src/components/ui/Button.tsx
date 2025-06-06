/**
 * Button Component
 * 
 * A reusable button component that implements the design system with
 * primary, secondary, and ghost variants. Supports icons, loading states,
 * and accessibility features with proper touch targets.
 */

import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn-base transition-standard'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  }
  
  const isDisabled = disabled || loading
  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
  
  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    className,
  ].filter(Boolean).join(' ')
  
  const renderIcon = () => {
    if (loading) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )
    }
    
    if (Icon) {
      return <Icon size={16} />
    }
    
    return null
  }
  
  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  )
} 