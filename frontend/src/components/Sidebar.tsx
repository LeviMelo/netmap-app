import React, { useState } from 'react';
import { useGraphStore } from '../store';
import { parseGraphSyntax } from '../utils/graphParser';

// Define available layouts
const availableLayouts = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre']; // Add more as needed

const Sidebar: React.FC = () => {
  const [graphInputText, setGraphInputText] = useState<string>('');
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);
  const currentLayout = useGraphStore((state) => state.layoutName);
  const setLayoutName = useGraphStore((state) => state.setLayoutName);

  const handleLoadGraph = () => {
     console.log("Attempting to load graph from text...");
     // Pass text to the parser
     const parsedData = parseGraphSyntax(graphInputText);
     // Parser now returns null only on catastrophic error, otherwise object possibly with empty arrays
     if (parsedData) {
         console.log("Parsed data:", parsedData);
         setNodes(parsedData.nodes);
         setEdges(parsedData.edges);
     } else {
         // This branch might not be reachable if parser always returns object
         console.error("Critical parsing error occurred.");
         alert("A critical error occurred during parsing. Check console.");
     }
     // Optionally clear input: setGraphInputText('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input Section */}
      <div>
        <h2 className="heading-2">Load Graph from Text</h2>
        <label htmlFor="graph-input" className="label-text">
            {/* Correctly escape '>' */}
            Enter graph definition (e.g., [A] {'->'} [B] : "Label"):
        </label>
        <textarea
            id="graph-input"
            rows={10}
            className="input-text mt-1 mb-2 h-48 resize-none font-mono text-sm" // Added monospace font for better syntax alignment
            placeholder={
`# Example:
[Node One]
[Node Two](id=n2)
[Node One] -> [n2] : "Connects to"
# Comments start with #`}
            value={graphInputText}
            onChange={(e) => setGraphInputText(e.target.value)}
            disabled={!stylesResolved}
        />
        <button
            className="btn btn-primary w-full"
            onClick={handleLoadGraph}
            disabled={!stylesResolved || !graphInputText.trim()}
        >
            Load Graph
        </button>
      </div>

      {/* Layout Controls Section */}
      <div className="mt-6">
          <h3 className="text-md font-semibold text-accent-cyan mb-2">Layout</h3>
          <div className="flex flex-wrap gap-2">
              {availableLayouts.map((layout) => (
                  <button
                      key={layout}
                      onClick={() => setLayoutName(layout)}
                      className={`btn text-sm ${
                          currentLayout === layout ? 'btn-primary' : 'btn-secondary'
                      }`}
                      disabled={!stylesResolved}
                  >
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </button>
              ))}
          </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Other Controls Placeholder */}
      <div>
         <h2 className="heading-2 mt-4">Editing</h2>
         <p className="text-sm text-text-secondary-dark">Editing controls here later.</p>
      </div>
    </div>
  );
};

export default Sidebar;