import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from 'antd';
import { VideoFeedProps } from '../../interface/propsType';
import DeviceSelector from '../camera/deviceSelector';
import WebcamDisplay from '../camera/webcamDisplay';
import { useResData } from '../../context';
import useDevices from '../../hooks/useDevices';
import useSendLandmarkData from '../../hooks/useSendLandMarkData';

const VideoFeedVer2: React.FC<VideoFeedProps> = ({ width, borderRadius }) => {
  const { deviceId, devices, setDeviceId } = useDevices();
  const { streaming, setStreaming } = useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);

  // Use the hook without combining results, as per different purpose
  useSendLandmarkData();

  const handleDeviceChange = useCallback(
    (value: string) => {
      setDeviceId(value);
    },
    [setDeviceId],
  );

  const toggleStreaming = useCallback(() => {
    if (streaming) {
      frameCountRef.current = 0;
    }
    setStreaming(!streaming);
  }, [streaming, setStreaming]);

  const toggleBlendShapes = useCallback(() => {
    setShowBlendShapes((prev) => !prev);
  }, []);

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

  return (
    <>
      <WebcamDisplay
        deviceId={deviceId}
        width={width}
        borderRadius={borderRadius}
        showBlendShapes={showBlendShapes}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '10px',
          gap: '10px',
        }}
      >
        {deviceSelectorMemo}
        <Button onClick={toggleStreaming}>
          {streaming ? 'Stop' : 'Start'}
        </Button>
        <Button onClick={toggleBlendShapes}>
          {showBlendShapes ? 'Hide Blend Shapes' : 'Show Blend Shapes'}
        </Button>
        <Button
          onClick={async () => {
            const title = 'Test Notification';
            const body = 'This is a test notification from the app.';
            await window.electron.ipcRenderer.invoke('show-notification', {
              title,
              body,
            });
          }}
        >
          Test Notification
        </Button>
      </div>
    </>
  );
};

export default VideoFeedVer2;
