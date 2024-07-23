import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Button } from 'antd';
import { DeviceProps, videoFeedProps } from '../interface/propsType';
import DeviceSelector from './camera/deviceSelector';
import WebcamDisplay from './camera/webcamDisplay';
import useWebSocket from '../utility/webSocketConfig';
import { useResData } from '../context';

// Define a type for the throttle function
type ThrottleFunction = (...args: any[]) => void;

const VideoFeed: React.FC<videoFeedProps> = ({ width, borderRadius }) => {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [devices, setDevices] = useState<DeviceProps[]>([]);
  const { streaming, setStreaming } = useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);
  const { setResData, landMarkData } = useResData();
  const { send } = useWebSocket('ws://localhost:8000/ws', setResData);

  const lastLogTimeRef = useRef<number>(0);
  const logInterval = 20000;

  const handleDevices = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(
        (device) => device.kind === 'videoinput',
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !deviceId) {
        setDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  }, [deviceId]);

  const handleDeviceChange = useCallback((value: string) => {
    setDeviceId(value);
  }, []);

  const toggleStreaming = () => {
    if (streaming) {
      frameCountRef.current = 0;
    }
    setStreaming(!streaming);
  };

  const toggleBlendShapes = () => {
    setShowBlendShapes((prev) => !prev);
  };

  useEffect(() => {
    handleDevices();
  }, [handleDevices]);

  const handleCapture = useCallback(
    (blob: Blob) => {
      console.log('Image size:', (blob.size / 1024).toFixed(2), 'kilo bytes');

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const timestamp = Date.now();
        const data = {
          frameCount: frameCountRef.current,
          image: dataUrl.split(',')[1],
          timestamp: timestamp,
        };

        send(JSON.stringify(data));
        frameCountRef.current += 1;
      };
      reader.readAsDataURL(blob);
    },
    [send],
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

  // Throttle function to limit the rate of function execution
  const throttle = (func: ThrottleFunction, limit: number) => {
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    return function (...args: any[]) {
      if (!lastRan) {
        func(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  const sendLandMarkData = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastLogTimeRef.current >= logInterval) {
      console.log(landMarkData);
      send(JSON.stringify({ landMarkData, timestamp: currentTime }));
      lastLogTimeRef.current = currentTime;
    }
  }, [landMarkData, logInterval, send]);

  useEffect(() => {
    const throttledSend = throttle(sendLandMarkData, logInterval);
    throttledSend();
  }, [landMarkData, sendLandMarkData, logInterval]);

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
