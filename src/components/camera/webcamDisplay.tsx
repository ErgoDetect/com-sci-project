/** @format */

import React, { useRef, useEffect, useCallback } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import { drawCircle } from '../../utility/drawCircle';

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  deviceId,
  ipAddress,
  streaming,
  width = '35vw',
  borderRadius = '12px',
  drawingDot,
  onCapture,
}) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const showCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | undefined>();
  const intervalIdRef = useRef<number | undefined>();

  const stopVideoStream = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const webcam = webcamRef.current;

    if (canvas && webcam) {
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob);
          }
        }, 'image/jpeg');
      }
    }
  }, [onCapture]);

  const startVideoStream = useCallback(async () => {
    if (!deviceId && !ipAddress) {
      console.error('No camera device or IP address selected.');
      return;
    }

    try {
      stopVideoStream();

      if (ipAddress) {
        // If an IP address is provided, use it as the video source
        const streamUrl = `http://${ipAddress}`;

        if (webcamRef.current) {
          webcamRef.current.src = streamUrl;
          await webcamRef.current.play();

          const { videoWidth, videoHeight } = webcamRef.current;
          if (canvasRef.current) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
          }
          if (showCanvasRef.current) {
            showCanvasRef.current.width = videoWidth;
            showCanvasRef.current.height = videoHeight;
          }
        }
      } else {
        // If no IP address is provided, use the local camera
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId,
            width: { ideal: 1980 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
        });

        videoStreamRef.current = videoStream;

        if (webcamRef.current) {
          webcamRef.current.srcObject = videoStream;
          await webcamRef.current.play();

          const { videoWidth, videoHeight } = webcamRef.current;
          if (canvasRef.current) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
          }
          if (showCanvasRef.current) {
            showCanvasRef.current.width = videoWidth;
            showCanvasRef.current.height = videoHeight;
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [deviceId, ipAddress, stopVideoStream]);

  useEffect(() => {
    if (deviceId || ipAddress) {
      startVideoStream();
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      stopVideoStream();
    };
  }, [deviceId, ipAddress, startVideoStream, stopVideoStream]);

  const renderFrame = useCallback(() => {
    const showCanvas = showCanvasRef.current;
    const webcam = webcamRef.current;

    if (showCanvas && webcam) {
      const context = showCanvas.getContext('2d');
      if (context) {
        context.drawImage(webcam, 0, 0, showCanvas.width, showCanvas.height);
        if (drawingDot) {
          for (let index = 0; index < drawingDot.x.length; index++) {
            drawCircle(
              drawingDot.x[index],
              drawingDot.y[index],
              showCanvas.width,
              showCanvas.height,
              showCanvas,
            );
          }
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [drawingDot]);

  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameIdRef.current !== undefined) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  useEffect(() => {
    if (streaming && intervalIdRef.current === undefined) {
      intervalIdRef.current = window.setInterval(captureFrame, 1000 / 2);
    } else if (!streaming && intervalIdRef.current !== undefined) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = undefined;
    }
  }, [streaming, captureFrame]);

  return (
    <>
      <video
        ref={webcamRef}
        style={{
          display: 'none',
        }}
      ></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <canvas ref={showCanvasRef} style={{ width, borderRadius }}></canvas>
    </>
  );
};

export default WebcamDisplay;
