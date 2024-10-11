import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { useResData } from '../context'; // App-level state
import axiosInstance from '../utility/axiosInstance'; // Axios instance
import { AuthStatusResponse } from '../interface/propsType';

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
  const deviceIdentifier = await window.electron.ipcRenderer.getMacAddress();
  if (!deviceIdentifier) {
    throw new Error('Device identifier not found');
  }
  return deviceIdentifier;
};

// Google SSE Login handler
const handleSSE = async (
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(GOOGLE_SSE_URL);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.success) {
          setLoginResponse(data.success);
          resolve();
        } else {
          reject(new Error('Login failed via SSE'));
        }
      } catch (error) {
        logError('Error parsing SSE message', error);
        reject(error);
      } finally {
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      logError('SSE connection error', error);
      eventSource.close();
      reject(error);
    };
  });
};

// Fetch Google auth URL
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

// Fetch Google token and set cookies
const fetchGoogleToken = async () => {
  try {
    await axiosInstance.get(GOOGLE_SET_COOKIES_URL);
  } catch (error) {
    logError('Error fetching token and setting cookies', error);
    throw error;
  }
};

// Refresh access token
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
  const [tryCount, setTryCount] = useState(0);
  const navigate = useNavigate();
  const { setLoginResponse } = useResData();

  // Handle successful login

  // Check server connection
  const checkServerConnection = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/');
      if (response.status === 200) {
        setIsConnected(true);
        setTryCount(0);
      } else {
        console.error('Server connection failed with status:', response.status);
        setIsConnected(false);
        setTryCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      setIsConnected(false);
      setTryCount((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (!isConnected && tryCount < 12) {
      intervalId = setInterval(() => checkServerConnection(), 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, checkServerConnection, tryCount]);

  // Token status check
  const checkAuthStatus = useCallback(async (): Promise<AuthStatusResponse> => {
    setLoading(true);
    try {
      const deviceIdentifier = await getDeviceIdentifier();
      let checksTokenStatus = await checkTokenStatus(deviceIdentifier);

      if (checksTokenStatus.status === 'Authenticated') {
        return { status: 'Authenticated' }; // User is authenticated, no need to proceed further
      }

      if (checksTokenStatus.status === 'Refresh') {
        await refreshAccessToken();
        checksTokenStatus = await checkTokenStatus(deviceIdentifier);
        if (checksTokenStatus.status === 'Authenticated') {
          navigate('/');
        }
      }

      navigate('/login');
      return { status: 'LoginRequired', message: 'Authentication required' };
    } catch (error: any) {
      logError('Error during authentication check', error);
      return { status: 'LoginRequired', message: 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Email login handler
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const deviceIdentifier = await getDeviceIdentifier();
        const response = await axiosInstance.post(
          LOGIN_URL,
          { email, password },
          { headers: { 'Device-Identifier': deviceIdentifier } },
        );

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
      const authUrl = await fetchGoogleAuthUrl(deviceIdentifier);
      await window.electron.ipcRenderer.openUrl(authUrl);

      await handleSSE(setLoginResponse);
      await fetchGoogleToken();
      const response = await checkAuthStatus();
      if (response.status === 'Authenticated') {
        navigate('/');
      }
    } catch (error) {
      logError('Google login error', error);
      message.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [checkAuthStatus, navigate, setLoginResponse]);

  return {
    loading,
    checkAuthStatus,
    loginWithEmail,
    loginWithGoogle,
    getDeviceIdentifier,
    isConnected,
    tryCount,
  };
};

export default useAuth;
