/**
 * Main Entry Point for Concept Map Builder
 * 
 * This file initializes the React application and renders the root App component.
 * It imports global styles and sets up the foundation for the entire application.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
