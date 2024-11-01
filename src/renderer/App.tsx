import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import ConnectionErrorModal from '../components/layout/ConnectionErrorModal';
import { useResData } from '../context';
import useReceiveData from '../hooks/useReceiveData';
import useVideoRecorder from '../hooks/useVideoRecorder';
import useNotify from '../hooks/useNotify';
import VideoUploadPage from '../pages/VideoUploadPage';

const App: React.FC = () => {
  const { checkAuthStatus, loading, isConnected, tryCount } = useAuth();
  const { contextLoading } = useResData();
  const { renderSettings, setRenderSettings } = useResData();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle connection error modal visibility based on retry count
  useEffect(() => {
    if (tryCount >= 12) {
      setIsModalVisible(true);
    }
  }, [tryCount]);

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

  const closeSettings = useCallback(
    () => setRenderSettings(false),
    [setRenderSettings],
  );

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

    if (renderSettings) {
      return <SettingPage setIsSettingsOpen={closeSettings} />;
    }

    switch (location.pathname) {
      case '/login':
        return <Login />;
      case '/signup':
        return <Signup />;
      case '/wait-verify':
        return <WaitVerify />;
      default:
        return (
          <>
            <AppHeader items={menuItems} />
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/video-upload" element={<VideoUploadPage />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </>
        );
    }
  }, [
    loading,
    isConnected,
    contextLoading,
    renderSettings,
    location.pathname,
    closeSettings,
    menuItems,
  ]);

  // Initialize hooks for additional functionality
  useReceiveData();
  useVideoRecorder();
  useNotify();

  return (
    <>
      <ConnectionErrorModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
      {renderContent()}
    </>
  );
};

export default App;
