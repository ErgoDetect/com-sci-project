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
  LoadingOutlined,
} from '@ant-design/icons';
import useAuth from '../hooks/useAuth';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/Login';
import Signup from '../pages/SignUp';
import SummaryPage from '../pages/SummaryPage';
import SettingPage from '../pages/SettingPage';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';
import ConnectionErrorModal from '../components/layout/ConnectionErrorModal';
import { useResData } from '../context';

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

    return (
      <div>
        <AppHeader items={menuItems} />
        <Content style={{ padding: 0 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/setting"
              element={<SettingPage setIsSettingsOpen={closeSettings} />}
            />
          </Routes>
        </Content>
        <AppFooter />
      </div>
    );
  };

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
