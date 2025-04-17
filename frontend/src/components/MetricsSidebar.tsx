import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import * as d3 from 'd3';
import { useTranslations } from '../hooks/useTranslations';
import { useGraphStore } from '../store';

interface Props {
  open: boolean;
  onClose: () => void;
  cyRef: React.MutableRefObject<Core | null>;
}

const MetricsSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
  const { t } = useTranslations();
  const nodes = useGraphStore(s => s.nodes);
  const edges = useGraphStore(s => s.edges);
  const [overlay, setOverlay] = useState<'none' | 'degree'>('none');
  const [degreeData, setDegreeData] = useState<Map<string, number>>(new Map());

  const calculateDegrees = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.nodes().length === 0) {
        setDegreeData(new Map());
        return;
    }
    const newDegreeData = new Map<string, number>();
    cy.nodes().forEach((n: NodeSingular) => {
        newDegreeData.set(n.id(), n.degree(false));
    });
    setDegreeData(newDegreeData);
  }, [cyRef]);

  useEffect(() => {
    calculateDegrees();
  }, [nodes, edges, calculateDegrees]);

  const histogram = useMemo(() => {
    // ... (histogram calculation remains the same) ...
    if (degreeData.size === 0) return [];
    const degrees = Array.from(degreeData.values());
    const counts = d3.rollup( degrees, v => v.length, d => d );
    return Array.from(counts, ([deg, cnt]) => ({ deg, cnt }))
      .sort((a, b) => a.deg - b.deg);
  }, [degreeData]);

  useEffect(() => {
    // ... (overlay application logic remains the same) ...
     const cy = cyRef.current;
    if (!cy) return;

    console.log(`Applying overlay: ${overlay}`);

    // Clear previous overlay styles (border)
    cy.nodes().style({
        'border-width': 0,
        'border-color': 'transparent'
    });

    // Apply new overlay if not 'none'
    if (overlay === 'degree' && degreeData.size > 0) {
      const degreeValues = Array.from(degreeData.values());
      const maxDegree = d3.max(degreeValues) ?? 1;

      const colorScale = d3.scaleLinear()
        .domain([0, maxDegree * 0.5, maxDegree])
        .range(['var(--color-accent-primary)', 'var(--color-accent-secondary)', 'var(--color-danger)'])
        .clamp(true);

      cy.nodes().forEach((n: NodeSingular) => {
        const degree = degreeData.get(n.id()) ?? 0;
        n.style({
            'border-width': 3,
            'border-color': colorScale(degree)
        });
      });
    }
  }, [overlay, degreeData, cyRef]);

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
      aria-labelledby="metrics-title"
      role="region"
    >
      {/* Header remains the same */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="metrics-title" className="text-lg font-semibold">
          {t('graphMetrics')}
        </h2>
        <button onClick={onClose} aria-label={t('close')} className="btn btn-ghost px-2 py-1 text-xl leading-none">
          ×
        </button>
      </div>

      {/* Body remains the same */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar">
         <p><strong>{t('nodes')}:</strong> {nodes.length}</p>
        <p><strong>{t('edges')}:</strong> {edges.length}</p>
        {/* Overlay Selector */}
        <div>
          <label className="label-text mb-1">{t('overlayMetric')}</label>
          <select
            className="input-base"
            value={overlay}
            onChange={e => setOverlay(e.target.value as 'none' | 'degree')}
          >
            <option value="none">{t('overlayNone')}</option>
            <option value="degree">{t('overlayDegree')}</option>
          </select>
        </div>
        {/* Histogram */}
        <div>
          <h4 className="label-text mb-2">{t('degreeDistribution')}</h4>
          {histogram.length > 0 ? (
            <svg className="w-full h-32" aria-label={t('degreeDistribution')}>
                <g transform="translate(24, 4)">
                    {(() => {
                        const width = 256 - 24 - 4;
                        const height = 120 - 4 - 16;
                        const xDomain = histogram.map(b => b.deg);
                        const yDomain = [0, d3.max(histogram, b => b.cnt) ?? 1];
                        const x = d3.scaleBand()
                            .domain(xDomain)
                            .range([0, width])
                            .padding(0.2);
                        const y = d3.scaleLinear()
                            .domain(yDomain)
                            .range([height, 0]);
                        return histogram.map(b => (
                            <rect
                                key={b.deg} x={x(b.deg) ?? 0} y={y(b.cnt)}
                                width={x.bandwidth()} height={height - y(b.cnt)}
                                fill="var(--color-accent-primary)" rx="1"
                            >
                                <title>{`Degree ${b.deg}: ${b.cnt} nodes`}</title>
                            </rect>
                        ));
                    })()}
                </g>
            </svg>
          ) : (
              <p className="text-text-muted text-sm">{nodes.length > 0 ? "Calculating..." : "No data"}</p>
          )}
        </div>
        {/* ... other metrics ... */}
      </div>
    </aside>
  );
};

export default MetricsSidebar;