import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support: only in the full build (service workers are not available in the Artifact preview).
if (!__ARTIFACT__ && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then((m) => m.registerSW({ immediate: true })).catch(() => undefined);
}
