import React from 'react';
import { Button } from '../ui';
import { ConstructorTool } from '@/types/graph';
import { CursorArrowRaysIcon, ArrowsPointingOutIcon, TrashIcon, HandRaisedIcon, LinkIcon } from '@heroicons/react/20/solid'; // Example Icons

interface ConstructorModeControlsProps {
    isConstructorMode: boolean;
    activeTool: ConstructorTool;
    onToggleConstructorMode: () => void;
    onToolChange: (tool: ConstructorTool) => void;
}

const toolIcons: Record<ConstructorTool, React.ElementType> = {
    select: CursorArrowRaysIcon,
    edge: LinkIcon,
    drag: HandRaisedIcon,
    delete: TrashIcon,
    pan: ArrowsPointingOutIcon,
};

const toolTips: Record<ConstructorTool, string> = {
    select: 'Select / Add Nodes (S)',
    edge: 'Create Edges (E)',
    drag: 'Drag Nodes (Hold Ctrl)',
    delete: 'Delete Elements (Hold Shift)',
    pan: 'Pan Canvas (P)',
};

export const ConstructorModeControls: React.FC<ConstructorModeControlsProps> = ({
    isConstructorMode,
    activeTool,
    onToggleConstructorMode,
    onToolChange,
}) => {
    const tools: ConstructorTool[] = ['select', 'edge', 'drag', 'delete', 'pan'];

    return (
        <div className="control-group">
            <div className="flex items-center justify-between mb-3">
                 <h3 className="!mb-0 !pb-0 !border-none">Constructor Mode</h3>
                <button
                    onClick={onToggleConstructorMode}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-800 ${
                        isConstructorMode ? 'bg-primary' : 'bg-gray-600'
                    }`}
                    role="switch"
                    aria-checked={isConstructorMode}
                >
                    <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isConstructorMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>
             {isConstructorMode && (
                 <div className="flex space-x-1 rounded-md bg-gray-700/50 p-1">
                     {tools.map(tool => {
                        const Icon = toolIcons[tool];
                        const isActive = activeTool === tool;
                        const isDisabled = (tool === 'drag' || tool === 'delete'); // Indicate special activation
                        return (
                            <Button
                                key={tool}
                                variant="custom"
                                onClick={() => onToolChange(tool)}
                                className={`
                                    flex-1 px-2 py-1 rounded-md text-xs transition-colors
                                    ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-dim hover:bg-gray-600/70 hover:text-text-main'}
                                    ${isDisabled ? 'opacity-70 cursor-default' : ''}
                                `}
                                title={toolTips[tool]}
                                disabled={isDisabled} // Disable direct click for modifier keys
                            >
                                <Icon className={`w-4 h-4 inline-block ${isActive ? '' : ''}`}/>
                            </Button>
                        );
                     })}
                 </div>
             )}
        </div>
    );
};