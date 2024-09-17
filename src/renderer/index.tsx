// src/index.tsx
import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ResProvider } from '../context';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDom.createRoot(container);

root.render(
  <React.StrictMode>
    <ResProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ResProvider>
  </React.StrictMode>,
);

window.electron.ipcRenderer.once('ipc-example', (arg) => {
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
