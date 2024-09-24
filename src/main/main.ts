import {
  app,
  BrowserWindow,
  ipcMain,
  session,
  Notification,
  Tray,
  Menu,
  powerSaveBlocker, // Import powerSaveBlocker
} from 'electron';
import { createMainWindow } from '../main-util/windowManager'; // Ensure this returns BrowserWindow or null
import * as path from 'path';
import * as fs from 'fs';
import logger from '../main-util/logger';
import loadEnvFile from '../main-util/env';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null; // System Tray reference
let isQuitting = false; // Flag to track if the app is quitting
let powerSaveBlockerId: number | null = null; // Keep a reference for powerSaveBlocker

// Folder for saving videos
const saveFolderPath = path.join(app.getPath('userData'), 'result');
if (!fs.existsSync(saveFolderPath)) {
  fs.mkdirSync(saveFolderPath, { recursive: true });
}

// Function to show an initial notification when the app starts
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
    console.error('Notifications are not supported on this platform.');
  }
};

// Create System Tray and set a context menu
const createTray = (): void => {
  const iconPath = path.join(
    __dirname,
    '../../',
    'assets',
    'icons',
    '16x16.png',
  ); // Update this path to your tray icon
  console.log(iconPath);

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

  // Restore the window when the tray icon is clicked
  tray.on('click', () => {
    if (tray) {
      mainWindow?.show();
    }
  });
};

// Application startup logic
app.whenReady().then(async () => {
  loadEnvFile(); // Load environment files if any
  handleFileOperations(ipcMain); // Handle file operations via IPC
  handleNotifications(); // Set up notifications

  // Create the main window
  mainWindow = await createMainWindow(); // Await the promise and assign the result to mainWindow

  if (mainWindow) {
    // Minimize to tray instead of closing the app
    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow?.hide();

        if (process.platform === 'darwin') {
          app.dock.hide();
        }
      } else {
        // Destroy the tray to clean up resources
        if (tray) {
          tray.destroy();
        }
      }
    });

    // Create System Tray
    createTray();
  }

  // Start powerSaveBlocker to prevent system suspension
  if (!powerSaveBlockerId) {
    powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
    console.log('Power save blocker started:', powerSaveBlockerId);
  }

  showInitialNotification();

  // Electron debug and production mode handling
  if (process.env.NODE_ENV === 'production') {
    require('source-map-support').install();
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    require('electron-debug')();
  }
});

// Handle app quitting
app.on('before-quit', () => {
  isQuitting = true;

  // Stop the powerSaveBlocker if it's running
  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    console.log('Power save blocker stopped:', powerSaveBlockerId);
    powerSaveBlockerId = null;
  }

  if (tray) {
    tray.destroy();
  }
});

// IPC handlers for saving video and getting cookies
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

ipcMain.handle('get-cookie', async () => {
  try {
    const cookies = await session.defaultSession.cookies.get({
      url: 'http://localhost:8000',
    });
    const accessToken = cookies.find(
      (cookie) => cookie.name === 'access_token',
    );
    const refreshToken = cookies.find(
      (cookie) => cookie.name === 'refresh_token',
    );
    if (!accessToken || !refreshToken)
      throw new Error('Required token(s) missing');
    return {
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    };
  } catch (error) {
    console.error('Error occurred in get-cookie:', error);
    throw error;
  }
});

// App lifecycle management
app.on('window-all-closed', () => {
  // Hide dock icon for macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = await createMainWindow(); // Ensure it's awaited and assigned properly
  }
});
