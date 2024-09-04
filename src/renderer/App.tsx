import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout, Menu, Switch } from 'antd';
import { RxDashboard } from 'react-icons/rx';
import { IoIosSettings } from 'react-icons/io';
import { FaRegUserCircle } from 'react-icons/fa';
import SummaryPage from '../pages/SummaryPage';
import DashboardPage from '../pages/DashboardPage';
import SettingPage from '../pages/SettingPage';
import { useResData } from '../context';
import GoogleLogin from '../components/Login/GoogleLogin';

const { Content } = Layout;

const App: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<string>('dashboard');
  const { setCalibrationData, theme, toggleTheme } = useResData();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const { landMarkData } = useResData();

  // useEffect(() => {
  //   console.log('Environment Variable HELLO:', window.electron.env.HELLO);
  //   console.log(
  //     'Environment Variable Client ID:',
  //     window.electron.env.GOOGLE_CLIENT_ID,
  //   );
  //   console.log(
  //     'Environment Variable Client SECRET:',
  //     window.electron.env.GOOGLE_CLIENT_SECRET,
  //   );
  // }, []); // The empty dependency array ensures this runs only once

  useEffect(() => {
    const loadCalibrationData = async () => {
      try {
        const filePath = await window.electron.fs.getUserDataPath();
        const fileExists = await window.electron.fs.fileExists(filePath);

        if (fileExists) {
          const data = await window.electron.fs.readFile(filePath);
          setCalibrationData(JSON.parse(data));
          console.log('Calibration data loaded successfully');
        } else {
          console.log('Calibration data file does not exist');
        }
      } catch (error) {
        console.error('Failed to load calibration data:', error);
        await window.electron.ipcRenderer.showNotification(
          'Calibration data file does not exist',
          'Failed to load calibration data',
        );
      }
    };

    loadCalibrationData();
  }, [setCalibrationData]);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    if (key === 'setting') {
      setIsSettingsOpen(true);
    } else {
      setCurrentMenu(key);
    }
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setCurrentMenu('dashboard');
  }, []);

  const renderContent = useMemo(() => {
    if (isSettingsOpen) {
      return (
        <SettingPage
          theme={theme}
          fullScreen={false}
          showDetailedData={false}
          toggleTheme={toggleTheme}
          onClose={handleCloseSettings}
        />
      );
    }

    switch (currentMenu) {
      case 'dashboard':
        return (
          <DashboardPage
            theme={theme}
            showDetailedData={false}
            onSessionComplete={() => {}}
          />
        );
      case 'summary':
        return <SummaryPage theme={theme} />;
      case 'login':
        return <GoogleLogin />;
      default:
        return (
          <DashboardPage
            theme={theme}
            showDetailedData={false}
            onSessionComplete={() => {}}
          />
        );
    }
  }, [currentMenu, handleCloseSettings, isSettingsOpen, theme, toggleTheme]);

  const menuItems = useMemo(
    () => [
      {
        key: 'dashboard',
        icon: <RxDashboard />,
        label: 'Dashboard',
      },
      {
        key: 'summary',
        icon: <IoIosSettings />,
        label: 'Summary',
      },
      {
        key: 'setting',
        icon: <IoIosSettings />,
        label: 'Setting',
      },
      {
        key: 'login',
        icon: <FaRegUserCircle />,
        label: 'Login',
      },
    ],
    [],
  );

  return (
    <>
      {!isSettingsOpen && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Menu
            mode="horizontal"
            selectedKeys={[currentMenu]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              backgroundColor: 'transparent',
              borderBottom: 'none',
            }}
          />
          {/* <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '42px',
            }}
          >
            <Switch
              checked={theme === 'dark'}
              onChange={toggleTheme}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
          </div> */}
        </div>
      )}

      <Content
        style={{
          width: '100%',
          height: '100vh',
          transition: 'background 0.3s ease',
        }}
      >
        {renderContent}
      </Content>
    </>
  );
};

export default App;
