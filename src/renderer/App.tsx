import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { Spin } from 'antd';
import {
  DashboardOutlined,
  HistoryOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/Login';
import Signup from '../pages/SignUp';
import WaitVerify from '../pages/WaitVerifyPage';
import SummaryPage from '../pages/SummaryPage';
import SettingPage from '../pages/SettingPage';
import HistoryPage from '../pages/HistoryPage';
import AppHeader from '../components/layout/AppHeader';
import { useResData } from '../context';
import useReceiveData from '../hooks/useReceiveData';
import useVideoRecorder from '../hooks/useVideoRecorder';
import useNotify from '../hooks/useNotify';
import VideoUploadPage from '../pages/VideoUploadPage';
import useNavigationEffect from '../hooks/useNavigationEffect';

const App: React.FC = () => {
  const { checkAuthStatus, loading, isConnected, setLoading } = useAuth();
  const { contextLoading, setStreaming } = useResData();
  const userInitiatedCheck = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Handle deep link protocol for navigation
  useEffect(() => {
    const handleProtocolUrl = (url: string) => {
      if (url.startsWith('ergodetect://login')) {
        navigate('/login');
      }
    };

    if (window.electron?.notifications?.onProtocolUrl) {
      window.electron.notifications.onProtocolUrl(handleProtocolUrl);
      return () => {
        window.electron.ipcRenderer.removeAllListeners?.('deep-link');
      };
    }

    return undefined;
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname);
  }, [location]);

  useEffect(() => {
    const authenticate = async () => {
      if (!isConnected) {
        console.log('Waiting for server connection...');
        return;
      }

      setLoading(true);
      const response = await checkAuthStatus();
      setLoading(false);
      console.log('Authentication response:', response);

      const lastPath = localStorage.getItem('lastPath') || '/';
      console.log('Last path from storage:', lastPath);

      if (response.status === 'Authenticated') {
        if (lastPath === '/login') {
          console.log(
            'Authenticated but last path is login, navigating to home.',
          );
          navigate('/', { replace: true }); // Redirect to home if authenticated but last path is login
        } else {
          console.log('Navigating to last path:', lastPath);
          navigate(lastPath, { replace: true });
        }
      } else if (
        response.status === 'LoginRequired' &&
        !userInitiatedCheck.current
      ) {
        if (
          ['/', '/history', '/video-upload', '/summary', '/setting'].includes(
            lastPath,
          )
        ) {
          console.log('Navigating back to non-sensitive route:', lastPath);
          navigate(lastPath, { replace: true });
        } else {
          console.log('Navigating to login due to login requirement');
          navigate('/login', { replace: true });
        }
      }
      userInitiatedCheck.current = false;
    };

    if (!['/signup', '/wait-verify'].includes(location.pathname)) {
      authenticate();
    }
  }, [checkAuthStatus, isConnected, location.pathname, navigate, setLoading]);

  useEffect(() => {
    if (
      ['/video-upload', '/summary', '/history', 'summary'].includes(
        location.pathname,
      )
    ) {
      setStreaming(true);
    } else {
      setStreaming(false);
    }
  }, [location.pathname, setStreaming]);

  // Memoize menu items to avoid unnecessary re-renders
  const menuItems = useMemo(
    () => [
      {
        label: (
          <Link to="/">
            <DashboardOutlined /> Dashboard
          </Link>
        ),
        key: '/',
      },

      {
        label: (
          <Link to="/history">
            <HistoryOutlined /> History
          </Link>
        ),
        key: '/history',
      },
    ],
    [],
  );

  const renderContent = useCallback(() => {
    // Check both loading states and connection state
    if (loading || !isConnected || contextLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: '10rem' }} spin />}
          />
        </div>
      );
    }

    // Conditional rendering based on path
    const shouldShowHeader = ![
      '/login',
      '/signup',
      '/wait-verify',
      '/setting',
      '/profile',
    ].includes(location.pathname);

    return (
      <>
        {shouldShowHeader && <AppHeader items={menuItems} />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/wait-verify" element={<WaitVerify />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/video-upload" element={<VideoUploadPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/setting" element={<SettingPage />} />
          <Route path="/profile" element="" />
        </Routes>
      </>
    );
  }, [loading, isConnected, contextLoading, location.pathname, menuItems]);

  // Initialize hooks for additional functionality
  useReceiveData();
  useVideoRecorder();
  useNotify();
  useNavigationEffect(userInitiatedCheck);

  return <>{renderContent()}</>;
};

export default App;
