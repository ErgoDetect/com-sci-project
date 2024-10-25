import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define your channels
export type Channels =
  | 'ipc-example'
  | 'play-alert-sound'
  | 'show-notification'
  | 'auth-complete'
  | 'get-cookie'
  | 'get-user-data-path'
  | 'write-file'
  | 'read-file'
  | 'file-exists'
  | 'open-auth-url'
  | 'save-video'
  | 'get-mac-address'
  | 'deep-link'
  | 'get-app-config'
  | 'save-app-config'
  | 'reset-app-config'
  | 'get-system-theme';

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
    getMacAddress() {
      return ipcRenderer.invoke('get-mac-address');
    },
    onProtocolUrl: (callback: (url: string) => void) => {
      ipcRenderer.on('deep-link', (event, url) => {
        callback(url);
      });
    },
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
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
  video: {
    saveVideo(
      videoName: string,
      buffer: Uint8Array,
    ): Promise<{ success: boolean; filePath?: string; error?: string }> {
      return ipcRenderer.invoke('save-video', videoName, buffer);
    },
  },
  config: {
    getSystemTheme() {
      return ipcRenderer.invoke('get-system-theme');
    },
    getAppConfig() {
      return ipcRenderer.invoke('get-app-config'); // Fetch config from the main process
    },

    // Save app configuration
    saveAppConfig(newConfig: any) {
      return ipcRenderer.invoke('save-app-config', newConfig); // Save config via main process
    },

    // Optionally: Reset app configuration to default
    resetAppConfig() {
      return ipcRenderer.invoke('reset-app-config'); // Reset config to default
    },
  },
};

// Expose the electron API to the renderer process
contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
