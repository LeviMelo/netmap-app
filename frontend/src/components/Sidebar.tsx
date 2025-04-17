// frontend/src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useGraphStore } from '../store'; // Import store
import { parseGraphSyntax } from '../utils/graphParser'; // <-- Import the real parser

// Define available layouts
const availableLayouts = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre']; // Add more as needed

const Sidebar: React.FC = () => {
  // Local state for the text input
  const [graphInputText, setGraphInputText] = useState<string>('');
  // Actions from Zustand store
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const stylesResolved = useGraphStore((state) => state.stylesResolved); // To potentially disable button
  // Layout state and action
  const currentLayout = useGraphStore((state) => state.layoutName);
  const setLayoutName = useGraphStore((state) => state.setLayoutName);

  const handleLoadGraph = () => {
    console.log("Attempting to load graph from text...");
    const parsedData = parseGraphSyntax(graphInputText);
    if (parsedData) {
        console.log("Parsed data:", parsedData);
        setNodes(parsedData.nodes);
        setEdges(parsedData.edges);
        // Optionally clear the text area after successful load
        // setGraphInputText('');
    } else {
        console.error("Failed to parse graph syntax.");
        // TODO: Show user-friendly error message
        alert("Error parsing graph syntax. Please check the format.");
    }
  };

  return (
    <div className="flex flex-col h-full"> {/* Allow vertical flex */}
      {/* Input Section */}
      <div>
        <h2 className="heading-2">Load Graph from Text</h2>
        <label htmlFor="graph-input" className="label-text">
            Enter graph definition (e.g., [A] -&gt; [B] : "Label"):
        </label>
        <textarea
            id="graph-input"
            rows={10} // Adjust rows as needed
            className="input-text mt-1 mb-2 h-48 resize-none" // Fixed height, no resize
            placeholder={`# Example:\n[Node One]\n[Node Two](id=n2)\n[Node One] -> [n2] : "Connects to"\n# Comments start with #`}
            value={graphInputText}
            onChange={(e) => setGraphInputText(e.target.value)}
            disabled={!stylesResolved} // Disable until styles are ready
        />
        <button
            className="btn btn-primary w-full"
            onClick={handleLoadGraph}
            disabled={!stylesResolved || !graphInputText.trim()} // Disable if no text or styles not ready
        >
            Load Graph
        </button>
      </div>

      {/* Spacer to push controls down or add more sections later */}
      <div className="flex-grow"></div>

      {/* Controls Section (Placeholder for Layouts/Editing later) */}
      <div>
         <h2 className="heading-2 mt-4">Controls</h2>
         <p className="text-sm text-text-secondary-dark">Layout & editing controls here later.</p>
      </div>
    </div>
  );
};

export default Sidebar;