import React, { useState, useRef } from 'react';
import { AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { useAppStore } from '../../stores/appState';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ValidationError {
  type: 'schema' | 'duplicate_id' | 'missing_reference' | 'conflict';
  message: string;
  nodeId?: string;
  edgeId?: string;
  suggestions?: string[];
  action?: 'overwrite' | 'skip' | 'rename';
  customValue?: string;
}

interface ParsedData {
  nodes: any[];
  edges: any[];
  errors: ValidationError[];
}

export const DataIOPanel: React.FC = () => {
  const { 
    importMode, 
    setImportMode, 
    elements,
    addNode,
    addEdge,
    getNodeById,
    reset
  } = useAppStore();

  const [textInput, setTextInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, ValidationError>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample JSON with comprehensive example
  const sampleJSON = {
    nodes: [
      { id: 'ai', label: 'Artificial Intelligence', color: '#0ea5e9' },
      { id: 'ml', label: 'Machine Learning', color: '#22c55e' },
      { id: 'dl', label: 'Deep Learning', color: '#f97316' },
      { id: 'nn', label: 'Neural Networks', color: '#eab308' },
      { id: 'data', label: 'Big Data', color: '#8b5cf6' },
      { id: 'python', label: 'Python', color: '#ef4444' },
      { id: 'algo', label: 'Algorithms', color: '#06b6d4' }
    ],
    edges: [
      { source: 'ai', target: 'ml', label: 'includes' },
      { source: 'ml', target: 'dl', label: 'subset of' },
      { source: 'dl', target: 'nn', label: 'uses' },
      { source: 'ml', target: 'data', label: 'processes' },
      { source: 'python', target: 'ml', label: 'implements' },
      { source: 'ml', target: 'algo', label: 'applies' }
    ]
  };

  // Placeholder text for the input area
  const placeholderText = `// Paste your JSON data here or try the sample data
{
  "nodes": [
    { "id": "node1", "label": "First Node", "color": "#0ea5e9" },
    { "id": "node2", "label": "Second Node", "color": "#22c55e" }
  ],
  "edges": [
    { "source": "node1", "target": "node2", "label": "connects to" }
  ]
}

/* Or use CSV format:
   For nodes: id,label,color
   For edges: source,target,label */`;

  const loadSampleData = () => {
    setTextInput(JSON.stringify(sampleJSON, null, 2));
  };

  const parseCSV = (content: string): { nodes: any[], edges: any[] } => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return { nodes: [], edges: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    
    // Detect if it's nodes or edges CSV
    if (headers.includes('id') && headers.includes('label')) {
      // Parse as nodes CSV
      const nodes = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const node: any = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            node[header] = values[index];
          }
        });
        return node;
      }).filter(node => node.id && node.label);
      
      return { nodes, edges: [] };
    } else if (headers.includes('source') && headers.includes('target')) {
      // Parse as edges CSV
      const edges = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const edge: any = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            edge[header] = values[index];
          }
        });
        return edge;
      }).filter(edge => edge.source && edge.target);
      
      return { nodes: [], edges };
    }
    
    return { nodes: [], edges: [] };
  };

  const validateData = (data: any): ParsedData => {
    const errors: ValidationError[] = [];
    let nodes = data.nodes || [];
    let edges = data.edges || [];

    // Schema validation
    if (!Array.isArray(nodes) && !Array.isArray(edges)) {
      errors.push({
        type: 'schema',
        message: 'Data must contain either "nodes" or "edges" array'
      });
      return { nodes: [], edges: [], errors };
    }

    // Validate nodes
    nodes = nodes.filter((node: any) => {
      if (!node.id || !node.label) {
        errors.push({
          type: 'schema',
          message: `Node missing required fields: ${!node.id ? 'id' : ''} ${!node.label ? 'label' : ''}`,
          nodeId: node.id || 'unknown'
        });
        return false;
      }
      return true;
    });

    // Check for duplicate node IDs in import data
    const nodeIds = new Set();
    nodes = nodes.filter((node: any) => {
      if (nodeIds.has(node.id)) {
        errors.push({
          type: 'duplicate_id',
          message: `Duplicate node ID in import data: "${node.id}"`,
          nodeId: node.id
        });
        return false;
      }
      nodeIds.add(node.id);
      return true;
    });

    // Check for conflicts with existing data (if merging)
    if (importMode === 'merge') {
      nodes.forEach((node: any) => {
        const existing = getNodeById(node.id);
        if (existing) {
          errors.push({
            type: 'conflict',
            message: `Node ID "${node.id}" already exists`,
            nodeId: node.id,
            suggestions: ['overwrite', 'skip', 'rename'],
            action: 'skip'
          });
        }
      });
    }

    // Validate edges
    edges = edges.filter((edge: any) => {
      if (!edge.source || !edge.target) {
        errors.push({
          type: 'schema',
          message: `Edge missing required fields: ${!edge.source ? 'source' : ''} ${!edge.target ? 'target' : ''}`,
          edgeId: edge.id || 'unknown'
        });
        return false;
      }
      return true;
    });

    // Check edge references
    const allNodeIds = new Set([
      ...elements.nodes.map(n => n.id),
      ...nodes.map((n: any) => n.id)
    ]);

    edges.forEach((edge: any) => {
      if (!allNodeIds.has(edge.source)) {
        const suggestions = Array.from(allNodeIds)
          .filter(id => id.toLowerCase().includes(edge.source.toLowerCase()) || 
                       edge.source.toLowerCase().includes(id.toLowerCase()))
          .slice(0, 3);
        
        errors.push({
          type: 'missing_reference',
          message: `Edge references missing source node: "${edge.source}"`,
          edgeId: edge.id || `${edge.source}-${edge.target}`,
          suggestions
        });
      }
      
      if (!allNodeIds.has(edge.target)) {
        const suggestions = Array.from(allNodeIds)
          .filter(id => id.toLowerCase().includes(edge.target.toLowerCase()) || 
                       edge.target.toLowerCase().includes(id.toLowerCase()))
          .slice(0, 3);
        
        errors.push({
          type: 'missing_reference',
          message: `Edge references missing target node: "${edge.target}"`,
          edgeId: edge.id || `${edge.source}-${edge.target}`,
          suggestions
        });
      }
    });

    return { nodes, edges, errors };
  };

  const handleValidate = async () => {
    if (!textInput.trim()) return;

    setIsValidating(true);
    try {
      let data;
      
      // Try to parse as JSON first
      try {
        data = JSON.parse(textInput);
      } catch {
        // Try as CSV
        const csvData = parseCSV(textInput);
        if (csvData.nodes.length === 0 && csvData.edges.length === 0) {
          throw new Error('Invalid format: not valid JSON or CSV');
        }
        data = csvData;
      }

      const validated = validateData(data);
      setParsedData(validated);
      setValidationComplete(true);

      // Initialize conflicts for resolution
      const conflictMap: Record<string, ValidationError> = {};
      validated.errors.forEach((error, index) => {
        if (error.type === 'conflict' || error.type === 'missing_reference') {
          conflictMap[`error_${index}`] = error;
        }
      });
      setConflicts(conflictMap);

    } catch (error) {
      setParsedData({
        nodes: [],
        edges: [],
        errors: [{
          type: 'schema',
          message: error instanceof Error ? error.message : 'Failed to parse data'
        }]
      });
      setValidationComplete(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConflictResolution = (errorKey: string, resolution: string, customValue?: string) => {
    setConflicts(prev => ({
      ...prev,
      [errorKey]: {
        ...prev[errorKey],
        action: resolution as any,
        customValue
      }
    }));
  };

  const canImport = parsedData && 
    parsedData.errors.filter(e => e.type === 'schema' || 
      (e.type === 'conflict' && !conflicts[`error_${parsedData.errors.indexOf(e)}`]?.action) ||
      (e.type === 'missing_reference' && !conflicts[`error_${parsedData.errors.indexOf(e)}`]?.action)
    ).length === 0;

  const handleImport = () => {
    if (!parsedData || !canImport) return;

    try {
      if (importMode === 'replace') {
        reset();
      }

      // Import nodes
      parsedData.nodes.forEach(node => {
        const conflictKey = `error_${parsedData.errors.findIndex(e => e.nodeId === node.id)}`;
        const conflict = conflicts[conflictKey];
        
        if (conflict?.action === 'skip') return;
        
        if (conflict?.action === 'rename') {
          node.id = conflict.customValue || `${node.id}_copy`;
        }

        addNode({
          id: node.id,
          label: node.label,
          color: node.color || '#0ea5e9',
          shape: node.shape || 'ellipse',
          tags: node.tags || [],
          isConnectorNode: node.isConnectorNode || false
        });
      });

      // Import edges
      parsedData.edges.forEach(edge => {
        const edgeId = edge.id || `${edge.source}-${edge.target}`;
        addEdge({
          id: edgeId,
          source: edge.source,
          target: edge.target,
          label: edge.label || '',
          color: edge.color
        });
      });

      // Reset state
      setTextInput('');
      setParsedData(null);
      setValidationComplete(false);
      setConflicts({});

    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTextInput(content);
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const exportData = (format: 'json' | 'csv-nodes' | 'csv-edges') => {
    let content = '';
    let filename = '';

    switch (format) {
      case 'json':
        content = JSON.stringify({ 
          nodes: elements.nodes, 
          edges: elements.edges 
        }, null, 2);
        filename = 'concept-map.json';
        break;
      
      case 'csv-nodes':
        const nodeHeaders = ['id', 'label', 'color', 'shape', 'tags', 'isConnectorNode'];
        const nodeRows = elements.nodes.map(node => [
          node.id,
          node.label,
          node.color || '',
          node.shape || '',
          (node.tags || []).join(';'),
          node.isConnectorNode || false
        ]);
        content = [nodeHeaders, ...nodeRows].map(row => row.join(',')).join('\n');
        filename = 'concept-map-nodes.csv';
        break;
      
      case 'csv-edges':
        const edgeHeaders = ['source', 'target', 'label', 'color'];
        const edgeRows = elements.edges.map(edge => [
          edge.source,
          edge.target,
          edge.label || '',
          edge.color || ''
        ]);
        content = [edgeHeaders, ...edgeRows].map(row => row.join(',')).join('\n');
        filename = 'concept-map-edges.csv';
        break;
    }

    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Import Mode Toggle - Lightswitch Style */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-text-base">Import Mode</h4>
          <p className="text-xs text-text-muted">
            {importMode === 'merge' 
              ? 'Add new data to existing graph' 
              : 'Replace entire graph with new data'}
          </p>
        </div>
        <div className="relative">
          <div className="flex rounded-lg border border-border bg-bg-secondary/50 p-1">
            <button
              onClick={() => setImportMode('merge')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                importMode === 'merge'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-base'
              }`}
            >
              Merge
            </button>
            <button
              onClick={() => setImportMode('replace')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                importMode === 'replace'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-base'
              }`}
            >
              Replace
            </button>
          </div>
        </div>
      </div>

      {/* Data Input */}
      <div className="border border-border/30 rounded-lg bg-bg-secondary/30 overflow-hidden">
        <div className="p-4 border-b border-border/20">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-text-base">Data Input</h4>
            <div className="flex gap-2">
              <button
                onClick={loadSampleData}
                className="px-3 py-1.5 text-xs font-medium text-accent-primary hover:text-accent-primary-hover border border-accent-primary/30 rounded-md hover:bg-accent-primary/10 transition-all"
              >
                Sample Data
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-accent-secondary hover:text-accent-secondary-hover border border-accent-secondary/30 rounded-md hover:bg-accent-secondary/10 transition-all"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-48 p-3 border border-border/50 rounded-lg bg-bg-tertiary/50 font-mono text-sm resize-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all backdrop-blur-sm"
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-text-muted">
              Supports JSON with nodes/edges arrays or CSV format
            </p>
            <button
              onClick={handleValidate}
              disabled={!textInput.trim() || isValidating}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                !textInput.trim() || isValidating
                  ? 'bg-border/50 text-text-muted cursor-not-allowed'
                  : 'bg-accent-primary text-white hover:bg-accent-primary-hover shadow-sm'
              }`}
            >
              {isValidating ? 'Validating...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      {validationComplete && parsedData && (
        <Card variant="elevated">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {parsedData.errors.length === 0 ? (
                <CheckCircle className="text-accent-secondary" size={18} />
              ) : (
                <AlertTriangle className="text-accent-tertiary" size={18} />
              )}
              <h4 className="text-body font-medium">
                Validation Results
              </h4>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-accent-primary/5">
                <p className="text-sm font-medium text-accent-primary">
                  {parsedData.nodes.length} Nodes
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent-secondary/5">
                <p className="text-sm font-medium text-accent-secondary">
                  {parsedData.edges.length} Edges
                </p>
              </div>
            </div>

            {/* Errors and Conflicts */}
            {parsedData.errors.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Issues to Resolve:</h5>
                {parsedData.errors.map((error, index) => (
                  <div key={index} className="p-3 rounded-lg bg-accent-tertiary/5 border border-accent-tertiary/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-accent-tertiary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{error.message}</p>
                        
                        {/* Conflict Resolution */}
                        {error.type === 'conflict' && error.suggestions && (
                          <div className="mt-2 flex gap-2">
                            {error.suggestions.map(action => (
                              <Button
                                key={action}
                                variant={conflicts[`error_${index}`]?.action === action ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handleConflictResolution(`error_${index}`, action)}
                              >
                                {action}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Missing Reference Suggestions */}
                        {error.type === 'missing_reference' && error.suggestions && error.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-text-muted mb-1">Did you mean:</p>
                            <div className="flex gap-2 flex-wrap">
                              {error.suggestions.map(suggestion => (
                                <Button
                                  key={suggestion}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleConflictResolution(`error_${index}`, 'fix', suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Import Button */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!canImport}
                className="w-full"
              >
                {importMode === 'merge' ? 'Merge Data' : 'Replace Graph'}
              </Button>
              {!canImport && (
                <p className="text-xs text-accent-tertiary mt-2">
                  Please resolve all issues before importing
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Export */}
      <Card>
        <div className="p-4">
          <h4 className="text-body font-medium mb-3">Export Data</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportData('json')}
              icon={Download}
              disabled={elements.nodes.length === 0}
            >
              Export as JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportData('csv-nodes')}
              icon={Download}
              disabled={elements.nodes.length === 0}
            >
              Export Nodes as CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportData('csv-edges')}
              icon={Download}
              disabled={elements.edges.length === 0}
            >
              Export Edges as CSV
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 