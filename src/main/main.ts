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
import { nativeImage } from 'electron';
import ffmpeg from 'fluent-ffmpeg';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let powerSaveBlockerId: number | null = null;

const platformFolder =
  process.platform === 'darwin'
    ? 'darwin'
    : process.platform === 'win32'
      ? 'win32'
      : null;
const archFolder = process.arch === 'arm64' ? 'arm64' : 'x64';

if (!platformFolder) {
  throw new Error('Unsupported platform');
}

// Define ffmpeg and ffprobe paths based on packaging status
let ffmpegPath = app.isPackaged
  ? path.join(process.resourcesPath, 'ffmpeg')
  : path.resolve(__dirname, '../../node_modules/ffmpeg-static/ffmpeg');

let ffprobePath = app.isPackaged
  ? path.join(
      process.resourcesPath,
      'ffprobe',
      platformFolder,
      archFolder,
      'ffprobe',
    )
  : path.resolve(
      __dirname,
      `../../node_modules/ffprobe-static/bin/${platformFolder}/${archFolder}/ffprobe`,
    );

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Define the default app configuration
const defaultAppConfig = {
  showStat: false,
  saveUploadVideo: true,
  useFocalLength: false,
  saveSessionVideo: true,
  showBlinkNotification: true,
  showSittingNotification: true,
  showDistanceNotification: true,
  showThoracticNotification: true,
  calibrationData: {
    cameraMatrix: [
      [0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0],
    ],
    distCoeffs: [[0.0, 0.0, 0.0, 0.0, 0.0]],
    mean_error: 0.0,
  },
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

const appPaths = {
  saveFolderPath: path.join(app.getPath('userData'), 'result'),
  settingPath: path.join(app.getPath('userData'), 'appConfig.json'),
};

// Ensure save folder and settings file exist
const ensureSaveFolderExists = async () => {
  if (!fs.existsSync(appPaths.saveFolderPath)) {
    await fs.promises.mkdir(appPaths.saveFolderPath, { recursive: true });
  }

  if (!fs.existsSync(appPaths.settingPath)) {
    fs.writeFileSync(
      appPaths.settingPath,
      JSON.stringify(defaultAppConfig, null, 2),
    );
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
    log.error(
      `Tray icon not found at: ${iconPath}. Falling back to default icon.`,
    );
    tray = new Tray(nativeImage.createEmpty()); // Fallback to empty tray icon
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
    if (powerSaveBlockerId !== null) {
      powerSaveBlocker.stop(powerSaveBlockerId);
      powerSaveBlockerId = null;
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
    if (!BrowserWindow.getAllWindows().length && !mainWindow) {
      mainWindow = await createMainWindow();
    } else {
      mainWindow?.show();
      if (process.platform === 'darwin') app.dock.show(); // Show dock icon on macOS
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow.webContents.send('deep-link', url);
        });
      } else {
        mainWindow.webContents.send('deep-link', url);
      }
    }
  });
};

const createThumbnail = async (
  videoPath: string,
  thumbnailPath: string,
): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['1%'], // Capture frame at 5% of video duration
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '1280x720', // Desired thumbnail dimensions
        })
        .on('end', () => {
          console.log(`Thumbnail created successfully at ${thumbnailPath}`);
          resolve();
        })
        .on('error', (err: Error) => {
          console.error('Error creating thumbnail:', err);
          reject(err);
        });
    });
  } catch (error) {
    throw new Error(`Thumbnail creation failed: ${(error as Error).message}`);
  }
};

const deleteVideoAndThumbnail = async (
  videoName: string,
  thumbnailName: string,
): Promise<{ success: boolean; error?: string }> => {
  const videoPath = path.join(appPaths.saveFolderPath, videoName);
  const thumbnailPath = path.join(appPaths.saveFolderPath, thumbnailName);

  const deletionPromises = [];

  // Attempt to delete the video file
  deletionPromises.push(
    fs.promises.unlink(videoPath).catch((error) => {
      // Log the error but don't throw
      logger.warn('Error deleting video file:', error.message);
    }),
  );

  // Attempt to delete the thumbnail file
  deletionPromises.push(
    fs.promises.unlink(thumbnailPath).catch((error) => {
      // Log the error but don't throw
      logger.warn('Error deleting thumbnail file:', error.message);
    }),
  );

  try {
    // Wait for both deletions to settle
    await Promise.allSettled(deletionPromises);

    logger.info(
      `Attempted to delete video and thumbnail: ${videoName}, ${thumbnailName}`,
    );
    return { success: true };
  } catch (error) {
    logger.error('Unexpected error while deleting video or thumbnail:', error);
    return {
      success: false,
      error: 'Unexpected error',
    };
  }
};

