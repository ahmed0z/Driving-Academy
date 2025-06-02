import React from 'react';
import ReactDOM from 'react-dom/client';
// Note: index.css is imported in App.js, which is fine.
// If you prefer it here, move the import './index.css'; from App.js to here.
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);