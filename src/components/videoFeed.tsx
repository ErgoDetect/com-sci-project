import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from 'antd';
import { LandmarksResult, videoFeedProps } from '../interface/propsType';
import DeviceSelector from './camera/deviceSelector';
import WebcamDisplay from './camera/webcamDisplay';
import { useResData } from '../context';
import useDevices from '../hooks/useDevices';
import { filterLandmark } from '../utility/filterLandMark';
import useWebSocket from '../utility/webSocketConfig';
import useInterval from '../hooks/useInterval';

const VideoFeed: React.FC<videoFeedProps> = ({ width, borderRadius }) => {
  const { deviceId, devices, setDeviceId } = useDevices();
  const { streaming, setStreaming } = useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);
  const { landMarkData, setResData, url } = useResData();
  const { send } = useWebSocket(`ws://${url}/landmark-results`, setResData);

  const lastLogTimeRef = useRef<number>(0);
  const logInterval = 1000;

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

  const sendLandMarkData = useCallback(() => {
    const currentTime = Date.now();

    // Ensure lastLogTimeRef.current is initialized
    if (lastLogTimeRef.current === undefined) {
      lastLogTimeRef.current = 0;
    }

    if (currentTime - lastLogTimeRef.current >= logInterval) {
      try {
        const filteredData = filterLandmark(landMarkData as LandmarksResult);
        const dataToSend = JSON.stringify({
          data: filteredData,
          timestamp: currentTime,
        });

        send(dataToSend);

        // Update the last log time reference
        lastLogTimeRef.current = currentTime;
      } catch (error) {
        console.error('Failed to send landmark data:', error);
      }
    }
  }, [landMarkData, logInterval, send]);

  useInterval(sendLandMarkData, 1000, streaming);

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
      </div>
    </>
  );
};

export default VideoFeed;
