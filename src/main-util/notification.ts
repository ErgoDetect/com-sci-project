import { ipcMain, Notification } from 'electron';

const handleNotifications = (): void => {
  ipcMain.handle(
    'show-notification',
    (_event, { title, body }: { title: string; body: string }): void => {
      if (title && body) {
        new Notification({ title, body }).show();
      } else {
        console.error('Notification title or body is missing.');
      }
    },
  );
};

export default handleNotifications;
