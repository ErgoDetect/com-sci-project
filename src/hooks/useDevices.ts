import { useState, useCallback, useEffect } from 'react';
import { DeviceProps } from '../interface/propsType';

const useDevices = () => {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [devices, setDevices] = useState<DeviceProps[]>([]);

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

  useEffect(() => {
    handleDevices();
  }, [handleDevices]);

  return { deviceId, devices, setDeviceId };
};

export default useDevices;
