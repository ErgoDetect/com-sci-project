import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { initializeFaceLandmarker } from '../model/faceLandmark';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import { filterLandmark } from '../utility/filterLandMark';
import { LandmarksResult } from '../interface/propsType';
import axiosInstance from '../utility/axiosInstance';

interface UseVideoProcessorProps {
  videoFile: File | null;
  mainVideoElementRef: React.RefObject<HTMLVideoElement>;
  goodPostureTime: number | null;
  setGoodPostureTime: React.Dispatch<React.SetStateAction<number | null>>;
  setHideVideo: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoFile: (file: File | null) => void;
}

const useVideoProcessor = ({
  mainVideoElementRef,
  goodPostureTime,
  setGoodPostureTime,
  setHideVideo,
  setVideoFile,
}: UseVideoProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const processResult = useRef<any[]>([]);

  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);

  // Initialize landmarkers
  const initializeLandmarkers = useCallback(async () => {
    // Close existing landmarkers
    if (faceLandmarkerRef.current) {
      await faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    if (poseLandmarkerRef.current) {
      await poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }

    // Initialize new landmarkers
    faceLandmarkerRef.current = await initializeFaceLandmarker();
    poseLandmarkerRef.current = await initializePoseLandmarker();
  }, []);

  // Process frame at a specific time (helper function)
  const processFrameAtTime = useCallback(
    async (currentTime: number) => {
      const videoElement = mainVideoElementRef.current;
      if (!videoElement) return;

      // Set the current time of the video element
      videoElement.currentTime = currentTime;

      // Use promise-based waiting for seek
      await new Promise<void>((resolve) => {
        const handleSeek = () => {
          resolve();
          videoElement.removeEventListener('seeked', handleSeek); // Ensure event listener is removed
        };
        videoElement.addEventListener('seeked', handleSeek);
      });

      const timestamp = currentTime * 1000; // Convert to milliseconds

      console.log(`Processing frame at time: ${currentTime}`);

      try {
        // Process both face and pose landmarks simultaneously
        const [faceResults, poseResults] = await Promise.all([
          faceLandmarkerRef.current.detectForVideo(videoElement, timestamp),
          poseLandmarkerRef.current.detectForVideo(videoElement, timestamp),
        ]);

        latestLandmarksResultRef.current = { faceResults, poseResults };
        const filteredData = filterLandmark(
          latestLandmarksResultRef.current as LandmarksResult,
        );
        processResult.current.push(filteredData);
      } catch (error) {
        message.error(`Error processing frame at time: ${currentTime}`);
        console.error(error);
      }
    },
    [
      mainVideoElementRef,
      faceLandmarkerRef,
      poseLandmarkerRef,
      latestLandmarksResultRef,
      processResult,
    ],
  );

  // Process video with parallel frame processing
  const processVideoFile = useCallback(async () => {
    if (goodPostureTime === null || isProcessed) {
      return; // Do nothing if goodPostureTime is not set or video is already processed
    }

    const videoElement = mainVideoElementRef.current;
    if (!videoElement) return;

    setIsProcessing(true);
    await initializeLandmarkers();

    const startTime = performance.now(); // Start time before processing
    console.log('Starting parallel frame processing');

    videoElement.muted = true; // Mute video during processing
    videoElement.controls = false;

    const frameDuration = 1 / 15; // 15 frames per second
    const totalDuration = videoElement.duration;

    console.log(`Total duration of video: ${totalDuration}`);

    let totalFramesProcessed = 0; // Track number of frames processed

    // Store frame processing promises
    const framePromises = [];

    for (
      let currentTime = goodPostureTime;
      currentTime < totalDuration;
      currentTime += frameDuration
    ) {
      // Create a promise to process each frame
      framePromises.push(processFrameAtTime(currentTime));
      totalFramesProcessed += 1; // Increment processed frames count
    }

    // Wait for all frames to be processed in parallel
    try {
      await Promise.all(framePromises);
      setIsProcessing(false);
      setHideVideo(false);
      setIsProcessed(true);

      const endTime = performance.now(); // End time after processing
      const processingDuration = (endTime - startTime) / 1000; // Time in seconds
      console.log(`Processing took ${processingDuration.toFixed(2)} seconds.`);
      console.log(`Total frames processed: ${totalFramesProcessed}`);
      console.log(
        `Average time per frame: ${(
          processingDuration / totalFramesProcessed
        ).toFixed(2)} seconds`,
      );

      try {
        const response = await axiosInstance.post('/files/upload/video/', {
          file: processResult.current, // This is the array of processed data
        });
        if (response.status === 200) {
          message.success('Video processing completed and uploaded.');
        } else {
          message.error('Failed to upload video.');
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        message.error('Error uploading video.');
      }

      message.success('Video processing completed.');
      videoElement.controls = true;
      console.log(processResult.current);
    } catch (error) {
      setIsProcessing(false);
      message.error('Error during parallel frame processing.');
      console.error(error);
    }
  }, [
    goodPostureTime,
    initializeLandmarkers,
    isProcessed,
    mainVideoElementRef,
    processFrameAtTime,
    setHideVideo,
  ]);

  // Delete uploaded video
  const handleDeleteVideo = useCallback(() => {
    if (mainVideoElementRef.current) {
      mainVideoElementRef.current.pause();
      mainVideoElementRef.current.currentTime = 0;
    }
    setVideoFile(null);
    setGoodPostureTime(null);
    setIsProcessing(false);
    processResult.current = [];
    setHideVideo(false);
    setIsProcessed(false); // Reset processed state on delete
    message.success('Uploaded video deleted and processing reset.');
  }, [mainVideoElementRef, setGoodPostureTime, setHideVideo, setVideoFile]);

  return {
    setVideoFile,
    isProcessing,
    isProcessed,
    processResult: processResult.current,
    processVideoFile,
    handleDeleteVideo,
  };
};

export default useVideoProcessor;
