// src/components/TopBar.tsx
/**
 * Renders the top application bar containing the application title/logo,
 * theme and language toggles, manual mode toggle, and buttons to open
 * metrics and share sidebars. Interacts with interaction store for mode state
 * and localization hook for language/theming.
 */
import React, { useEffect, useState } from 'react';
import { BarChart2, Share2, Edit, Sun, Moon, XCircle } from 'lucide-react'; // Use Edit for Manual Mode, XCircle to exit

// Import store
import { useGraphInteractionStore } from '../stores/graphInteractionStore';

// Import UI components and hooks
import Button from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';

// Props interface for toggling sidebars (passed from App)
interface Props {
  onMetricsToggle: () => void;
  onShareToggle: () => void;
}

const TopBar: React.FC<Props> = ({ onMetricsToggle, onShareToggle }) => {
  const { t, locale, setLocale } = useTranslations();

  // Get interaction mode state and actions
  const mode = useGraphInteractionStore((s) => s.mode);
  const toggleManualModeAction = useGraphInteractionStore((s) => s.toggleManualMode);
  // const setMode = useGraphInteractionStore((s) => s.setMode); // For direct mode setting if needed

  // Local state for theme icon, synced with document class
  const [isDarkMode, setIsDarkMode] = useState(!document.documentElement.classList.contains('light'));

  const toggleTheme = () => {
    document.documentElement.classList.toggle('light');
    setIsDarkMode(!document.documentElement.classList.contains('light'));
  };

  // Sync theme state on initial load
  useEffect(() => {
    setIsDarkMode(!document.documentElement.classList.contains('light'));
  }, []);

  // Determine if currently in any manual mode variant
  const isInManualMode = mode.startsWith('manual');

  return (
    <header className="flex items-center justify-between bg-bg-secondary px-4 py-2 border-b border-border sticky top-0 z-20 flex-shrink-0">
      {/* Left side: Brand/Title */}
      <div className="flex items-center gap-3">
        {/* Use the actual logo */}
        <img src="/src/assets/netmap_logo.png" alt="Netmap Logo" className="w-8 h-8" />
        <h1 className="text-xl font-semibold">{t('appTitle')}</h1>
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <Button
          variant="ghost" size="sm"
          onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
          title={locale === 'en-US' ? t('switchToPortuguese') : t('switchToEnglish')}
        >
          {locale === 'en-US' ? 'PT' : 'EN'}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost" size="md" icon={isDarkMode ? Sun : Moon}
          onClick={toggleTheme}
          title={isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
        />

        {/* Manual Mode Toggle Button */}
        <Button
            // Change appearance and icon based on whether manual mode is active
            variant={isInManualMode ? 'warning' : 'ghost'}
            size="md"
            icon={isInManualMode ? XCircle : Edit} // Show X to exit manual mode
            onClick={toggleManualModeAction}
            title={isInManualMode ? "Exit Manual Edit Mode" : "Enter Manual Edit Mode (Shift=Delete, Ctrl=Drag Node)"}
        />
        {/* Display current sub-mode if in manual mode */}
        {isInManualMode && (
          <span className="text-xs opacity-80 min-w-[4rem] text-center select-none bg-warning bg-opacity-20 px-1.5 py-0.5 rounded">
             {mode === 'manual-delete' ? 'Deleting' : mode === 'manual-drag' ? 'Dragging' : 'Editing'}
          </span>
        )}

        {/* Metrics/Share Sidebar Toggles */}
        <Button variant="ghost" size="md" icon={BarChart2} onClick={onMetricsToggle} title={t('metrics')} />
        <Button variant="ghost" size="md" icon={Share2} onClick={onShareToggle} title={t('share')} />
      </div>
    </header>
  );
};

export default TopBar;