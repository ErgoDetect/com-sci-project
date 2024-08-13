import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from 'antd';
import { VideoFeedProps } from '../../interface/propsType';
import DeviceSelector from '../camera/deviceSelector';
import WebcamDisplay from '../camera/webcamDisplay';
import { useResData } from '../../context';
import useDevices from '../../hooks/useDevices';
import useSendLandmarkData from '../../hooks/useSendLandMarkData';

const VideoFeedVer1: React.FC<VideoFeedProps> = ({ width, borderRadius }) => {
  const { deviceId, devices, setDeviceId } = useDevices();
  const { streaming, setStreaming, url } = useResData();
  const [showBlendShapes, setShowBlendShapes] = useState<boolean>(true);
  const frameCountRef = useRef<number>(0);

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

  useSendLandmarkData({ combineResults: true });
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
  const handleDownload = async () => {
    try {
      // Fetch the calibration data from the server
      const response = await fetch(
        `http://${url}/download/calibration_data.json`,
      );

      if (!response.ok) {
        console.error('Failed to download calibration data:', response.status);
        throw new Error('Download failed');
      }

      // Read the response data as text (assuming JSON format)
      const calibrationData = await response.text();

      // Get the secure path to save the calibration data on the user's device
      const savePath = await window.electron.fs.getUserDataPath();

      // Write the calibration data to the file in a hidden directory
      await window.electron.fs.writeFile(savePath, calibrationData);

      console.log(`Calibration data successfully saved to ${savePath}`);
    } catch (error: any) {
      console.error(
        'Error downloading or saving calibration data:',
        error.message,
      );

      // Optional: Show a user-friendly notification in case of failure
      await window.electron.ipcRenderer.showNotification(
        'Download Error',
        'Failed to download and save calibration data. Please try again.',
      );
    }
  };

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
        <Button onClick={handleDownload}>Test Download Result</Button>
      </div>
    </>
  );
};

export default VideoFeedVer1;
