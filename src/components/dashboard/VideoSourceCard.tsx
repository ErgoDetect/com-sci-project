import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Switch, Upload, message, Button, Modal } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';

import { VideoCard, VideoContainer, VideoContent } from '../../styles/styles';
import { VideoSourceCardProps } from '../../interface/propsType';
import WebcamDisplay from '../camera/webcamDisplay';
import { useResData } from '../../context';
import useVideoProcessor from '../../hooks/useVideoProcessor';

const { Dragger } = Upload;

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  useVideoFile,
  setUseVideoFile,
  videoFile,
  setVideoFile,
  deviceId,
}) => {
  // Context and Refs
  const { setStreaming } = useResData();
  const modalVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoElementRef = useRef<HTMLVideoElement | null>(null);

  // State Variables
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goodPostureTime, setGoodPostureTime] = useState<number | null>(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');

  // Custom Hooks
  const {
    isProcessing,
    isProcessed,
    processResult,
    processVideoFile,
    handleDeleteVideo,
  } = useVideoProcessor({
    videoFile,
    mainVideoElementRef,
    goodPostureTime,
    setGoodPostureTime,
    setHideVideo,
    setVideoFile,
  });

  // Styles
  const videoStyles = {
    width: '55rem',
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

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      setVideoFile(file);
      setGoodPostureTime(null);
      setIsModalVisible(true);
      setHideVideo(false);
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
  }, [setGoodPostureTime, setHideVideo]);

  // Start processing after modal closes
  useEffect(() => {
    if (!isModalVisible && goodPostureTime !== null && !isProcessed) {
      processVideoFile();
    }
  }, [isModalVisible, goodPostureTime, processVideoFile, isProcessed]);

  return (
    <VideoCard
      style={{ height: useVideoFile ? '45rem' : '' }}
      title="Video Source"
      bordered={false}
      extra={
        <Switch
          checkedChildren="Video File"
          unCheckedChildren="Live Feed"
          onChange={(checked) => {
            setUseVideoFile(checked);
            setVideoFile(null);
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
              <div>
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
                <div
                  style={{
                    height: '25rem',
                    display: 'flex', // Enables Flexbox layout
                    flexDirection: 'column', // Align elements vertically
                    justifyContent: 'center', // Center items vertically
                    alignItems: 'center', // Center items horizontally
                    marginTop: '6rem',
                  }}
                >
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
                    style={{ marginTop: '3rem' }}
                  >
                    Delete Video
                  </Button>
                </div>
              </div>
            ) : (
              <Dragger
                name="file"
                multiple={false}
                accept=".webm, .mp4, .mov"
                beforeUpload={handleFileUpload}
                showUploadList={false}
              >
                <div
                  style={{
                    height: '25rem',
                    display: 'flex', // Enables Flexbox layout
                    flexDirection: 'column', // Align elements vertically
                    justifyContent: 'center', // Center items vertically
                    alignItems: 'center', // Center items horizontally
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag video file to this area to upload
                  </p>
                </div>
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
