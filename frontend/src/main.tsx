import React from 'react';
import ReactDOM from 'react-dom/client';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';
import edgehandles from 'cytoscape-edgehandles';
import App from './App';
import { LocalizationProvider } from './hooks/useTranslations';
import './index.css';

// Register Cytoscape extensions *ONCE* globally before the app renders
try {
  cytoscape.use(coseBilkent);
  cytoscape.use(dagre);
  cytoscape.use(edgehandles);
} catch (error) {
  console.warn("Cytoscape extensions already registered or failed:", error);
}


// Wrap the entire app in LocalizationProvider so t() works everywhere
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> {/* Keep StrictMode for development checks */}
    <LocalizationProvider>
      <App />
    </LocalizationProvider>
  </React.StrictMode>
);