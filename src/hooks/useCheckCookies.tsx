import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResData } from '../context'; // Access app-level state

const useCheckCookies = () => {
  const { setIsLogin } = useResData();
  const navigate = useNavigate();
  const location = useLocation(); // To get the current route

  // Memoize checkCookies to prevent it from being redefined on every render
  const checkCookies = useCallback(async () => {
    try {
      const cookies = await window.electron.ipcRenderer.getCookie();
      console.log('Fetched cookies:', cookies); // Logs cookies fetched

      const accessToken = cookies.find(
        (cookie: any) => cookie.name === 'access_token',
      );
      const isLoggedIn = !!accessToken;

      if (!isLoggedIn) {
        console.log('No access token found, redirecting to login...');
        setIsLogin(false);
        // Prevent redirect loop if already on login page
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } else {
        setIsLogin(true);
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking cookies:', error);
    }
  }, [setIsLogin, navigate, location.pathname]); // Ensure location.pathname is included

  return { checkCookies };
};

export default useCheckCookies;
