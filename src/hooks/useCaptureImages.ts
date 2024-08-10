import { useEffect, useState, RefObject } from 'react';
import { useResData } from '../context';

const useCaptureImage = (videoRef: RefObject<HTMLVideoElement>) => {
  const { startCapture, setStartCapture, setCalibrationData } = useResData();
  const captureDuration = 12000; // 12 seconds duration
  const captureFPS = 12; // 12 FPS
  const maxImageCount = Math.floor((captureDuration / 1000) * captureFPS);
  const endpointUrl = 'http://localhost:8000/upload-images'; // Adjusted for batch upload
  const triggerURL = 'http://localhost:8000/trigger-calibration';
  const [capturedImages, setCapturedImages] = useState<Blob[]>([]); // Store captured images

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

        // Upload all images at once
        const formData = new FormData();
        newCapturedImages.forEach((image, index) => {
          formData.append('files', image, `calibration_${index + 1}.png`); // Changed 'file' to 'files'
        });

        const response = await fetch(endpointUrl, {
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
          // Trigger calibration after all images are uploaded
          const calibrationResponse = await fetch(triggerURL, {
            method: 'POST',
          });

          if (!calibrationResponse.ok) {
            console.error(
              'Failed to calibrate camera:',
              calibrationResponse.status,
              await calibrationResponse.text(),
            );
          } else {
            const data = await calibrationResponse.json();
            console.log('Calibration result:', data);

            // Fetch the calibration_data.json file
            const jsonResponse = await fetch(
              `http://localhost:8000/download/${data.calibration_file.split('/').pop()}`, // Extracts the filename from the path
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
      onCaptureComplete(); // Trigger calibration after capture completes
      setCapturedImages(newCapturedImages); // Set captured images after capture completes
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
    endpointUrl,
    triggerURL,
    setStartCapture,
    setCalibrationData,
  ]);

  return { capturedImages };
};

export default useCaptureImage;
