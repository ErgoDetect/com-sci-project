import React, { useEffect, useMemo, useCallback } from 'react';
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
import RequestResetLink from '../pages/RequestResetLink';
import ResetPassword from '../pages/ResetPasswordPage';

const App: React.FC = () => {
  const { checkAuthStatus, loading, isConnected } = useAuth();
  const { contextLoading, setStreaming } = useResData();

  const navigate = useNavigate();
  const location = useLocation();

  // Handle deep link protocol for navigation
  useEffect(() => {
    const handleProtocolUrl = (url: string) => {
      if (url.startsWith('ergodetect://login')) {
        navigate('/login');
      } else if (url.startsWith('ergodetect://reset-password')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const email = params.get('email');
        navigate(`/reset-password?email=${email}`);
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

  // Authenticate user and redirect if needed
  useEffect(() => {
    const authenticate = async () => {
      const response = await checkAuthStatus();
      if (
        response.status === 'Authenticated' &&
        location.pathname === '/login'
      ) {
        navigate('/');
      }
    };

    if (!['/signup', '/wait-verify'].includes(location.pathname)) {
      authenticate();
    }
  }, [checkAuthStatus, location.pathname, navigate]);

  useEffect(() => {
    if (['/video-upload', '/summary', '/history'].includes(location.pathname)) {
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

  // Render content based on the application's state
  const renderContent = useCallback(() => {
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

    const shouldShowHeader = ![
      '/login',
      '/signup',
      '/wait-verify',
      '/setting',
      '/request-reset',
      '/reset-password',
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
          <Route path="/request-reset" element={<RequestResetLink />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </>
    );
  }, [loading, isConnected, contextLoading, location.pathname, menuItems]);

  // Initialize hooks for additional functionality
  useReceiveData();
  useVideoRecorder();
  useNotify();

  return <>{renderContent()}</>;
};

export default App;
