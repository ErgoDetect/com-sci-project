import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResData } from '../context'; // Assuming this handles app-level state
import axiosInstance from '../utility/axiosInstance'; // Import your axios instance

// Centralized error logger
const logError = (message: string, error: unknown) => {
  console.error(`${message}:`, error);
};

// SSE handler for Google login
const handleSSE = async (
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(
      `http://localhost:8000/auth/google/sse/`,
    );
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.user?.success) {
          setLoginResponse(true);
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

// Fetch Google Auth URL
const fetchAuthUrl = async () => {
  try {
    const { data } = await axiosInstance.get(`/auth/google/login/`);
    return data.url;
  } catch (error) {
    logError('Error fetching Google Auth URL', error);
    throw error;
  }
};

// Fetch token and set cookies
const fetchToken = async () => {
  try {
    await axiosInstance.get(`/auth/google/set-cookies/`, {
      withCredentials: true,
    });
  } catch (error) {
    logError('Error fetching token and setting cookies', error);
    throw error;
  }
};

// Utility to check cookies via Electron
const checkCookies = async () => {
  try {
    // Call Electron IPC to get the cookies
    const cookies = await window.electron.ipcRenderer.getCookie();

    // Check if the access_token is present
    return !!cookies.access_token; // Simply check if access_token exists
  } catch (error) {
    logError('Error fetching cookies', error);
    throw error;
  }
};

// Optimized hook for authentication
const useAuth = () => {
  const { isLogin, setIsLogin } = useResData(); // Assuming useResData provides these
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogin) {
      console.log('Login state updated, navigating to root...');
      navigate('/'); // Navigate only after login state is true
    }
  }, [isLogin, navigate]);

  // Login with email
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await axiosInstance.post(
          `/auth/login/`,
          {
            email,
            password,
          },
          {
            withCredentials: true, // Ensures cookies are sent and received
          },
        );

        if (response.data) {
          // Step 1: Check cookies client-side for faster validation
          const isLoggedIn = await checkCookies();

          // Step 2: Optionally send a request to the server to verify token validity
          if (isLoggedIn) {
            console.log('Navigating to root...');
            setIsLogin(true);
            navigate('/');
          } else {
            throw new Error('Login failed: Unable to find valid cookies');
          }
        }
      } catch (error) {
        logError('Login error', error);
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    },
    [setIsLogin, navigate],
  );

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const authUrl = await fetchAuthUrl();
      await window.electron.ipcRenderer.openUrl(authUrl);

      // Step 1: Handle login response through SSE
      await handleSSE(setIsLogin);

      // Step 2: Fetch token and set cookies on successful login
      await fetchToken();

      // Step 3: Check if cookies are set and update login state
      const isLoggedIn = await checkCookies();

      if (isLoggedIn) {
        console.log('Navigating to root...');
        setIsLogin(true);
        navigate('/');
      } else {
        throw new Error('Login failed: Unable to find valid cookies');
      }
    } catch (error) {
      logError('Google login error', error);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  }, [setIsLogin, navigate]);

  return {
    loading,
    loginWithEmail,
    loginWithGoogle,
  };
};

export default useAuth;
