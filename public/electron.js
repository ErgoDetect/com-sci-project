const { app, BrowserWindow, screen } = require('electron');
const path = require('node:path');

const isDev = process.env.NODE_ENV !== 'production';

const createWindow = () => {
  // Create the browser window.
  const display = screen.getPrimaryDisplay();
  // const screenWidth = Math.floor(display.workAreaSize.width * 0.75);
  const screenWidth = Math.floor(display.workAreaSize.width);
  const windowWidth = screenWidth;
  const windowHeight = Math.floor((windowWidth * 10) / 16);
  const minWidth = Math.floor(display.workAreaSize.width * 0.63);
  const minHeight = Math.floor((minWidth * 10) / 16);

  const mainWindow = new BrowserWindow({
    // width: windowWidth,
    // height: windowHeight,
    width: windowWidth,
    height: windowHeight,
    resizable: true,
    minWidth: minWidth,
    minHeight: minHeight,
    webPreferences: {
      nodeIntegration: true,
      // preload: path.join(__dirname, "preload.js"),
    },
    // fullscreen: true,
  });

  if (isDev) {
    mainWindow.loadURL(
      isDev
        ? 'http://localhost:3000'
        : path.join(__dirname, 'build', 'index.html'),
    );

    mainWindow.webContents.openDevTools();
  }
};
app.whenReady().then(() => {
  createWindow();

  app.on('window-all-closed', (e) => {
    if (process.platform === 'darwin') {
      e.preventDefault();
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
