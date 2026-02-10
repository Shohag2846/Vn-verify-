import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Robust polyfill for process.env in the browser
const globalAny = window as any;
if (!globalAny.process) {
  globalAny.process = { env: {} };
}
if (!globalAny.process.env) {
  globalAny.process.env = {};
}
// Ensure API_KEY exists to prevent the SDK from crashing during initialization
globalAny.process.env.API_KEY = globalAny.process.env.API_KEY || '';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);