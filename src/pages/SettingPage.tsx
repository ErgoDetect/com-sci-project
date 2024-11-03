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
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DeviceSelector from '../components/camera/deviceSelector';
import useDevices from '../hooks/useDevices';
import CalibrationModal from '../components/modal/CalibrationModal';
import { useResData } from '../context';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface SettingsProps {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Default calibration data
const defaultCalibrationData = {
  cameraMatrix: [
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
  ],
  distCoeffs: [[0.0, 0.0, 0.0, 0.0, 0.0]],
  mean_error: 0.0,
};

const Settings = () => {
  const {
    showDetailedData,
    setShowDetailedData,
    useFocalLength,
    setUseFocalLength,
    calibrationData,
    saveSessionVideo,
    setSaveSessionVideo,
    // showNotification,
    // setShowNotification,
    showBlinkNotification,
    setShowBlinkNotification,
    showSittingNotification,
    setShowSittingNotification,
    showDistanceNotification,
    setShowDistanceNotification,
    showThoracticNotification,
    setShowThoracticNotification,
  } = useResData();
  const [selectedMenu, setSelectedMenu] = useState<string>('camera');
  const { deviceId, devices, setDeviceId } = useDevices();
  const navigate = useNavigate();

  // Check if calibration data matches default value
  const isCalibrationDefault = useMemo(
    () =>
      JSON.stringify(calibrationData) ===
      JSON.stringify(defaultCalibrationData),
    [calibrationData],
  );

  // Memoize disabled switch style
  const disabledSwitchStyle = useMemo<React.CSSProperties>(() => {
    return isCalibrationDefault
      ? { opacity: 0.5, pointerEvents: 'none', cursor: 'not-allowed' }
      : {};
  }, [isCalibrationDefault]);

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
      window.electron.config
        .getAppConfig()
        .then((config) => {
          const updatedConfig = { ...config, showStat: checked };
          return window.electron.config.saveAppConfig(updatedConfig);
        })
        .then((result) => {
          if (result.success) {
            message.success('Settings saved successfully');
            return 'Settings saved'; // Returning a value for consistency
          }
          message.error('Failed to save settings');
          throw new Error(result.error || 'Unknown save error');
        })
        .catch((error): void => {
          message.error('Error fetching or saving settings');
          console.error('Error:', error);
          return null; // Return null explicitly to avoid promise chain issues
        });
    },
    [setShowDetailedData],
  );
  const handleSaveVideoChange = useCallback(
    (checked: boolean): void => {
      setSaveSessionVideo(checked);
      window.electron.config
        .getAppConfig()
        .then((config) => {
          const updatedConfig = { ...config, saveSessionVideo: checked };
          return window.electron.config.saveAppConfig(updatedConfig);
        })
        .then((result) => {
          if (result.success) {
            message.success('Settings saved successfully');
            return 'Settings saved'; // Returning a value for consistency
          }
          message.error('Failed to save settings');
          throw new Error(result.error || 'Unknown save error');
        })
        .catch((error): void => {
          message.error('Error fetching or saving settings');
          console.error('Error:', error);
          return null; // Return null explicitly to avoid promise chain issues
        });
    },
    [setSaveSessionVideo],
  );

  const handleShowNotificationsChange = useCallback(
    (type: string, checked: boolean): void => {
      window.electron.config
        .getAppConfig()
        .then((config) => {
          if (type == 'blink') {
            setShowBlinkNotification(checked);
            const updatedConfig = { ...config, showBlinkNotification: checked };
            return window.electron.config.saveAppConfig(updatedConfig);
          } else if (type == 'sitting') {
            setShowSittingNotification(checked);
            const updatedConfig = {
              ...config,
              showSittingNotification: checked,
            };
            return window.electron.config.saveAppConfig(updatedConfig);
          } else if (type == 'distance') {
            setShowDistanceNotification(checked);
            const updatedConfig = {
              ...config,
              showDistanceNotification: checked,
            };
            return window.electron.config.saveAppConfig(updatedConfig);
          } else if (type == 'thoractic') {
            setShowThoracticNotification(checked);
            const updatedConfig = {
              ...config,
              showThoracticNotification: checked,
            };
            return window.electron.config.saveAppConfig(updatedConfig);
          }
        })
        .then((result) => {
          if (result.success) {
            message.success('Settings saved successfully');
            return 'Settings saved'; // Returning a value for consistency
          }
          message.error('Failed to save settings');
          throw new Error(result.error || 'Unknown save error');
        })
        .catch((error): void => {
          message.error('Error fetching or saving settings');
          console.error('Error:', error);
          return null; // Return null explicitly to avoid promise chain issues
        });
    },
    [
      setShowBlinkNotification,
      setShowSittingNotification,
      setShowDistanceNotification,
      setShowThoracticNotification,
    ],
  );

  const handleUseFocalLengthChange = useCallback(
    (checked: boolean): void => {
      setUseFocalLength(checked);
      window.electron.config
        .getAppConfig()
        .then((config) => {
          const updatedConfig = { ...config, useFocalLength: checked };
          return window.electron.config.saveAppConfig(updatedConfig);
        })
        .then((result) => {
          if (result.success) {
            message.success('Settings saved successfully');
            return 'Settings saved';
          }
          message.error('Failed to save settings');
          throw new Error(result.error || 'Unknown save error');
        })
        .catch((error): void => {
          message.error('Error fetching or saving settings');
          console.error('Error:', error);
          return null;
        });
    },
    [setUseFocalLength],
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
          <Form.Item
            label={
              isCalibrationDefault
                ? 'Show Depth in Centimeter (Needed Calibration Camera)'
                : 'Show Depth in Centimeter'
            }
            style={{ opacity: isCalibrationDefault ? 0.5 : '' }}
          >
            <Tooltip
              title={
                isCalibrationDefault ? 'Enable after camera calibration.' : ''
              }
            >
              <Switch
                checked={isCalibrationDefault ? false : useFocalLength}
                onChange={handleUseFocalLengthChange}
                disabled={isCalibrationDefault} // Disable switch if calibration data is default
                style={disabledSwitchStyle}
              />
            </Tooltip>
          </Form.Item>
          <Form.Item label="Camera Calibration">
            <CalibrationModal />
            <Tooltip title="Calibrate camera for improved detection accuracy.">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [
      deviceSelectorMemo,
      handleUseFocalLengthChange,
      useFocalLength,
      isCalibrationDefault,
      disabledSwitchStyle,
    ],
  );

  // Render general settings section
  const renderGeneralSettings = useMemo(
    () => (
      <>
        <Title level={4} style={{ marginBottom: '24px' }}>
          General Settings
        </Title>
        <Form layout="vertical">
          <Form.Item label="Show Detailed Data During Detection ">
            <Switch
              checked={showDetailedData}
              onChange={handleDetailedDataChange}
            />
            <Tooltip title="Toggle detailed data display in detection ">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
          {/* <Form.Item label="Show Notifications">
            <Switch
              checked={showNotification}
              onChange={handleShowNotificationsChange}
            />
            <Tooltip title="Tooggle to turn on and off notification">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item> */}
          <Form.Item label="Show Blink Notifications">
            <Switch
              checked={showBlinkNotification}
              onChange={() =>
                handleShowNotificationsChange('blink', !showBlinkNotification)
              }
            />
            <Tooltip title="Tooggle to turn on and off blink notification">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
          <Form.Item label="Show Sitting Notifications">
            <Switch
              checked={showSittingNotification}
              onChange={() =>
                handleShowNotificationsChange(
                  'sitting',
                  !showSittingNotification,
                )
              }
            />
            <Tooltip title="Tooggle to turn on and off sitting notification">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
          <Form.Item label="Show Distance Notifications">
            <Switch
              checked={showDistanceNotification}
              onChange={() =>
                handleShowNotificationsChange(
                  'distance',
                  !showDistanceNotification,
                )
              }
            />
            <Tooltip title="Tooggle to turn on and off distance notification">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
          <Form.Item label="Show Thoractic Notifications">
            <Switch
              checked={showThoracticNotification}
              onChange={() =>
                handleShowNotificationsChange(
                  'thoractic',
                  !showThoracticNotification,
                )
              }
            />
            <Tooltip title="Tooggle to turn on and off thoractic notification">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
          <Form.Item label="Save Video Detection Session">
            <Switch
              checked={saveSessionVideo}
              onChange={handleSaveVideoChange}
            />
            <Tooltip title="Toggle to save video file while using Live Feed">
              <InfoCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Form.Item>
        </Form>
      </>
    ),
    [
      showDetailedData,
      handleDetailedDataChange,
      // showNotification,
      // handleShowNotificationsChange,
      showBlinkNotification,
      setShowBlinkNotification,
      showSittingNotification,
      setShowSittingNotification,
      showDistanceNotification,
      setShowDistanceNotification,
      showThoracticNotification,
      setShowThoracticNotification,
      saveSessionVideo,
      handleSaveVideoChange,
    ],
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
        shape="circle"
        size="large"
        icon={<CloseOutlined />}
        onClick={() => navigate(-1)}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
        }}
      />

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
