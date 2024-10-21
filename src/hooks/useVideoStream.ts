import { useRef, useCallback, useEffect } from 'react';
import { useResData } from '../context';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { initializeFaceLandmarker } from '../model/faceLandmark';

const useVideoStream = ({
  deviceId,
  showBlendShapes,
  showLandmarks,
}: WebcamDisplayProps & { showLandmarks: boolean }) => {
  const { webcamRef, videoStreamRef, setLandMarkData } = useResData();
  const animationFrameIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
  const lastFrameTimeRef = useRef<number>(0); // Store the last frame timestamp

  // Stop the video stream and cancel animation frame
  const stopVideoStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    if (animationFrameIdRef.current !== undefined) {
      clearTimeout(animationFrameIdRef.current); // Clear the timeout
    }
  }, [videoStreamRef, webcamRef]);

  // Render frames and detect landmarks
  const renderFrame = useCallback(async () => {
    const webcam = webcamRef.current;
    const now = performance.now();
    const timeSinceLastFrame = now - lastFrameTimeRef.current;

    // Process frames only every 66.67ms (i.e., 15 FPS)
    if (
      webcam &&
      webcam.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      timeSinceLastFrame >= 1000 / 15 &&
      (faceLandmarkerRef.current || poseLandmarkerRef.current)
    ) {
      const timestamp = now;

      const [faceResults, poseResults] = await Promise.all([
        faceLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
        poseLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
      ]);

      latestLandmarksResultRef.current = { faceResults, poseResults };
      lastFrameTimeRef.current = now; // Update the last frame time

      if (animationFrameIdRef.current) {
        setLandMarkData(latestLandmarksResultRef.current);
      }
    }

    // Use setTimeout to throttle frame processing to 15 FPS
    animationFrameIdRef.current = setTimeout(renderFrame, 1000 / 15); // 15 FPS
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

          lastFrameTimeRef.current = performance.now(); // Reset the last frame time
          animationFrameIdRef.current = setTimeout(renderFrame, 66.67); // Start the loop with 15 FPS
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
