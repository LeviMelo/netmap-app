import React from 'react';
import { AnalysisResults } from '@/types/graph';
import { LoadingSpinner } from '../ui';

interface AnalysisDisplayProps {
    results: AnalysisResults; // Can be null
    isLoading: boolean;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ results, isLoading }) => {

    if (isLoading) {
        return (
            <div className="control-group text-center">
                <LoadingSpinner />
                <p className="text-xs text-text-dim mt-2">Running Analysis...</p>
            </div>
        );
    }

    if (!results) {
        return (
             <div className="control-group">
                 <h3>Analysis Results</h3>
                 <p className="text-xs text-text-dim italic">Run analysis to see results here.</p>
             </div>
         );
    }

    if (results.error) {
         return (
             <div className="control-group">
                 <h3>Analysis Error</h3>
                 <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded border border-red-600">{results.error}</p>
             </div>
         );
    }

    // Basic display - expand this significantly
    return (
        <div className="control-group">
            <h3>Analysis Results</h3>
            <div className="space-y-2 text-xs">
                {/* Validation */}
                {results.validation && (
                    <div>
                        <h4 className="font-semibold text-text-main">Validation:</h4>
                        {results.validation.errors && results.validation.errors.length > 0 && <p className="text-red-400">Errors: {results.validation.errors.length}</p>}
                        {results.validation.warnings && results.validation.warnings.length > 0 && <p className="text-yellow-400">Warnings: {results.validation.warnings.length}</p>}
                        {/* Display more validation details */}
                    </div>
                )}
                 {/* Metrics */}
                 {results.original_graph_metrics && (
                    <div>
                         <h4 className="font-semibold text-text-main">Metrics:</h4>
                         <p>Nodes: {results.original_graph_metrics.num_nodes ?? 'N/A'}</p>
                         <p>Edges: {results.original_graph_metrics.num_edges ?? 'N/A'}</p>
                         <p>Density: {results.original_graph_metrics.density?.toFixed(4) ?? 'N/A'}</p>
                         {/* Display more metrics */}
                    </div>
                 )}
                 {/* Embedding */}
                 {results.embedding_analysis?.sentence_transformer && (
                    <div>
                       <h4 className="font-semibold text-text-main">Embeddings (Sentence):</h4>
                       <p>Proposed New Edges: {results.embedding_analysis.sentence_transformer.proposed_edges?.length ?? 0}</p>
                        {/* Display heatmap link/button, metrics chart? */}
                    </div>
                 )}
                 {/* Add more sections for structure, node2vec etc. */}
            </div>
        </div>
    );
};