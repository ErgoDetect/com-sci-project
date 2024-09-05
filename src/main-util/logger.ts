import winston from 'winston';
import path from 'path';
import { app } from 'electron';

// Define the log directory
const logDir = path.join(app.getPath('userData'), 'logs-prod');

// Ensure the directory existsc
import fs from 'fs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create the logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({
      filename: path.join(logDir, `${app.getName()}.log`),
    }), // Log to file
  ],
});

export default logger;
