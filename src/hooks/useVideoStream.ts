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
  const { webcamRef, videoStreamRef } = useResData();
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const { setLandMarkData } = useResData();

  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null); // <-- Store the latest landmarks result

  const stopVideoStream = useCallback(() => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [videoStreamRef, webcamRef]);

  const renderFrame = useCallback(async () => {
    const webcam = webcamRef.current;
    if (
      webcam &&
      webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      (faceLandmarkerRef.current || poseLandmarkerRef.current)
    ) {
      const timestamp = performance.now();

      const [faceResults, poseResults] = await Promise.all([
        faceLandmarkerRef.current
          ? faceLandmarkerRef.current.detectForVideo(webcam, timestamp)
          : Promise.resolve(null),
        poseLandmarkerRef.current
          ? poseLandmarkerRef.current.detectForVideo(webcam, timestamp)
          : Promise.resolve(null),
      ]);

      const newResults: LandmarksResult = { faceResults, poseResults };

      // Store the results in a ref, not in state to avoid re-renders
      latestLandmarksResultRef.current = newResults;

      // Only update the state every N frames (throttling updates)
      if (
        animationFrameIdRef.current &&
        animationFrameIdRef.current % 5 === 0
      ) {
        setLandMarkData(newResults);
      }
    }

    // Schedule the next frame
    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [setLandMarkData, webcamRef]);

  const startVideoStream = useCallback(async () => {
    if (!deviceId) {
      console.error('No camera device.');
      return;
    }

    const constraints = {
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    };

    const fallbackConstraints = {
      video: {
        deviceId: { exact: deviceId },
        width: 640,
        height: 480,
        frameRate: 15,
      },
      audio: false,
    };

    try {
      stopVideoStream();

      let videoStream: MediaStream | null = null;
      try {
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.warn(
          'High-res camera access failed, attempting fallback.',
          error,
        );
        videoStream =
          await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }

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

          if (!faceLandmarkerRef.current) {
            faceLandmarkerRef.current = await initializeFaceLandmarker();
          }
          if (!poseLandmarkerRef.current) {
            poseLandmarkerRef.current = await initializePoseLandmarker();
          }

          // Start rendering frames once metadata is loaded
          animationFrameIdRef.current = requestAnimationFrame(renderFrame);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [deviceId, renderFrame, stopVideoStream, videoStreamRef, webcamRef]);

  useEffect(() => {
    return () => {
      stopVideoStream();
    };
  }, [stopVideoStream]);

  return { webcamRef, startVideoStream, stopVideoStream };
};

export default useVideoStream;
