import React, { useRef, useEffect, useCallback, useState } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import { drawCircle } from '../../utility/drawCircle';
import { initializeFaceLandmarker, drawResults } from '../../faceLandmark';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { useResData } from '../../context';

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  deviceId,
  width = '35vw',
  borderRadius = '12px',
  drawingDot,
  showBlendShapes,
}) => {
  const [showLandmarks, setShowLandmarks] = useState(true);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const showCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const intervalIdRef = useRef<number | undefined>(undefined);
  const { setLandMarkData, streaming } = useResData();

  const faceLandmarkerRef = useRef<any>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  const stopVideoStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
  }, []);

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
        audio: false,
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

        if (!faceLandmarkerRef.current && streaming) {
          faceLandmarkerRef.current = await initializeFaceLandmarker();
        }
        if (showCanvasRef.current) {
          const context = showCanvasRef.current.getContext('2d');
          if (context) {
            drawingUtilsRef.current = new DrawingUtils(context);
          } else {
            console.error('Unable to get 2D context for the canvas.');
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [deviceId, stopVideoStream, streaming]);

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

    if (
      showCanvas &&
      webcam &&
      webcam.srcObject &&
      webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      faceLandmarkerRef.current
    ) {
      const context = showCanvas.getContext('2d');
      if (context) {
        context.drawImage(webcam, 0, 0, showCanvas.width, showCanvas.height);
        const results = await faceLandmarkerRef.current.detectForVideo(
          webcam,
          performance.now(),
        );

        // Store results in setLandMarkData
        setLandMarkData(results);

        if (showLandmarks && drawingUtilsRef.current) {
          drawResults(results, context, drawingUtilsRef.current);
        }

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

        if (showBlendShapes) {
          const blendShapesElement =
            document.getElementById('video-blend-shapes');
          if (blendShapesElement) {
            blendShapesElement.innerHTML = ''; // Clear previous content
            // Insert new blend shapes rendering logic here
          }
        }
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [drawingDot, showBlendShapes, showLandmarks, setLandMarkData]);

  useEffect(() => {
    setShowLandmarks(showBlendShapes); // Toggle landmarks visibility based on blend shapes
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameIdRef.current !== undefined) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrame, showBlendShapes]);

  // useEffect(() => {
  //   if (streaming && intervalIdRef.current === undefined) {
  //     intervalIdRef.current = window.setInterval(captureFrame, 1000 / 2);
  //   } else if (!streaming && intervalIdRef.current !== undefined) {
  //     clearInterval(intervalIdRef.current);
  //     intervalIdRef.current = undefined;
  //   }
  // }, [streaming, captureFrame]);

  return (
    <>
      {streaming ? (
        <>
          <video ref={webcamRef} style={{ display: 'none' }}></video>
          <canvas
            ref={showCanvasRef}
            style={{ width, borderRadius, transform: 'rotateY(180deg)' }}
          ></canvas>
          {showBlendShapes && (
            <div style={{ height: '2px' }} id="video-blend-shapes"></div>
          )}
        </>
      ) : (
        <>
          <video
            ref={webcamRef}
            style={{ width, borderRadius, transform: 'rotateY(180deg)' }}
          ></video>
        </>
      )}
    </>
  );
};

export default WebcamDisplay;
