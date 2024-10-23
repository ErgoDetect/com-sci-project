/** @format */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Layout,
  Menu,
  Form,
  Button,
  Switch,
  InputNumber,
  Tooltip,
  Typography,
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
  const { showDetailedData, theme, setShowDetailedData } = useResData();
  const [selectedMenu, setSelectedMenu] = useState<string>('camera');
  const { deviceId, devices, setDeviceId } = useDevices();

  // Common theme styles for light/dark mode
  const themeStyles = useMemo(
    () => ({
      titleColor: theme === 'dark' ? '#f4f5f7' : '#23272A',
      backgroundColor: theme === 'dark' ? '#2C2F33' : '#f5f5f5',
      contentBackground: theme === 'dark' ? '#2b2b2b' : '#FFFFFF',
      textColor: theme === 'dark' ? '#f4f5f7' : '#333',
      hoverColor: theme === 'dark' ? '#36393f' : '#e3e5e8',
    }),
    [theme],
  );

  // Handle device change
  const handleDeviceChange = useCallback(
    (value: string) => setDeviceId(value),
    [setDeviceId],
  );

  // Memoized device selector
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

  // Handle detailed data change and save to config
  const handleDetailedDataChange = useCallback(
    (checked: boolean): void => {
      setShowDetailedData(checked);
      console.log(showDetailedData);

      // Fetch the current config, modify, and save it
      window.electron.config
        .getAppConfig()
        .then((config) => {
          // Update the config with the new detailed data value
          const updatedConfig = { ...config, showStat: checked };

          // Save the updated config and return the promise
          return window.electron.config
            .saveAppConfig(updatedConfig)
            .then((result): void => {
              if (result.success) {
                console.log('Config saved successfully');
              } else {
                console.error('Error saving config:', result.error);
              }
              return null; // Explicitly return null to satisfy ESLint rule
            });
        })
        .catch((error): void => {
          console.error('Error fetching or saving appConfig:', error);
          return null; // Explicitly return null to satisfy ESLint rule
        });
    },
    [setShowDetailedData, showDetailedData],
  );

  // Render camera settings
  const renderCameraSettings = useMemo(
    () => (
      <>
        <Title
          level={4}
          style={{ marginBottom: '24px', color: themeStyles.titleColor }}
        >
          Camera Settings
        </Title>

        <Form layout="vertical">
          <Form.Item label="Select Camera">{deviceSelectorMemo}</Form.Item>
          <Form.Item label="Camera Calibration">
            <CalibrationModal />
            <Tooltip
              title="Calibrating the camera can improve detection accuracy."
              placement="topLeft"
            >
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [deviceSelectorMemo, themeStyles.titleColor],
  );

  // Render general settings
  const renderGeneralSettings = useMemo(
    () => (
      <>
        <Title
          level={4}
          style={{ marginBottom: '24px', color: themeStyles.titleColor }}
        >
          General Settings
        </Title>

        <Form layout="vertical">
          <Form.Item label="Notification Frequency by Blink Duration (in seconds)">
            <InputNumber min={1} defaultValue={5} style={{ width: '100%' }} />
            <Tooltip title="Set the frequency to notify when no blink is detected for a certain duration.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>

          <Form.Item label="Notification Frequency by Usage Duration (in minutes)">
            <InputNumber min={15} defaultValue={45} style={{ width: '100%' }} />
            <Tooltip title="Set the duration after which a notification will be sent when the user has been continuously detected.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>

          <Form.Item label="Notification for Proximity to Monitor (in seconds)">
            <InputNumber min={10} defaultValue={30} style={{ width: '100%' }} />
            <Tooltip title="Set the duration after which a notification will be sent if the user sits too close to the monitor.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>

          <Form.Item label="Notification for Hunchback Posture (in seconds)">
            <InputNumber min={10} defaultValue={30} style={{ width: '100%' }} />
            <Tooltip title="Set the duration after which a notification will be sent if the user is detected sitting with a hunchback posture.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>

          <Form.Item label="Show Detailed Data During Detection and Summary">
            <Switch
              checked={showDetailedData}
              onChange={handleDetailedDataChange}
            />
            <Tooltip title="Enable or disable detailed data display during detection and in the summary.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [showDetailedData, handleDetailedDataChange, themeStyles.titleColor],
  );

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

  const renderContent = useMemo(() => {
    switch (selectedMenu) {
      case 'camera':
        return renderCameraSettings;
      case 'general':
        return renderGeneralSettings;
      default:
        return renderCameraSettings;
    }
  }, [selectedMenu, renderCameraSettings, renderGeneralSettings]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sider
        width={240}
        style={{
          backgroundColor: themeStyles.backgroundColor,
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <Menu
          mode="vertical"
          defaultSelectedKeys={[selectedMenu]}
          items={menuItems}
          style={{
            backgroundColor: 'transparent',
            borderRight: 0,
            color: themeStyles.textColor,
          }}
          onClick={(e) => setSelectedMenu(e.key)}
        />
      </Sider>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="text"
          icon={<IoIosCloseCircleOutline style={{ fontSize: '42px' }} />}
          onClick={() => setIsSettingsOpen(false)}
          style={{
            fontSize: '16px',
            color: themeStyles.textColor,
            backgroundColor: 'transparent',
            border: 'none',
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '22px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = themeStyles.hoverColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ESC
        </Button>
      </div>

      <Content
        style={{
          padding: '15px 45px',
          backgroundColor: themeStyles.contentBackground,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          color: themeStyles.textColor,
          flex: 1,
        }}
      >
        {renderContent}
      </Content>
    </div>
  );
};

export default Settings;
