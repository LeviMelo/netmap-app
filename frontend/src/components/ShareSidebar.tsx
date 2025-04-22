// src/components/ShareSidebar.tsx
/**
 * Renders a sidebar allowing users to export the current graph data or view
 * in various formats (JSON, Text DSL, PNG). It interacts with the graph data store
 * to get the elements and uses a direct Cytoscape instance reference (`cyRef`)
 * for image export.
 */
import React, { useState, MutableRefObject } from 'react';
import { Core, ElementDefinition } from 'cytoscape';

// Import stores
import { useGraphDataStore } from '../stores/graphDataStore'; // To get nodes/edges for text/json export

// Import hooks and UI components
import { useTranslations } from '../hooks/useTranslations';
import Button from './ui/Button';
import { X } from 'lucide-react'; // Icon

// Props interface
interface Props {
  open: boolean;
  onClose: () => void;
  cyRef: MutableRefObject<Core | null>; // Still needed for PNG export
}

// Define export formats
type ExportFormat = 'json' | 'text' | 'png';

const ShareSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
  const { t } = useTranslations();

  // Get nodes/edges from the store for JSON/Text export
  const nodes = useGraphDataStore((s) => s.nodes);
  const edges = useGraphDataStore((s) => s.edges);

  // Local state for export options
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includePositions, setIncludePositions] = useState(true); // For JSON
  const [pngWidth, setPngWidth] = useState(1920);
  // Removed pngHeight - Cytoscape PNG export often scales based on width or content size

  // Function to trigger file download
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append temporarily to body
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Release object URL
  };

  // Handle the download button click
  const handleDownload = () => {
    const cy = cyRef.current;

    // --- JSON Export ---
    if (format === 'json') {
      // Reconstruct elements slightly differently than cy.json() to optionally exclude positions
      const exportNodes = nodes.map((n: ElementDefinition) => {
        const nodeData: any = { data: n.data };
        // Include position only if checkbox is checked AND position exists
        if (includePositions && n.position) {
          nodeData.position = n.position;
        }
        return nodeData;
      });
      const exportEdges = edges.map((e: ElementDefinition) => ({ data: e.data })); // Usually don't need edge positions

      const jsonString = JSON.stringify({ nodes: exportNodes, edges: exportEdges }, null, 2); // Pretty print JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      triggerDownload(blob, 'netmap_graph.json');
    }
    // --- Text DSL Export ---
    else if (format === 'text') {
      const lines: string[] = [];
      // Nodes: [Label](id=..., color=...)
      nodes.forEach((n) => {
         if (!n.data) return; // Skip nodes without data
         const { id, label, ...rest } = n.data; // Separate id and label
         const attrs = Object.entries(rest)
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`) // Stringify values to handle spaces/special chars
            .join(', ');
         lines.push(`[${label || 'Untitled'}](id=${id}${attrs ? `, ${attrs}` : ''})`);
      });
      // Edges: sourceId -> targetId : "label" (attr=...)
      edges.forEach((e) => {
         if (!e.data?.source || !e.data?.target) return; // Skip invalid edges
          const { id, source, target, label, ...rest } = e.data;
          const attrs = Object.entries(rest)
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(', ');
         lines.push(
           `${source} -> ${target}${label ? ` : "${label}"` : ''}${attrs ? ` (${attrs})` : ''}`
         );
      });

      const textContent = lines.join('\n');
      const blob = new Blob([textContent], { type: 'text/plain' });
      triggerDownload(blob, 'netmap_graph.txt');
    }
    // --- PNG Export ---
    else if (format === 'png') {
      if (!cy) {
        alert("Graph instance not available for PNG export.");
        return;
      }
      try {
        // Calculate scale based on desired width relative to current canvas size
        const currentWidth = cy.width();
        const scale = currentWidth > 0 ? (Number(pngWidth) || 1920) / currentWidth : 1;

        const pngUri = cy.png({
          output: 'blob', // Get Blob directly for better handling
          full: true, // Export the whole graph, including off-screen parts
          scale: scale,
          bg: getCssVar('--color-bg-primary'), // Use current background color
        });

        // Check if pngUri is a Blob (synchronous export)
        if (pngUri instanceof Blob) {
             triggerDownload(pngUri, 'netmap_graph.png');
        } else {
             // Handle promise if the export is async (less common for png blob)
             Promise.resolve(pngUri).then(blob => {
                 triggerDownload(blob, 'netmap_graph.png');
             }).catch(err => {
                  console.error("Error exporting PNG:", err);
                  alert("Failed to export PNG. See console for details.");
             });
        }

      } catch (error) {
           console.error("Error during PNG export setup:", error);
           alert("Failed to export PNG. See console for details.");
      }
    }
  };

  return (
    // Use fixed positioning and transform for smooth slide-in/out
    <aside
      className={`fixed right-0 top-0 h-full w-80 bg-bg-secondary bg-opacity-80 dark:bg-opacity-70 backdrop-filter backdrop-blur-lg border-l border-border rounded-l-lg shadow-xl transform transition-transform z-30 ${
        open ? 'translate-x-0' : 'translate-x-full' // Slide in/out
      }`}
      aria-labelledby="share-title" role="dialog" aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="share-title" className="text-lg font-semibold">
          {t('shareExport')}
        </h2>
         <Button variant="ghost" size="sm" icon={X} onClick={onClose} title={t('close')} className="p-1"/>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar">
        {/* Format Selector */}
        <div>
          <label htmlFor="export-format-select" className="label-text mb-1">{t('format')}</label>
          <select
            id="export-format-select"
            className="input-base" // Use shared input style
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <option value="json">{t('json')}</option>
            <option value="text">{t('text')}</option>
            <option value="png">{t('png')}</option>
          </select>
        </div>

        {/* JSON Specific Options */}
        {format === 'json' && (
          <label className="label-text inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-accent-primary rounded border-border focus:ring-accent-primary"
              checked={includePositions}
              onChange={(e) => setIncludePositions(e.target.checked)}
            />
            {t('includePositions')}
          </label>
        )}

        {/* PNG Specific Options */}
        {format === 'png' && (
          <div className="grid grid-cols-1 gap-3"> {/* Simplified to just Width */}
            <div>
              <label htmlFor="png-width-input" className="label-text">{t('pngWidth')}</label>
              <input
                id="png-width-input"
                type="number"
                className="input-base"
                value={pngWidth}
                onChange={(e) => setPngWidth(Number(e.target.value))}
                min={100} step={10}
              />
            </div>
            {/* Height is usually determined by aspect ratio or content */}
          </div>
        )}

        {/* Download Button */}
        <Button variant="primary" className="w-full" onClick={handleDownload}>
          {t('download')}
        </Button>
      </div>
    </aside>
  );
};

export default ShareSidebar;