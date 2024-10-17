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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goodPostureTime, setGoodPostureTime] = useState<number | null>(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const timeCounterRef = useRef(0);
  const processResult = useRef<any[]>([]);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // State variable for video source
  const [videoSrc, setVideoSrc] = useState('');

  // Update videoSrc when videoFile changes
  useEffect(() => {
    let url: string | undefined;

    if (videoFile) {
      url = URL.createObjectURL(videoFile);
      setVideoSrc(url);
    } else {
      setVideoSrc('');
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [videoFile]);

  const initializeLandmarkers = useCallback(async () => {
    if (!faceLandmarkerRef.current) {
      faceLandmarkerRef.current = await initializeFaceLandmarker();
    }
    if (!poseLandmarkerRef.current) {
      poseLandmarkerRef.current = await initializePoseLandmarker();
    }
  }, []);

  // Handle video processing starting from the selected posture time
  const processVideo = useCallback(async () => {
    const videoElement = videoElementRef.current;
    if (!videoElement) {
      console.error('Video element is hidden, cannot process video.');
      return;
    }

    if (videoElement.readyState < 1) {
      await new Promise<void>((resolve) => {
        videoElement.addEventListener('loadedmetadata', () => resolve(), {
          once: true,
        });
      });
    }

    setIsProcessing(true);
    await initializeLandmarkers();

    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.autoplay = true;
    videoElement.playbackRate = 1;
    videoElement.controls = false;

    const totalDuration = videoElement.duration;

    if (goodPostureTime !== null) {
      videoElement.currentTime = goodPostureTime;
    }

    let isProcessingFrame = false;

    const processFrame = async () => {
      if (isProcessingFrame) return;
      isProcessingFrame = true;

      if (videoElement.currentTime >= totalDuration) {
        setIsProcessing(false);
        setHideVideo(false);
        setIsProcessed(true);
        message.success('Video processing completed.');
        videoElement.controls = true;
      }

      const frameInterval = 1 / 1;
      const timeDelta = videoElement.currentTime - timeCounterRef.current;
      if (timeDelta >= frameInterval) {
        timeCounterRef.current = videoElement.currentTime;
        const timestamp = videoElement.currentTime * 1000;

        if (videoElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          try {
            const [faceResults, poseResults] = await Promise.all([
              faceLandmarkerRef.current?.detectForVideo(
                videoElement,
                timestamp,
              ),
              poseLandmarkerRef.current?.detectForVideo(
                videoElement,
                timestamp,
              ),
            ]);
            latestLandmarksResultRef.current = { faceResults, poseResults };
            const filteredData = filterLandmark(
              latestLandmarksResultRef.current as LandmarksResult,
            );
            processResult.current.push(filteredData);

            setProcessingProgress(
              (videoElement.currentTime / totalDuration) * 100,
            );
          } catch (error) {
            console.error('Error processing frame:', error);
            message.error('An error occurred during video processing.');
          }
        }
      }

      isProcessingFrame = false;
      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    try {
      await videoElement.play();
    } catch (err) {
      console.error('Error starting video playback:', err);
    }

    timeCounterRef.current = 0;
    processFrame();
  }, [initializeLandmarkers, goodPostureTime]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        setVideoFile(file);
        setGoodPostureTime(null);
        setIsModalVisible(true);
        setHideVideo(false);
        setIsProcessed(false);
        message.success(`${file.name} uploaded successfully.`);
        return true;
      } catch (error) {
        message.error('Error during file upload handling.');
        return false;
      }
    },
    [setVideoFile],
  );

  // Handle setting good posture time
  const handleSetGoodPosture = useCallback(() => {
    const videoElement = videoElementRef.current;
    if (videoElement) {
      setGoodPostureTime(videoElement.currentTime);
      setHideVideo(true);
      message.success(
        `Good posture set at ${videoElement.currentTime.toFixed(2)} seconds.`,
      );
      setIsModalVisible(false);
    }
  }, []);

  // Start processing after modal is closed
  useEffect(() => {
    if (!isModalVisible && goodPostureTime !== null) {
      processVideo();
    }
  }, [isModalVisible, goodPostureTime, processVideo]);

  // Delete uploaded video and reset states
  const handleDeleteVideo = useCallback(() => {
    if (videoElementRef.current) {
      videoElementRef.current.pause();
      videoElementRef.current.currentTime = 0;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    setVideoFile(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    processResult.current = [];
    setGoodPostureTime(null);
    setHideVideo(false);
    message.success('Uploaded video deleted and processing reset.');
  }, [setVideoFile]);

  // After processing, control playback to simulate trimming
  useEffect(() => {
    if (isProcessed && goodPostureTime !== null) {
      const videoElement = videoElementRef.current;
      if (videoElement) {
        videoElement.currentTime = goodPostureTime;
        videoElement.play();
        message.info(
          `Video trimmed to start from ${goodPostureTime.toFixed(2)} seconds.`,
        );
      }
    }
  }, [isProcessed, goodPostureTime]);

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
            setProcessingProgress(0);
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
                    <img
                      src="/path/to/overlay-image.png"
                      alt="Processing Overlay"
                      style={{
                        width: videoElementRef.current.width,
                        height: videoElementRef.current.height,
                      }}
                    />
                    <p style={{ color: 'white', textAlign: 'center' }}>
                      Processing... Please wait.
                    </p>
                  </div>
                )}

                <video
                  ref={videoElementRef}
                  src={videoSrc}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    display: hideVideo ? 'none' : 'block',
                  }}
                  controls={!isProcessing}
                  onLoadedMetadata={() => {
                    const videoElement = videoElementRef.current;
                    if (
                      videoElement &&
                      isProcessed &&
                      goodPostureTime !== null
                    ) {
                      videoElement.currentTime = goodPostureTime;
                    }
                  }}
                  onSeeking={() => {
                    const videoElement = videoElementRef.current;
                    if (
                      videoElement &&
                      isProcessed &&
                      goodPostureTime !== null &&
                      videoElement.currentTime < goodPostureTime
                    ) {
                      videoElement.currentTime = goodPostureTime;
                    }
                  }}
                  onTimeUpdate={() => {
                    const videoElement = videoElementRef.current;
                    if (
                      videoElement &&
                      isProcessed &&
                      goodPostureTime !== null &&
                      videoElement.currentTime < goodPostureTime
                    ) {
                      videoElement.currentTime = goodPostureTime;
                    }
                  }}
                  controlsList="nofullscreen"
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
                beforeUpload={async (file) => {
                  await handleFileUpload(file);
                  return false;
                }}
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
        footer={[
          <div
            key="footer"
            style={{
              display: 'flex',
              justifyContent: 'center', // Center the button horizontally
            }}
          >
            <Button key="set" type="primary" onClick={handleSetGoodPosture}>
              Set Good Posture
            </Button>
          </div>,
        ]}
      >
        <div
          style={{
            padding: '25px',
            alignItems: 'center',
          }}
        >
          <video
            ref={videoElementRef}
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
