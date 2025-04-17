// src/components/TopBar.tsx
import React from 'react';
import { BarChart2, Share2 } from 'lucide-react';
import Button from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';

interface Props {
  onMetricsToggle: () => void;
  onShareToggle: () => void;
}

const TopBar: React.FC<Props> = ({ onMetricsToggle, onShareToggle }) => {
  const { t } = useTranslations();

  return (
    <header className="flex items-center justify-between bg-bg-secondary px-4 py-2 border-b border-border sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <img src="/assets/netmap_logo.svg" alt="Netmap" className="w-6 h-6" />
        <h1 className="text-lg font-semibold">{t('appTitle')}</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Metrics button only toggles metrics */}
        <Button
          variant="ghost"
          size="sm"
          icon={BarChart2}
          title={t('metrics')}
          onClick={onMetricsToggle}
        />
        {/* Share button only toggles share */}
        <Button
          variant="ghost"
          size="sm"
          icon={Share2}
          title={t('share')}
          onClick={onShareToggle}
        />
      </div>
    </header>
  );
};

export default TopBar;
