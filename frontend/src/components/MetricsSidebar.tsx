// src/components/MetricsSidebar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// • Added `cyRef` to Props so TS knows it’s required.
// • Switched every call to `n.degree()` → `n.degree(false)` to satisfy the
//   signature which now requires an `includeLoops: boolean`.
// • Restored a real D3 import so you can extend this with fancier charts later.
// • Kept it surgical: TS errors gone, overlay now actually works.

import React, { useMemo, useEffect, useState } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import * as d3 from 'd3';           // you’ll need `npm install d3 @types/d3`
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

  // which overlay to apply
  const [overlay, setOverlay] = useState<'none' | 'degree'>('none');

  // compute degree for each node (no loops)
  const degreeData: number[] = useMemo(() => {
    const cy = cyRef.current;
    if (!cy) return [];
    return cy.nodes().map((n: NodeSingular) => n.degree(false));
  }, [nodes, cyRef]);

  // histogram buckets
  const histogram = useMemo(() => {
    const counts = d3.rollup(
      degreeData,
      v => v.length,
      d => d
    );
    return Array.from(counts, ([deg, cnt]) => ({ deg, cnt }))
      .sort((a, b) => a.deg - b.deg);
  }, [degreeData]);

  // apply or clear overlay
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // clear previous
    cy.nodes().forEach((n: NodeSingular) => {
      n.style('background-color', '');
    });

    // if degree overlay, color nodes by degree heat
    if (overlay === 'degree' && degreeData.length) {
      const maxDeg = Math.max(...degreeData, 1);
      cy.nodes().forEach((n: NodeSingular) => {
        const d = n.degree(false);
        // map [0..maxDeg] → [lightPink..darkRed]
        const scale = d3.scaleLinear<string>()
          .domain([0, maxDeg])
          .range(['#ffe6e6', '#990000']);
        n.style('background-color', scale(d));
      });
    }
  }, [overlay, degreeData, cyRef]);

  return (
    <aside
      className={`
        fixed right-0 top-0 h-full w-80
        bg-bg-secondary/40 dark:bg-bg-secondary/40
        backdrop-blur-lg
        border-l border-border
        rounded-l-lg shadow-xl
        transform transition-transform
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      aria-labelledby="metrics-title"
      role="region"
    >
      {/* header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="metrics-title" className="text-lg font-semibold">
          {t('graphMetrics')}
        </h2>
        <button onClick={onClose} aria-label={t('close')} className="text-xl leading-none">
          &times;
        </button>
      </div>

      {/* body */}
      <div className="p-4 space-y-4">
        <p><strong>{t('nodes')}:</strong> {nodes.length}</p>
        <p><strong>{t('edges')}:</strong> {edges.length}</p>

        {/* overlay selector */}
        <div>
          <label className="block font-medium mb-1">{t('overlayMetric')}</label>
          <select
            className="input-base"
            value={overlay}
            onChange={e => setOverlay(e.target.value as any)}
          >
            <option value="none">{t('overlayNone')}</option>
            <option value="degree">{t('overlayDegree')}</option>
          </select>
        </div>

        {/* degree distribution chart (simple D3‐powered SVG) */}
        <div>
          <h4 className="font-medium mb-2">{t('degreeDistribution')}</h4>
          <svg className="w-full h-32">
            {(() => {
              const margin = { top: 4, right: 4, bottom: 16, left: 24 };
              const width = 256 - margin.left - margin.right;
              const height = 120 - margin.top - margin.bottom;
              const x = d3.scaleBand<number>()
                .domain(histogram.map(b => b.deg))
                .range([0, width])
                .padding(0.1);
              const y = d3.scaleLinear<number>()
                .domain([0, d3.max(histogram, b => b.cnt) ?? 1])
                .range([height, 0]);

              return histogram.map(b => (
                <rect
                  key={b.deg}
                  x={margin.left + (x(b.deg) ?? 0)}
                  y={margin.top + y(b.cnt)}
                  width={x.bandwidth()}
                  height={height - y(b.cnt)}
                  fill="var(--color-accent-primary)"
                />
              ));
            })()}
            {/* axes can be added here later */}
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default MetricsSidebar;
