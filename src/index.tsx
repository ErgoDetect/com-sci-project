import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ResProvider } from './context';

// Create the root element
const rootElement = document.getElementById('root') as HTMLElement;

// Ensure the root element is found
if (!rootElement) {
  throw new Error('Root element not found');
}

// Render the application
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ResProvider>
      <App />
    </ResProvider>
  </React.StrictMode>,
);

reportWebVitals();
