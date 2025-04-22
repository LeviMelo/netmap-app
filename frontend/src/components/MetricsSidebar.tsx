// src/components/MetricsSidebar.tsx
/**
 * Container component for the metrics sidebar.
 * It renders the sidebar frame, fetches graph metrics using the useGraphMetrics hook,
 * displays basic stats, provides UI for selecting overlays, and conditionally renders
 * specific metric visualization components (DegreeHistogram, HaloOverlayCanvas).
 */
import React, { useState, useMemo, MutableRefObject } from 'react';
import { Core } from 'cytoscape';
import { rollup } from 'd3-array'; // Keep rollup for histogram processing

// Import stores and hooks
import { useGraphDataStore } from '../stores/graphDataStore';
import { useGraphMetrics, GraphMetrics } from '../hooks/useGraphMetrics'; // Import the new hook
import { useTranslations } from '../hooks/useTranslations';

// Import UI Components
import Button from './ui/Button';
import { X } from 'lucide-react';

// Import Child Visualization Components
import DegreeHistogram, { DegreeBucket } from './metrics/DegreeHistogram'; // Adjust path
import HaloOverlayCanvas from './metrics/HaloOverlayCanvas'; // Adjust path

// Type for the overlay selection state
type OverlayType = 'none' | 'degree';

interface Props {
  open: boolean;
  onClose: () => void;
  cyRef: MutableRefObject<Core | null>;
}

const MetricsSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
  const { t } = useTranslations();

  // Get basic counts from data store
  const nodeCount = useGraphDataStore((s) => s.nodes.length);
  const edgeCount = useGraphDataStore((s) => s.edges.length);

  // Get calculated metrics from the custom hook
  const { degreeData }: GraphMetrics = useGraphMetrics(cyRef);

  // State for the selected overlay type
  const [overlayType, setOverlayType] = useState<OverlayType>('none');

  /* Process data for Histogram */
  const histogramData: DegreeBucket[] = useMemo(() => {
    if (!degreeData || degreeData.size === 0) return [];
    const degrees = Array.from(degreeData.values());
    const counts = rollup(degrees, (v) => v.length, (d) => d);
    return Array.from(counts, ([deg, cnt]) => ({ deg, cnt })).sort((a, b) => a.deg - b.deg);
  }, [degreeData]); // Calculate when degreeData changes

  return (
    // Sidebar container
    <aside
      // Use fixed positioning for sidebar itself, canvas is separate
      className={`fixed right-0 top-0 h-full w-80 bg-bg-secondary bg-opacity-80 dark:bg-opacity-70 backdrop-filter backdrop-blur-lg border-l border-border rounded-l-lg shadow-xl transform transition-transform z-30 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-labelledby="metrics-title" role="region"
    >
       {/* --- Render Halo Overlay Canvas --- */}
       {/* It's positioned absolutely relative to viewport/graph area, not inside sidebar */}
       {/* We only render it when the sidebar is open AND the overlay type is active */}
       {open && (
          <HaloOverlayCanvas
             cyRef={cyRef}
             degreeData={degreeData}
             isActive={overlayType === 'degree'} // Only active for degree overlay
          />
       )}


      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-border z-10"> {/* Ensure header is above potential internal canvas */}
        <h2 id="metrics-title" className="text-lg font-semibold">{t('graphMetrics')}</h2>
        <Button variant="ghost" size="sm" icon={X} onClick={onClose} title={t('close')} className="p-1"/>
      </div>

      {/* Body */}
      <div className="relative p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar z-10">
        {/* Basic Counts */}
        <p><strong>{t('nodes')}:</strong> {nodeCount}</p>
        <p><strong>{t('edges')}:</strong> {edgeCount}</p>

        {/* Metric Overlay Selector */}
        <div>
          <label htmlFor="metric-overlay-select" className="label-text mb-1">{t('overlayMetric')}</label>
          <select
             id="metric-overlay-select"
             className="input-base"
             value={overlayType}
             onChange={(e) => setOverlayType(e.target.value as OverlayType)}
          >
            <option value="none">{t('overlayNone')}</option>
            <option value="degree">{t('overlayDegree')}</option>
          </select>
        </div>

        {/* Degree Histogram */}
        <div>
          <h4 className="label-text mb-2">{t('degreeDistribution')}</h4>
           {/* Render the histogram component, passing data */}
           <DegreeHistogram histogramData={histogramData} />
           {/* Show message if no data instead of component showing it */}
           {histogramData.length === 0 && nodeCount > 0 && (
               <p className="text-text-muted text-sm">Calculating…</p>
           )}
           {nodeCount === 0 && (
                <p className="text-text-muted text-sm">No data</p>
           )}
        </div>
         {/* Add sections for other metrics/visualizations here */}
      </div>
    </aside>
  );
};

export default MetricsSidebar;