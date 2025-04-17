import React, { useEffect } from 'react'; // Import useEffect
import cytoscape from 'cytoscape'; // Import cytoscape core
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { useResolveCytoscapeStyles } from './store';
// Import layout extensions HERE for registration
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

// Flag to prevent multiple registrations during HMR or StrictMode
let layoutsRegisteredInApp = false;

function App() {
  // Resolve CSS variable styles on mount
  useResolveCytoscapeStyles();

  // Effect to register Cytoscape extensions ONCE on app mount
  useEffect(() => {
    if (!layoutsRegisteredInApp) {
      try {
        console.log("[App Effect] Registering Cytoscape layouts...");
        cytoscape.use(coseBilkent);
        cytoscape.use(dagre);
        layoutsRegisteredInApp = true; // Set flag after successful registration
        console.log("[App Effect] Cytoscape layouts registered.");
      } catch (e) {
        console.error("[App Effect] Error registering Cytoscape layouts:", e);
        // Handle registration error (e.g., show an error message)
      }
    }
    // Run this effect only once on component mount
  }, []); // Empty dependency array

  return (
    <div className="flex h-screen w-screen bg-bg-primary text-text-base overflow-hidden">
      {/* Sidebar Area */}
      <div className="w-1/3 min-w-[340px] max-w-md h-full bg-bg-secondary border-r border-border overflow-y-auto shadow-lg no-scrollbar">
         <Sidebar />
      </div>
      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative">
        <GraphCanvas />
      </div>
    </div>
  );
}

export default App;