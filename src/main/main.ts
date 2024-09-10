import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import { Notification } from 'electron';
import { createMainWindow } from '../main-util/windowManager';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../main-util/logger';
import loadEnvFile from '../main-util/env';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';

// Create a folder for saving videos
const saveFolderPath = path.join(app.getPath('userData'), 'result');

// Ensure the directory exists
if (!fs.existsSync(saveFolderPath)) {
  fs.mkdirSync(saveFolderPath, { recursive: true });
}

const showInitialNotification = (): void => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Welcome!',
      body: 'Your application is running successfully!',
    });

    notification.show();

    notification.on('click', () => {
      console.log('Notification clicked');
    });

    notification.on('close', () => {
      console.log('Notification closed');
    });
  } else {
    console.error('Notifications are not supported on this platform.');
  }
};

app.whenReady().then(() => {
  // Load any .env or necessary config files
  loadEnvFile();

  // Handle any file operations needed
  handleFileOperations(ipcMain);

  // Show notifications
  handleNotifications();

  // Open the main window initially
  // Handle the 'save-video' IPC call
  ipcMain.handle('save-video', async (event, buffer: Buffer) => {
    try {
      // Create a unique file name
      const videoFileName = `recorded_video_${Date.now()}.webm`;
      const filePath = path.join(saveFolderPath, videoFileName);

      // Write the video buffer to a file
      fs.writeFileSync(filePath, buffer);

      return { success: true, filePath };
    } catch (error) {
      // Type assertion to ensure `error` is a known type
      if (error instanceof Error) {
        console.error('Error saving video:', error.message);
        return { success: false, error: error.message };
      } else {
        console.error('Unexpected error:', error);
        return { success: false, error: 'An unexpected error occurred' };
      }
    }
  });

  createMainWindow();

  ipcMain.handle('get-cookie', async () => {
    try {
      const cookies = await session.defaultSession.cookies.get({
        url: 'http://localhost:8000',
      });
      return cookies;
    } catch (error) {
      console.error('Error fetching cookies:', error);
      throw error;
    }
  });

  // Listen for the `open-auth-window` IPC event

  // Show an initial notification
  showInitialNotification();

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    require('electron-debug')();
  }
});

// Handle app quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate the main window when the dock icon is clicked and there are no open windows
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
