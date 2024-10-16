import { useRef, useEffect, useCallback } from 'react';
import { useResData } from '../context';
import { initializeFaceLandmarker } from '../model/faceLandmark';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';

const useVideoStream = ({
  deviceId,
  showBlendShapes,
  showLandmarks,
}: WebcamDisplayProps & { showLandmarks: boolean }) => {
  const { webcamRef, videoStreamRef, setLandMarkData } = useResData();
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);

  // Stop the video stream and cancel animation frame
  const stopVideoStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    if (animationFrameIdRef.current !== undefined) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
  }, [videoStreamRef, webcamRef]);

  // Render frames and detect landmarks
  const renderFrame = useCallback(async () => {
    const webcam = webcamRef.current;
    if (
      webcam &&
      webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      (faceLandmarkerRef.current || poseLandmarkerRef.current)
    ) {
      const timestamp = performance.now();

      const [faceResults, poseResults] = await Promise.all([
        faceLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
        poseLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
      ]);

      latestLandmarksResultRef.current = { faceResults, poseResults };

      // Throttle state updates to every 5th frame to reduce re-renders
      if (
        animationFrameIdRef.current &&
        animationFrameIdRef.current % 5 === 0
      ) {
        setLandMarkData(latestLandmarksResultRef.current);
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [setLandMarkData, webcamRef]);

  // Start video stream with fallback constraints
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

    stopVideoStream(); // Ensure any active stream is stopped

    try {
      const videoStream = await navigator.mediaDevices
        .getUserMedia(constraints)
        .catch(() => {
          console.warn('High-res camera access failed, attempting fallback.');
          return navigator.mediaDevices.getUserMedia(fallbackConstraints);
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

          // Initialize face and pose landmarkers if not already initialized
          faceLandmarkerRef.current ||= await initializeFaceLandmarker();
          poseLandmarkerRef.current ||= await initializePoseLandmarker();

          animationFrameIdRef.current = requestAnimationFrame(renderFrame);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [deviceId, renderFrame, stopVideoStream, videoStreamRef, webcamRef]);

  // Stop the video stream when the component unmounts
  useEffect(() => stopVideoStream, [stopVideoStream]);

  return { webcamRef, startVideoStream, stopVideoStream };
};

export default useVideoStream;
