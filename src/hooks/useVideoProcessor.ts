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
  const frameDuration = 1 / 15;

  // Initialize landmarkers
  const initializeLandmarkers = useCallback(async () => {
    if (faceLandmarkerRef.current) {
      await faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    if (poseLandmarkerRef.current) {
      await poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }

    faceLandmarkerRef.current = await initializeFaceLandmarker();
    poseLandmarkerRef.current = await initializePoseLandmarker();
  }, []);

  // Process a single frame
  const processFrameAtTime = useCallback(
    async (currentTime: number) => {
      const videoElement = mainVideoElementRef.current;
      if (!videoElement) return;

      // Only seek if the current time is different
      if (videoElement.currentTime !== currentTime) {
        videoElement.currentTime = currentTime;
        await new Promise<void>((resolve) => {
          const handleSeek = () => {
            resolve();
            videoElement.removeEventListener('seeked', handleSeek);
          };
          videoElement.addEventListener('seeked', handleSeek);
        });
      }

      const timestamp = currentTime * 1000; // Convert to milliseconds

      console.log(`Processing frame at time: ${currentTime}`);

      try {
        // Batch process or limit frequency of detection calls if needed
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
    [mainVideoElementRef],
  );

  // Process video frame by frame
  const processVideoFile = useCallback(async () => {
    if (goodPostureTime === null || isProcessed) {
      return;
    }

    const videoElement = mainVideoElementRef.current;
    if (!videoElement) return;

    setIsProcessing(true);
    await initializeLandmarkers();

    const startTime = performance.now();
    console.log('Starting sequential frame processing');

    videoElement.muted = true;
    videoElement.controls = false;

    const totalDuration = videoElement.duration;
    let currentTime = goodPostureTime;
    let totalFramesProcessed = 0;

    const processNextFrame = async () => {
      if (currentTime < totalDuration) {
        await processFrameAtTime(currentTime);
        currentTime += frameDuration;
        totalFramesProcessed++;

        // Schedule the next frame process
        setTimeout(processNextFrame, 0);
        // requestAnimationFrame(processNextFrame);
      } else {
        // Once done, finalize
        setIsProcessing(false);
        setHideVideo(false);
        setIsProcessed(true);
        videoElement.controls = true;

        const endTime = performance.now();
        const processingDuration = (endTime - startTime) / 1000;
        console.log(
          `Processing took ${processingDuration.toFixed(2)} seconds.`,
        );
        console.log(`Total frames processed: ${totalFramesProcessed}`);
        console.log(
          `Average time per frame: ${(processingDuration / totalFramesProcessed).toFixed(2)} seconds`,
        );

        try {
          const response = await axiosInstance.post('/files/upload/video/', {
            file: processResult.current,
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
      }
    };

    processNextFrame();
  }, [
    goodPostureTime,
    initializeLandmarkers,
    isProcessed,
    mainVideoElementRef,
    processFrameAtTime,
    setHideVideo,
  ]);

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
    setIsProcessed(false);
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
