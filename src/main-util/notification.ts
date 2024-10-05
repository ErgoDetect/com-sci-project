import { ipcMain, Notification } from 'electron';
import logger from './logger'; // Adjust the import path if necessary

const handleNotifications = (): void => {
  // Register the IPC handler for showing notifications
  ipcMain.handle(
    'show-notification',
    async (
      _event,
      { title, body }: { title: string; body: string },
    ): Promise<{ success: boolean; error?: string }> => {
      // Check if notifications are supported on this platform
      if (!Notification.isSupported()) {
        const errorMessage =
          'Notifications are not supported on this platform.';
        logger.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validate the title and body
      if (!title || !body) {
        const errorMessage = 'Notification title or body is missing.';
        logger.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      try {
        // Create and display the notification
        const notification = new Notification({ title, body });
        notification.show();

        // Optionally handle notification events
        notification.on('click', () => {
          logger.info('Notification clicked');
          // Perform additional actions if needed
        });

        return { success: true };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        logger.error('Error showing notification:', error);
        return { success: false, error: errorMessage };
      }
    },
  );
};

export default handleNotifications;
