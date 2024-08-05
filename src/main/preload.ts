import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import isFirstRun from 'first-run';

export type Channels = 'ipc-example' | 'show-modal';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  showModal: {
    checkFirstRun() {
      return isFirstRun({ name: 'x ' }); // Check if it's the first run
    },
    setCameraAccessGranted() {
      localStorage.setItem('cameraAccessGranted', 'true'); // Mark camera access as granted
    },
    getCameraAccessStatus() {
      return localStorage.getItem('cameraAccessGranted') === 'true'; // Check if camera access was granted
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
