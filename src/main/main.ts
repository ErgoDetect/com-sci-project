import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  powerSaveBlocker,
  dialog,
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

if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient('ergodetect', process.execPath, [
    path.resolve(process.argv[1]),
  ]);
} else {
  app.setAsDefaultProtocolClient('ergodetect');
}

// Define a helper to retrieve asset paths
const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  return path.join(RESOURCES_PATH, ...paths);
};

// Ensure save folder exists
const ensureSaveFolderExists = (): void => {
  const saveFolderPath = path.join(app.getPath('userData'), 'result');
  if (!fs.existsSync(saveFolderPath)) {
    fs.mkdirSync(saveFolderPath, { recursive: true });
  }
};

// Show a welcome notification when the app starts
const showInitialNotification = (): void => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Welcome!',
      body: 'Your application is running successfully!',
    });
    notification.show();
    notification.on('click', () => console.log('Notification clicked'));
    notification.on('close', () => console.log('Notification closed'));
  } else {
    logger.error('Notifications are not supported on this platform.');
  }
};

// Create system tray and context menu
const createTray = (): void => {
  const iconPath = getAssetPath('icons', '16x16.png');

  // Log if the tray icon path does not exist
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

// Handle application events
const setupAppEvents = (): void => {
  // Handle close event to hide the window instead of quitting
  mainWindow?.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide(); // Hide the window instead of closing
      if (process.platform === 'darwin') {
        app.dock.hide(); // Hide the dock icon on macOS
      }
    } else {
      mainWindow = null;
    }
  });

  // Handle quitting the app
  app.on('before-quit', () => {
    isQuitting = true;
    if (tray) {
      tray.destroy(); // Destroy the tray only when actually quitting
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
      app.dock.hide();
    } else {
      app.quit();
    }
  });

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) {
      mainWindow = await createMainWindow();
    } else {
      mainWindow?.show();
    }
  });

  app.on('open-url', (event, url) => {
    // dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`);
    if (mainWindow) {
      mainWindow.webContents.send('deep-link', url);
    }
  });
};

// Set up IPC handlers
const setupIPCHandlers = (): void => {
  ipcMain.handle('save-video', async (event, buffer) => {
    try {
      const saveFolderPath = path.join(app.getPath('userData'), 'result');
      await fs.promises.mkdir(saveFolderPath, { recursive: true });

      const videoFileName = `recorded_video_${Date.now()}.webm`;
      const filePath = path.join(saveFolderPath, videoFileName);

      // Create a write stream to save the buffer in chunks
      const writeStream = fs.createWriteStream(filePath);

      // Stream the buffer directly to the file
      writeStream.write(buffer);
      writeStream.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          logger.info(`Video saved successfully to ${filePath}`);
          resolve({ success: true, filePath });
        });
        writeStream.on('finish', () => {
          logger.info(`Video saved successfully to ${filePath}`);
          resolve({ success: true, filePath });
        });

        writeStream.on('error', (error) => {
          logger.error('Error saving video:', error);
          reject({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Unexpected error occurred',
          });
        });
      });
    } catch (error) {
      logger.error('Error in save-video handler:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unexpected error occurred',
      };
    }
  });
};
// Start power save blocker
const startPowerSaveBlocker = (): void => {
  if (powerSaveBlockerId === null) {
    powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    logger.info('Power save blocker started:', powerSaveBlockerId);
  }
};

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const deepLinkUrl = commandLine.pop();
    // dialog.showErrorBox('Welcome Back', `You arrived from: ${deepLinkUrl}`);
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

// Error Handling for unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  app.quit();
});
