import axios from 'axios';

const getDeviceIdentifier = async (): Promise<string> => {
  const deviceIdentifier = await window.electron.ipcRenderer.getMacAddress();
  if (!deviceIdentifier) {
    throw new Error('Device identifier not found');
  }
  return deviceIdentifier;
};

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// List of endpoints that require the 'Device-Identifier' header
const endpointsRequiringDeviceIdentifier = [
  '/auth/status',
  '/auth/google/login',
  '/files/upload/video',
  '/auth/logout',
  '/auth/google/set-cookies',
  '/auth/login',
  '/auth/refresh-token',
];

// Add a request interceptor to conditionally attach the 'Device-Identifier' header
axiosInstance.interceptors.request.use(
  async (config) => {
    // Check if the request URL matches one of the endpoints requiring the header
    if (
      endpointsRequiringDeviceIdentifier.some((url) =>
        config.url?.includes(url),
      )
    ) {
      const deviceIdentifier = await getDeviceIdentifier();
      config.headers['Device-Identifier'] = deviceIdentifier;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const deviceIdentifier = await getDeviceIdentifier();
        await axiosInstance.get('auth/status', {
          headers: { 'Device-Identifier': deviceIdentifier },
        });
      } catch (statusError) {
        console.error('Error handling 401:', statusError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
