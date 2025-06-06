/**
 * Input Component
 * 
 * A reusable input component that follows the design system with
 * proper focus states, placeholder styling, and accessibility features.
 */

import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const inputClasses = [
    'input-base',
    error ? 'border-danger focus:outline-danger' : '',
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-small font-medium text-text-base mb-1"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-small text-danger">
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-small text-text-muted">
          {hint}
        </p>
      )}
    </div>
  )
} 