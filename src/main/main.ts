import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import { Notification } from 'electron';
import { createMainWindow } from '../main-util/windowManager';

import loadEnvFile from '../main-util/env';
import { handleFileOperations } from '../main-util/fileOperations';
import handleNotifications from '../main-util/notification';

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
