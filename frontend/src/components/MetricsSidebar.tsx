import React, {
    useMemo,
    useEffect,
    useState,
    useCallback,
    MutableRefObject,
  } from 'react';
  import { Core, NodeSingular } from 'cytoscape';
  import { rollup, max as d3Max } from 'd3-array';
  import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
  
  import { useGraphStore } from '../store';
  import { useTranslations } from '../hooks/useTranslations';
  
  interface DegreeBucket {
    deg: number;
    cnt: number;
  }
  
  interface Props {
    open: boolean;
    onClose: () => void;
    cyRef: MutableRefObject<Core | null>;
  }
  
  // Helper function to get computed CSS variable value
  const getCssVar = (varName: string): string => {
      if (typeof window === 'undefined') return '#000000'; // Fallback for SSR or testing
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#000000'; // Provide fallback
  };
  
  
  const MetricsSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
    const { t } = useTranslations();
    const nodes = useGraphStore((s) => s.nodes);
    const edges = useGraphStore((s) => s.edges);
  
    const [overlay, setOverlay] = useState<'none' | 'degree'>('none');
    const [degreeData, setDegreeData] = useState<Map<string, number>>(new Map());
  
    /* Degree calculation (remains the same) */
    const calculateDegrees = useCallback(() => {
        const cy = cyRef.current;
        if (!cy || cy.nodes().length === 0) {
          setDegreeData(new Map()); return;
        }
        const map = new Map<string, number>();
        cy.nodes().forEach((n: NodeSingular) => { map.set(n.id(), n.degree(false)); });
        setDegreeData(map);
      }, [cyRef]);
  
    useEffect(calculateDegrees, [nodes, edges, calculateDegrees]);
  
    /* Histogram (remains the same) */
    const histogram: DegreeBucket[] = useMemo(() => {
      if (degreeData.size === 0) return [];
      const degrees = Array.from(degreeData.values());
      const counts = rollup(degrees, (v) => v.length, (d) => d);
      return Array.from(counts, ([deg, cnt]) => ({ deg, cnt })).sort((a, b) => a.deg - b.deg);
    }, [degreeData]);
  
    /* Degree overlay styling - USE COMPUTED COLORS */
    useEffect(() => {
      const cy = cyRef.current;
      if (!cy) return;
  
      /* Clear previous overlay */
      cy.nodes().style({ 'border-width': 0, 'border-color': 'transparent' });
  
      if (overlay !== 'degree' || degreeData.size === 0) return;
  
      // Get computed colors *inside* the effect
      const colorPrimary = getCssVar('--color-accent-primary');
      const colorSecondary = getCssVar('--color-accent-secondary');
      const colorDanger = getCssVar('--color-danger');
  
      const maxDegree = d3Max(Array.from(degreeData.values())) ?? 1;
  
      /* Colour scale using computed colors */
      const colour = scaleLinear<string>() // Output is string (color)
        .domain([0, maxDegree * 0.5, maxDegree])
        .range([colorPrimary, colorSecondary, colorDanger]) // Pass computed hex/rgb values
        .clamp(true);
  
      cy.nodes().forEach((n: NodeSingular) => {
        const d = degreeData.get(n.id()) ?? 0;
        // Apply the style with the *computed* color
        n.style({
          'border-width': 3,
          'border-color': colour(d), // Pass the actual color string from the scale
        });
      });
      // Log to verify colors are applied
      // console.log("Applied border colors:", cy.nodes().map(n => n.style('border-color')));
  
    }, [overlay, degreeData, cyRef]); // Re-run when overlay or data changes
  
  
    return (
      <aside
        className={`sidebar-overlay bg-bg-secondary bg-opacity-30 dark:bg-opacity-50 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-labelledby="metrics-title" role="region"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="metrics-title" className="text-lg font-semibold">{t('graphMetrics')}</h2>
          <button onClick={onClose} aria-label={t('close')} className="btn btn-ghost px-2 py-1 text-xl leading-none">×</button>
        </div>
  
        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar">
          <p><strong>{t('nodes')}:</strong> {nodes.length}</p>
          <p><strong>{t('edges')}:</strong> {edges.length}</p>
  
          {/* Metric selector */}
          <div>
            <label className="label-text mb-1">{t('overlayMetric')}</label>
            <select className="input-base" value={overlay} onChange={(e) => setOverlay(e.target.value as 'none' | 'degree')}>
              <option value="none">{t('overlayNone')}</option>
              <option value="degree">{t('overlayDegree')}</option>
            </select>
          </div>
  
          {/* Degree histogram */}
          <div>
            <h4 className="label-text mb-2">{t('degreeDistribution')}</h4>
            {histogram.length ? (
              <svg className="w-full h-32" aria-label={t('degreeDistribution')}>
                <g transform="translate(24, 4)">
                  {(() => {
                    const width = 256 - 24 - 4;
                    const height = 120 - 4 - 16;
                    const xDomain = histogram.map((b) => b.deg);
                    const yDomain: [number, number] = [0, d3Max(histogram, (b) => b.cnt) ?? 1];
                    const x: ScaleBand<number> = scaleBand<number>().domain(xDomain).range([0, width]).padding(0.2);
                    const y: ScaleLinear<number, number> = scaleLinear<number>().domain(yDomain).range([height, 0]);
                    return histogram.map((b) => (
                      <rect key={b.deg} x={x(b.deg) ?? 0} y={y(b.cnt)} width={x.bandwidth()} height={height - y(b.cnt)} fill="var(--color-accent-primary)" rx="1">
                        <title>{`Degree ${b.deg}: ${b.cnt} nodes`}</title>
                      </rect>
                    ));
                  })()}
                </g>
              </svg>
            ) : (
              <p className="text-text-muted text-sm">{nodes.length ? 'Calculating…' : 'No data'}</p>
            )}
          </div>
        </div>
      </aside>
    );
  };
  
  export default MetricsSidebar;