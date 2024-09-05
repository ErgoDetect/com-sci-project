import { BrowserWindow, ipcMain } from 'electron';
import http from 'http';
import { URL } from 'url';
import { OAuth2Client } from 'google-auth-library';
import { OAuthTokens } from '../interface/propsType';
import logger from './logger';

let authWindow: BrowserWindow | null = null;

export const startAuthServer = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '', `http://localhost:3000`);
      logger.info('Received URL:', url.toString());

      const accessToken = url.searchParams.get('access_token');

      if (accessToken) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Authentication successful! You can close this window.');
        resolve(accessToken);
        server.close();
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Authentication failed!');
        reject(new Error('No access token found'));
        server.close();
      }
    });

    server.listen(3000, () => {
      logger.info('OAuth2 server listening on http://localhost:3000');
    });

    server.on('error', (err) => {
      reject(err);
      server.close();
    });
  });
};

export const openAuthWindow = async (): Promise<OAuthTokens> => {
  return new Promise<OAuthTokens>((resolve, reject) => {
    authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
      },
    });

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000',
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });

    authWindow.loadURL(authUrl);

    authWindow.webContents.on('will-redirect', async (event, newUrl) => {
      const url = new URL(newUrl);
      const code = url.searchParams.get('code');

      if (code) {
        try {
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);
          resolve(tokens as OAuthTokens);
          authWindow?.close();
          authWindow = null;
        } catch (error) {
          logger.error('Failed to get tokens:', error);
          reject(error);
        }
      }
    });

    authWindow.on('closed', () => {
      reject(new Error('Auth window was closed by the user'));
      authWindow = null;
    });
  });
};
