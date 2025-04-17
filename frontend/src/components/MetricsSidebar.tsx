// src/components/MetricsSidebar.tsx
import React, {
    useMemo,
    useEffect,
    useState,
    useCallback,
  } from 'react';
  import { Core, NodeSingular } from 'cytoscape';
  import { max as d3Max } from 'd3-array';
  import {
    scaleLinear,
    scaleBand,
    ScaleLinear,
    ScaleBand,
  } from 'd3-scale';
  import { useTranslations } from '../hooks/useTranslations';
  import { useGraphStore } from '../store';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    cyRef: React.MutableRefObject<Core | null>;
  }
  
  interface DegreeBucket {
    deg: number;
    cnt: number;
  }
  
  const MetricsSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
    const { t } = useTranslations();
    const nodes = useGraphStore((s) => s.nodes);
    const edges = useGraphStore((s) => s.edges);
  
    const [overlay, setOverlay] = useState<'none' | 'degree'>('none');
    const [degreeData, setDegreeData] = useState<Map<string, number>>(
      new Map()
    );
  
    // Compute degree for each node in the cytoscape instance
    const calculateDegrees = useCallback(() => {
      const cy = cyRef.current;
      const map = new Map<string, number>();
      if (cy) {
        cy.nodes().forEach((n: NodeSingular) => {
          map.set(n.id(), n.degree(false));
        });
      }
      setDegreeData(map);
    }, [cyRef]);
  
    // Recalculate whenever nodes or edges change
    useEffect(() => {
      calculateDegrees();
    }, [nodes, edges, calculateDegrees]);
  
    // Build histogram buckets [ { deg, cnt }, ... ]
    const histogram: DegreeBucket[] = useMemo(() => {
      if (degreeData.size === 0) {
        return [];
      }
      const counts = new Map<number, number>();
      for (const deg of degreeData.values()) {
        counts.set(deg, (counts.get(deg) || 0) + 1);
      }
      return Array.from(counts.entries())
        .map(([deg, cnt]) => ({ deg, cnt }))
        .sort((a, b) => a.deg - b.deg);
    }, [degreeData]);
  
    // Apply overlay styling to nodes when 'degree' is selected
    useEffect(() => {
      const cy = cyRef.current;
      if (!cy) return;
  
      // Reset border
      cy.nodes().style({
        'border-width': 0,
        'border-color': 'transparent',
      });
  
      if (overlay === 'degree' && degreeData.size > 0) {
        const maxDegree = d3Max(Array.from(degreeData.values())) ?? 1;
  
        // Linear color scale: 0 → primary, mid → secondary, max → danger
        const colorScale: ScaleLinear<number, string> = scaleLinear<string>()
          .domain([0, maxDegree * 0.5, maxDegree])
          .range([
            'var(--color-accent-primary)',
            'var(--color-accent-secondary)',
            'var(--color-danger)',
          ])
          .clamp(true);
  
        cy.nodes().forEach((n: NodeSingular) => {
          const d = degreeData.get(n.id()) ?? 0;
          n.style({
            'border-width': 3,
            'border-color': colorScale(d),
          });
        });
      }
    }, [overlay, degreeData, cyRef]);
  
    return (
      <aside
        className={`
          sidebar-overlay
          bg-bg-secondary bg-opacity-30 dark:bg-opacity-50
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-labelledby="metrics-title"
        role="region"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="metrics-title" className="text-lg font-semibold">
            {t('graphMetrics')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="btn btn-ghost px-2 py-1 text-xl leading-none"
          >
            ×
          </button>
        </div>
  
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar">
          <p>
            <strong>{t('nodes')}:</strong> {nodes.length}
          </p>
          <p>
            <strong>{t('edges')}:</strong> {edges.length}
          </p>
  
          {/* Overlay selector */}
          <div>
            <label className="label-text mb-1">{t('overlayMetric')}</label>
            <select
              className="input-base"
              value={overlay}
              onChange={(e) =>
                setOverlay(e.target.value as 'none' | 'degree')
              }
            >
              <option value="none">{t('overlayNone')}</option>
              <option value="degree">{t('overlayDegree')}</option>
            </select>
          </div>
  
          {/* Degree distribution histogram */}
          <div>
            <h4 className="label-text mb-2">{t('degreeDistribution')}</h4>
            {histogram.length > 0 ? (
              <svg className="w-full h-32" aria-label={t('degreeDistribution')}>
                <g transform="translate(24, 4)">
                  {(() => {
                    const svgWidth = 256 - 24 - 4;
                    const svgHeight = 120 - 4 - 16;
                    const xScale: ScaleBand<number> = scaleBand<number>()
                      .domain(histogram.map((b) => b.deg))
                      .range([0, svgWidth])
                      .padding(0.2);
                    const yScale: ScaleLinear<number, number> = scaleLinear()
                      .domain([
                        0,
                        d3Max(histogram.map((b) => b.cnt)) ?? 0,
                      ])
                      .range([svgHeight, 0]);
  
                    return histogram.map((b) => (
                      <rect
                        key={b.deg}
                        x={xScale(b.deg) ?? 0}
                        y={yScale(b.cnt)}
                        width={xScale.bandwidth()}
                        height={svgHeight - yScale(b.cnt)}
                        fill="var(--color-accent-primary)"
                        rx={1}
                      >
                        <title>{`Degree ${b.deg}: ${b.cnt} nodes`}</title>
                      </rect>
                    ));
                  })()}
                </g>
              </svg>
            ) : (
              <p className="text-text-muted text-sm">
                {nodes.length > 0 ? 'Calculating...' : 'No data'}
              </p>
            )}
          </div>
        </div>
      </aside>
    );
  };
  
  export default MetricsSidebar;
  