import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ResProvider } from '../context';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const clientId = window.electron.env.GOOGLE_CLIENT_ID;

// if (clientId) {
root.render(
  <ResProvider>
    <GoogleOAuthProvider clientId={`${clientId}`}>
      <App />
    </GoogleOAuthProvider>
  </ResProvider>,
);
// } else {
// console.error('Google Client ID is not defined');
// }
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
