// src/components/ShareSidebar.tsx
import React, { useState } from 'react';
import { Core } from 'cytoscape';
import { useTranslations } from '../hooks/useTranslations';
import Button from './ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  cyRef: React.MutableRefObject<Core | null>;
}

const ShareSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
  const { t } = useTranslations();
  const [format, setFormat] = useState<'json' | 'text' | 'png'>('json');
  const [includePos, setIncludePos] = useState(true);
  const [includeStyles, setIncludeStyles] = useState(true);
  const [pngWidth, setPngWidth] = useState(1920);
  const [pngHeight, setPngHeight] = useState(1080);

  const handleDownload = () => {
    const cy = cyRef.current;
    if (!cy) return;

    if (format === 'json') {
      const full = (cy.json() as any).elements;
      const nodes = full.nodes.map((n: any) => {
        const o: any = { data: n.data };
        if (includePos) o.position = n.position;
        if (includeStyles) o.style = n.style;
        return o;
      });
      const edges = full.edges.map((e: any) => ({ data: e.data }));
      const blob = new Blob(
        [JSON.stringify({ nodes, edges }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'netmap.json';
      a.click();
      URL.revokeObjectURL(url);

    } else if (format === 'text') {
      const lines: string[] = [];
      cy.nodes().forEach(n => {
        const d = n.data() as any;
        lines.push(`[${d.label}](id=${d.id})`);
      });
      cy.edges().forEach(e => {
        const d = e.data() as any;
        lines.push(`${d.source} -> ${d.target}${d.label ? ` : "${d.label}"` : ''}`);
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'netmap.txt';
      a.click();
      URL.revokeObjectURL(url);

    } else {
      const uri = cy.png({ full: true, scale: pngWidth / cy.width() });
      const a = document.createElement('a');
      a.href = uri;
      a.download = 'netmap.png';
      a.click();
    }
  };

  return (
    <aside
      className={`
        fixed right-0 top-0 h-full w-80
        bg-bg-secondary/30 light:bg-bg-secondary/30 dark:bg-bg-secondary/50
        backdrop-blur-lg backdrop-filter
        border-l border-border
        rounded-l-lg shadow-lg
        transform transition-transform
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      aria-labelledby="share-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="share-title" className="text-lg font-semibold">
          {t('shareSidebarLabel')}
        </h2>
        <button
          onClick={onClose}
          aria-label={t('close')}
          className="text-xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* Format selector */}
        <div>
          <label className="block font-medium mb-1">{t('format')}</label>
          <select
            className="input-base"
            value={format}
            onChange={e => setFormat(e.target.value as any)}
          >
            <option value="json">{t('json')}</option>
            <option value="text">{t('text')}</option>
            <option value="png">{t('png')}</option>
          </select>
        </div>

        {/* JSON options */}
        {format === 'json' && (
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includePos}
                onChange={e => setIncludePos(e.target.checked)}
                className="mr-2"
              />
              {t('includePositions')}
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={includeStyles}
                onChange={e => setIncludeStyles(e.target.checked)}
                className="mr-2"
              />
              {t('includeStyles')}
            </label>
          </div>
        )}

        {/* PNG options */}
        {format === 'png' && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm">{t('pngWidth')}</label>
              <input
                type="number"
                className="input-base w-full"
                value={pngWidth}
                onChange={e => setPngWidth(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm">{t('pngHeight')}</label>
              <input
                type="number"
                className="input-base w-full"
                value={pngHeight}
                onChange={e => setPngHeight(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <Button variant="primary" className="w-full" onClick={handleDownload}>
          {t('download')}
        </Button>
      </div>
    </aside>
  );
};

export default ShareSidebar;
