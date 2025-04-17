// App.tsx
// Updated: April 17, 2025
// - Removed unused default React import

import { useEffect } from 'react';
import cytoscape from 'cytoscape';
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { useResolveCytoscapeStyles } from './store';
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

let layoutsRegisteredInApp = false;

function App() {
  useResolveCytoscapeStyles();

  useEffect(() => {
    if (!layoutsRegisteredInApp) {
      try {
        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        layoutsRegisteredInApp = true;
      } catch (e) {
        console.error('Error registering Cytoscape layouts:', e);
      }
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-bg-primary text-text-base overflow-hidden">
      <div className="w-1/3 min-w-[340px] max-w-md h-full bg-bg-secondary border-r border-border overflow-y-auto shadow-lg no-scrollbar">
        <Sidebar />
      </div>
      <div className="flex-1 h-full relative">
        <GraphCanvas />
      </div>
    </div>
  );
}

export default App;
