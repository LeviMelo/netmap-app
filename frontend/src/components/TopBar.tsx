// src/components/TopBar.tsx
import React from 'react';
import { BarChart2, Database, Download } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  onMetricsToggle: () => void;
  onExportJSON: () => void;
  onExportPNG: () => void;
}

const TopBar: React.FC<Props> = ({ onMetricsToggle, onExportJSON, onExportPNG }) => (
  <header className="flex items-center justify-between bg-bg-secondary px-4 py-2 border-b border-border sticky top-0 z-20">
    <div className="flex items-center gap-2">
      <img src="/assets/netmap_logo.svg" alt="Netmap" className="w-6 h-6" />
      <h1 className="text-lg font-semibold">Netmap</h1>
    </div>
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        icon={BarChart2}
        title="Toggle Metrics"
        onClick={onMetricsToggle}
      />
      <Button
        variant="ghost"
        size="sm"
        icon={Database}
        title="Export JSON"
        onClick={onExportJSON}
      />
      <Button
        variant="ghost"
        size="sm"
        icon={Download}
        title="Export PNG"
        onClick={onExportPNG}
      />
    </div>
  </header>
);

export default TopBar;
