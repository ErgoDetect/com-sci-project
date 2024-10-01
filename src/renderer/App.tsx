import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Layout, Menu, Spin } from 'antd';
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
import useAuth from '../hooks/useAuth';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const [renderSettings, setRenderSettings] = useState(false);
  const { checkAuthStatus, loading, loginWithGoogle } = useAuth();
  const [authChecked, setAuthChecked] = useState(false); // New state to track auth status check
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check authentication status on protected pages, like dashboard and summary
    const checkAuthentication = async () => {
      const authStatus = await checkAuthStatus();
      if (authStatus.status === 'LoginRequired') {
        navigate('/login'); // Redirect to login if authentication fails
      }
      setAuthChecked(true); // Mark auth check as complete
    };

    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      checkAuthentication();
    } else {
      setAuthChecked(true); // For login/signup pages, no need to check auth
    }
  }, [checkAuthStatus, navigate, location.pathname]);

  // Show a loading spinner until authentication check is complete
  if (loading || !authChecked) {
    return (
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
  }

  // Function to close Settings and return to normal Layout
  const closeSettings = () => setRenderSettings(false);

  // Conditionally render either the SettingPage, Login, Signup, or the main layout
  if (renderSettings) {
    return <SettingPage setIsSettingsOpen={closeSettings} />;
  }

  if (location.pathname === '/login') {
    return <Login />;
  }

  if (location.pathname === '/signup') {
    return <Signup />;
  }

  return (
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
        </Routes>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center' }}>
        Ant Design Layout ©2023 Created by Your Name
      </Footer>
    </Layout>
  );
};

export default App;
