/* eslint-disable no-underscore-dangle */
import axios from 'axios';

let cachedDeviceIdentifier: string | PromiseLike<string> = null;

// Function to get or cache the device identifier
const getDeviceIdentifier = async (): Promise<string> => {
  if (cachedDeviceIdentifier) {
    return cachedDeviceIdentifier;
  }
  const deviceIdentifier = await window.electron.system.getMacAddress();
  if (!deviceIdentifier) {
    throw new Error('Device identifier not found');
  }
  cachedDeviceIdentifier = deviceIdentifier;
  return deviceIdentifier;
};

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// Define endpoints that require the 'Device-Identifier' header
const endpointsRequiringDeviceIdentifier = new Set([
  '/auth/status',
  '/auth/google/login',
  '/auth/logout',
  '/auth/google/set-cookies',
  '/auth/login',
  '/auth/refresh-token',
]);

// Request interceptor to attach the 'Device-Identifier' header where needed
axiosInstance.interceptors.request.use(
  async (config) => {
    if (
      config.url &&
      endpointsRequiringDeviceIdentifier.has(config.url.split('?')[0])
    ) {
      const deviceIdentifier = await getDeviceIdentifier();
      config.headers['Device-Identifier'] = deviceIdentifier;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle global errors and token refresh mechanism
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh logic on 401 Unauthorized response
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark the request as retried
      try {
        const deviceIdentifier = await getDeviceIdentifier();
        const refreshResponse = await axiosInstance.post(
          '/auth/refresh-token',
          null,
          {
            headers: { 'Device-Identifier': deviceIdentifier },
          },
        );

        if (refreshResponse.status === 200) {
          // Retry the original request with the new token
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Implement a logout mechanism or further error handling here
      }
    }

    // Additional handling for other types of response errors can be added here
    return Promise.reject(error);
  },
);

export default axiosInstance;
