import { Button } from 'antd';
import { useState, useCallback } from 'react';
import GoogleIcon from '../../icons/googleIcon.svg';
import { useResData } from '../../context';

// Fetch the Google authentication URL
const fetchAuthUrl = async (baseUrl: string) => {
  const url = `http://${baseUrl}/auth/google`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch Google auth URL');

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error fetching Google auth URL:', error);
    throw new Error('Failed to get Google auth URL');
  }
};

// Fetch and log cookies from the Electron renderer process
const fetchToken = async (baseUrl: string) => {
  const url = `http://${baseUrl}/auth/google/set-cookies`;

  try {
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok)
      throw new Error('Failed to fetch token from set-cookies endpoint');

    try {
      const cookies = await window.electron.ipcRenderer.getCookie();
      console.log('Cookies:', cookies);
    } catch (cookieError) {
      console.error('Error fetching cookies from Electron:', cookieError);
    }
  } catch (fetchError) {
    console.error('Error during token fetch:', fetchError);
    throw new Error('Failed to get token');
  }
};

// Handle Server-Sent Events (SSE) for authentication
const handleSSE = async (
  baseUrl: string,
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const url = `http://${baseUrl}/auth/google/sse`;

  return new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(url);
    const timeoutId = setTimeout(() => {
      eventSource.close();
      reject(new Error('SSE connection timed out'));
    }, 10000); // 10 seconds timeout

    eventSource.onopen = () => {
      console.log('SSE connection opened.');
      clearTimeout(timeoutId); // Clear timeout when connection is successfully opened
    };

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);

        if (data.user.success) {
          setLoginResponse(true);
          resolve();
        } else {
          setLoginResponse(false);
          reject(new Error('Login failed'));
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
        reject(error);
      } finally {
        eventSource.close(); // Close connection after receiving the message
        console.log('SSE connection closed.');
      }
    };

    eventSource.onerror = (error: any) => {
      clearTimeout(timeoutId);
      console.error('SSE error:', error);
      eventSource.close();
      reject(new Error(`SSE connection error: ${error.message}`));
    };
  });
};

const GoogleButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setLoginResponse, url } = useResData();

  // Handle the Google login button click
  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the Google authentication URL
      const authUrl = await fetchAuthUrl(url);
      if (authUrl) {
        // Open the authentication URL in Electron's browser window
        await window.electron.ipcRenderer.openUrl(authUrl);

        // Handle the Server-Sent Events (SSE) from the server for login
        await handleSSE(url, setLoginResponse);

        // Fetch cookies after successful login
        await fetchToken(url);
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoginResponse, url]);

  return (
    <div>
      <Button
        style={{
          width: '100%',
          margin: '20px 0',
          padding: '18px 0',
          gap: '20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={handleLogin}
        loading={loading}
        aria-label="Continue with Google"
      >
        <img
          src={GoogleIcon}
          alt="Google Icon"
          style={{ marginRight: '8px' }}
        />
        Continue with Google
      </Button>
    </div>
  );
};

export default GoogleButton;
