const installExtensions = async (): Promise<void> => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    try {
      await installer.default(
        extensions.map((name: string) => installer[name]),
        forceDownload,
      );
    } catch (error) {
      console.log('Failed to install extensions:', error);
    }
  }
};

export default installExtensions;
