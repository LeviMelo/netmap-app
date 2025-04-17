// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LocalizationProvider } from './hooks/useTranslations'; // Import provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalizationProvider> {/* Wrap App */}
      <App />
    </LocalizationProvider>
  </React.StrictMode>,
)