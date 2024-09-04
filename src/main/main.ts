import { app, ipcMain } from 'electron';
import { Notification } from 'electron';
import logger from '../main-util/logger';
import loadEnvFile from '../main-util/env';
import { createMainWindow, handleAppEvents } from '../main-util/windowManager';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';
import { openAuthWindow } from '../main-util/auth';

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

  ipcMain.handle('open-auth-window', openAuthWindow);

  createMainWindow();
  showInitialNotification();
  handleAppEvents();

  // Show initial notification

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
