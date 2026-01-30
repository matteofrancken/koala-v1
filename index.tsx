import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Critical fix for browser environment where process.env might not be defined
// Using globalThis to ensure compatibility across all browser contexts
const g = (globalThis as any);
if (!g.process) {
  g.process = { env: {} };
}
if (!g.process.env) {
  g.process.env = {};
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Critical rendering error:", err);
  }
} else {
  console.error("Critical: Root element not found");
}