// Utility function to save file
const saveFile = async (filePath: string, data: Buffer) => {
  await fs.promises.writeFile(filePath, data);
};

const saveVideoWithThumbnail = async (
  videoName: string,
  thumbnail: string,
  buffer: Buffer,
) => {
  const filePath = path.join(appPaths.saveFolderPath, videoName);
  const thumbnailPath = path.join(appPaths.saveFolderPath, thumbnail);

  // Start saving the file and creating the thumbnail concurrently
  const saveFilePromise = saveFile(filePath, buffer);
  const thumbnailPromise = saveFilePromise.then(() =>
    createThumbnail(filePath, thumbnailPath),
  );

  // Wait for both operations to complete
  await Promise.all([saveFilePromise, thumbnailPromise]);

  logger.info(
    `Video saved successfully to ${filePath} with thumbnail at ${thumbnailPath}`,
  );

  return { success: true, filePath, thumbnailPath };
};

// Setup IPC handlers
const setupIPCHandlers = (): void => {
  // Utility function to ensure directory exists

  // Handle saving video
  ipcMain.handle('save-video', async (event, videoName, thumbnail, buffer) => {
    try {
      return await saveVideoWithThumbnail(videoName, thumbnail, buffer);
    } catch (error) {
      logger.error('Error saving video or generating thumbnail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  });

  // Handle saving and uploading video
  ipcMain.handle(
    'save-upload-video',
    async (event, buffer, start, videoName, thumbnail) => {
      const tempPath = path.join(app.getPath('userData'), 'temp_video.mp4');
      const processedPath = path.join(
        app.getPath('userData'),
        'processed_video.mp4',
      );

      try {
        await saveFile(tempPath, buffer);

        await new Promise((resolve, reject) => {
          ffmpeg(tempPath)
            .setStartTime(start)
            .save(processedPath)
            .on('end', resolve)
            .on('error', reject);
        });

        const processedBuffer = await fs.promises.readFile(processedPath);
        await fs.promises.unlink(tempPath);

        // Call saveVideoWithThumbnail directly
        return await saveVideoWithThumbnail(
          videoName,
          thumbnail,
          processedBuffer,
        );
      } catch (error) {
        logger.error('Error processing or saving video:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unexpected error',
        };
      } finally {
        if (fs.existsSync(processedPath))
          await fs.promises.unlink(processedPath);
      }
    },
  );

  ipcMain.handle(
    'delete-video-and-thumbnail',
    async (event, videoName, thumbnailName) => {
      return await deleteVideoAndThumbnail(videoName, thumbnailName);
    },
  );
  // Handle retrieving video
  ipcMain.handle('get-video', async (event, videoName) => {
    const filePath = path.join(app.getPath('userData'), 'result', videoName);

    try {
      const buffer = await fs.promises.readFile(filePath);
      return `data:video/webm;base64,${buffer.toString('base64')}`;
    } catch (error) {
      logger.error('Error retrieving video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  });

  // Handle retrieving thumbnail
  ipcMain.handle('get-thumbnail', async (event, thumbnailName) => {
    const filePath = path.join(
      app.getPath('userData'),
      'result',
      thumbnailName,
    );

    try {
      const buffer = await fs.promises.readFile(filePath);
      return `data:image/jpg;base64,${buffer.toString('base64')}`;
    } catch (error) {
      logger.error('Error retrieving thumbnail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  });
};

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

    const deepLinkUrl = commandLine.find((arg) =>
      arg.startsWith('ergodetect://'),
    );
    if (deepLinkUrl) {
      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow.webContents.send('deep-link', deepLinkUrl);
        });
      } else {
        mainWindow.webContents.send('deep-link', deepLinkUrl);
      }
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
  if (mainWindow) {
    mainWindow.webContents.send('error-notification', {
      title: 'An error occurred',
      message: 'An unexpected issue occurred. Please try again.',
    });
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (mainWindow) {
    mainWindow.webContents.send('error-notification', {
      title: 'Critical Error',
      message:
        'The application encountered an unexpected error and needs to close.',
    });
  }
  app.quit();
});
