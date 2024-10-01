import { ipcMain } from 'electron';

// utility/getMacAddress.js
const os = require('os');

const getMacAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const key in networkInterfaces) {
    for (const net of networkInterfaces[key]) {
      // Check for non-internal and IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.mac; // Return the MAC address
      }
    }
  }
  return null;
};

export default getMacAddress;
