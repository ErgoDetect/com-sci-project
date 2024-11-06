// src/index.tsx
import React from 'react';
import ReactDom from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ResProvider } from '../context';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDom.createRoot(container);

root.render(
  // <React.StrictMode>
  <ResProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </ResProvider>,
  // </React.StrictMode>,
);
