// src/components/MetricsSidebar.tsx
import React from 'react';
import { useGraphStore } from '../store';
import { useTranslations } from '../hooks/useTranslations';

interface Props {
  open: boolean;
  onClose: () => void;
}

const MetricsSidebar: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslations();
  // Live counts
  const nodeCount = useGraphStore(s => s.nodes.length);
  const edgeCount = useGraphStore(s => s.edges.length);

  return (
    <aside
      className={`
        fixed right-0 top-0 h-full w-80
        bg-bg-secondary/50 dark:bg-bg-secondary/50
        backdrop-blur-md backdrop-filter
        border-l border-border
        rounded-l-lg shadow-lg
        transform transition-transform
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      aria-labelledby="metrics-title"
      role="region"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="metrics-title" className="text-lg font-semibold">
          {t('graphMetrics')}
        </h2>
        <button onClick={onClose} aria-label={t('close')}>
          &times;
        </button>
      </div>
      <div className="p-4 space-y-4">
        <p>
          <strong>{t('nodes')}:</strong> {nodeCount}
        </p>
        <p>
          <strong>{t('edges')}:</strong> {edgeCount}
        </p>
        {/* TODO: Centrality heatmap */}
        {/* TODO: Degree distribution chart */}
      </div>
    </aside>
  );
};

export default MetricsSidebar;
