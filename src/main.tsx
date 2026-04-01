import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global styles if needed
import './styles/globals.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
