import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { useResData } from '../context'; // Assuming this handles app-level state
import axiosInstance from '../utility/axiosInstance'; // Your axios instance
import { AuthStatusResponse } from '../interface/propsType';

// Define URLs
const GOOGLE_SSE_URL = `http://localhost:8000/auth/google/sse/`;
const GOOGLE_LOGIN_URL = `/auth/google/login/`;
const GOOGLE_SET_COOKIES_URL = `/auth/google/set-cookies/`;
const LOGIN_URL = `/auth/login/`;
const REFRESH_TOKEN_URL = `/auth/refresh-token/`;
const AUTH_STATUS_URL = `/auth/status/`;

// Centralized error logger
const logError = (messageText: string, error: unknown) => {
  console.error(`${messageText}:`, error);
};

// Helper to handle different server errors
const handleServerError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data?.detail;
    const errorMessages: Record<string, string> = {
      'Email does not exist.': 'Email does not exist. Please register.',
      'Email not verified.': 'Email not verified. Please check your inbox.',
      'Incorrect password.': 'Incorrect password. Please try again.',
    };

    const messageText =
      errorMessages[serverError] ||
      'An error occurred. Please try again later.';
    message.error(messageText);
  } else {
    message.error('Network error. Please check your connection.');
  }
};

// Helper to get device identifier
const getDeviceIdentifier = async (): Promise<string> => {
  const deviceIdentifier = await window.electron.ipcRenderer.getMacAddress();
  if (!deviceIdentifier) {
    throw new Error('Device identifier not found');
  }
  return deviceIdentifier;
};

// SSE handler for Google login
const handleSSE = async (
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(GOOGLE_SSE_URL); // Open the SSE connection

    eventSource.onmessage = (event) => {
      try {
        console.log('SSE message received:', event.data);
        const data = JSON.parse(event.data);
        if (data?.success) {
          setLoginResponse(data.success); // Set login response in global state
          resolve(); // Resolve the promise, indicating login success
        } else {
          reject(new Error('Login failed via SSE')); // Reject if login failed
        }
      } catch (error) {
        logError('Error parsing SSE message', error);
        reject(error); // Reject the promise if parsing error occurs
      } finally {
        eventSource.close(); // Close the SSE connection
      }
    };

    eventSource.onerror = (error) => {
      logError('SSE connection error', error); // Log any errors in SSE
      eventSource.close(); // Close the SSE connection
      reject(error); // Reject the promise if an error occurs
    };
  });
};

// Fetch Google Auth URL
const fetchGoogleAuthUrl = async (deviceIdentifier: string) => {
  try {
    const { data } = await axiosInstance.get(GOOGLE_LOGIN_URL, {
      headers: { 'Device-Identifier': deviceIdentifier },
    });
    return data.url;
  } catch (error) {
    logError('Error fetching Google Auth URL', error);
    throw error;
  }
};

// Fetch token and set cookies
const fetchGoogleToken = async () => {
  try {
    await axiosInstance.get(GOOGLE_SET_COOKIES_URL);
  } catch (error) {
    logError('Error fetching token and setting cookies', error);
    throw error;
  }
};

// Refresh token logic
const refreshAccessToken = async () => {
  try {
    await axiosInstance.post(REFRESH_TOKEN_URL, {}, { withCredentials: true });
  } catch (error) {
    logError('Error refreshing access token', error);
    throw error;
  }
};

// Check token status
const checkTokenStatus = async (
  deviceIdentifier: string,
): Promise<AuthStatusResponse> => {
  try {
    const { data } = await axiosInstance.get<AuthStatusResponse>(
      AUTH_STATUS_URL,
      {
        withCredentials: true,
        headers: { 'Device-Identifier': deviceIdentifier },
      },
    );

    return data;
  } catch (error) {
    logError('Error checking token status', error);
    return { status: 'LoginRequired', message: 'Authentication failed' };
  }
};

// Optimized hook for authentication
const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tryCount, setTryCount] = useState(0); // State to track connection attempts
  const navigate = useNavigate();
  const { setLoginResponse } = useResData(); // Assuming this handles global login state

  // Centralized function to handle successful login
  const handleSuccessfulLogin = useCallback(() => {
    navigate('/'); // Redirect to dashboard or home
  }, [navigate]);

  // Check server connection
  const checkServerConnection = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/'); // Adjust the axios instance if needed

      // Check if the response status is in the range 200-299
      if (response.status >= 200 && response.status < 300) {
        setIsConnected(true);
        setTryCount(0); // Reset try count on successful connection
      } else {
        console.error('Server connection failed with status:', response.status);
        setIsConnected(false);
        setTryCount((prev) => prev + 1); // Increment try count
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      setIsConnected(false); // Connection failed due to an error
      setTryCount((prev) => prev + 1); // Increment try count
    }
  }, []);

  // Heartbeat logic for checking connection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkServerConnection();
    }, 5000); // Check every 3 seconds

    if (isConnected) {
      console.log('Server is connected. Stopping heartbeat checks.');
      setTryCount(0); // Reset try count on successful connection
      clearInterval(interval); // Clear the interval here
    } else if (tryCount >= 12) {
      // Example max try count
      console.log(
        'Max connection attempts reached. Stopping heartbeat checks.',
      );
      clearInterval(interval); // Clear the interval if max tries are reached
    }

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [checkServerConnection, isConnected, tryCount]);

  // Token status check
  const checkAuthStatus = useCallback(async (): Promise<AuthStatusResponse> => {
    try {
      setLoading(true);
      const deviceIdentifier = await getDeviceIdentifier();
      return await checkTokenStatus(deviceIdentifier);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 error specifically
        logError('Token status check failed with 404', error);
        return { status: 'Not Found', message: 'Resource not found' }; // Customize the response as needed
      }
      logError('Error during token status check', error);
      return { status: 'LoginRequired', message: 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with email
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        const deviceIdentifier = await getDeviceIdentifier();

        const response = await axiosInstance.post(
          LOGIN_URL,
          { email, password },
          { headers: { 'Device-Identifier': deviceIdentifier } },
        );

        if (response.status === 200) {
          message.success('Login successful');
          const authStatus = await checkAuthStatus();
          if (authStatus.status === 'Authenticated') {
            handleSuccessfulLogin();
          } else if (authStatus.status === 'Refresh') {
            await refreshAccessToken();
            handleSuccessfulLogin();
          } else {
            navigate('/login');
          }
        }
      } catch (error) {
        handleServerError(error);
        logError('Login error', error);
      } finally {
        setLoading(false);
      }
    },
    [checkAuthStatus, handleSuccessfulLogin, navigate],
  );

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const deviceIdentifier = await getDeviceIdentifier();
      const authUrl = await fetchGoogleAuthUrl(deviceIdentifier);

      await window.electron.ipcRenderer.openUrl(authUrl);

      // Wait for SSE message indicating login success
      await handleSSE(setLoginResponse);

      // Fetch token and set cookies
      await fetchGoogleToken();

      // Check authentication status
      const authStatus = await checkAuthStatus();
      if (authStatus.status === 'Authenticated') {
        handleSuccessfulLogin();
      } else if (authStatus.status === 'Refresh') {
        await refreshAccessToken();
        handleSuccessfulLogin();
      } else {
        navigate('/login');
      }
    } catch (error) {
      logError('Google login error', error);
      message.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [checkAuthStatus, handleSuccessfulLogin, navigate, setLoginResponse]);

  return {
    loading,
    checkAuthStatus,
    loginWithEmail,
    loginWithGoogle,
    isConnected,
    tryCount,
  };
};

export default useAuth;
