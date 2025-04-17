// Sidebar.tsx
// Updated: 2025‑04‑17
import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { useGraphStore } from '../store';
import { parseGraphSyntax } from '../utils/graphParser';
import { diabetesExampleSyntax } from '../constants/exampleGraph';
import { useTranslations } from '../hooks/useTranslations';
import Panel from './ui/Panel';
import Button from './ui/Button';
import TextAreaInput from './ui/TextAreaInput';
import TextInput from './ui/TextInput';
import SelectInput, { SelectOption } from './ui/SelectInput';
import EditPanel from './EditPanel';
import {
  UploadCloud,
  LayoutGrid,
  Languages,
  Sun,
  Moon,
  Trash2,
  PlusCircle,
  Link
} from 'lucide-react';

const availableLayouts = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre'];
let newNodeCount = 0, newEdgeCount = 0;
const genNodeId = () => `new_n_${Date.now()}_${newNodeCount++}`;
const genEdgeId = () => `new_e_${Date.now()}_${newEdgeCount++}`;

const Sidebar: React.FC = () => {
  const { t, locale, setLocale } = useTranslations();
  const [graphText, setGraphText] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [srcRef, setSrcRef] = useState('');
  const [tgtRef, setTgtRef] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Separate selectors for each slice
  const nodes = useGraphStore(s => s.nodes);
  const setNodes = useGraphStore(s => s.setNodes);
  const setEdges = useGraphStore(s => s.setEdges);
  const stylesResolved = useGraphStore(s => s.stylesResolved);
  const currentLayout = useGraphStore(s => s.layoutName);
  const setLayoutName = useGraphStore(s => s.setLayoutName);
  const selectedElementId = useGraphStore(s => s.selectedElementId);
  const removeElement = useGraphStore(s => s.removeElement);
  const addNode = useGraphStore(s => s.addNode);
  const addEdge = useGraphStore(s => s.addEdge);

  const handleLoad = () => {
    const parsed = parseGraphSyntax(graphText, t);
    if (parsed) {
      setNodes(parsed.nodes);
      setEdges(parsed.edges);
    } else {
      alert(t('parseErrorAlert'));
    }
  };

  // Filter to ensure id is always a string
  const nodeOptions: SelectOption[] = useMemo(() => {
    return nodes
      .filter((n): n is { data: { id: string; label?: string } } => typeof n.data?.id === 'string')
      .map(n => ({
        value: n.data.id,
        label: `${n.data.label ?? 'N/A'} (${n.data.id.slice(0, 4)}…)`
      }));
  }, [nodes]);

  return (
    <div className="flex flex-col h-full p-4 space-y-5 overflow-y-auto no-scrollbar">
      {/* Logo & Title */}
      <div className="flex items-center gap-2 mb-4">
        <img src="/logo.svg" alt="Netmap" className="w-6 h-6" />
        <h2 className="text-xl font-bold">{t('appTitle')}</h2>
      </div>

      {/* Locale & Theme */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
          variant="ghost" size="sm" icon={Languages}
          title={t(locale === 'en-US' ? 'switchToPortuguese' : 'switchToEnglish')}
        >
          {locale === 'en-US' ? 'PT' : 'EN'}
        </Button>
        <Button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          variant="ghost" size="sm"
          icon={theme === 'light' ? Moon : Sun}
          title={t(theme === 'light' ? 'switchToDarkMode' : 'switchToLightMode')}
        />
      </div>

      {/* Load Graph */}
      <Panel title={t('loadGraphTitle')} icon={UploadCloud}>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="graph-input" className="label-text">{t('loadGraphLabel')}</label>
          <button
            onClick={() => setGraphText(diabetesExampleSyntax)}
            disabled={!stylesResolved}
            className="text-accent-primary hover:underline text-xs font-medium"
          >
            {t('pasteExampleLink')}
          </button>
        </div>
        <TextAreaInput
          id="graph-input" rows={8} className="font-mono text-xs"
          placeholder="[A]->[B]" value={graphText}
          onChange={e => setGraphText(e.target.value)}
          disabled={!stylesResolved}
        />
        <Button
          variant="primary" className="w-full mt-2"
          onClick={handleLoad}
          disabled={!stylesResolved || !graphText.trim()}
        >
          {t('loadGraphButton')}
        </Button>
      </Panel>

      {/* Layout Controls */}
      <Panel title={t('layoutTitle')} icon={LayoutGrid}>
        <div className="grid grid-cols-3 gap-2">
          {availableLayouts.map(l => (
            <Button
              key={l}
              onClick={() => setLayoutName(l)}
              variant={currentLayout === l ? 'primary' : 'secondary'}
              size="sm" className="w-full"
              disabled={!stylesResolved}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </Button>
          ))}
        </div>
      </Panel>

      {/* Editing & Tools */}
      <Panel title={t('editingTitle')} icon={PlusCircle}>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={() => {
              const label = prompt(t('addNodePromptLabel'), t('addNodePromptDefault'));
              if (label) addNode({ data: { id: genNodeId(), label } });
            }}
            variant="secondary" size="sm" className="w-full"
            icon={PlusCircle} disabled={!stylesResolved}
          >
            {t('addNodeTitle')}
          </Button>
          <Button
            onClick={() => selectedElementId && removeElement(selectedElementId)}
            variant="danger" size="sm" className="w-full"
            icon={Trash2} disabled={!selectedElementId || !stylesResolved}
          >
            {t('deleteSelectedTitle')}
          </Button>
        </div>

        {/* Add Edge */}
        <div className="border-t border-border pt-4 space-y-3 mb-4">
          <h4 className="text-sm font-medium text-text-muted flex items-center gap-2">
            <Link size={14} /> {t('addEdgeTitle')}
          </h4>
          <SelectInput
            id="src" label={t('sourceNodeLabel')}
            placeholderOption={{ value: '', label: t('selectSourcePlaceholder') }}
            options={nodeOptions} value={srcRef}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSrcRef(e.target.value)}
            disabled={!stylesResolved || nodeOptions.length === 0}
          />
          <SelectInput
            id="tgt" label={t('targetNodeLabel')}
            placeholderOption={{ value: '', label: t('selectTargetPlaceholder') }}
            options={nodeOptions} value={tgtRef}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setTgtRef(e.target.value)}
            disabled={!stylesResolved || nodeOptions.length === 0}
          />
          <TextInput
            id="edge-label" label={t('edgeLabelLabel')}
            value={edgeLabel} onChange={e => setEdgeLabel(e.target.value)}
            disabled={!stylesResolved}
          />
          <Button
            onClick={() => {
              if (!srcRef || !tgtRef) { alert(t('addEdgeSelectNodesError')); return; }
              addEdge({ data: { id: genEdgeId(), source: srcRef, target: tgtRef, label: edgeLabel || undefined } });
              setSrcRef(''); setTgtRef(''); setEdgeLabel('');
            }}
            variant="secondary" size="sm" className="w-full"
            icon={Link} disabled={!srcRef || !tgtRef || !stylesResolved}
          >
            {t('addEdgeTitle')}
          </Button>
        </div>

        <EditPanel />
      </Panel>

      <div className="flex-grow" />

      <div className="mt-4 pt-4 text-center border-t border-border">
        <p className="text-xs text-text-muted opacity-75">{t('authorship')}</p>
      </div>
    </div>
  );
};

export default Sidebar;
