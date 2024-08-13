import { useEffect, useState, RefObject } from 'react';
import { useResData } from '../context';

const useCaptureImage = (videoRef: RefObject<HTMLVideoElement>) => {
  const { startCapture, setStartCapture, setCalibrationData, url } =
    useResData();
  const captureDuration = 12000; // 12 seconds duration
  const captureFPS = 12; // 12 FPS
  const maxImageCount = Math.floor((captureDuration / 1000) * captureFPS);
  const [capturedImages, setCapturedImages] = useState<Blob[]>([]);

  useEffect(() => {
    if (!startCapture) return undefined;

    let intervalId: number | null = null;
    let timeoutId: number | null = null;
    let imageCount = 0;
    const newCapturedImages: Blob[] = [];

    const captureImage = async () => {
      const video = videoRef.current;
      if (video && imageCount < maxImageCount) {
        const imageBitmap = await createImageBitmap(video);

        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(imageBitmap, 0, 0);
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/png');
          });

          if (blob) {
            newCapturedImages.push(blob);
            imageCount += 1;
          }
        }
      }
    };

    const onCaptureComplete = async () => {
      try {
        console.log('Image capture complete. Uploading images...');
        await window.electron.ipcRenderer.showNotification(
          'Capture Complete',
          'Image capture is complete.',
        );

        const formData = new FormData();
        newCapturedImages.forEach((image, index) => {
          formData.append('files', image, `calibration_${index + 1}.png`);
        });

        const response = await fetch(`http://${url}/upload-images`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error(
            'Failed to upload images:',
            response.status,
            await response.text(),
          );
        } else {
          const calibrationResponse = await fetch(
            `http://${url}/trigger-calibration`,
            { method: 'POST' },
          );

          if (!calibrationResponse.ok) {
            console.error(
              'Failed to calibrate camera:',
              calibrationResponse.status,
              await calibrationResponse.text(),
            );
          } else {
            const data = await calibrationResponse.json();
            console.log('Calibration result:', data);

            const jsonResponse = await fetch(
              `http://${url}/download/${data.calibration_file.split('/').pop()}`,
            );
            const jsonData = await jsonResponse.json();
            console.log('Calibration data:', jsonData);
            setCalibrationData(jsonData);

            await window.electron.ipcRenderer.showNotification(
              'Calibrate Complete',
              'The calibration process has completed successfully.',
            );
          }
        }
      } catch (error) {
        console.error('Error in capture or calibration:', error);
      }
    };

    const intervalDuration = 1000 / captureFPS;

    intervalId = window.setInterval(async () => {
      await captureImage();
    }, intervalDuration);

    timeoutId = window.setTimeout(() => {
      console.log('Capture duration ended. Stopping image capture.');
      if (intervalId) clearInterval(intervalId);
      setStartCapture(false);
      onCaptureComplete();
      setCapturedImages(newCapturedImages);
    }, captureDuration);

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [
    startCapture,
    captureFPS,
    captureDuration,
    maxImageCount,
    videoRef,
    setStartCapture,
    setCalibrationData,
    url,
  ]);

  return { capturedImages };
};

export default useCaptureImage;
