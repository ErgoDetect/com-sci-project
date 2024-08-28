import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';
import dotenv from 'dotenv';

const loadEnvFile = () => {
  const rootDir = path.resolve(__dirname, '../../');
  const envFilePath =
    process.env.NODE_ENV === 'production'
      ? path.join(rootDir, '.env.production')
      : path.join(rootDir, '.env');

  console.log('Loading environment variables from:', envFilePath);

  dotenv.config({ path: envFilePath });
};

loadEnvFile();

let mainWindow: BrowserWindow | null = null;

// Handle getting the user data path securely
ipcMain.handle('get-user-data-path', () => {
  // Get the path to the user data directory
  const userDataPath = app.getPath('userData');

  // Ensure the user data directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // Define the path to the hidden calibration data file
  const calibrationFilePath = path.join(userDataPath, 'calibrationData.json');

  // Hide the file on Windows
  if (process.platform === 'win32') {
    require('child_process').execSync(`attrib +h "${calibrationFilePath}`);
  }

  // On Unix-like systems (macOS, Linux), hide the file by prefixing with a dot
  if (process.platform !== 'win32') {
    const hiddenFilePath = path.join(userDataPath, '.calibrationData.json');
    if (fs.existsSync(calibrationFilePath)) {
      fs.renameSync(calibrationFilePath, hiddenFilePath);
    }
    return hiddenFilePath;
  }

  return calibrationFilePath;
});

// Handle writing to a file securely
ipcMain.handle('write-file', (event, filePath: string, data: string) => {
  fs.writeFileSync(filePath, data, 'utf8');
  return true;
});

// Handle reading from a file
ipcMain.handle('read-file', (event, filePath: string) => {
  return fs.readFileSync(filePath, 'utf8');
});

// Handle checking if a file exists
ipcMain.handle('file-exists', (event, filePath: string) => {
  return fs.existsSync(filePath);
});

// Handle showing notifications
ipcMain.handle('show-notification', (event, args) => {
  const { title, body } = args;
  if (title && body) {
    new Notification({ title, body }).show();
  } else {
    console.error('Notification title or body is missing.');
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name: any) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
};

const showInitialNotification = () => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });

    // Show an initial notification when the app is ready
    showInitialNotification();
  })
  .catch(console.log);
