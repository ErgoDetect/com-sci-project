import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  powerSaveBlocker,
  nativeTheme,
} from 'electron';
import { createMainWindow } from '../main-util/windowManager';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../main-util/logger';
import loadEnvFile from '../main-util/env';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';
import log from 'electron-log';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let powerSaveBlockerId: number | null = null;

// Define the default app configuration
const defaultAppConfig = {
  appearance: {
    theme: 'light',
    fontSize: 14,
  },
  showStat: false,
};

// Handle default protocol for deep linking
if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient('ergodetect', process.execPath, [
    path.resolve(process.argv[1]),
  ]);
} else {
  app.setAsDefaultProtocolClient('ergodetect');
}

// Helper to get asset paths
const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  return path.join(RESOURCES_PATH, ...paths);
};

// Ensure save folder and settings file exist
const ensureSaveFolderExists = (): void => {
  const saveFolderPath = path.join(app.getPath('userData'), 'result');
  const settingPath = path.join(app.getPath('userData'), 'appConfig.json');

  if (!fs.existsSync(saveFolderPath)) {
    fs.mkdirSync(saveFolderPath, { recursive: true });
  }

  if (!fs.existsSync(settingPath)) {
    // Write the default app config to the settings file
    fs.writeFileSync(settingPath, JSON.stringify(defaultAppConfig, null, 2));
  }
};

// Show initial notification when the app starts
const showInitialNotification = (): void => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Welcome!',
      body: 'Your application is running successfully!',
    });
    notification.show();
  } else {
    logger.error('Notifications are not supported on this platform.');
  }
};

// Create system tray with context menu
const createTray = (): void => {
  const iconPath = getAssetPath('icons', '16x16.png');

  if (!fs.existsSync(iconPath)) {
    log.error(`Tray icon not found at: ${iconPath}`);
    return;
  }

  try {
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => mainWindow?.show() },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip('Electron App');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow?.show());

    log.info('Tray created successfully');
  } catch (error) {
    log.error('Failed to create tray:', error);
  }
};

// Setup application events
const setupAppEvents = (): void => {
  // Prevent window close, hide it instead
  mainWindow?.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      if (process.platform === 'darwin') app.dock.hide();
    }
  });

  app.on('before-quit', () => {
    isQuitting = true;
    tray?.destroy();
  });

  app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
      app.dock.hide();
    } else {
      app.quit();
    }
  });

  app.on('activate', async () => {
    if (!BrowserWindow.getAllWindows().length && !mainWindow) {
      mainWindow = await createMainWindow();
    } else {
      mainWindow?.show();
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    mainWindow?.webContents.send('deep-link', url);
  });
};

// Setup IPC handlers
const setupIPCHandlers = (): void => {
  // Handle saving video
  ipcMain.handle('save-video', async (event, videoName, buffer) => {
    try {
      const saveFolderPath = path.join(app.getPath('userData'), 'result');
      await fs.promises.mkdir(saveFolderPath, { recursive: true });

      const filePath = path.join(saveFolderPath, videoName);

      await fs.promises.writeFile(filePath, buffer);
      logger.info(`Video saved successfully to ${filePath}`);
      return { success: true, filePath };
    } catch (error) {
      logger.error('Error saving video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  });

  // Handle app config loading
  ipcMain.handle('get-app-config', async () => {
    try {
      const settingPath = path.join(app.getPath('userData'), 'appConfig.json');
      if (!fs.existsSync(settingPath)) {
        return defaultAppConfig;
      }

      const data = await fs.promises.readFile(settingPath, 'utf-8');
      return { ...defaultAppConfig, ...JSON.parse(data) }; // Merge default with existing config
    } catch (error) {
      logger.error('Error loading app config:', error);
      return { error: 'Failed to load config' };
    }
  });

  // Handle saving app config
  ipcMain.handle('save-app-config', async (event, newConfig) => {
    try {
      const settingPath = path.join(app.getPath('userData'), 'appConfig.json');
      const config = { ...defaultAppConfig, ...newConfig }; // Merge with default
      await fs.promises.writeFile(settingPath, JSON.stringify(config, null, 2));
      return { success: true, config };
    } catch (error) {
      logger.error('Error saving app config:', error);
      return { success: false, error: 'Failed to save config' };
    }
  });

  ipcMain.handle('get-system-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });
};

// Start power save blocker
const startPowerSaveBlocker = (): void => {
  if (powerSaveBlockerId === null) {
    powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    logger.info('Power save blocker started:', powerSaveBlockerId);
  }
};

// Ensure single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    const deepLinkUrl = commandLine.pop();
    if (deepLinkUrl) {
      mainWindow?.webContents.send('deep-link', deepLinkUrl);
    }
  });
}

// Main application startup logic
app.whenReady().then(async () => {
  loadEnvFile();
  ensureSaveFolderExists();
  handleFileOperations();
  handleNotifications();

  mainWindow = await createMainWindow();
  if (mainWindow) {
    setupAppEvents();
    setupIPCHandlers();
    createTray();
    showInitialNotification();
    startPowerSaveBlocker();
  }

  if (process.env.NODE_ENV === 'production') {
    require('source-map-support').install();
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    require('electron-debug')();
  }

  logger.info('CPU Usage:', process.getCPUUsage());
  logger.info('System Memory Info:', process.getSystemMemoryInfo());
});

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  app.quit();
});
