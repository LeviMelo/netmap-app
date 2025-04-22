// src/components/Sidebar.tsx
/**
 * Renders the left sidebar containing controls for loading graph data,
 * managing layout and styles, and editing graph elements (nodes/edges).
 * It interacts with various Zustand stores to fetch data/settings and dispatch actions.
 */
import React, { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { ElementDefinition } from 'cytoscape';

// Import stores
import { useGraphDataStore } from '../stores/graphDataStore';
import { useGraphInteractionStore } from '../stores/graphInteractionStore';
// Settings store might be needed indirectly via controls, but not directly here

// Import utilities and constants
import { parseGraphSyntax } from '../utils/graphParser';
import { diabetesExampleSyntax } from '../constants/exampleGraph';
import { useTranslations } from '../hooks/useTranslations';

// Import UI components and sub-panels
import Panel from './ui/Panel';
import Button from './ui/Button';
import TextAreaInput from './ui/TextAreaInput';
import TextInput from './ui/TextInput';
import SelectInput, { SelectOption } from './ui/SelectInput';
import EditPanel from './EditPanel'; // Will be updated later
import LayoutControls from './LayoutControls'; // Will be updated later
import StyleControls from './StyleControls'; // Will beupdated later
import { UploadCloud, PlusCircle, Link, Trash2, Sun, Moon, Settings, Edit } from 'lucide-react'; // Added icons

// ID generators (keep local or move to utils)
const genNodeId = (() => { let c = 0; return () => `u_n_${Date.now()}_${c++}`; })();
const genEdgeId = (() => { let c = 0; return () => `u_e_${Date.now()}_${c++}`; })();

const Sidebar: React.FC = () => {
  /* Localisation / Theme */
  const { t, locale, setLocale } = useTranslations();
  const [isDarkMode, setIsDarkMode] = useState(!document.documentElement.classList.contains('light'));

  const toggleTheme = () => {
    document.documentElement.classList.toggle('light');
    setIsDarkMode(!document.documentElement.classList.contains('light'));
  };

  // Ensure theme state is synced on initial load
  useEffect(() => {
      setIsDarkMode(!document.documentElement.classList.contains('light'));
  }, []);


  /* Local State for Inputs */
  const [syntaxMode, setSyntaxMode] = useState<'text' | 'json'>('text');
  const [input, setInput] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');

  /* Zustand Store Access */
  // Data Store
  const nodes = useGraphDataStore((s) => s.nodes);
  const loadGraphAction = useGraphDataStore((s) => s.loadGraph);
  const addNodeAction = useGraphDataStore((s) => s.addNode);
  const addEdgeAction = useGraphDataStore((s) => s.addEdge);
  const removeElementAction = useGraphDataStore((s) => s.removeElement);

  // Interaction Store
  const selectedId = useGraphInteractionStore((s) => s.selectedElementId);
  const setSelectedElementId = useGraphInteractionStore((s) => s.setSelectedElementId); // Needed to clear selection

  /* Memoized Data for Dropdowns */
  const nodeOptions: SelectOption[] = useMemo(
    () =>
      nodes
        // Ensure data and id exist for filtering and mapping
        .filter((n): n is { data: { id: string; label?: string } } => !!n.data?.id)
        .map((n) => ({
          value: n.data.id,
          // Provide a fallback label if node.data.label is undefined
          label: `${n.data.label ?? 'Unnamed Node'} (${n.data.id.slice(0, 4)}...)`,
        })),
    [nodes] // Recompute only when nodes array changes
  );

  /* Event Handlers */
  const handleLoadGraph = () => {
    if (!input.trim()) return;

    if (syntaxMode === 'json') {
      try {
        const obj = JSON.parse(input);
        // Basic validation: Check if nodes and edges arrays exist
        if (Array.isArray(obj.nodes) && Array.isArray(obj.edges)) {
          loadGraphAction(obj.nodes, obj.edges);
           // Clear selection after loading new graph
           setSelectedElementId(null);
        } else {
           console.error('Invalid JSON format: "nodes" and "edges" arrays are required.', obj);
           alert('Invalid JSON structure. Check console.');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON syntax. Check console.');
      }
      return;
    }

    // Text DSL parsing
    const parsed = parseGraphSyntax(input, t); // Pass translation function
    if (parsed) {
      loadGraphAction(parsed.nodes, parsed.edges);
      // Clear selection after loading new graph
      setSelectedElementId(null);
    } else {
      // parseGraphSyntax should ideally show specific errors via console.warn
      alert(t('parseErrorAlert'));
    }
  };

  const handleAddNode = () => {
    // Use dedicated modal later
    const name = prompt(t('addNodePromptLabel'), t('addNodePromptDefault'));
    if (name) {
      addNodeAction({ data: { id: genNodeId(), label: name } });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      removeElementAction(selectedId);
      // Selection is cleared automatically via store subscription if element is deleted
    }
  };

  const handleAddEdge = () => {
    if (!edgeSource || !edgeTarget) {
      alert(t('addEdgeSelectNodesError'));
      return;
    }
    // Optional: Check if source and target nodes actually exist in the store (robustness)
    // const nodeIds = new Set(nodes.map(n => n.data?.id));
    // if (!nodeIds.has(edgeSource) || !nodeIds.has(edgeTarget)) {
    //     alert(t('addEdgeInvalidNodeError'));
    //     return;
    // }
    addEdgeAction({
      data: {
        id: genEdgeId(),
        source: edgeSource,
        target: edgeTarget,
        label: edgeLabel || undefined, // Add label only if not empty
      },
    });
    // Reset edge input fields
    setEdgeSource('');
    setEdgeTarget('');
    setEdgeLabel('');
  };


  /* Render */
  return (
    // Added `bg-bg-secondary` and adjusted padding/spacing for consistency
    <div className="flex flex-col h-full p-3 space-y-4 overflow-y-auto bg-bg-secondary border-r border-border no-scrollbar">
      {/* Header / Quick Actions */}
      <div className="flex justify-between items-center mb-2">
         {/* Placeholder for Logo/Title if needed */}
         <span className="font-semibold text-lg">Controls</span>
         <div className="flex items-center gap-1">
             <Button
                size="sm" variant="ghost"
                onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
                title={locale === 'en-US' ? t('switchToPortuguese') : t('switchToEnglish')}
             >
                 {locale === 'en-US' ? 'PT' : 'EN'}
             </Button>
             <Button
                size="sm" variant="ghost" icon={isDarkMode ? Sun : Moon}
                onClick={toggleTheme}
                title={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
             />
              <Button
                size="sm" variant="ghost"
                onClick={() => setSyntaxMode(syntaxMode === 'text' ? 'json' : 'text')}
                title={`Switch to ${syntaxMode === 'text' ? 'JSON' : 'Text'} input mode`}
             >
                 {syntaxMode.toUpperCase()}
             </Button>
         </div>
      </div>

      {/* Loader Panel */}
      <Panel title={syntaxMode === 'text' ? t('loadGraphTitle') : 'Import JSON'} icon={UploadCloud}>
        {syntaxMode === 'text' && (
          <button
            onClick={() => setInput(diabetesExampleSyntax)}
            className="text-accent-primary hover:underline text-xs font-medium mb-1 block text-left" // Make it block for spacing
          >
            {t('pasteExampleLink')}
          </button>
        )}
        <TextAreaInput
          id="graph-input"
          rows={6} // Slightly reduced rows
          className="font-mono text-xs"
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder={syntaxMode === 'text' ? '[Node A]\n[Node B]\nNode A -> Node B : "label"' : '{ "nodes": [...], "edges": [...] }'}
        />
        <Button variant="primary" size="sm" className="w-full mt-2" onClick={handleLoadGraph} disabled={!input.trim()}>
          {syntaxMode === 'text' ? t('loadGraphButton') : 'Load JSON'}
        </Button>
      </Panel>

      {/* Layout & Style Panels */}
      <LayoutControls />
      <StyleControls />

      {/* Editing Panel */}
      <Panel title={t('editingTitle')} icon={Edit}>
        {/* Quick Node Add / Delete Selected */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button variant="secondary" size="sm" icon={PlusCircle} className="w-full" onClick={handleAddNode}>
            {t('addNodeTitle')}
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} className="w-full" disabled={!selectedId} onClick={handleDeleteSelected}>
            {t('deleteSelectedTitle')}
          </Button>
        </div>

        {/* Edge Creator */}
        <h4 className="text-sm font-medium text-text-muted flex items-center gap-1.5 mb-2 border-t border-border pt-3">
          <Link size={14} /> {t('addEdgeTitle')}
        </h4>
        <div className="space-y-2">
            <SelectInput
              id="edge-src" label={t('sourceNodeLabel')} options={nodeOptions}
              value={edgeSource} onChange={(e) => setEdgeSource(e.target.value)}
              // Add a placeholder option
              placeholderOption={{ value: "", label: t('selectSourcePlaceholder')}}
            />
            <SelectInput
              id="edge-tgt" label={t('targetNodeLabel')} options={nodeOptions}
              value={edgeTarget} onChange={(e) => setEdgeTarget(e.target.value)}
              // Add a placeholder option
               placeholderOption={{ value: "", label: t('selectTargetPlaceholder')}}
            />
            <TextInput
              id="edge-lbl" label={t('edgeLabelLabel')}
              value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)}
            />
        </div>
        <Button
          variant="secondary" size="sm" icon={Link} className="w-full mt-3"
          onClick={handleAddEdge} disabled={!edgeSource || !edgeTarget} // Disable if no source/target selected
        >
          {t('addEdgeTitle')}
        </Button>

        {/* Element-Specific Editor (if element selected) */}
        {selectedId ? <EditPanel /> : (
             <p className="text-xs text-text-muted text-center pt-4">{t('editingPlaceholder')}</p>
        )}
      </Panel>

       {/* Footer or other elements if needed */}
        <div className="text-center text-xs text-text-muted pt-4 border-t border-border">
            {t('authorship')}
        </div>

    </div>
  );
};

export default Sidebar;