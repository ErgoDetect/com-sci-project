import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Switch, Upload, Button, Checkbox, Spin, Modal, message } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { VideoCard, VideoContainer, Container } from '../styles/styles';
import useVideoProcessor from '../hooks/useVideoProcessor';
import { useResData } from '../context';

const { Dragger } = Upload;

const VideoUploadPage = () => {
  const {
    saveUploadVideo,
    setSaveUploadVideo,
    videoFile,
    setUseVideoFile,
    setVideoFile,
    setStreaming,
    useVideoFile,
  } = useResData();
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goodPostureTime, setGoodPostureTime] = useState<number | null>(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [thumbnailName, setThumbnailName] = useState<string>('');
  const [videoSrc, setVideoSrc] = useState('');
  const [newVideoSrc, setNewVideoSrc] = useState<string>('');
  const navigate = useNavigate();
  const {
    isProcessing,
    processVideoFile,
    handleDeleteVideo,
    isProcessed,
    sessionId,
  } = useVideoProcessor({
    mainVideoElementRef: mainVideoRef,
    goodPostureTime,
    setGoodPostureTime,
    setHideVideo,
    setVideoFile,
    setNewVideoSrc,
    videoFileName,
    thumbnailName,
  });

  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      setVideoFile(file);
      setGoodPostureTime(null);
      setIsModalVisible(true);
      setHideVideo(false);

      if (saveUploadVideo) {
        const timestamp = Date.now();
        setVideoFileName(`recorded_video_${timestamp}.webm`);
        setThumbnailName(`thumb_recorded_video_${timestamp}.jpg`);
      }

      setVideoSrc(URL.createObjectURL(file));

      message.success(`${file.name} uploaded successfully.`);
      return false;
    },
    [saveUploadVideo, setVideoFile],
  );
  const createNewVideoFromGoodPostureTime = useCallback(
    async (startTime: number) => {
      if (!videoFile) return;

      try {
        const arrayBuffer = await videoFile.arrayBuffer();
        const videoBuffer = new Uint8Array(arrayBuffer);

        const response = await window.electron.video.saveUploadVideo(
          videoBuffer,
          startTime,
          videoFileName,
          thumbnailName,
        );

        if (response.success && response.filePath) {
          const dataURL = await window.electron.video.getVideo(videoFileName);
          setNewVideoSrc(dataURL);
        } else {
          console.error('Failed to save new video:', response.error);
        }
      } catch (error) {
        console.error(
          'Error creating new video from good posture time:',
          error,
        );
      }
    },
    [videoFile, videoFileName, thumbnailName],
  );
  const handleSetGoodPosture = useCallback(() => {
    const videoElement = modalVideoRef.current;
    if (videoElement) {
      const { currentTime } = videoElement;
      setGoodPostureTime(currentTime);
      setHideVideo(true);
      message.success(`Good posture set at ${currentTime.toFixed(2)} seconds.`);
      setIsModalVisible(false);
      if (saveUploadVideo) createNewVideoFromGoodPostureTime(currentTime);
    }
  }, [createNewVideoFromGoodPostureTime, saveUploadVideo]);

  const handleSaveVideo = useCallback(
    (checked: boolean): void => {
      setSaveUploadVideo(checked);

      window.electron.config
        .getAppConfig()
        .then((config) => {
          const updatedConfig = { ...config, saveUploadVideo: checked };
          return window.electron.config.saveAppConfig(updatedConfig);
        })
        .then((result) => {
          if (result.success) {
            message.success('Settings saved successfully');
            return;
          }
          message.error('Failed to save settings');
          throw new Error(result.error || 'Unknown save error');
        })
        .catch((error) => {
          message.error('Error fetching or saving settings');
          if (process.env.NODE_ENV === 'development') {
            console.error('Error:', error);
          }
        });
    },
    [setSaveUploadVideo],
  );

  useEffect(() => {
    if (!isModalVisible && goodPostureTime !== null && !isProcessing) {
      processVideoFile().catch((error) => {
        console.error('Error processing video file:', error);
      });
    }
  }, [isModalVisible, goodPostureTime, processVideoFile, isProcessing]);

  useEffect(() => {
    if (isProcessed && newVideoSrc) {
      setVideoSrc(newVideoSrc);
    }
  }, [isProcessed, newVideoSrc]);

  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  useEffect(() => {
    if (!useVideoFile) {
      navigate('/');
    }
  }, [navigate, useVideoFile]);

  return (
    <Container>
      <VideoCard
        style={{ width: '100%' }}
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
            }}
            checked
          />
        }
      >
        <VideoContainer>
          {videoFile ? (
            <div style={{ position: 'relative', maxWidth: '100%' }}>
              {isProcessing && (
                <Spin
                  tip="Processing... Please wait."
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: '2rem',
                }}
              >
                <video
                  ref={mainVideoRef}
                  src={videoSrc}
                  style={{
                    width: '100%',
                    maxWidth: '55rem',
                    borderRadius: '10px',
                    display: hideVideo ? 'none' : 'block',
                  }}
                  controls={!isProcessing}
                  controlsList="nofullscreen"
                />
                {!isProcessed ? (
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteVideo}
                    style={{ marginTop: '1rem' }}
                  >
                    Delete Video
                  </Button>
                ) : (
                  <div style={{ display: 'flex', gap: 20 }}>
                    <Button
                      onClick={handleDeleteVideo}
                      style={{ marginTop: '1rem' }}
                    >
                      Continue Detect
                    </Button>
                    <Button
                      type="primary"
                      style={{
                        marginTop: '1rem',
                      }}
                      icon={<CaretRightOutlined />}
                      onClick={() => {
                        navigate(`/summary?session_id=${sessionId}`);
                      }}
                    >
                      View Detect Result
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Checkbox
                checked={saveUploadVideo}
                onChange={(e) => handleSaveVideo(e.target.checked)}
                style={{ marginBottom: '1rem' }}
              >
                Save uploaded video
              </Checkbox>
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
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <InboxOutlined
                    style={{ fontSize: '48px', color: '#1890ff' }}
                  />
                  <p className="ant-upload-text">
                    Click or drag video file to upload
                  </p>
                </div>
              </Dragger>
            </div>
          )}
        </VideoContainer>
        <Modal
          open={isModalVisible}
          width="60%"
          onCancel={() => {
            setIsModalVisible(false);
            handleDeleteVideo();
          }}
          footer={
            <Button
              type="primary"
              onClick={handleSetGoodPosture}
              style={{ textAlign: 'center' }}
            >
              Set Good Posture
            </Button>
          }
        >
          <div style={{ padding: '25px' }}>
            <video
              ref={modalVideoRef}
              src={videoSrc}
              style={{ width: '100%', borderRadius: '10px' }}
              controls
            />
          </div>
        </Modal>
      </VideoCard>
    </Container>
  );
};

export default VideoUploadPage;
