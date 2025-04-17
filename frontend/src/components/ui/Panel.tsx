import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PanelProps {
    title: string;
    icon?: LucideIcon;
    titleElement?: ReactNode;
    children: ReactNode;
    className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, icon: Icon, titleElement, children, className = '' }) => {
    return (
        <div className={`panel ${className}`}> {/* Uses .panel class */}
            {titleElement ? titleElement : (
                 <h3 className="panel-title"> {/* Uses .panel-title class */}
                    {Icon && <Icon className="w-4 h-4 opacity-80" aria-hidden="true" />}
                    <span>{title}</span>
                 </h3>
            )}
            <div className="space-y-4 pt-1">
                 {children}
            </div>
        </div>
    );
};

export default Panel;