import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from 'antd';
import { videoFeedProps } from '../interface/propsType';
import DeviceSelector from './camera/deviceSelector';
import WebcamDisplay from './camera/webcamDisplay';
import { useResData } from '../context';
import useDevices from '../hooks/useDevices';
import useSendLandmarkData from '../hooks/useSendLandMark';

const VideoFeed: React.FC<videoFeedProps> = ({ width, borderRadius }) => {
  const { deviceId, devices, setDeviceId } = useDevices();
  const { streaming, setStreaming } = useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);
  const { landMarkData } = useResData();
  const logInterval = 20000;

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

  useSendLandmarkData(landMarkData, logInterval);

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
      </div>
    </>
  );
};

export default VideoFeed;
