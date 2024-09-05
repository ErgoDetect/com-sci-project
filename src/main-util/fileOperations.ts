import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export const getUserDataPath = (): string => {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  const calibrationFilePath = path.join(userDataPath, 'calibrationData.json');
  if (process.platform === 'win32') {
    require('child_process').execSync(`attrib +h "${calibrationFilePath}"`);
  } else {
    const hiddenFilePath = path.join(userDataPath, '.calibrationData.json');
    if (fs.existsSync(calibrationFilePath)) {
      fs.renameSync(calibrationFilePath, hiddenFilePath);
    }
    return hiddenFilePath;
  }

  return calibrationFilePath;
};

export const handleFileOperations = (ipcMain: Electron.IpcMain): void => {
  ipcMain.handle('get-user-data-path', getUserDataPath);

  ipcMain.handle(
    'write-file',
    (_event, filePath: string, data: string): boolean => {
      try {
        fs.writeFileSync(filePath, data, 'utf8');
        return true;
      } catch (error) {
        console.error('Failed to write file:', error);
        return false;
      }
    },
  );

  ipcMain.handle('read-file', (_event, filePath: string): string => {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Failed to read file:', error);
      return '';
    }
  });

  ipcMain.handle('file-exists', (_event, filePath: string): boolean => {
    return fs.existsSync(filePath);
  });
};
