import {
  BrowserWindow,
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';

// Define your channels
export type Channels =
  | 'ipc-example'
  | 'play-alert-sound'
  | 'show-notification'
  | 'auth-complete'
  | 'open-auth-window'
  | 'get-cookie'
  | 'get-user-data-path'
  | 'write-file'
  | 'read-file'
  | 'file-exists'
  | 'open-auth-url';

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
    invoke(channel: Channels, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    showNotification(title: string, body: string) {
      return ipcRenderer.invoke('show-notification', { title, body });
    },
    openUrl(url: string) {
      return ipcRenderer.invoke('open-auth-url', url);
    },
    getCookie() {
      return ipcRenderer.invoke('get-cookie');
    },
  },
  fs: {
    getUserDataPath(): Promise<string> {
      return ipcRenderer.invoke('get-user-data-path');
    },
    writeFile(filePath: string, data: string): Promise<void> {
      return ipcRenderer.invoke('write-file', filePath, data);
    },
    readFile(filePath: string): Promise<string> {
      return ipcRenderer.invoke('read-file', filePath);
    },
    fileExists(filePath: string): Promise<boolean> {
      return ipcRenderer.invoke('file-exists', filePath);
    },
  },
  env: {
    HELLO: process.env.HELLO,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
