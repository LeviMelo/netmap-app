import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-[3px]',
        lg: 'w-8 h-8 border-4',
    };
    return (
        <div className="flex justify-center items-center">
            <div
                className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-live="polite"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};