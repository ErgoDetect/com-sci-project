import {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  powerSaveBlocker,
} from 'electron';
import { createMainWindow } from '../main-util/windowManager';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../main-util/logger';
import loadEnvFile from '../main-util/env';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';
import getMacAddress from '../main-util/getMacAddress';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let powerSaveBlockerId: number | null = null;

const saveFolderPath = path.join(app.getPath('userData'), 'result');

// Ensure save folder exists
const ensureSaveFolderExists = (): void => {
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
  const iconPath = path.join(__dirname, '../../assets/icons/16x16.png');
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
};

// Handle application events
const setupAppEvents = (): void => {
  // Handle close event to minimize to tray
  mainWindow?.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();

      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    } else if (tray) {
      tray.destroy();
    }
  });

  // Quitting the app
  app.on('before-quit', () => {
    isQuitting = true;

    // Stop power save blocker
    if (powerSaveBlockerId !== null) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
    }

    // Clean up tray
    if (tray) {
      tray.destroy();
    }
  });

  // Handle app lifecycle for macOS
  app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
      app.dock.hide();
    } else {
      app.quit();
    }
  });

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createMainWindow();
    } else {
      mainWindow?.show();
    }
  });
};

// Set up IPC handlers
const setupIPCHandlers = (): void => {
  ipcMain.handle('save-video', async (event, buffer: Buffer) => {
    try {
      const videoFileName = `recorded_video_${Date.now()}.webm`;
      const filePath = path.join(saveFolderPath, videoFileName);
      fs.writeFileSync(filePath, buffer);
      return { success: true, filePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  });

  // Add other IPC handlers if needed
};

// Start power save blocker
const startPowerSaveBlocker = (): void => {
  if (powerSaveBlockerId === null) {
    powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    console.log('Power save blocker started:', powerSaveBlockerId);
  }
};

// Main application startup logic
app.whenReady().then(async () => {
  // Load environment variables
  loadEnvFile();

  // Ensure save folder exists
  ensureSaveFolderExists();

  // Set up file operations and notifications
  handleFileOperations();
  handleNotifications();

  // Create the main window
  mainWindow = await createMainWindow();

  if (mainWindow) {
    setupAppEvents();
    setupIPCHandlers(); // Added this call to set up IPC handlers
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

  console.log('CPU Usage:', process.getCPUUsage());
  console.log('System Memory Info:', process.getSystemMemoryInfo());
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  app.quit();
});
