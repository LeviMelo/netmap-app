import React, { useState } from 'react';
import { useGraphStore } from '../store';
import { parseGraphSyntax } from '../utils/graphParser';
import { diabetesExampleSyntax } from '../constants/exampleGraph'; // Import example
import { useTranslations } from '../hooks/useTranslations'; // Import i18n hook

const availableLayouts = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre'];

const Sidebar: React.FC = () => {
  const { t, locale, setLocale } = useTranslations(); // Use the hook
  const [graphInputText, setGraphInputText] = useState<string>('');
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);
  const currentLayout = useGraphStore((state) => state.layoutName);
  const setLayoutName = useGraphStore((state) => state.setLayoutName);

  const handleLoadGraph = () => {
     console.log("Attempting to load graph from text...");
     // Pass the translation function 't' to the parser
     const parsedData = parseGraphSyntax(graphInputText, t);
     if (parsedData) {
         console.log("Parsed data:", parsedData);
         setNodes(parsedData.nodes);
         setEdges(parsedData.edges);
     } else {
         // This branch may not be reachable if parser always returns object
         console.error("Critical parsing error occurred.");
         alert(t('parseErrorAlert')); // Use translated alert
     }
  };

  const handlePasteExample = () => {
      setGraphInputText(diabetesExampleSyntax); // Use constant
  };

  const toggleLocale = () => {
      setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US');
  };

  return (
    <div className="flex flex-col h-full p-4"> {/* Added standard padding */}
      {/* Language Toggle */}
      <div className="mb-4 text-right">
           <button onClick={toggleLocale} className="text-sm text-accent-cyan hover:underline focus:outline-none">
               {locale === 'en-US' ? 'Mudar para Português' : 'Switch to English'}
           </button>
      </div>

      {/* Input Section */}
      <div>
        {/* Use heading-1 class from index.css */}
        <h2 className="heading-1 !mb-2">{t('loadGraphTitle')}</h2>
        <label htmlFor="graph-input" className="label-text">
            {t('loadGraphLabel')}{' '}
             <button onClick={handlePasteExample} className="text-accent-cyan hover:underline focus:outline-none text-sm p-0">
                 {t('pasteExampleLink')}
             </button>:
        </label>
        <textarea
            id="graph-input"
            rows={10}
            className="input-text mt-1 mb-2 h-48 resize-none font-mono text-sm"
             // Use a simple placeholder, actual example pasted via button
            placeholder={`[Node A]\n[Node B]\n[Node A] -> [Node B] : "Connects"`}
            value={graphInputText}
            onChange={(e) => setGraphInputText(e.target.value)}
            disabled={!stylesResolved}
        />
        <button
            // Use btn classes from index.css
            className="btn btn-primary w-full"
            onClick={handleLoadGraph}
            disabled={!stylesResolved || !graphInputText.trim()}
        >
            {t('loadGraphButton')}
        </button>
      </div>

      {/* Layout Controls Section */}
      <div className="mt-6">
          {/* Use heading-2 class */}
          <h3 className="heading-2 !mt-0 !mb-2">{t('layoutTitle')}</h3>
          <div className="flex flex-wrap gap-2">
              {availableLayouts.map((layout) => (
                  <button
                      key={layout}
                      onClick={() => setLayoutName(layout)}
                       // Use btn classes
                      className={`btn text-xs px-3 py-1 ${
                          currentLayout === layout ? 'btn-primary' : 'btn-secondary'
                      }`}
                      disabled={!stylesResolved}
                  >
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </button>
              ))}
          </div>
      </div>

       {/* Editing Placeholder */}
       <div className="mt-6">
             {/* Use heading-2 class */}
            <h3 className="heading-2 !mt-0 !mb-2">{t('editingTitle')}</h3>
            <p className="text-sm text-text-secondary-dark">{t('editingPlaceholder')}</p>
        </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Footer / Authorship */}
      <div className="mt-4 pt-4 border-t border-border-dark text-center">
           <p className="text-sm text-text-secondary-dark">
               {t('authorship')}
           </p>
      </div>
    </div>
  );
};

export default Sidebar;