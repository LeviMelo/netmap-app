// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LocalizationProvider } from './hooks/useTranslations';
import './index.css';

// Wrap the entire app in LocalizationProvider so t() works everywhere
ReactDOM.createRoot(document.getElementById('root')!).render(
  <LocalizationProvider>
    <App />
  </LocalizationProvider>
);
