// frontend/src/App.tsx
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { useResolveCytoscapeStyles } from './store';
// No need for useTranslations here if App shell text is static or handled in Sidebar

function App() {
  // Resolve styles on app mount
  useResolveCytoscapeStyles();

  return (
    <div className="flex h-screen w-screen bg-secondary-dark text-text-primary-dark overflow-hidden">
      {/* Sidebar Area */}
      <div className="w-1/3 min-w-[320px] max-w-md h-full bg-gray-800 border-r border-border-dark overflow-y-auto shadow-lg"> {/* Adjusted width */}
         <Sidebar /> {/* Sidebar handles its own content and title */}
      </div>
      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative">
        <GraphCanvas />
      </div>
    </div>
  );
}

export default App;