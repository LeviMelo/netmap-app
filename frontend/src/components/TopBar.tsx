import React from 'react';
import { BarChart2, Share2, Hammer } from 'lucide-react';
import Button from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';
import { useGraphStore } from '../store';

interface Props {
  onMetricsToggle: () => void;
  onShareToggle: () => void;
}

const TopBar: React.FC<Props> = ({ onMetricsToggle, onShareToggle }) => {
  const t = useTranslations().t;
  const constructorMode  = useGraphStore((s) => s.constructorMode);
  const toggleConstructor = useGraphStore((s) => s.toggleConstructor);

  return (
    <header className="flex items-center justify-between bg-bg-secondary px-4 py-2 border-b border-border sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <img src="/assets/netmap_logo.svg" alt="Netmap" className="w-6 h-6" />
        <h1 className="text-lg font-semibold">{t('appTitle')}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant={constructorMode ? 'warning' : 'ghost'}
          size="sm"
          icon={Hammer}
          onClick={toggleConstructor}
          title="Constructor Mode"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={BarChart2}
          onClick={onMetricsToggle}
          title={t('metrics')}
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Share2}
          onClick={onShareToggle}
          title={t('share')}
        />
      </div>
    </header>
  );
};

export default TopBar;
