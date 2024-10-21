import { useRef, useCallback, useEffect } from 'react';
import { useResData } from '../context';
import { WebcamDisplayProps, LandmarksResult } from '../interface/propsType';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { initializeFaceLandmarker } from '../model/faceLandmark';

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
  const { webcamRef, videoStreamRef, setLandMarkData } = useResData();
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dynamically calculate IntervalFrame based on target FPS
  const IntervalFrame = 1000 / targetFPS;

  // Stop the video stream and cancel the interval
  const stopVideoStream = useCallback(() => {
    videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    videoStreamRef.current = null;
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current); // Clear the interval
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

      // Run the landmark detection asynchronously (non-blocking)
      const [faceResults, poseResults] = await Promise.all([
        faceLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
        poseLandmarkerRef.current?.detectForVideo(webcam, timestamp) ?? null,
      ]);

      latestLandmarksResultRef.current = { faceResults, poseResults };

      setLandMarkData(latestLandmarksResultRef.current);
      // if (!lastCalledTime) {
      //   lastCalledTime = Date.now();
      //   fps = 0;
      // }
      // delta = (Date.now() - lastCalledTime) / 1000;
      // lastCalledTime = Date.now();
      // fps = 1 / delta;
      // console.log(fps);
    }
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

          // Start the interval to process frames at exactly the target FPS
          intervalIdRef.current = setInterval(() => {
            renderFrame(); // Call renderFrame every 200ms (for 5 FPS)
          }, IntervalFrame);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [
    deviceId,
    renderFrame,
    stopVideoStream,
    videoStreamRef,
    webcamRef,
    IntervalFrame,
  ]);

  // Stop the video stream when the component unmounts
  useEffect(() => stopVideoStream, [stopVideoStream]);

  return { webcamRef, startVideoStream, stopVideoStream };
};

export default useVideoStream;
