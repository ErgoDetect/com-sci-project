import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Layout, Menu, Modal, Spin } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/Login';
import Signup from '../pages/SignUp';
import SummaryPage from '../pages/SummaryPage';
import SettingPage from '../pages/SettingPage';
import WaitingPage from '../pages/WaitVerifyPage';
import useAuth from '../hooks/useAuth';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [renderSettings, setRenderSettings] = useState(false);
  const { checkAuthStatus, loading, isConnected, tryCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (window.electron?.ipcRenderer?.onProtocolUrl) {
      const handleProtocolUrl = (url: string) => {
        console.log('Received protocol URL:', url);
        if (url.startsWith('ergodetect://login')) {
          navigate('/login');
        }
      };

      window.electron.ipcRenderer.onProtocolUrl(handleProtocolUrl);

      // Cleanup listener on unmount
      return () => {
        window.electron.ipcRenderer?.removeAllListeners('deep-link');
        console.log('Protocol URL listener removed');
      };
    }

    return undefined;
  }, [navigate]);

  // Handle connection retries
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

    authenticate();
  }, [checkAuthStatus, location.pathname, navigate]);

  const closeSettings = () => setRenderSettings(false);

  // Conditionally render components
  let content;
  if (loading || !isConnected) {
    content = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  } else if (renderSettings) {
    content = <SettingPage setIsSettingsOpen={closeSettings} />;
  } else if (location.pathname === '/login') {
    content = <Login />;
  } else if (location.pathname === '/signup') {
    content = <Signup />;
  } else if (location.pathname === '/wait-verify') {
    content = <WaitingPage />;
  } else {
    content = (
      <Layout
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Ant Design Header */}
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="/" icon={<DashboardOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="/summary" icon={<FileTextOutlined />}>
              <Link to="/summary">Summary</Link>
            </Menu.Item>
            <Menu.Item
              key="/setting"
              icon={<SettingOutlined />}
              onClick={() => setRenderSettings(true)}
            >
              Settings
            </Menu.Item>
          </Menu>
        </Header>

        {/* Main Content */}
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

        {/* Footer */}
        <Footer style={{ textAlign: 'center' }}>
          Ant Design Layout ©2023 Created by Your Name
        </Footer>
      </Layout>
    );
  }

  return (
    <>
      {/* Modal for connection error */}
      <Modal
        title="Connection Error"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        okText="Retry"
        cancelText="Cancel"
      >
        <p>Unable to connect to the server. Please try again later.</p>
      </Modal>
      {content}
    </>
  );
};

export default App;
