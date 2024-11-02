import { useRef, useCallback, useMemo } from 'react';
import { useResData } from '../context';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { initializeFaceLandmarker } from '../model/faceLandmark';
import filterLandmark from '../utility/filterLandMark';
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
    setResData,
    isAligned,
    initialModal,
    initializationSuccess,
    useFocalLength,
  } = useResData();

  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const firstFrameTimeRef = useRef<number>(0);
  const countRef = useRef<number>(0);

  const TARGET_FPS = 15;
  const { send } = useWebSocket(
    `landmark/results?stream=${streaming}&focal_length_enabled=${useFocalLength}`,
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

        setTimeout(frameLoop, interval - deltaTime);
      };

      setTimeout(frameLoop, interval);
    },
    [],
  );

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

  const handleWebSocketSend = useCallback(() => {
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

          startFrameTiming(processFrame, TARGET_FPS);
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

  const stopVideoStream = useCallback(() => {
    if (videoStreamRef.current) {
      const tracks = videoStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
  }, [videoStreamRef]);

  useMemo(() => handleWebSocketSend(), [handleWebSocketSend]);

  useMemo(() => {
    return () => {
      stopVideoStream();
    };
  }, [stopVideoStream]);

  return { startVideoStream, stopVideoStream };
};

export default useVideoStream;
