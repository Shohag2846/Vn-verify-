import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safe environment polyfill
const globalAny = window as any;
try {
  if (!globalAny.process) {
    globalAny.process = { env: {} };
  }
  if (!globalAny.process.env) {
    globalAny.process.env = {};
  }
  globalAny.process.env.API_KEY = globalAny.process.env.API_KEY || '';
} catch (e) {
  console.warn("Process polyfill failed, but proceeding...");
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Root element not found in DOM");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (renderError) {
    console.error("React Render Error:", renderError);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Application Error</h2>
      <p>Failed to load the verification portal. Please check the console for logs.</p>
    </div>`;
  }
}