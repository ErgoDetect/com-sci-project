import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Switch, Upload, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { VideoCard, VideoContainer, VideoContent } from '../../styles/styles';
import {
  LandmarksResult,
  VideoSourceCardProps,
} from '../../interface/propsType';
import WebcamDisplay from '../camera/webcamDisplay';
import useSendLandmarkData from '../../hooks/useSendLandMarkData';
import { useResData } from '../../context';
import { initializeFaceLandmarker } from '../../model/faceLandmark';
import { initializePoseLandmarker } from '../../model/bodyLandmark';

const { Dragger } = Upload;

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  useVideoFile,
  setUseVideoFile,
  videoFile,
  setVideoFile,
  deviceId,
}) => {
  const { setLandMarkData, setStreaming } = useResData();
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  // const [playbackRate] = useState(4.0); // Default playback rate
  const timeCounterRef = useRef(0);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  // Clean up object URL when component unmounts or videoFile changes
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  // Initialize landmarkers
  const initializeLandmarkers = useCallback(async () => {
    if (!faceLandmarkerRef.current) {
      faceLandmarkerRef.current = await initializeFaceLandmarker();
    }
    if (!poseLandmarkerRef.current) {
      poseLandmarkerRef.current = await initializePoseLandmarker();
    }
  }, []);

  // Handle video processing
  const processVideo = useCallback(async () => {
    const videoElement = videoElementRef.current;
    if (!videoElement) return;

    setIsProcessing(true);
    await initializeLandmarkers();

    videoElement.muted = true;
    videoElement.playsInline = false;

    const totalDuration = videoElement.duration;

    const processFrame = async () => {
      if (timeCounterRef.current >= totalDuration) {
        setIsProcessing(false);
        setStreaming(false);
        message.success('Video processing completed.');
        return;
      }

      if (videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const timestamp = timeCounterRef.current * 1000; // Convert to milliseconds

        try {
          const [faceResults, poseResults] = await Promise.all([
            faceLandmarkerRef.current?.detectForVideo(
              videoElement,
              timestamp,
            ) ?? null,
            poseLandmarkerRef.current?.detectForVideo(
              videoElement,
              timestamp,
            ) ?? null,
          ]);

          latestLandmarksResultRef.current = { faceResults, poseResults };
          setLandMarkData(latestLandmarksResultRef.current);
          setStreaming(true);

          // Update progress
          setProcessingProgress((timeCounterRef.current / totalDuration) * 100);
        } catch (error) {
          console.error('Error processing frame:', error);
          message.error('An error occurred during video processing.');
        }
      }

      // Update video time and increment timeCounterRef
      videoElement.currentTime = timeCounterRef.current;
      timeCounterRef.current =
        Math.round((timeCounterRef.current + 0.1) * 100) / 100; // Increment by 0.1 seconds (adjust as needed)
      // console.log(timeCounterRef);

      // Continue processing frames
      setTimeout(processFrame, 0); // Call processFrame every 100 ms
    };

    // Start processing frames after an initial delay
    const initialDelay = 500; // Delay in milliseconds
    setTimeout(() => {
      timeCounterRef.current = 0; // Reset time counter
      processFrame(); // Start manual processing loop
    }, initialDelay);
  }, [initializeLandmarkers, setLandMarkData, setStreaming]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        setVideoFile(file); // Store the file
        message.success(`${file.name} uploaded successfully.`);
        // Start processing the video
        await processVideo();
        return true;
      } catch (error) {
        console.error('Error during file upload handling:', error);
        message.error('Error during file upload handling.');
        return false;
      }
    },
    [processVideo, setVideoFile],
  );

  // Custom hook for sending landmark data
  useSendLandmarkData();

  // Render video uploader
  const renderVideoUploader = useMemo(
    () => (
      <VideoContainer>
        {videoFile ? (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {isProcessing && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  zIndex: 1,
                }}
              >
                <Progress
                  type="circle"
                  percent={Math.round(processingProgress)}
                  width={80}
                />
              </div>
            )}
            <video
              ref={videoElementRef}
              src={videoSrc}
              style={{
                width: '100%',
                borderRadius: '10px',
              }}
              controls={!isProcessing}
              onLoadedData={processVideo}
            />
          </div>
        ) : (
          <Dragger
            name="file"
            multiple={false}
            accept=".webm, .mp4, .mov"
            beforeUpload={async (file) => {
              await handleFileUpload(file);
              return false; // Prevent automatic upload
            }}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag video file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single video file upload.
            </p>
          </Dragger>
        )}
      </VideoContainer>
    ),
    [
      videoFile,
      isProcessing,
      processingProgress,
      videoSrc,
      handleFileUpload,
      processVideo,
    ],
  );

  // Render webcam display
  const renderWebcamDisplay = useMemo(
    () => (
      <div>
        <WebcamDisplay
          deviceId={deviceId}
          width="100%"
          borderRadius={12}
          showBlendShapes={false}
        />
      </div>
    ),
    [deviceId],
  );

  // Cleanup on component unmount
  useEffect(() => {
    // Capture the current values of refs
    const videoElement = videoElementRef.current;
    const animationFrameId = animationFrameIdRef.current;

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, []);

  return (
    <VideoCard
      title="Video Source"
      bordered={false}
      extra={
        <Switch
          checkedChildren="Video File"
          unCheckedChildren="Live Feed"
          onChange={(checked) => {
            setUseVideoFile(checked);
            // Reset state when switching sources
            setVideoFile(null);
            setIsProcessing(false);
            setProcessingProgress(0);
            setStreaming(false);
          }}
          checked={useVideoFile}
        />
      }
    >
      <VideoContent>
        {useVideoFile ? renderVideoUploader : renderWebcamDisplay}
      </VideoContent>
    </VideoCard>
  );
};

export default VideoSourceCard;
