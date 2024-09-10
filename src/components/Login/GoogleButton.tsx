import { Button } from 'antd';
import { useState, useCallback } from 'react';
import GoogleIcon from '../../icons/googleIcon.svg';
import { useResData } from '../../context';

const fetchAuthUrl = async () => {
  try {
    const response = await fetch('http://localhost:8000/auth/google');
    if (!response.ok) {
      throw new Error('Failed to fetch Google auth URL');
    }
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error fetching Google auth URL:', error);
    throw new Error('Failed to get Google auth URL');
  }
};

const handleSSE = (
  url: string,
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`http://${url}/auth/google/sse`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('SSE connection opened.');
    };

    eventSource.onmessage = (event) => {
      console.log('SSE message received:', event.data);
      const data = JSON.parse(event.data);
      if (data.success) {
        setLoginResponse(true);
        resolve(data);
      } else {
        setLoginResponse(false);
        reject(new Error('Login failed'));
      }
      eventSource.close();
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
      reject(error);
    };
  });
};

const GoogleButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setLoginResponse, url } = useResData();
  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const authUrl = await fetchAuthUrl();

      if (authUrl) {
        await window.electron.ipcRenderer.openUrl(authUrl);

        const data: any = await handleSSE(url, setLoginResponse);
        console.log('User Info:', data.user_info);

        if (data) {
          try {
            const cookies = await window.electron.ipcRenderer.getCookie();
            console.log('Cookies:', cookies);
          } catch (error) {
            console.error('Error fetching cookies:', error);
          }
        }

        // Optionally handle callback here if needed
        // const callbackResponse = await handleCallback(url, data.code, data.state);
        // console.log('Callback Response:', callbackResponse);
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
