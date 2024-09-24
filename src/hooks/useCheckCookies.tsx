/* eslint-disable camelcase */
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utility/axiosInstance'; // Use axiosInstance
import { useResData } from '../context'; // Access app-level state

const useCheckLoginStatus = () => {
  const { isLogin, setIsLogin } = useResData();
  const navigate = useNavigate();
  const location = useLocation(); // To get the current route

  const handleRedirection = useCallback(
    (currentPath: string) => {
      if (isLogin && currentPath !== '/') {
        navigate('/');
      } else if (!isLogin && currentPath !== '/login') {
        navigate('/login');
      }
    },
    [isLogin, navigate],
  );

  const checkLoginStatus = useCallback(async () => {
    try {
      const cookies = await window.electron.ipcRenderer.getCookie();

      // Check if access token exists
      if (cookies.access_token) {
        const response = await axiosInstance.get('/auth/status/', {
          withCredentials: true,
        });
        setIsLogin(response.data.is_login);
        handleRedirection(location.pathname);
        return; // Exit early if access token is valid
      }

      // Check for refresh token and attempt to refresh access token
      if (cookies.refresh_token) {
        const refreshResponse = await axiosInstance.post(
          '/auth/refresh-token/',
          {
            withCredentials: true,
          },
        );

        if (refreshResponse.data.access_token_is_set) {
          const statusResponse = await axiosInstance.get('/auth/status/', {
            withCredentials: true,
          });
          setIsLogin(statusResponse.data.is_login);
          handleRedirection(location.pathname);
        } else {
          // If refresh token didn't set a new access token
          setIsLogin(false);
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        }
      } else {
        // If no refresh token
        setIsLogin(false);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLogin(false);
      if (location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate, setIsLogin, handleRedirection]);

  return { checkLoginStatus };
};

export default useCheckLoginStatus;
