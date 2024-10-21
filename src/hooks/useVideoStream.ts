import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useResData } from '../context';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { initializeFaceLandmarker } from '../model/faceLandmark';
import { filterLandmark } from '../utility/filterLandMark';
import useWebSocket from '../utility/webSocketConfig';

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
  } = useResData();

  const animationFrameIdRef = useRef<number | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const firstFrameTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const countRef = useRef<number>(0);
  const { send } = useWebSocket(`landmark/results?stream=${streaming}`);

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

  // Stop video stream
  const stopVideoStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [videoStreamRef, webcamRef]);

  // Render and detect landmarks
  const renderFrame = useCallback(async () => {
    const webcam = webcamRef.current;
    const now = performance.now();

    // Throttle to 15 FPS (1 second / 15 frames = ~66.67ms per frame)
    const timeSinceLastFrame = now - (lastFrameTimeRef.current || 0);
    if (timeSinceLastFrame < 1000 / 15) {
      animationFrameIdRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    if (webcam && webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const timestamp = now;
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

    // Update the last frame timestamp
    lastFrameTimeRef.current = now;

    // Queue the next frame
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [setLandMarkData, webcamRef]);

  // Handle WebSocket data send
  useEffect(() => {
    if (landMarkData && streaming) {
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
  }, [landMarkData, send, streaming]);

  // Start video stream
  const startVideoStream = useCallback(async () => {
    stopVideoStream(); // Ensure any active stream is stopped

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

          animationFrameIdRef.current = requestAnimationFrame(renderFrame);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [
    constraints,
    fallbackConstraints,
    renderFrame,
    stopVideoStream,
    videoStreamRef,
    webcamRef,
  ]);

  // Cleanup video stream on component unmount
  useEffect(() => stopVideoStream, [stopVideoStream]);

  return { startVideoStream, stopVideoStream };
};

export default useVideoStream;
