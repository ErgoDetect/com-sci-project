import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Button } from 'antd';
import { videoFeedProps } from '../interface/propsType';
import DeviceSelector from './camera/deviceSelector';
import WebcamDisplay from './camera/webcamDisplay';
import useWebSocket from '../utility/webSocketConfig';
import { useResData } from '../context';
import useDevices from '../hooks/useDevices';
import useThrottle from '../hooks/useThrottle';

const VideoFeed: React.FC<videoFeedProps> = ({ width, borderRadius }) => {
  const { deviceId, devices, setDeviceId } = useDevices();
  const { streaming, setStreaming } = useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);
  const { setResData, landMarkData } = useResData();
  const { send } = useWebSocket('ws://localhost:8000/ws', setResData);

  const lastLogTimeRef = useRef<number>(0);
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

  const sendLandMarkData = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastLogTimeRef.current >= logInterval) {
      console.log(landMarkData);
      send(JSON.stringify({ landMarkData, timestamp: currentTime }));
      lastLogTimeRef.current = currentTime;
    }
  }, [landMarkData, logInterval, send]);

  const throttledSend = useThrottle(sendLandMarkData, logInterval);

  useEffect(() => {
    const intervalId: ReturnType<typeof setInterval> = setInterval(
      throttledSend,
      logInterval,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [throttledSend, logInterval]);

  console.log('face landmark', landMarkData?.faceResults);
  console.log('pose landmark', landMarkData?.poseResults);

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
