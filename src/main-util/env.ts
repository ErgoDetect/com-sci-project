import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import logger from './logger';

const loadEnvFile = (): void => {
  let envFilePath: string;

  // Check if the app is running with asar packaging
  if (process.mainModule?.filename.includes('app.asar')) {
    // If inside an asar archive, use the unpacked location
    const baseDir = path.resolve(process.resourcesPath, 'app.asar.unpacked');
    envFilePath = path.join(
      baseDir,
      process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    );
  } else {
    // If not using asar or running in development
    const rootDir = path.resolve(__dirname, '../../');
    envFilePath = path.join(
      rootDir,
      process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    );
  }

  // Check if the .env file exists and load it
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    logger.info('Environment variables loaded successfully.');
    logger.info(`Environment file path: ${envFilePath}`);
  } else {
    logger.warn(`No .env file found at: ${envFilePath}`);
  }
};

export default loadEnvFile;
