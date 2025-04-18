import React, { useState, ChangeEvent, useMemo } from 'react';
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
import LayoutControls from './LayoutControls';
import StyleControls from './StyleControls';
import { UploadCloud, PlusCircle, Link, Trash2, Sun, Moon } from 'lucide-react';

/* id generators ---------------------------------------------------- */
const genNodeId = (() => { let c = 0; return () => `u_n_${Date.now()}_${c++}`; })();
const genEdgeId = (() => { let c = 0; return () => `u_e_${Date.now()}_${c++}`; })();

const Sidebar: React.FC = () => {
  /* localisation / theme ------------------------------------------ */
  const { t, locale, setLocale } = useTranslations();
  const isLight = document.documentElement.classList.contains('light');
  const toggleTheme = () => document.documentElement.classList.toggle('light');

  /* graph input mode (DSL vs JSON) -------------------------------- */
  const [syntaxMode, setSyntaxMode] = useState<'text' | 'json'>('text');
  const [input, setInput] = useState('');

  /* graph mutations ------------------------------------------------ */
  const nodes       = useGraphStore((s) => s.nodes);
  const setNodes    = useGraphStore((s) => s.setNodes);
  const setEdges    = useGraphStore((s) => s.setEdges);
  const selectedId  = useGraphStore((s) => s.selectedElementId);
  const remove      = useGraphStore((s) => s.removeElement);
  const addNode     = useGraphStore((s) => s.addNode);
  const addEdge     = useGraphStore((s) => s.addEdge);

  /* load button ---------------------------------------------------- */
  const handleLoad = () => {
    if (!input.trim()) return;
    if (syntaxMode === 'json') {
      try {
        const obj = JSON.parse(input);
        if (obj.nodes && obj.edges) {
          setNodes(obj.nodes);
          setEdges(obj.edges);
        } else throw 0;
      } catch { alert('Invalid JSON'); }
      return;
    }
    /* text DSL ---------------------------------------------------- */
    const parsed = parseGraphSyntax(input, t);
    if (parsed) { setNodes(parsed.nodes); setEdges(parsed.edges); }
    else alert(t('parseErrorAlert'));
  };

  /* edge‑builder dropdowns ---------------------------------------- */
  const options: SelectOption[] = useMemo(
    () =>
      nodes
        .filter((n): n is { data: { id: string; label?: string } } => !!n.data?.id)
        .map((n) => ({
          value: n.data.id,
          label: `${n.data.label ?? 'N/A'} (${n.data.id.slice(0, 4)})`,
        })),
    [nodes]
  );
  const [src, setSrc] = useState('');  const [tgt, setTgt] = useState('');  const [lbl, setLbl] = useState('');

  /* ---------------------------------------------------------------- */
  return (
    <div className="flex flex-col h-full p-4 space-y-5 overflow-y-auto no-scrollbar">
      {/* quick switches -------------------------------------------- */}
      <div className="flex justify-end gap-2 mb-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
        >{locale === 'en-US' ? 'PT' : 'EN'}</Button>

        <Button
          size="sm"
          variant="ghost"
          icon={isLight ? Moon : Sun}
          onClick={toggleTheme}
          title={isLight ? t('switchToDarkMode') : t('switchToLightMode')}
        />

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSyntaxMode(syntaxMode === 'text' ? 'json' : 'text')}
        >{syntaxMode.toUpperCase()}</Button>
      </div>

      {/* loader panel --------------------------------------------- */}
      <Panel title={syntaxMode === 'text' ? t('loadGraphTitle') : 'Import JSON'} icon={UploadCloud}>
        {syntaxMode === 'text' && (
          <button
            onClick={() => setInput(diabetesExampleSyntax)}
            className="text-accent-primary text-xs font-medium mb-1"
          >
            {t('pasteExampleLink')}
          </button>
        )}
        <TextAreaInput
          id="graph-input"
          rows={8}
          className="font-mono text-xs"
          value={input}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
        />
        <Button variant="primary" className="w-full mt-2" onClick={handleLoad} disabled={!input.trim()}>
          {syntaxMode === 'text' ? t('loadGraphButton') : 'Load JSON'}
        </Button>
      </Panel>

      {/* layout & style panels ------------------------------------ */}
      <LayoutControls />
      <StyleControls />

      {/* editing panel ------------------------------------------- */}
      <Panel title={t('editingTitle')} icon={PlusCircle}>
        {/* quick node / delete */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            variant="secondary"
            size="sm"
            icon={PlusCircle}
            className="w-full"
            onClick={() => {
              const name = prompt(t('addNodePromptLabel'), t('addNodePromptDefault'));
              if (name) addNode({ data: { id: genNodeId(), label: name } });
            }}
          >{t('addNodeTitle')}</Button>

          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            className="w-full"
            disabled={!selectedId}
            onClick={() => selectedId && remove(selectedId)}
          >{t('deleteSelectedTitle')}</Button>
        </div>

        {/* edge creator */}
        <h4 className="text-sm font-medium text-text-muted flex items-center gap-2 mb-1">
          <Link size={14} /> {t('addEdgeTitle')}
        </h4>
        <SelectInput id="src" label={t('sourceNodeLabel')} options={options} value={src} onChange={(e)=>setSrc(e.target.value)} />
        <SelectInput id="tgt" label={t('targetNodeLabel')} options={options} value={tgt} onChange={(e)=>setTgt(e.target.value)} />
        <TextInput   id="lbl" label={t('edgeLabelLabel')} value={lbl} onChange={(e)=>setLbl(e.target.value)} />

        <Button
          variant="secondary"
          size="sm"
          icon={Link}
          className="w-full mt-2"
          onClick={() => {
            if (!src || !tgt) { alert(t('addEdgeSelectNodesError')); return; }
            addEdge({ data: { id: genEdgeId(), source: src, target: tgt, label: lbl || undefined } });
            setSrc(''); setTgt(''); setLbl('');
          }}
        >{t('addEdgeTitle')}</Button>

        {/* element‑specific editor -------------------------------- */}
        <EditPanel />
      </Panel>
    </div>
  );
};

export default Sidebar;
