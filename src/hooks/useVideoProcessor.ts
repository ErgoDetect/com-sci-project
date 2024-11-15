import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { initializeFaceLandmarker } from '../model/faceLandmark';
import { initializePoseLandmarker } from '../model/bodyLandmark';
import filterLandmark from '../utility/filterLandMark';
import {
  LandmarksResult,
  UseVideoProcessorProps,
} from '../interface/propsType';
import axiosInstance from '../utility/axiosInstance';

const useVideoProcessor = ({
  mainVideoElementRef,
  goodPostureTime,
  setGoodPostureTime,
  setHideVideo,
  setVideoFile,
  setNewVideoSrc,
  videoFileName,
  thumbnailName,
}: UseVideoProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const processResult = useRef<any[]>([]);

  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
  const frameDuration = 1 / 15;
  const isCancelledRef = useRef(false); // Cancellation flag

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

  const processFrameAtTime = useCallback(
    async (currentTime: number) => {
      if (isCancelledRef.current) {
        return; // Exit if processing is cancelled
      }
      const videoElement = mainVideoElementRef.current;
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

      const timestamp = currentTime * 1000;
      console.log(`Processing frame at time: ${currentTime}`);

      try {
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

  const processVideoFile = useCallback(async () => {
    if (goodPostureTime === null || isProcessed) return;

    const videoElement = mainVideoElementRef.current;
    if (!videoElement) return;

    console.log('Starting video processing...');
    setIsProcessing(true);
    setIsProcessed(false);
    isCancelledRef.current = false; // Reset cancellation flag
    await initializeLandmarkers();

    const startTime = performance.now();
    videoElement.muted = true;
    videoElement.controls = false;

    const totalDuration = videoElement.duration;
    let currentTime = goodPostureTime;
    let totalFramesProcessed = 0;

    const processNextFrame = async () => {
      if (isCancelledRef.current) {
        console.log('Processing cancelled.');
        setIsProcessing(false);
        return;
      }
      if (currentTime < totalDuration) {
        console.log(`Processing frame at time: ${currentTime}`);
        await processFrameAtTime(currentTime);
        currentTime += frameDuration;
        totalFramesProcessed += 1;
        requestAnimationFrame(processNextFrame);
      } else {
        setIsProcessing(false);
        setHideVideo(false);
        setIsProcessed(true);
        videoElement.controls = true;
        videoElement.currentTime = 0;

        const endTime = performance.now();
        const processingDuration = (endTime - startTime) / 1000;
        console.log(
          `Processing took ${processingDuration.toFixed(2)} seconds.`,
        );
        console.log(`Total frames processed: ${totalFramesProcessed}`);
        console.log(
          `Average time per frame: ${(processingDuration / totalFramesProcessed).toFixed(2)} seconds`,
        );

        // Attempt upload and check for success or failure
        try {
          const response = await axiosInstance.post('/files/upload/video/', {
            video_name: videoFileName,
            thumbnail: thumbnailName,
            files: processResult.current,
          });
          if (response.status === 200) {
            message.success('Video processing completed and uploaded.');
            setSessionId(response.data.sitting_session_id);
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
    frameDuration,
    goodPostureTime,
    initializeLandmarkers,
    isProcessed,
    mainVideoElementRef,
    processFrameAtTime,
    setHideVideo,
    thumbnailName,
    videoFileName,
  ]);

  const handleDeleteVideo = useCallback(() => {
    if (mainVideoElementRef.current) {
      mainVideoElementRef.current.pause();
      mainVideoElementRef.current.currentTime = 0;
    }
    isCancelledRef.current = true; // Set cancellation flag
    setVideoFile(null);
    setNewVideoSrc('');
    setGoodPostureTime(null);
    setIsProcessing(false);
    processResult.current = [];
    setHideVideo(false);
    setIsProcessed(false);
    message.success('Uploaded video deleted and processing reset.');
  }, [
    mainVideoElementRef,
    setGoodPostureTime,
    setHideVideo,
    setNewVideoSrc,
    setVideoFile,
  ]);

  return {
    setVideoFile,
    isProcessing,
    isProcessed,
    processResult: processResult.current,
    processVideoFile,
    handleDeleteVideo,
    sessionId,
  };
};

export default useVideoProcessor;
