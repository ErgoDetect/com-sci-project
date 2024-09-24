import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import as default
import { useNavigate } from 'react-router-dom';
import { useResData } from '../context'; // Assuming this handles app-level state

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // Ensure cookies are sent with requests
});

// Function to decode token and check expiration
const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  const decodedToken: any = jwtDecode(token);
  const currentTime = Date.now() / 1000; // Current time in seconds
  return decodedToken.exp < currentTime; // Check if token is expired
};

// Function to handle refreshing the access token
const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post(
      '/auth/refresh-token/',
      {}, // No need for payload; refresh token will be sent via cookies
      {
        withCredentials: true, // Sends the refresh token cookie
      },
    );
    return response.data.access_token; // Return the new access token
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error; // Re-throw error for further handling
  }
};

// Helper to get tokens using Electron IPC
const getAccessToken = async (): Promise<string | null> => {
  try {
    const cookies = await window.electron.ipcRenderer.getCookie();
    let token = cookies.access_token || null;

    // If no token found, try to refresh it immediately
    if (!token) {
      console.log('No access token found, trying to refresh.');
      try {
        token = await refreshAccessToken();
        console.log('New access token obtained:', token);
      } catch (error) {
        console.error(
          'Failed to refresh token when none found initially:',
          error,
        );
        return null;
      }
    }

    return token;
  } catch (error) {
    console.error('Error retrieving access token from cookies:', error);
    return null;
  }
};

// Axios interceptor to handle token expiration and refresh
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = await getAccessToken(); // Get stored access token or refresh it

    if (token && isTokenExpired(token)) {
      // If token is expired, try to refresh
      console.log('Access token is expired, attempting to refresh.');
      try {
        token = await refreshAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`; // Attach new token to the request
        }
      } catch (error) {
        console.error('Failed to refresh access token:', error);
        return Promise.reject(error);
      }
    } else if (token) {
      // Attach valid token to the request
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Axios interceptor for handling 401 errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;
    const navigate = useNavigate(); // Hook to navigate user
    const { setIsLogin } = useResData(); // Access login state handler

    // If access token expired and not retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.isRetry
    ) {
      originalRequest.isRetry = true; // Prevent infinite loops
      try {
        // Attempt to refresh the access token
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest); // Retry the original request with new token
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        setIsLogin(false); // Log the user out
        navigate('/login'); // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    // If refresh token also expired or any other 401 error
    if (error.response && error.response.status === 401) {
      console.error('Refresh token expired or invalid.');
      setIsLogin(false); // Log the user out
      navigate('/login'); // Redirect to login page
    }

    return Promise.reject(error); // Reject for other types of errors
  },
);

export default axiosInstance;
