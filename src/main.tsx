import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppInstallProvider } from './components/AppInstallContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppInstallProvider>
      <App />
    </AppInstallProvider>
  </StrictMode>,
);