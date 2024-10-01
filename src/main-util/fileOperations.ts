import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import logger from './logger'; // Adjust the import path as needed

const fsExists = promisify(fs.exists);
const fsMkdir = promisify(fs.mkdir);
const fsRename = promisify(fs.rename);
const fsWriteFile = promisify(fs.writeFile);
const fsReadFile = promisify(fs.readFile);
const execAsync = promisify(exec);

export const getCalibrationFilePath = async (): Promise<string> => {
  const userDataPath = app.getPath('userData');

  // Ensure the user data path exists
  const userDataExists = await fsExists(userDataPath);
  if (!userDataExists) {
    await fsMkdir(userDataPath, { recursive: true });
  }

  let calibrationFilePath = path.join(userDataPath, 'calibrationData.json');

  if (process.platform === 'win32') {
    try {
      // Hide the file on Windows
      await execAsync(`attrib +h "${calibrationFilePath}"`);
    } catch (error) {
      logger.error('Failed to hide calibration file on Windows:', error);
    }
  } else {
    // For Unix-like systems, prefix the filename with a dot to hide it
    const hiddenFilePath = path.join(userDataPath, '.calibrationData.json');
    const calibrationFileExists = await fsExists(calibrationFilePath);

    if (calibrationFileExists) {
      try {
        await fsRename(calibrationFilePath, hiddenFilePath);
        calibrationFilePath = hiddenFilePath;
      } catch (error) {
        logger.error('Failed to rename calibration file:', error);
      }
    } else {
      calibrationFilePath = hiddenFilePath;
    }
  }

  return calibrationFilePath;
};

export const handleFileOperations = (): void => {
  ipcMain.handle('get-calibration-file-path', async () => {
    try {
      const calibrationFilePath = await getCalibrationFilePath();
      return { success: true, path: calibrationFilePath };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      logger.error('Failed to get calibration file path:', error);
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle(
    'write-file',
    async (
      _event,
      filePath: string,
      data: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // Validate the file path to prevent directory traversal attacks
        const userDataPath = app.getPath('userData');
        if (!filePath.startsWith(userDataPath)) {
          throw new Error('Invalid file path');
        }

        await fsWriteFile(filePath, data, 'utf8');
        return { success: true };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        logger.error('Failed to write file:', error);
        return { success: false, error: errorMessage };
      }
    },
  );

  ipcMain.handle(
    'read-file',
    async (
      _event,
      filePath: string,
    ): Promise<{ success: boolean; data?: string; error?: string }> => {
      try {
        // Validate the file path to prevent directory traversal attacks
        const userDataPath = app.getPath('userData');
        if (!filePath.startsWith(userDataPath)) {
          throw new Error('Invalid file path');
        }

        const data = await fsReadFile(filePath, 'utf8');
        return { success: true, data };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        logger.error('Failed to read file:', error);
        return { success: false, error: errorMessage };
      }
    },
  );

  ipcMain.handle(
    'file-exists',
    async (
      _event,
      filePath: string,
    ): Promise<{ success: boolean; exists?: boolean; error?: string }> => {
      try {
        // Validate the file path to prevent directory traversal attacks
        const userDataPath = app.getPath('userData');
        if (!filePath.startsWith(userDataPath)) {
          throw new Error('Invalid file path');
        }

        const exists = await fsExists(filePath);
        return { success: true, exists };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        logger.error('Failed to check if file exists:', error);
        return { success: false, error: errorMessage };
      }
    },
  );
};

export default handleFileOperations;
