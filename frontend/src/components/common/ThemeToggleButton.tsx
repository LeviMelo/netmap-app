/**
 * A self-contained, reusable component for toggling the application's theme.
 * It hooks into the app state directly, making it a portable "drop-in" component.
 */
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../stores/appState';

export const ThemeToggleButton: React.FC = () => {
  const { settings, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-accent-primary/10 transition-all duration-300 text-accent-primary"
      aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};