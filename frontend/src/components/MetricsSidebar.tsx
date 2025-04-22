// src/components/MetricsSidebar.tsx
/**
 * Container component for the metrics sidebar UI elements.
 * Renders the sidebar frame, fetches graph metrics using the useGraphMetrics hook,
 * displays basic stats, provides UI for selecting overlays (state managed by parent),
 * and renders the DegreeHistogram component. The actual overlay canvas is rendered separately by App.tsx.
 * ---
 * ✅ Refactoring Note (Overlay Canvas):
 *  - This component NO LONGER renders the HaloOverlayCanvas.
 *  - Responsibility for rendering the overlay canvas is moved to App.tsx
 *    to ensure correct positioning relative to the GraphCanvas.
 *  - This component manages the UI controls (dropdown) for selecting the
 *    overlay type, and communicates the choice up via props (setOverlayType).
 * ---
 */
import React, { useMemo, MutableRefObject } from 'react'; // Removed useState
import { Core } from 'cytoscape';
import { rollup } from 'd3-array';

// Import stores and hooks
import { useGraphDataStore } from '../stores/graphDataStore';
import { useGraphMetrics } from '../hooks/useGraphMetrics'; // Keep hook to get data for histogram
import { useTranslations } from '../hooks/useTranslations';

// Import UI Components
import Button from './ui/Button';
import { X } from 'lucide-react';

// Import Child Visualization Components
import DegreeHistogram, { DegreeBucket } from './metrics/DegreeHistogram';
// REMOVED: import HaloOverlayCanvas from './metrics/HaloOverlayCanvas';

// Type for the overlay selection state - Define locally or import if shared
export type OverlayType = 'none' | 'degree';

interface Props {
  open: boolean;
  onClose: () => void;
  cyRef: MutableRefObject<Core | null>;
  // Props for lifted state
  overlayType: OverlayType;
  setOverlayType: (type: OverlayType) => void;
}

const MetricsSidebar: React.FC<Props> = ({
    open,
    onClose,
    cyRef,
    overlayType, // Receive from parent
    setOverlayType // Receive from parent
}) => {
  const { t } = useTranslations();

  // Get basic counts
  const nodeCount = useGraphDataStore((s) => s.nodes.length);
  const edgeCount = useGraphDataStore((s) => s.edges.length);

  // Get calculated metrics from the custom hook (needed for histogram)
  const { degreeData } = useGraphMetrics(cyRef);

  /* Process data for Histogram */
  const histogramData: DegreeBucket[] = useMemo(() => {
    // Use optional chaining for safety, though hook should initialize map
    if (!degreeData || degreeData.size === 0) return [];
    const degrees = Array.from(degreeData.values());
    const counts = rollup(degrees, (v) => v.length, (d) => d);
    return Array.from(counts, ([deg, cnt]) => ({ deg, cnt })).sort((a, b) => a.deg - b.deg);
  }, [degreeData]);

  return (
    // Sidebar container styles remain the same
    <aside
      className={`fixed right-0 top-0 h-full w-80 bg-bg-secondary bg-opacity-80 dark:bg-opacity-70 backdrop-filter backdrop-blur-lg border-l border-border rounded-l-lg shadow-xl transform transition-transform z-30 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-labelledby="metrics-title" role="region"
    >
       {/* *** REMOVED rendering of HaloOverlayCanvas from here *** */}

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-border z-10">
        <h2 id="metrics-title" className="text-lg font-semibold">{t('graphMetrics')}</h2>
        <Button variant="ghost" size="sm" icon={X} onClick={onClose} title={t('close')} className="p-1"/>
      </div>

      {/* Body */}
      <div className="relative p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar z-10">
        {/* Basic Counts */}
        <p><strong>{t('nodes')}:</strong> {nodeCount}</p>
        <p><strong>{t('edges')}:</strong> {edgeCount}</p>

        {/* Metric Overlay Selector - uses props now */}
        <div>
          <label htmlFor="metric-overlay-select" className="label-text mb-1">{t('overlayMetric')}</label>
          <select
             id="metric-overlay-select"
             className="input-base"
             value={overlayType} // Use prop value
             onChange={(e) => setOverlayType(e.target.value as OverlayType)} // Call prop setter
          >
            <option value="none">{t('overlayNone')}</option>
            <option value="degree">{t('overlayDegree')}</option>
          </select>
        </div>

        {/* Degree Histogram */}
        <div>
          <h4 className="label-text mb-2">{t('degreeDistribution')}</h4>
           <DegreeHistogram histogramData={histogramData} />
           {/* Show message if no data instead of component showing it */}
           {histogramData.length === 0 && nodeCount > 0 && (
               <p className="text-text-muted text-sm">Calculating…</p>
           )}
           {nodeCount === 0 && (
                <p className="text-text-muted text-sm">No data</p>
           )}
        </div>
      </div>
    </aside>
  );
};

export default MetricsSidebar;