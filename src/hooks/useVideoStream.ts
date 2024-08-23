import { useRef, useEffect, useCallback } from 'react';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { useResData } from '../context';
import {
  initializeFaceLandmarker,
  drawFaceLandmarker,
} from '../model/faceLandmark';
import {
  initializePoseLandmarker,
  drawPoseLandmarker,
} from '../model/bodyLandmark';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';

const useVideoStream = ({
  deviceId,
  showBlendShapes,
  showLandmarks,
}: WebcamDisplayProps & { showLandmarks: boolean }) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const showCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const { setLandMarkData } = useResData();

  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
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

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    };

    try {
      stopVideoStream();

      const videoStream = await navigator.mediaDevices
        .getUserMedia(constraints)
        .catch(() => {
          console.warn('High-res camera access failed, attempting fallback.');
          return navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: 30 },
            audio: false,
          });
        });

      if (!videoStream) {
        console.error(
          'Unable to access the camera with any supported resolution.',
        );
        return;
      }

      videoStreamRef.current = videoStream;
      if (webcamRef.current) {
        webcamRef.current.srcObject = videoStream;

        webcamRef.current.onloadedmetadata = async () => {
          await webcamRef.current?.play();

          const { videoWidth, videoHeight } = webcamRef.current!;
          [canvasRef.current, showCanvasRef.current].forEach((canvas) => {
            if (canvas) {
              canvas.width = videoWidth;
              canvas.height = videoHeight;
            }
          });

          if (!faceLandmarkerRef.current) {
            faceLandmarkerRef.current = await initializeFaceLandmarker();
          }
          if (!poseLandmarkerRef.current) {
            poseLandmarkerRef.current = await initializePoseLandmarker();
          }
          if (showCanvasRef.current) {
            const context = showCanvasRef.current.getContext('2d');
            if (context) {
              drawingUtilsRef.current = new DrawingUtils(context);
            } else {
              console.error('Unable to get 2D context for the canvas.');
            }
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [deviceId, stopVideoStream]);

  const renderFrame = useCallback(async () => {
    const showCanvas = showCanvasRef.current;
    const webcam = webcamRef.current;

    if (
      showCanvas &&
      webcam &&
      webcam.srcObject &&
      webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      (faceLandmarkerRef.current || poseLandmarkerRef.current)
    ) {
      const context = showCanvas.getContext('2d');
      if (context) {
        context.drawImage(webcam, 0, 0, showCanvas.width, showCanvas.height);

        const faceResults = faceLandmarkerRef.current
          ? await faceLandmarkerRef.current.detectForVideo(
              webcam,
              performance.now(),
            )
          : null;

        const poseResults = poseLandmarkerRef.current
          ? await poseLandmarkerRef.current.detectForVideo(
              webcam,
              performance.now(),
            )
          : null;

        const results: LandmarksResult = { faceResults, poseResults };
        setLandMarkData(results);

        if (showLandmarks && drawingUtilsRef.current) {
          if (faceResults) {
            drawFaceLandmarker(faceResults, context, drawingUtilsRef.current);
          }
          if (poseResults) {
            drawPoseLandmarker(poseResults, context, drawingUtilsRef.current);
          }
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
  }, [showBlendShapes, showLandmarks, setLandMarkData]);

  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationFrameIdRef.current !== undefined) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  return { webcamRef, showCanvasRef, startVideoStream, stopVideoStream };
};

export default useVideoStream;
