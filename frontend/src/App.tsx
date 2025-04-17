// frontend/src/App.tsx
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { useResolveCytoscapeStyles } from './store';
// No useEffect needed here anymore

function App() {
  // Resolve styles on app mount
  useResolveCytoscapeStyles();

  return (
    <div className="flex h-screen w-screen bg-secondary-dark text-text-primary-dark overflow-hidden">
      <div className="w-1/4 min-w-[250px] h-full bg-gray-800 border-r border-border-dark p-4 overflow-y-auto">
         <h1 className="heading-1">Concept Map Builder</h1>
         <Sidebar />
      </div>
      <div className="flex-1 h-full">
        {/* Conditionally render GraphCanvas only after styles are resolved */}
        <GraphCanvas />
      </div>
    </div>
  );
}

export default App;