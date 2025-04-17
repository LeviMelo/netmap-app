import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PanelProps {
    title: string;
    icon?: LucideIcon;
    titleElement?: ReactNode; // Allow completely custom title element
    children: ReactNode;
    className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, icon: Icon, titleElement, children, className = '' }) => {
    return (
        // Apply the .panel class defined in index.css
        <div className={`panel ${className}`}>
            {/* Conditional rendering for title */}
            {titleElement ? titleElement : (
                 <h3 className="panel-title"> {/* Apply .panel-title class */}
                    {Icon && <Icon className="w-4 h-4 opacity-80" aria-hidden="true" />}
                    <span>{title}</span>
                 </h3>
            )}
            {/* Keep spacing utilities if needed for content */}
            <div className="space-y-4 pt-1">
                 {children}
            </div>
        </div>
    );
};

export default Panel;