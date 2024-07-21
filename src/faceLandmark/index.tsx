import React, { useEffect, useRef, useState } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

const FaceLandmarkerComponent: React.FC = () => {
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [runningMode, setRunningMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  useEffect(() => {
    const createFaceLandmarker = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
      );
      const landmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode,
          numFaces: 1,
        },
      );
      setFaceLandmarker(landmarker);
    };
    createFaceLandmarker();
  }, [runningMode]);

  const handleImageClick = async (
    event: React.MouseEvent<HTMLImageElement>,
  ) => {
    if (!faceLandmarker) {
      console.log('Wait for faceLandmarker to load before clicking!');
      return;
    }

    if (runningMode === 'VIDEO') {
      setRunningMode('IMAGE');
      await faceLandmarker.setOptions({ runningMode: 'IMAGE' });
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'canvas';
    canvas.width = event.currentTarget.naturalWidth;
    canvas.height = event.currentTarget.naturalHeight;

    const parent = event.currentTarget.parentElement;
    if (parent) {
      parent.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const drawingUtils = new DrawingUtils(ctx);
      const results = await faceLandmarker.detect(event.currentTarget);

      results.faceLandmarks.forEach((landmarks: any) => {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: '#C0C0C070', lineWidth: 1 },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: '#30FF30' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: '#30FF30' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: '#E0E0E0' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: '#E0E0E0' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: '#30FF30' },
        );
      });
    }
  };

  const handleEnableCam = async () => {
    if (!faceLandmarker) {
      console.log('Wait! faceLandmarker not loaded yet.');
      return;
    }

    if (webcamRunning) {
      setWebcamRunning(false);
    } else {
      setWebcamRunning(true);
    }

    if (videoRef.current) {
      const constraints = {
        video: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    }
  };

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarker) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (runningMode === 'IMAGE') {
      setRunningMode('VIDEO');
      await faceLandmarker.setOptions({ runningMode: 'VIDEO' });
    }

    const startTimeMs = performance.now();
    const results = await faceLandmarker.detectForVideo(video, startTimeMs);

    if (ctx && results.faceLandmarks) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const drawingUtils = new DrawingUtils(ctx);

      results.faceLandmarks.forEach((landmarks: any) => {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: '#C0C0C070', lineWidth: 1 },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: '#30FF30' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: '#30FF30' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: '#E0E0E0' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: '#E0E0E0' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: '#30FF30' },
        );
      });
    }

    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  return (
    <div>
      <button onClick={handleEnableCam}>Enable Webcam</button>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="480" height="360" />
    </div>
  );
};

export default FaceLandmarkerComponent;
