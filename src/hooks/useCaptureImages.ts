import { useEffect, useRef, RefObject } from 'react';
import { useResData } from '../context';
import axiosInstance from '../utility/axiosInstance';

const useCaptureImage = (videoRef: RefObject<HTMLVideoElement>) => {
  const { startCapture, setStartCapture } = useResData();
  const captureDuration = 12000; // Total duration to capture images (in milliseconds)
  const captureFPS = 12; // Frames per second to capture
  const maxImageCount = Math.floor((captureDuration / 1000) * captureFPS);

  const capturedImagesRef = useRef<Blob[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    let timeoutId: NodeJS.Timeout | undefined;
    let imageCount = 0;

    const captureImage = async () => {
      const video = videoRef.current;
      if (video && imageCount < maxImageCount) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob((blobs) => resolve(blobs), 'image/png');
            });
            if (blob) {
              capturedImagesRef.current.push(blob);
              imageCount += 1;
            }
          }
        } catch (error) {
          console.error('Error capturing image:', error);
        }
      }
    };

    const onCaptureComplete = async () => {
      try {
        console.log('Image capture complete. Uploading images...');
        if (window.electron?.notifications.showNotification) {
          await window.electron.notifications.showNotification(
            'Capture Complete',
            'Image capture is complete.',
          );
        }

        const formData = new FormData();
        capturedImagesRef.current.forEach((image, index) => {
          formData.append('files', image, `calibration_${index + 1}.png`);
        });

        const uploadResponse = await axiosInstance.post(
          '/images/upload/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        console.log('Upload successful:', uploadResponse.data);

        // Additional calibration logic can be added here

        // Notify user of completion
        if (window.electron?.notifications.showNotification) {
          await window.electron.notifications.showNotification(
            'Calibration Complete',
            'The calibration process has completed successfully.',
          );
        }
      } catch (error) {
        console.error('Error in capture or calibration:', error);
      } finally {
        // Reset captured images
        capturedImagesRef.current = [];
        setStartCapture(false);
      }
    };

    if (startCapture) {
      const intervalDuration = 1000 / captureFPS;
      intervalId = setInterval(() => {
        captureImage();
      }, intervalDuration);

      timeoutId = setTimeout(() => {
        console.log('Capture duration ended. Stopping image capture.');
        onCaptureComplete();
      }, captureDuration);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [
    startCapture,
    captureFPS,
    captureDuration,
    maxImageCount,
    videoRef,
    setStartCapture,
  ]);

  return {};
};

export default useCaptureImage;
