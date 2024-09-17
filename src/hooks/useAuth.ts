import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResData } from '../context'; // Assuming this handles app-level state

// Helper function to perform fetch requests
const fetchRequest = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Fetch request error:', error);
    throw error;
  }
};

// SSE handler for Google login
const handleSSE = async (
  baseUrl: string,
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(`http://${baseUrl}/auth/google/sse/`);
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
        console.error('Error parsing SSE message:', error);
        reject(error);
      } finally {
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      reject(error);
    };
  });
};

// Fetch Google Auth URL
const fetchAuthUrl = async (baseUrl: string) => {
  const url = `http://${baseUrl}/auth/google/login/`;
  return fetchRequest(url, { method: 'GET' }).then((data) => data.url);
};

// Fetch token and set cookies
const fetchToken = async (baseUrl: string) => {
  const url = `http://${baseUrl}/auth/google/set-cookies/`;
  return fetchRequest(url, { credentials: 'include' });
};

// Optimized hook for authentication
const useAuth = () => {
  const { url, setIsLogin, isLogin } = useResData(); // Assuming useResData provides these
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unified error logging function
  const logError = useCallback((message: string, error: unknown) => {
    console.error(`${message}:`, error);
  }, []);

  // Function to check login status via cookies
  // const checkLoginStatus = useCallback(async () => {
  //   try {
  //     const cookies = await window.electron.ipcRenderer.getCookie();
  //     const accessToken = cookies.find(
  //       (cookie: any) => cookie.name === 'access_token',
  //     );

  //     const isLoggedIn = !!accessToken;
  //     setIsLogin(isLoggedIn);

  //     // Conditional navigation based on login state
  //     navigate(isLoggedIn ? '/' : '/login');
  //   } catch (error) {
  //     logError('Error checking login status', error);
  //   }
  // }, [navigate, setIsLogin, logError]);

  // Login with email
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const data = await fetchRequest(`http://${url}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (data) {
          const cookies = await window.electron.ipcRenderer.getCookie();
          setIsLogin(!!cookies); // Update login state based on cookies

          // Navigate to home on successful login
          navigate('/');
        }
      } catch (error) {
        logError('Error during email login', error);
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    },
    [url, setIsLogin, navigate, logError],
  );

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const authUrl = await fetchAuthUrl(url);
      await window.electron.ipcRenderer.openUrl(authUrl);

      await handleSSE(url, setIsLogin);
      await fetchToken(url);

      const cookies = await window.electron.ipcRenderer.getCookie();
      setIsLogin(!!cookies); // Update login state

      // Navigate to home after successful login
      navigate('/');
    } catch (error) {
      logError('Google login error', error);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  }, [url, setIsLogin, navigate, logError]);

  // Monitor cookies and handle navigation based on cookie state
  // useEffect(() => {
  //   const checkCookies = async () => {
  //     try {
  //       const cookies = await window.electron.ipcRenderer.getCookie();
  //       console.log('Fetched cookies:', cookies); // Log to verify cookie structure

  //       const accessToken = cookies.find(
  //         (cookie: any) => cookie.name === 'access_token',
  //       );
  //       const isLoggedIn = !!accessToken;

  //       if (!isLoggedIn) {
  //         console.log('No access token found, redirecting to login...');
  //         setIsLogin(false);
  //         navigate('/login');
  //       }
  //     } catch (error) {
  //       console.error('Error checking cookies:', error);
  //     }
  //   };

  //   checkCookies(); // Initial check on mount

  //   const interval = setInterval(checkCookies, 5000); // Continuous cookie check
  //   return () => clearInterval(interval); // Cleanup on unmount
  // }, [navigate, setIsLogin]);

  return {
    loading,
    loginWithEmail,
    loginWithGoogle,
  };
};

export default useAuth;
