import React, { useState, useEffect } from 'react';
import { useGraphStore } from '../store';
import { parseGraphSyntax } from '../utils/graphParser';
import { diabetesExampleSyntax } from '../constants/exampleGraph';
import { useTranslations } from '../hooks/useTranslations';
import Panel from './ui/Panel';
import Button from './ui/Button';
import TextAreaInput from './ui/TextAreaInput';
// Correct icon imports - remove unused ones
import { UploadCloud, LayoutGrid, Languages, Pencil, Sun, Moon } from 'lucide-react';

const availableLayouts = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre'];

const Sidebar: React.FC = () => {
  const { t, locale, setLocale } = useTranslations();
  const [graphInputText, setGraphInputText] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove(theme === 'light' ? 'dark' : 'light');
      root.classList.add(theme);
  }, [theme]);

  // ** CORRECTED ZUSTAND STATE SELECTION **
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);
  const currentLayout = useGraphStore((state) => state.layoutName);
  const setLayoutName = useGraphStore((state) => state.setLayoutName);
  // ** END CORRECTION **


  const handleLoadGraph = () => {
     const parsedData = parseGraphSyntax(graphInputText, t);
     if (parsedData) {
         setNodes(parsedData.nodes);
         setEdges(parsedData.edges);
     } else {
         alert(t('parseErrorAlert'));
     }
  };

  const handlePasteExample = () => { setGraphInputText(diabetesExampleSyntax); };
  const toggleLocale = () => { setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US'); };
  const toggleTheme = () => { setTheme(theme === 'light' ? 'dark' : 'light'); };


  return (
    <div className="flex flex-col h-full p-4 space-y-5 overflow-y-auto no-scrollbar">

      {/* Header section */}
      <div className="flex justify-between items-center mb-1">
        {/* App Title */}
        <h1 className="text-lg font-semibold text-text-base flex items-center gap-2">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
           {t('appTitle')}
        </h1>
         <div className="flex items-center gap-1"> {/* Reduced gap */}
              {/* Language Toggle */}
              <Button onClick={toggleLocale} variant="ghost" size="sm" icon={Languages} title={locale === 'en-US' ? 'Mudar para Português' : 'Switch to English'}>
                  {locale === 'en-US' ? 'PT' : 'EN'}
              </Button>
               {/* Theme Toggle */}
               <Button onClick={toggleTheme} variant="ghost" size="sm" icon={theme === 'light' ? Moon : Sun} title={theme === 'light' ? 'Mudar para modo escuro' : 'Switch to Light Mode'} /> {/* Closing tag was correct here before, just verifying */}
         </div>
      </div>

      {/* Load Graph Panel */}
      <Panel title={t('loadGraphTitle')} icon={UploadCloud}>
          <TextAreaInput
              id="graph-input"
              // ** CORRECTED LABEL JSX ASSIGNMENT **
              // Define the label content separately for clarity
              label={
                  <span className="flex justify-between items-center w-full">
                    <span>{t('loadGraphLabel')}</span>
                    <button
                        type="button" // Important for buttons inside labels
                        onClick={handlePasteExample}
                        className="text-accent-cyan hover:underline focus:outline-none text-xs p-0 font-medium"
                    >
                        {t('pasteExampleLink')}
                    </button>
                  </span>
              }
              // ** END CORRECTION **
              rows={8}
              className="font-mono text-xs leading-relaxed"
              placeholder={`[Node A]\n[Node B]\n[Node A] -> [Node B]`}
              value={graphInputText}
              onChange={(e) => setGraphInputText(e.target.value)}
              disabled={!stylesResolved}
          />
          <Button
              variant="primary"
              className="w-full"
              onClick={handleLoadGraph}
              disabled={!stylesResolved || !graphInputText.trim()}
              // icon={FileText} // Removed unused icon import earlier
          >
              {t('loadGraphButton')}
          </Button>
      </Panel>

      {/* Layout Controls Panel */}
      <Panel title={t('layoutTitle')} icon={LayoutGrid}>
          <div className="grid grid-cols-3 gap-2">
              {availableLayouts.map((layout) => (
                  <Button
                      key={layout}
                      onClick={() => setLayoutName(layout)}
                      variant={currentLayout === layout ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full justify-center"
                      disabled={!stylesResolved}
                  > {/* Verified opening tag */}
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </Button> // ** Verified closing tag **
              ))}
          </div>
      </Panel>

       {/* Editing Placeholder Panel */}
       <Panel title={t('editingTitle')} icon={Pencil}>
            <p className="text-sm text-text-muted">{t('editingPlaceholder')}</p>
        </Panel>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Footer / Authorship */}
      <div className="mt-4 pt-4 text-center border-t border-border">
           <p className="text-xs text-text-muted opacity-75">
               {t('authorship')}
           </p>
      </div>
    </div>
  );
};

export default Sidebar;