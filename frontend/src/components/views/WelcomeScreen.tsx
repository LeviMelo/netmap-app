import React from 'react';
import { useAppStore } from '../../stores/appState';

export const WelcomeScreen: React.FC = () => {
  const { addNode, addEdge, setMode, setImportMode, setUtilityPanelVisible } = useAppStore();

  const createSampleMap = () => {
    // Create a sample concept map about "Web Development"
    const nodes = [
      { label: 'Web Development', color: '#f97316', position: { x: 200, y: 150 } },
      { label: 'Frontend', color: '#0ea5e9', position: { x: 100, y: 250 } },
      { label: 'Backend', color: '#0ea5e9', position: { x: 300, y: 250 } },
      { label: 'Database', color: '#0ea5e9', position: { x: 400, y: 200 } },
      { label: 'React', color: '#22c55e', position: { x: 50, y: 350 } },
      { label: 'TypeScript', color: '#22c55e', position: { x: 150, y: 350 } },
      { label: 'Node.js', color: '#22c55e', position: { x: 250, y: 350 } },
      { label: 'Express', color: '#22c55e', position: { x: 350, y: 350 } },
      { label: 'PostgreSQL', color: '#22c55e', position: { x: 450, y: 300 } },
      { label: 'API Design', color: '#eab308', position: { x: 200, y: 50 } },
      { label: 'uses', color: '#94a3b8', shape: 'diamond', isConnectorNode: true, position: { x: 125, y: 300 } },
      { label: 'requires', color: '#94a3b8', shape: 'diamond', isConnectorNode: true, position: { x: 275, y: 300 } },
    ];

    const edges = [
      { source: 'node_web_dev', target: 'node_frontend' },
      { source: 'node_web_dev', target: 'node_backend' },
      { source: 'node_web_dev', target: 'node_database' },
      { source: 'node_web_dev', target: 'node_api' },
      { source: 'node_frontend', target: 'node_connector_uses' },
      { source: 'node_connector_uses', target: 'node_react' },
      { source: 'node_connector_uses', target: 'node_typescript' },
      { source: 'node_backend', target: 'node_connector_requires' },
      { source: 'node_connector_requires', target: 'node_nodejs' },
      { source: 'node_connector_requires', target: 'node_express' },
      { source: 'node_database', target: 'node_postgresql' },
    ];

    // Add nodes with proper IDs
    nodes.forEach((node, index) => {
      const nodeId = index === 0 ? 'node_web_dev' : 
                    index === 1 ? 'node_frontend' :
                    index === 2 ? 'node_backend' :
                    index === 3 ? 'node_database' :
                    index === 4 ? 'node_react' :
                    index === 5 ? 'node_typescript' :
                    index === 6 ? 'node_nodejs' :
                    index === 7 ? 'node_express' :
                    index === 8 ? 'node_postgresql' :
                    index === 9 ? 'node_api' :
                    index === 10 ? 'node_connector_uses' :
                    'node_connector_requires';
      
      addNode({ 
        id: nodeId,
        label: node.label, 
        color: node.color, 
        position: node.position,
        shape: node.shape as 'ellipse' | 'rectangle' | 'diamond' | 'triangle' | undefined,
        isConnectorNode: node.isConnectorNode 
      });
    });

    // Add edges
    edges.forEach((edge, index) => {
      addEdge({ 
        id: `edge_${index}`,
        source: edge.source, 
        target: edge.target 
      });
    });

    // Switch to view mode
    setMode('view');
  };

  const handleLoadFromFile = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let data;
          
          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            // Basic CSV parsing for demo purposes
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            
            if (headers.includes('id') && headers.includes('label')) {
              // Parse as nodes CSV
              data = {
                nodes: lines.slice(1).map(line => {
                  const values = line.split(',');
                  return {
                    id: values[0],
                    label: values[1],
                    color: values[2] || '#0ea5e9'
                  };
                }).filter(node => node.id && node.label),
                edges: []
              };
            } else if (headers.includes('source') && headers.includes('target')) {
              // Parse as edges CSV
              data = {
                nodes: [],
                edges: lines.slice(1).map(line => {
                  const values = line.split(',');
                  return {
                    source: values[0],
                    target: values[1],
                    label: values[2] || ''
                  };
                }).filter(edge => edge.source && edge.target)
              };
            }
          }

          if (data) {
            // Set import mode and switch to dataIO mode
            setImportMode('replace');
            setMode('dataIO');
            setUtilityPanelVisible(true);
            
            // Import the data
            useAppStore.getState().validateAndImportData(data);
          }
        } catch (error) {
          alert('Failed to parse file. Please check the format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-bg-primary overflow-hidden">
        {/* FIXED: Increased opacity and used theme colors for more vibrancy */}
        <div 
          className="absolute -inset-1/3 bg-[radial-gradient(circle_at_30%_40%,rgba(249,115,22,0.25),transparent_50%)] animate-[pulse-glow_10s_ease-in-out_infinite]"
        />
        <div 
          className="absolute -inset-1/3 bg-[radial-gradient(circle_at_70%_60%,rgba(14,165,233,0.2),transparent_50%)] animate-[gentle-drift-one_28s_ease-in-out_-5s_infinite]"
        />
         <div 
          className="absolute -inset-1/3 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.15),transparent_60%)] animate-[gentle-drift-two_35s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 opacity-20 dark:opacity-40">
          <div className="h-full w-full bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </div>
      
      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto relative group">
            {/* FIXED: Increased blur, spread, and opacity of the drop-shadow for a more vibrant, multi-color glow */}
            <img 
              src="/src/assets/netmap_logo.png" 
              alt="NetMap Logo" 
              className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500 
                [filter:drop-shadow(0_0_18px_rgba(249,115,22,0.6))_drop-shadow(0_0_18px_rgba(14,165,233,0.5))]"
            />
          </div>
        </div>
        <h1 className="text-display font-bold mb-4 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
          Welcome to NetMap
        </h1>
        <p className="text-body-large text-text-muted mb-8 leading-relaxed">
          Create, visualize, and analyze concept maps with intuitive drag & drop editing, 
          smart layouts, and powerful export options.
        </p>
        <div className="mb-8">
          <button 
            onClick={createSampleMap}
            className="btn-base btn-primary text-lg px-8 py-4"
          >
            <span className="relative z-10">Create New Concept Map</span>
          </button>
        </div>
        <div className="text-small text-text-muted">
          or{' '}
          <button 
            onClick={handleLoadFromFile}
            className="text-accent-secondary hover:text-accent-secondary-hover underline"
          >
            load from file
          </button>
        </div>
      </div>
    </div>
  );
};