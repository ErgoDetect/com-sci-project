import { BrowserWindow, app, ipcMain, shell } from 'electron';
import * as path from 'path';
import { resolveHtmlPath } from '../main/util';
import installExtensions from './extensions';
import MenuBuilder from '../main/menu';
import getMacAddress from './getMacAddress';

let mainWindow: BrowserWindow | null = null;

// Utility function to get asset paths
const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  return path.join(RESOURCES_PATH, ...paths);
};

// Create and configure the main BrowserWindow
const createBrowserWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    show: false,
    width: 1024,
    height: 756,
    minWidth: 1024,
    minHeight: 756,
    movable: true,
    fullscreenable: true,
    resizable: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: false,
    },
  });

  // Handle new window events to prevent opening external URLs in the app
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return window;
};

// Show window when ready, open dev tools in dev mode
const setupWindowEvents = (window: BrowserWindow): void => {
  window.on('ready-to-show', () => {
    if (process.env.START_MINIMIZED) {
      window.minimize();
    } else {
      window.show();
    }

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      window.webContents.openDevTools();
    }
  });

  window.on('closed', () => {
    mainWindow = null;
  });
};

// Handle opening URLs externally
const handleAuthUrlOpening = (): void => {
  ipcMain.handle('open-auth-url', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error: any) {
      console.error('Error opening URL:', error);
      return { success: false, error: error.message };
    }
  });
};

ipcMain.handle('get-mac-address', () => {
  return getMacAddress(); // Call the function to retrieve the MAC address
});

// Create and initialize the main application window
export const createMainWindow = async (): Promise<BrowserWindow> => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = createBrowserWindow();
  setupWindowEvents(mainWindow);
  handleAuthUrlOpening();

  await mainWindow.loadURL(resolveHtmlPath('index.html'));

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  return mainWindow;
};
