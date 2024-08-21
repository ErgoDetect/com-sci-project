import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout, Menu, theme } from 'antd';
import { RxDashboard } from 'react-icons/rx';
import { IoIosSettings } from 'react-icons/io';
import SummaryPage from '../pages/SummaryPage';
import DashboardPage from '../pages/DashboardPage';
// import SettingPage from'../pages/SettingPage
import { useResData } from '../context';

const { Content } = Layout;

const App: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<string>('dashboard');
  const [videoFeedVersion, setVideoFeedVersion] = useState<'1' | '2'>('1');
  const { setCalibrationData } = useResData();

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
    setCurrentMenu(key);
  }, []);

  const renderContent = useMemo(() => {
    switch (currentMenu) {
      case 'dashboard':
        return (
          <DashboardPage
            theme="light"
            showDetailedData={false}
            onSessionComplete={() => {}}
          />
        );
      case 'setting':
        // return <SettingPage />;
        return null;
      case 'summary':
        return <SummaryPage theme="light" />;
      default:
        return (
          <DashboardPage
            theme="light"
            showDetailedData={false}
            onSessionComplete={() => {}}
          />
        );
    }
  }, [currentMenu]);

  return (
    <>
      <Menu
        mode="horizontal"
        selectedKeys={[currentMenu]}
        onClick={handleMenuClick}
        style={{
          backgroundColor: 'transparent',
          borderBottom: 'none',
        }}
      >
        <Menu.Item key="dashboard" icon={<RxDashboard />}>
          Dashboard
        </Menu.Item>
        <Menu.Item key="summary" icon={<IoIosSettings />}>
          Summary
        </Menu.Item>
        <Menu.Item key="setting" icon={<IoIosSettings />}>
          Setting
        </Menu.Item>
      </Menu>
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
