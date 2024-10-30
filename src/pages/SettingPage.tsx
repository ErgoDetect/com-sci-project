/** @format */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Layout,
  Menu,
  Form,
  Button,
  Switch,
  Tooltip,
  Typography,
  message,
  MenuProps,
} from 'antd';
import {
  SettingOutlined,
  CameraOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import DeviceSelector from '../components/camera/deviceSelector';
import useDevices from '../hooks/useDevices';
import CalibrationModal from '../components/modal/CalibrationModal';
import { useResData } from '../context';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface SettingsProps {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Settings: React.FC<SettingsProps> = ({ setIsSettingsOpen }) => {
  const { showDetailedData, setShowDetailedData } = useResData();
  const [selectedMenu, setSelectedMenu] = useState<string>('camera');
  const { deviceId, devices, setDeviceId } = useDevices();

  // Device selection handler
  const handleDeviceChange = useCallback(
    (value: string) => setDeviceId(value),
    [setDeviceId],
  );

  // Memoized device selector for efficiency
  const deviceSelectorMemo = useMemo(
    () => (
      <DeviceSelector
        deviceId={deviceId}
        devices={devices}
        onChange={handleDeviceChange}
      />
    ),
    [deviceId, devices, handleDeviceChange],
  );

  // Handle detailed data switch and config saving
  const handleDetailedDataChange = useCallback(
    (checked: boolean): void => {
      setShowDetailedData(checked);

      // Fetch the current config, modify, and save it
      window.electron.config
        .getAppConfig()
        .then((config): Promise<{ success: boolean; error?: string }> => {
          // Update the config with the new detailed data value
          const updatedConfig = { ...config, showStat: checked };

          // Save the updated config and return a promise
          return window.electron.config.saveAppConfig(updatedConfig);
        })
        .then((result): string | void => {
          if (result.success) {
            message.success('Settings saved successfully');
            return 'Settings saved';
          }
          message.error('Failed to save settings');
          throw new Error(result.error || 'Unknown save error');
        })
        .catch((error): null => {
          message.error('Error fetching or saving settings');
          console.error('Error:', error);
          return null;
        });
    },
    [setShowDetailedData],
  );

  // Render camera settings section
  const renderCameraSettings = useMemo(
    () => (
      <>
        <Title level={4} style={{ marginBottom: '24px' }}>
          Camera Settings
        </Title>
        <Form layout="vertical">
          <Form.Item label="Select Camera">{deviceSelectorMemo}</Form.Item>
          <Form.Item label="Camera Calibration">
            <CalibrationModal />
            <Tooltip title="Calibrate camera for improved detection accuracy.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [deviceSelectorMemo],
  );

  // Render general settings section
  const renderGeneralSettings = useMemo(
    () => (
      <>
        <Title level={4} style={{ marginBottom: '24px' }}>
          General Settings
        </Title>
        <Form layout="vertical">
          <Form.Item label="Show Detailed Data During Detection and Summary">
            <Switch
              checked={showDetailedData}
              onChange={handleDetailedDataChange}
            />
            <Tooltip title="Toggle detailed data display in detection and summary view.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [showDetailedData, handleDetailedDataChange],
  );

  // Sidebar menu items
  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'camera',
        icon: <CameraOutlined />,
        label: 'Camera Settings',
      },
      {
        key: 'general',
        icon: <SettingOutlined />,
        label: 'General Settings',
      },
    ],
    [],
  );

  // Render content based on selected menu
  const renderContent = useMemo(() => {
    return selectedMenu === 'general'
      ? renderGeneralSettings
      : renderCameraSettings;
  }, [selectedMenu, renderCameraSettings, renderGeneralSettings]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sider
        width={240}
        style={{
          height: '100%',
          overflowY: 'auto',
          paddingTop: '20px',
        }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          style={{
            backgroundColor: 'transparent',
            borderRight: 0,
          }}
          onClick={(e) => setSelectedMenu(e.key)}
          theme="dark"
        />
      </Sider>

      <Button
        type="text"
        icon={<IoIosCloseCircleOutline style={{ fontSize: '36px' }} />}
        onClick={() => setIsSettingsOpen(false)}
        aria-label="Close Settings"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          fontSize: '16px',
          backgroundColor: 'transparent',
          border: 'none',
          zIndex: 1000,
          padding: '10px',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ESC
      </Button>

      <Content
        style={{
          padding: '20px 40px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          flex: 1,
          overflow: 'auto',
        }}
      >
        {renderContent}
      </Content>
    </div>
  );
};

export default Settings;
