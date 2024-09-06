import { app, ipcMain, Notification } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../main-util/logger';
import loadEnvFile from '../main-util/env';
import { createMainWindow, handleAppEvents } from '../main-util/windowManager';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';
import { openAuthWindow } from '../main-util/auth';

// Create a folder for saving videos
const saveFolderPath = path.join(app.getPath('userData'), 'result');

// Ensure the directory exists
if (!fs.existsSync(saveFolderPath)) {
  fs.mkdirSync(saveFolderPath, { recursive: true });
}

const showInitialNotification = (): void => {
  // Check if Notifications are supported (specific to Electron)
  if (Notification.isSupported()) {
    // Create a new notification instance
    const notification = new Notification({
      title: 'Welcome!',
      body: 'Your application is running successfully!',
    });

    // Show the notification
    notification.show();

    // Add event listeners for click and close events
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
  loadEnvFile();
  handleFileOperations(ipcMain);
  handleNotifications();

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

  ipcMain.handle('open-auth-window', openAuthWindow);

  createMainWindow();
  showInitialNotification();
  handleAppEvents();

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
