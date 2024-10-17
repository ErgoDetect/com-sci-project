import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Switch, Upload, message, Button, Modal } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';

import { VideoCard, VideoContainer, VideoContent } from '../../styles/styles';
import {
  VideoSourceCardProps,
  LandmarksResult,
} from '../../interface/propsType';
import WebcamDisplay from '../camera/webcamDisplay';
import { useResData } from '../../context';
import { initializeFaceLandmarker } from '../../model/faceLandmark';
import { initializePoseLandmarker } from '../../model/bodyLandmark';
import { filterLandmark } from '../../utility/filterLandMark';

const { Dragger } = Upload;

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  useVideoFile,
  setUseVideoFile,
  videoFile,
  setVideoFile,
  deviceId,
}) => {
  const { setStreaming } = useResData();
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
  const modalVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timeCounterRef = useRef(0);
  const processResult = useRef<any[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goodPostureTime, setGoodPostureTime] = useState<number | null>(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');

  // Styles
  const videoStyles = {
    width: '100%',
    borderRadius: '10px',
    display: hideVideo ? 'none' : 'block',
  };

  // Create object URL for video file
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoSrc(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
    return () => {
      setVideoSrc('');
    };
  }, [videoFile]);

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

  // Process video
  const processVideo = useCallback(async () => {
    const videoElement = mainVideoElementRef.current;
    if (!videoElement) return;

    setIsProcessing(true);
    await initializeLandmarkers();

    videoElement.muted = true;
    videoElement.playbackRate = 1;
    videoElement.controls = false;

    const totalDuration = videoElement.duration;

    if (goodPostureTime !== null) {
      videoElement.currentTime = goodPostureTime;
    }

    let isProcessingFrame = false;

    const processFrame = async () => {
      if (isProcessingFrame) return;

      if (videoElement.currentTime >= totalDuration) {
        setIsProcessing(false);
        setHideVideo(false);
        setIsProcessed(true);
        message.success('Video processing completed.');
        videoElement.controls = true;
        return;
      }

      isProcessingFrame = true;
      const frameInterval = 1; // Process every second
      if (videoElement.currentTime - timeCounterRef.current >= frameInterval) {
        timeCounterRef.current = videoElement.currentTime;
        const timestamp = videoElement.currentTime * 1000;

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
          message.error('Error processing frame.');
          console.error(error);
        }
      }

      isProcessingFrame = false;
      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    try {
      await videoElement.play();
      timeCounterRef.current = videoElement.currentTime;
      processFrame();
    } catch (error) {
      message.error('Error starting video playback.');
      console.error(error);
    }
  }, [initializeLandmarkers, goodPostureTime]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      setVideoFile(file);
      setGoodPostureTime(null);
      setIsModalVisible(true);
      setHideVideo(false);
      setIsProcessed(false);
      message.success(`${file.name} uploaded successfully.`);
      return false; // Prevent automatic upload
    },
    [setVideoFile],
  );

  // Set good posture time
  const handleSetGoodPosture = useCallback(() => {
    const videoElement = modalVideoElementRef.current;
    if (videoElement) {
      setGoodPostureTime(videoElement.currentTime);
      setHideVideo(true);
      message.success(
        `Good posture set at ${videoElement.currentTime.toFixed(2)} seconds.`,
      );
      setIsModalVisible(false);
    }
  }, []);

  // Start processing after modal closes
  useEffect(() => {
    if (!isModalVisible && goodPostureTime !== null) {
      processVideo();
    }
  }, [isModalVisible, goodPostureTime, processVideo]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Delete uploaded video
  const handleDeleteVideo = useCallback(() => {
    if (mainVideoElementRef.current) {
      mainVideoElementRef.current.pause();
      mainVideoElementRef.current.currentTime = 0;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    setVideoFile(null);
    setIsProcessing(false);
    processResult.current = [];
    setGoodPostureTime(null);
    setHideVideo(false);
    message.success('Uploaded video deleted and processing reset.');
  }, [setVideoFile]);

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
            setVideoFile(null);
            setIsProcessing(false);
            setStreaming(false);
            setHideVideo(false);
          }}
          checked={useVideoFile}
        />
      }
    >
      <VideoContent>
        {useVideoFile ? (
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
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      padding: '20px',
                      borderRadius: '10px',
                      zIndex: 10,
                    }}
                  >
                    <p style={{ color: 'white', textAlign: 'center' }}>
                      Processing... Please wait.
                    </p>
                  </div>
                )}

                <video
                  ref={mainVideoElementRef}
                  src={videoSrc}
                  style={videoStyles}
                  controls={!isProcessing}
                  controlsList="nofullscreen"
                  onTimeUpdate={() => {
                    const videoElement = mainVideoElementRef.current;
                    if (
                      videoElement &&
                      isProcessed &&
                      goodPostureTime !== null &&
                      videoElement.currentTime < goodPostureTime
                    ) {
                      videoElement.currentTime = goodPostureTime;
                    }
                  }}
                />

                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteVideo}
                  style={{ marginTop: '10px' }}
                >
                  Delete Video
                </Button>
              </div>
            ) : (
              <Dragger
                name="file"
                multiple={false}
                accept=".webm, .mp4, .mov"
                beforeUpload={handleFileUpload}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag video file to this area to upload
                </p>
              </Dragger>
            )}
          </VideoContainer>
        ) : (
          <WebcamDisplay
            deviceId={deviceId}
            width="100%"
            borderRadius={12}
            showBlendShapes={false}
          />
        )}
      </VideoContent>

      <Modal
        open={isModalVisible}
        width="65%"
        onCancel={() => {
          setIsModalVisible(false);
          handleDeleteVideo();
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button type="primary" onClick={handleSetGoodPosture}>
              Set Good Posture
            </Button>
          </div>
        }
      >
        <div style={{ padding: '25px', alignItems: 'center' }}>
          <video
            ref={modalVideoElementRef}
            src={videoSrc}
            style={{ width: '100%', borderRadius: '10px' }}
            controls
          />
        </div>
      </Modal>
    </VideoCard>
  );
};

export default VideoSourceCard;
