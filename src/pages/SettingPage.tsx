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
  const { showDetailedData, theme } = useResData();
  const [selectedMenu, setSelectedMenu] = useState<string>('camera');
  const [detailedData, setDetailedData] = useState<boolean>(showDetailedData);
  const { deviceId, devices, setDeviceId } = useDevices();

  const handleDeviceChange = useCallback(
    (value: string) => {
      setDeviceId(value);
    },
    [setDeviceId],
  );

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

  const handleDetailedDataChange = useCallback((checked: boolean) => {
    setDetailedData(checked);
  }, []);

  const renderCameraSettings = useMemo(
    () => (
      <>
        <Title
          level={4}
          style={{
            marginBottom: '24px',
            color: theme === 'dark' ? '#f4f5f7' : '#23272A',
          }}
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
    [deviceSelectorMemo, theme],
  );

  const renderGeneralSettings = useMemo(
    () => (
      <>
        <Title
          level={4}
          style={{
            marginBottom: '24px',
            color: theme === 'dark' ? '#f4f5f7' : '#23272A',
          }}
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
              checked={detailedData}
              onChange={handleDetailedDataChange}
            />
            <Tooltip title="Enable or disable detailed data display during detection and in the summary.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [detailedData, handleDetailedDataChange, theme],
  );

  const menuItems = useMemo(
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
          backgroundColor: theme === 'dark' ? '#2C2F33' : '#f5f5f5',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          style={{
            backgroundColor: 'transparent',
            borderRight: 0,
            color: theme === 'dark' ? '#fff' : '#333',
          }}
          onClick={(e) => setSelectedMenu(e.key)}
        />
      </Sider>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          type="text"
          icon={
            <IoIosCloseCircleOutline
              style={{
                fontSize: '42px',
              }}
            />
          }
          onClick={() => {
            setIsSettingsOpen(false);
          }}
          style={{
            fontSize: '16px',
            color: theme === 'dark' ? '#f4f5f7' : '#23272A',
            backgroundColor: 'transparent',
            border: 'none',
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '22px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor =
              theme === 'dark' ? '#36393f' : '#e3e5e8';
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
          backgroundColor: theme === 'dark' ? '#2b2b2b' : '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          color: theme === 'dark' ? '#f4f5f7' : '#333',
          flex: 1,
        }}
      >
        {renderContent}
      </Content>
    </div>
  );
};

export default Settings;
