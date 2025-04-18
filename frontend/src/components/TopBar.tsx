import React from 'react';
import { BarChart2, Share2, Hammer, Sun, Moon } from 'lucide-react';
import Button from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';
import { useGraphStore } from '../store';

interface Props {
  onMetricsToggle: () => void;
  onShareToggle  : () => void;
}

const TopBar: React.FC<Props> = ({ onMetricsToggle, onShareToggle }) => {
  const { t, locale, setLocale } = useTranslations();
  const { constructor: cons, drag, del } = useGraphStore((s) => s.mode);
  const toggleCon  = useGraphStore((s) => s.toggleConstructor);

  /* theme switch --------------------------------------------------- */
  const isLight    = document.documentElement.classList.contains('light');
  const toggleTheme = () =>
    document.documentElement.classList.toggle('light');

  return (
    <header className="flex items-center justify-between bg-bg-secondary px-4 py-2 border-b border-border sticky top-0 z-20">
      {/* brand ------------------------------------------------------- */}
      <div className="flex items-center gap-3">
        <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
        <h1 className="text-xl font-semibold">{t('appTitle')}</h1>
      </div>

      {/* controls ---------------------------------------------------- */}
      <div className="flex items-center gap-2">
        {/* language toggle (smaller) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
          title={locale === 'en-US' ? t('switchToPortuguese') : t('switchToEnglish')}
        >
          {locale === 'en-US' ? 'PT' : 'EN'}
        </Button>

        {/* theme toggle */}
        <Button
          variant="ghost"
          size="md"
          icon={isLight ? Moon : Sun}
          onClick={toggleTheme}
          title={isLight ? t('switchToDarkMode') : t('switchToLightMode')}
        />

        {/* constructor */}
        <Button
          variant={cons ? 'warning' : 'ghost'}
          size="md"
          icon={Hammer}
          onClick={toggleCon}
          title="Constructor Mode (Ctrl=Drag, Shift=Delete)"
        />
        {cons && (
          <span className="text-xs opacity-70 min-w-[3.5rem] text-center select-none">
            {drag ? 'Drag' : del ? 'Delete' : 'Edge'}
          </span>
        )}

        {/* metrics / share */}
        <Button variant="ghost" size="md" icon={BarChart2} onClick={onMetricsToggle} title={t('metrics')} />
        <Button variant="ghost" size="md" icon={Share2}     onClick={onShareToggle}   title={t('share')}   />
      </div>
    </header>
  );
};

export default TopBar;
