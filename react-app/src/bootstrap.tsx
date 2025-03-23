import React from 'react';
import ReactDOM from 'react-dom/client';
import AppLocal from './AppLocal';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <AppLocal />
    </React.StrictMode>,
  );
}
