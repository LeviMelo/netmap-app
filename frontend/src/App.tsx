// frontend/src/App.tsx
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { useResolveCytoscapeStyles } from './store';

function App() {
  useResolveCytoscapeStyles();

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