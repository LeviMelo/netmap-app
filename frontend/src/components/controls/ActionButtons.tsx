// frontend/src/components/controls/ActionButtons.tsx
import React from 'react';
import { Button, LoadingSpinner } from '../ui';
// Remove unused icons
import { ArrowPathIcon, ArrowDownTrayIcon, ArrowsPointingOutIcon } from '@heroicons/react/20/solid';

interface ActionButtonsProps {
    onResetZoom: () => void;
    onExportPng: () => void;
    onRunAnalysis: () => void;
    isAnalysisLoading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onResetZoom, onExportPng, onRunAnalysis, isAnalysisLoading,
}) => {
    return (
        <div className="control-group">
            <h3>Actions</h3>
            <div className="grid grid-cols-2 gap-2">
                 <Button variant="secondary" onClick={onResetZoom} title="Reset Zoom & Pan">
                     <ArrowsPointingOutIcon className="w-4 h-4 mr-1 inline"/> Fit View
                 </Button>
                 <Button variant="secondary" onClick={onExportPng} title="Export as PNG">
                     <ArrowDownTrayIcon className="w-4 h-4 mr-1 inline"/> Export
                 </Button>
                 <Button variant="primary" onClick={onRunAnalysis} disabled={isAnalysisLoading} className="col-span-2" title="Run Backend Graph Analysis">
                    {isAnalysisLoading ? ( <><LoadingSpinner size="sm"/> <span className="ml-2">Analyzing...</span></> )
                                       : ( <><ArrowPathIcon className="w-4 h-4 mr-1 inline"/> Run Analysis</> )}
                 </Button>
            </div>
        </div>
    );
};