import { useEffect, useRef, RefObject, useCallback, useState } from 'react';
import { message } from 'antd';
import axiosInstance from '../utility/axiosInstance';
import { useResData } from '../context';

const CAPTURE_DURATION = 12000;
const CAPTURE_FPS = 12;
const MAX_IMAGE_COUNT = Math.floor((CAPTURE_DURATION / 1000) * CAPTURE_FPS);

const notify = async (title: string, body: string) => {
  try {
    await window.electron?.notifications.showNotification?.(title, body);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

const useCaptureImage = (videoRef: RefObject<HTMLVideoElement>) => {
  const [startCapture, setStartCapture] = useState(false);
  const [isCaptureCompleted, setIsCaptureCompleted] = useState(false);
  const capturedImagesRef = useRef<Blob[]>([]);
  const { setCalibrationData } = useResData();

  const captureImage = useCallback(() => {
    const video = videoRef.current;
    if (video && capturedImagesRef.current.length < MAX_IMAGE_COUNT) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) capturedImagesRef.current.push(blob);
        }, 'image/png');
      }
    }
  }, [videoRef]);

  const onCaptureComplete = useCallback(async () => {
    try {
      notify('Capture Complete', 'Image capture is complete.');

      const formData = new FormData();
      capturedImagesRef.current.forEach((image, index) => {
        formData.append('files', image, `calibration_${index + 1}.png`);
      });

      // Upload captured images
      const uploadResponse = await axiosInstance.post(
        '/files/calibration',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      console.log('Upload successful:', uploadResponse.data);

      notify(
        'Calibration Complete',
        'The calibration process has completed successfully.',
      );
      setCalibrationData(uploadResponse.data.calibration_data);

      // Fetch and update app config with the new calibration data
      const config = await window.electron.config.getAppConfig();
      const updatedConfig = {
        ...config,
        calibrationData: uploadResponse.data.calibration_data,
      };
      const result = await window.electron.config.saveAppConfig(updatedConfig);

      if (result.success) {
        message.success('Settings saved successfully');
      } else {
        message.error('Failed to save settings');
        throw new Error(result.error || 'Unknown save error');
      }

      setIsCaptureCompleted(true); // Mark capture as complete if everything succeeded
    } catch (error) {
      console.error('Error in capture or calibration:', error);
      message.error('Error fetching or saving settings');
    } finally {
      capturedImagesRef.current = []; // Reset images
      setStartCapture(false); // Stop capture
    }
  }, [setCalibrationData]);

  useEffect(() => {
    if (startCapture) {
      notify('Calibration Starting', 'The calibration process is starting.');
      const intervalId = setInterval(captureImage, 1000 / CAPTURE_FPS);
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        onCaptureComplete();
      }, CAPTURE_DURATION);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [startCapture, captureImage, onCaptureComplete]);

  return {
    startImageCapture: () => setStartCapture(true),
    resetCapture: () => setStartCapture(false),
    captureCompleted: isCaptureCompleted,
  };
};

export default useCaptureImage;
