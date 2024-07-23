/** @format */

import React, { useRef, useEffect, useCallback } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import { drawCircle } from '../../utility/drawCircle';
import {
  initializeFaceLandmarker,
  drawResults,
  drawBlendShapes,
} from '../../faceLandmark';
import { DrawingUtils } from '@mediapipe/tasks-vision';

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  deviceId,
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
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const intervalIdRef = useRef<number | undefined>(undefined);

  const faceLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);

  const stopVideoStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
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
        canvas.toBlob((blob) => blob && onCapture(blob), 'image/jpeg');
      }
    }
  }, [onCapture]);

  const startVideoStream = useCallback(async () => {
    if (!deviceId) {
      console.error('No camera device.');
      return;
    }

    try {
      stopVideoStream();

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

        if (!faceLandmarkerRef.current) {
          faceLandmarkerRef.current = await initializeFaceLandmarker();
        }
        drawingUtilsRef.current = new DrawingUtils(
          showCanvasRef.current.getContext('2d'),
        );
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [deviceId, stopVideoStream]);

  useEffect(() => {
    if (deviceId) {
      startVideoStream();
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      stopVideoStream();
    };
  }, [deviceId, startVideoStream, stopVideoStream]);

  const renderFrame = useCallback(async () => {
    const showCanvas = showCanvasRef.current;
    const webcam = webcamRef.current;

    if (showCanvas && webcam && faceLandmarkerRef.current) {
      const context = showCanvas.getContext('2d');
      if (context) {
        context.drawImage(webcam, 0, 0, showCanvas.width, showCanvas.height);
        const results = await faceLandmarkerRef.current.detectForVideo(
          webcam,
          performance.now(),
        );
        drawResults(results, context, drawingUtilsRef.current);

        if (drawingDot) {
          drawingDot.x.forEach((x, index) => {
            drawCircle(
              x,
              drawingDot.y[index],
              showCanvas.width,
              showCanvas.height,
              showCanvas,
            );
          });
        }

        drawBlendShapes(
          document.getElementById('video-blend-shapes'),
          results.faceBlendshapes,
        );
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
      <video ref={webcamRef} style={{ display: 'none' }}></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <canvas
        ref={showCanvasRef}
        style={{ width, borderRadius, transform: 'rotateY(180deg)' }}
      ></canvas>
      <div id="video-blend-shapes"></div>
    </>
  );
};

export default WebcamDisplay;
