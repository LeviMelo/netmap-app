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
    // ... (download logic remains the same) ...
     const cy = cyRef.current;
    if (!cy) return;

    if (format === 'json') {
      const full = (cy.json() as any).elements;
      // Careful: cy.json() might not include 'style' property by default.
      // You might need to iterate elements and get their renderedStyle if needed.
      const nodes = full.nodes.map((n: any) => {
        const o: any = { data: n.data };
        if (includePos) o.position = n.position;
        // 'style' might not be directly on the json output, adjust if needed
        if (includeStyles && n.style) o.style = n.style;
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
        // Include ID in output for better reference
        lines.push(`[${d.label || 'Untitled'}](id=${d.id})`);
      });
      cy.edges().forEach(e => {
        const d = e.data() as any;
        // Use IDs for source/target in text output for robustness
        lines.push(`${d.source} -> ${d.target}${d.label ? ` : "${d.label}"` : ''}`);
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'netmap.txt';
      a.click();
      URL.revokeObjectURL(url);

    } else { // PNG
        // Use specified dimensions, ensure they are numbers
        const w = Number(pngWidth) || 1920;
        const h = Number(pngHeight) || 1080;
        const scaleFactor = w / cy.width(); // Calculate scale based on width

        const uri = cy.png({
            full: true, // Capture the whole graph
            scale: scaleFactor,
            // bg: 'white', // Optionally set background color for PNG
            // width: w, // These might not be directly supported by cy.png, scale is primary
            // height: h
         });
      const a = document.createElement('a');
      a.href = uri;
      a.download = 'netmap.png';
      a.click();
    }
  };


  return (
    <aside
      // Apply the base .sidebar-overlay class
      // THEN add the background color variable utility (bg-bg-secondary)
      // THEN add the LIGHT mode opacity utility (bg-opacity-30)
      // THEN add the DARK mode opacity utility (dark:bg-opacity-50)
      className={`
        sidebar-overlay
        bg-bg-secondary bg-opacity-30 dark:bg-opacity-50
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      aria-labelledby="share-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Header remains the same */}
       <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="share-title" className="text-lg font-semibold">
          {t('shareSidebarLabel')}
        </h2>
        <button onClick={onClose} aria-label={t('close')} className="btn btn-ghost px-2 py-1 text-xl leading-none">
          ×
        </button>
      </div>

      {/* Body remains the same */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar">
        <div>
          <label className="label-text mb-1">{t('format')}</label>
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

        {format === 'json' && (
          <div className="space-y-2">
            <label className="label-text inline-flex items-center gap-2">
              <input type="checkbox" checked={includePos} onChange={e => setIncludePos(e.target.checked)} />
              {t('includePositions')}
            </label>
            {/* Include Styles might be tricky depending on cy.json() output */}
            {/* <label className="label-text inline-flex items-center gap-2">
              <input type="checkbox" checked={includeStyles} onChange={e => setIncludeStyles(e.target.checked)} />
              {t('includeStyles')}
            </label> */}
          </div>
        )}

        {format === 'png' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">{t('pngWidth')}</label>
              <input type="number" className="input-base" value={pngWidth} onChange={e => setPngWidth(Number(e.target.value))} min="100"/>
            </div>
            <div>
              <label className="label-text">{t('pngHeight')}</label>
              <input type="number" className="input-base" value={pngHeight} onChange={e => setPngHeight(Number(e.target.value))} min="100"/>
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