// ต้อง calibrate ท่านั่งที่ถูกต้อง
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from 'antd';
import { LandmarksResult, videoFeedProps } from '../../interface/propsType';
import DeviceSelector from '../camera/deviceSelector';
import WebcamDisplay from '../camera/webcamDisplay';
import { useResData } from '../../context';
import useDevices from '../../hooks/useDevices';
import { filterLandmark, getIrisDiameter } from '../../utility/filterLandMark';
import useWebSocket from '../../utility/webSocketConfig';
import useInterval from '../../hooks/useInterval';

interface VideoFeedProps extends videoFeedProps {
  onResult?: (result: any) => void;
}

export const VideoFeedVer1: React.FC<VideoFeedProps> = ({
  width,
  borderRadius,
  onResult,
}) => {
  const { deviceId, devices, setDeviceId } = useDevices();
  const { streaming, setStreaming, startCapture, setStartCapture } =
    useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);
  const { landMarkData, setResData, url } = useResData();
  const { send, message } = useWebSocket(
    `ws://${url}/landmark-results`,
    setResData,
  );
  const [result, setResult] = useState<any>(null);

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

    if (currentTime - lastLogTimeRef.current >= logInterval) {
      try {
        const filteredData = filterLandmark(landMarkData as LandmarksResult);
        const dataToSend = JSON.stringify({
          data: filteredData,
          timestamp: currentTime,
        });

        send(dataToSend);
        lastLogTimeRef.current = currentTime;

        // Ensure message is parsed only if it's a string
        let parsedMessage;
        if (typeof message === 'string') {
          parsedMessage = JSON.parse(message);
        } else {
          parsedMessage = message;
        }

        const newResult = {
          ...parsedMessage,
          ...getIrisDiameter(landMarkData as LandmarksResult),
        };
        setResult(newResult);

        // Pass the result to the parent component via the onResult callback
        if (onResult) {
          onResult(newResult);
        }
      } catch (error) {
        console.error('Failed to send landmark data:', error);
      }
    }
  }, [landMarkData, logInterval, send, message, onResult]);

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
