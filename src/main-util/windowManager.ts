import { BrowserWindow, app, ipcMain, shell } from 'electron';
import path from 'path';
import { resolveHtmlPath } from '../main/util';
import installExtensions from './extensions';
import MenuBuilder from '../main/menu';

let mainWindow: BrowserWindow | null = null;

// Utility function to get asset paths
const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  return path.join(RESOURCES_PATH, ...paths);
};

// Create and configure the main BrowserWindow
const configureMainWindow = (): BrowserWindow => {
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
    },
  });

  window.loadURL(resolveHtmlPath('index.html'));

  return window;
};

// Handle the "ready-to-show" event
const handleReadyToShow = (window: BrowserWindow): void => {
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
};

// Handle URL opening in external browser
const handleAuthUrlOpening = (): void => {
  ipcMain.handle('open-auth-url', async (event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error: any) {
      console.error('Error opening URL:', error);
      return { success: false, error: error.message };
    }
  });
};

// Create the main application window
export const createMainWindow = async (): Promise<void> => {
  await installExtensions();
  mainWindow = configureMainWindow();

  handleReadyToShow(mainWindow);
  handleAuthUrlOpening();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

// Handle application-level events
export const handleAppEvents = (): void => {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) createMainWindow();
  });
};
