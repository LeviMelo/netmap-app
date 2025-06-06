/**
 * Card Component
 * 
 * A reusable card component implementing the glassmorphism design system.
 * Provides base and elevated variants with proper shadows and backdrop blur.
 */

import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'elevated'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'base',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    base: 'card-base',
    elevated: 'card-elevated',
  }
  
  const combinedClassName = [
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  )
} 