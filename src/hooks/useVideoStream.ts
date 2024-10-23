import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useResData } from '../context';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { initializeFaceLandmarker } from '../model/faceLandmark';
import { filterLandmark } from '../utility/filterLandMark';
import useWebSocket from '../utility/webSocketConfig';

// Define target FPS (e.g., 5 FPS)
// let lastCalledTime: any;
// let fps;
// let delta;
const targetFPS = 5;
const useVideoStream = ({
  deviceId,
  showBlendShapes,
  showLandmarks,
}: WebcamDisplayProps & { showLandmarks: boolean }) => {
  const {
    webcamRef,
    videoStreamRef,
    streaming,
    setLandMarkData,
    landMarkData,
    setResData,
    isAligned,
    initialModal,
    initializationSuccess,
  } = useResData();

  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const firstFrameTimeRef = useRef<number>(0);
  const countRef = useRef<number>(0);

  const TARGET_FPS = 15;
  const { send } = useWebSocket(
    `landmark/results?stream=${streaming}`,
    setResData,
  );

  const constraints = useMemo(
    () => ({
      video: {
        deviceId: { exact: deviceId },
        width: 1280,
        height: 720,
        frameRate: 30,
      },
      audio: false,
    }),
    [deviceId],
  );

  const fallbackConstraints = useMemo(
    () => ({
      video: {
        deviceId: { exact: deviceId },
        width: 640,
        height: 480,
        frameRate: 30,
      },
      audio: false,
    }),
    [deviceId],
  );

  // Frame timing control
  const startFrameTiming = useCallback(
    (processFrame: () => Promise<void>, targetFPS: number) => {
      const interval = 1000 / targetFPS;
      let lastFrameTime = performance.now();

      const frameLoop = async () => {
        const now = performance.now();
        const deltaTime = now - lastFrameTime;

        if (deltaTime >= interval) {
          lastFrameTime = now - (deltaTime % interval);
          await processFrame();
        }

        setTimeout(frameLoop, interval - deltaTime); // Use setTimeout for precise scheduling
      };

      setTimeout(frameLoop, interval);
    },
    [],
  );

  // Processing frame and detecting landmarks
  const processFrame = useCallback(async () => {
    const webcam = webcamRef.current;
    if (webcam && webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const timestamp = performance.now();
      const [faceResults, poseResults] = await Promise.all([
        faceLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
        poseLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
      ]);

      const latestLandmarksResult: LandmarksResult = {
        faceResults,
        poseResults,
      };
      setLandMarkData(latestLandmarksResult);
    }
  }, [setLandMarkData, webcamRef]);

  // Handle WebSocket data send
  useEffect(() => {
    if (
      landMarkData &&
      streaming &&
      (initializationSuccess || (isAligned && !initialModal))
    ) {
      const filteredData = filterLandmark(landMarkData as LandmarksResult);
      const currentTime = Date.now();

      send({ data: filteredData, timestamp: currentTime });

      if (countRef.current === 0) {
        firstFrameTimeRef.current = currentTime;
      }

      countRef.current += 1;
      const elapsedTime = (currentTime - firstFrameTimeRef.current) / 1000;
      if (elapsedTime > 0) {
        const fps = countRef.current / elapsedTime;
        console.log('FPS:', fps);
      }
    } else {
      countRef.current = 0;
      firstFrameTimeRef.current = 0;
    }
  }, [
    initializationSuccess,
    initialModal,
    isAligned,
    landMarkData,
    send,
    streaming,
  ]);

  // Start video stream
  const startVideoStream = useCallback(async () => {
    try {
      const videoStream = await navigator.mediaDevices
        .getUserMedia(constraints)
        .catch(() => {
          console.warn('High-res camera access failed, attempting fallback.');
          return navigator.mediaDevices.getUserMedia(fallbackConstraints);
        });

      if (!videoStream) {
        console.error('Unable to access the camera.');
        return;
      }

      videoStreamRef.current = videoStream;

      if (webcamRef.current) {
        webcamRef.current.srcObject = videoStream;
        webcamRef.current.onloadedmetadata = async () => {
          await webcamRef.current?.play();

          if (!faceLandmarkerRef.current) {
            faceLandmarkerRef.current = await initializeFaceLandmarker();
          }
          if (!poseLandmarkerRef.current) {
            poseLandmarkerRef.current = await initializePoseLandmarker();
          }

          // Start frame timing with target FPS
          startFrameTiming(processFrame, TARGET_FPS); // You can easily adjust target FPS here
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [
    constraints,
    fallbackConstraints,
    processFrame,
    startFrameTiming,
    videoStreamRef,
    webcamRef,
  ]);

  // Stop video stream and cleanup
  const stopVideoStream = useCallback(() => {
    if (videoStreamRef.current) {
      const tracks = videoStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
  }, [videoStreamRef]);

  // Cleanup video stream on component unmount
  useEffect(() => {
    return () => {
      stopVideoStream(); // Clean up the video stream
    };
  }, [stopVideoStream]);

  return { startVideoStream, stopVideoStream };
};

export default useVideoStream;
