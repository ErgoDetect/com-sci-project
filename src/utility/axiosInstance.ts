/* eslint-disable no-underscore-dangle */
import axios from 'axios';

const getDeviceIdentifier = async (): Promise<string> => {
  const deviceIdentifier = await window.electron.system.getMacAddress();
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
    const originalRequest = error.config;

    // If we get a 401 and it's not already retried, handle it
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent retrying indefinitely

      try {
        // Call refresh-token API to get a new token
        const deviceIdentifier = await getDeviceIdentifier();
        const refreshResponse = await axiosInstance.post(
          '/auth/refresh-token',
          null,
          {
            headers: { 'Device-Identifier': deviceIdentifier },
          },
        );

        if (refreshResponse.status === 200) {
          // Token refreshed, retry the original request with the new token
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // If refresh fails, log out or handle appropriately
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
