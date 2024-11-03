import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import axiosInstance from '../utility/axiosInstance'; // Axios instance
import { AuthStatusResponse } from '../interface/propsType';

const GOOGLE_SSE_URL = `http://localhost:8000/auth/google/sse`;
const GOOGLE_LOGIN_URL = `/auth/google/login`;
const GOOGLE_SET_COOKIES_URL = `/auth/google/set-cookies`;
const LOGIN_URL = `/auth/login`;
const REFRESH_TOKEN_URL = `/auth/refresh-token`;
const AUTH_STATUS_URL = `/auth/status`;

// Centralized error logger
const logError = (messageText: string, error: unknown) => {
  console.error(`${messageText}:`, error);
};

// Server-side error handler
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

// Get device identifier
const getDeviceIdentifier = async (): Promise<string> => {
  const deviceIdentifier = await window.electron.system.getMacAddress();
  if (!deviceIdentifier) {
    throw new Error('Device identifier not found');
  }
  return deviceIdentifier;
};

const fetchGoogleToken = async () => {
  try {
    await axiosInstance.post(GOOGLE_SET_COOKIES_URL);
  } catch (error) {
    logError('Error fetching token and setting cookies', error);
    throw error;
  }
};

// Google SSE Login handler
const handleSSE = async (deviceIdentifier: string) => {
  return new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(
      `${GOOGLE_SSE_URL}?device_identifier=${deviceIdentifier}`,
    );

    // Handle messages from the server
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE data received:', data); // Log SSE data

        if (data?.success) {
          resolve(); // Resolve the promise after success
          eventSource.close(); // Close the SSE connection after success
        } else {
          console.log('SSE failed:', data); // Log failure if success is false
          // Close on failure
          reject(new Error('Login failed via SSE')); // Reject the promise
          eventSource.close();
        }
      } catch (error) {
        logError('Error parsing SSE message', error); // Log the parsing error
        reject(error); // Reject the promise
        eventSource.close();
      }
    };

    // Handle errors with the EventSource connection
    eventSource.onerror = (error) => {
      logError('SSE connection error', error); // Log the error
      console.log(`SSE error details: readyState=${eventSource.readyState}`); // Add more error details
      eventSource.close(); // Close the SSE connection on error
      reject(error); // Reject the promise with the error
    };
  });
};

// Fetch Google auth URL
const fetchGoogleAuthUrl = async () => {
  try {
    const { data } = await axiosInstance.get(GOOGLE_LOGIN_URL);
    return data.url;
  } catch (error) {
    logError('Error fetching Google Auth URL', error);
    throw error;
  }
};

const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post(REFRESH_TOKEN_URL);
    if (response.status === 200) {
      // Assuming the server responds with relevant data on successful refresh
      return { success: true, token: response.data.token };
    }
    // Handle unexpected status codes as unsuccessful refresh attempts
    return { success: false, message: 'Failed to refresh token' };
  } catch (error: any) {
    logError('Error refreshing access token', error);
    // Return a structured error to handle it gracefully
    return { success: false, message: error.message };
  }
};

// Check token status
const checkTokenStatus = async (): Promise<AuthStatusResponse> => {
  try {
    const { data } =
      await axiosInstance.get<AuthStatusResponse>(AUTH_STATUS_URL);
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
  const navigate = useNavigate();

  // Token status check
  const checkAuthStatus = useCallback(async (): Promise<AuthStatusResponse> => {
    setLoading(true);

    try {
      const checksTokenStatus = await checkTokenStatus();

      // Case 1: User is already authenticated
      if (checksTokenStatus.status === 'Authenticated') {
        return { status: 'Authenticated' }; // User is authenticated, return success
      }

      // Case 2: Token needs refreshing
      if (checksTokenStatus.status === 'Refresh') {
        const refreshResponse = await refreshAccessToken(); // Attempt to refresh token
        if (refreshResponse.success) {
          // Successfully refreshed the token
          return { status: 'Authenticated' };
        }
        // Failed to refresh the token, handle according to the failure reason
        return { status: 'LoginRequired', message: refreshResponse.message };
      }

      // Case 3: User needs to log in
      return { status: 'LoginRequired', message: 'Authentication required' };
    } catch (error) {
      logError('Error during authentication check', error);
      return { status: 'LoginRequired', message: 'Authentication failed' };
    } finally {
      setLoading(false); // Stop loading spinner
    }
  }, []);

  const checkServerConnection = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/');
      if (response.status === 200) {
        setIsConnected(true); // Connection is good
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      setIsConnected(false); // Connection is lost
    }
  }, []);

  useEffect(() => {
    // Check connection every 5 seconds if not connected
    const interval = !isConnected
      ? setInterval(checkServerConnection, 5000)
      : null;
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected, checkServerConnection]);

  // Email login handler
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await axiosInstance.post(LOGIN_URL, {
          email,
          password,
        });

        if (response.status === 200) {
          message.success('Login successful');
          const res = await checkAuthStatus();
          if (res.status === 'Authenticated') {
            navigate('/');
          }
        }
      } catch (error) {
        handleServerError(error);
        logError('Login error', error);
      } finally {
        setLoading(false);
      }
    },
    [checkAuthStatus, navigate],
  );
  // Google login handler
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const deviceIdentifier = await getDeviceIdentifier();

      // Step 1: Get the Google Auth URL and open it in the browser
      const authUrl = await fetchGoogleAuthUrl();
      console.log('Auth URL received:', authUrl); // Log the auth URL
      await window.electron.notifications.openUrl(authUrl);

      // Step 2: Wait for SSE to resolve success and fetch token
      await handleSSE(deviceIdentifier);

      await fetchGoogleToken(); // Fetch the token

      const response = await checkAuthStatus();
      if (response.status === 'Authenticated') {
        console.log('User authenticated, navigating to home...');
        navigate('/');
      }
    } catch (error) {
      logError('Google login error', error);
      message.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [checkAuthStatus, navigate]);

  return {
    loading,
    setLoading,
    checkAuthStatus,
    loginWithEmail,
    loginWithGoogle,
    getDeviceIdentifier,
    isConnected,
    refreshAccessToken,
  };
};

export default useAuth;
