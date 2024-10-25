import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import { Layout, Spin } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
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

const { Content } = Layout;

const App: React.FC = () => {
  const { checkAuthStatus, loading, isConnected, tryCount } = useAuth();
  const { renderSettings, setRenderSettings } = useResData();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tryCount >= 12) {
      setIsModalVisible(true);
    }
  }, [tryCount]);

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
          <Link to="/summary">
            <FileTextOutlined /> Summary
          </Link>
        ),
        key: '/summary',
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

  const renderContent = () => {
    if (loading || !isConnected) {
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
    if (location.pathname === '/login') {
      return <Login />;
    }
    if (location.pathname === '/signup') {
      return <Signup />;
    }
    if (location.pathname === '/wait-verify') {
      return <WaitVerify />;
    }

    return (
      <>
        <AppHeader items={menuItems} />
        <Content style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </Content>
      </>
    );
  };

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
