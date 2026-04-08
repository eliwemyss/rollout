import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[v0] main.tsx loading');

try {
  const root = document.getElementById('root');
  console.log('[v0] Root element:', root ? 'found' : 'NOT FOUND');
  
  ReactDOM.createRoot(root!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[v0] React render called');
} catch (error) {
  console.error('[v0] Error during React render:', error);
}
