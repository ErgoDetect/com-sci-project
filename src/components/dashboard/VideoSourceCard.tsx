import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Switch, Upload, message, Button, Modal } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { VideoCard, VideoContainer, VideoContent } from '../../styles/styles';
import { VideoSourceCardProps } from '../../interface/propsType';
import WebcamDisplay from '../camera/webcamDisplay';
import { useResData } from '../../context';
import useVideoProcessor from '../../hooks/useVideoProcessor';
import useDevices from '../../hooks/useDevices';

const { Dragger } = Upload;

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  useVideoFile,
  setUseVideoFile,
}) => {
  const { setStreaming } = useResData();
  const { deviceId } = useDevices();
  const modalVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoElementRef = useRef<HTMLVideoElement | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goodPostureTime, setGoodPostureTime] = useState<number | null>(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>(''); // for modal display
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [thumbnailName, setThumbnailName] = useState<string>('');
  const [newVideoSrc, setNewVideoSrc] = useState<string>(''); // for main video element display

  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      setVideoFile(file);
      setGoodPostureTime(null);
      setIsModalVisible(true);
      setHideVideo(false);

      const timestamp = Date.now();
      setVideoFileName(`recorded_video_${timestamp}.webm`);
      setThumbnailName(`thumb_recorded_video_${timestamp}.jpg`);

      // Directly use the file URL for modal preview
      const url = URL.createObjectURL(file);
      setVideoSrc(url);

      message.success(`${file.name} uploaded successfully.`);
      return false;
    },
    [setVideoFile],
  );

  const { isProcessing, isProcessed, processVideoFile, handleDeleteVideo } =
    useVideoProcessor({
      mainVideoElementRef,
      goodPostureTime,
      setGoodPostureTime,
      setHideVideo,
      setVideoFile,
      setNewVideoSrc,
      videoFileName,
      thumbnailName,
    });

  const videoStyles = {
    width: '55rem',
    borderRadius: '10px',
    display: hideVideo ? 'none' : 'block',
  };

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
          const videoBlob = await window.electron.video.getVideo(videoFileName);
          setNewVideoSrc(videoBlob); // set new video source for main player

          // Clean up previous video source if it exists
          if (newVideoSrc) URL.revokeObjectURL(newVideoSrc);
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
    [videoFile, videoFileName, thumbnailName, newVideoSrc],
  );

  const handleSetGoodPosture = useCallback(() => {
    const videoElement = modalVideoElementRef.current;
    if (videoElement) {
      const { currentTime } = videoElement;
      console.log(`Setting good posture time at: ${currentTime} seconds.`);
      setGoodPostureTime(currentTime);
      setHideVideo(true);
      message.success(`Good posture set at ${currentTime.toFixed(2)} seconds.`);
      setIsModalVisible(false);

      createNewVideoFromGoodPostureTime(currentTime);
    }
  }, [createNewVideoFromGoodPostureTime]);

  useEffect(() => {
    if (
      !isModalVisible &&
      goodPostureTime !== null &&
      !isProcessed &&
      newVideoSrc
    ) {
      console.log(
        `Starting video processing with goodPostureTime: ${goodPostureTime}`,
      );
      processVideoFile();
    }
  }, [
    isModalVisible,
    goodPostureTime,
    processVideoFile,
    isProcessed,
    newVideoSrc,
  ]);

  // Clean up videoSrc URL when component unmounts or videoFile changes
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (newVideoSrc) URL.revokeObjectURL(newVideoSrc);
    };
  }, [videoSrc, newVideoSrc]);

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
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '6rem',
                  }}
                >
                  {newVideoSrc && (
                    <video
                      ref={mainVideoElementRef}
                      src={newVideoSrc}
                      style={videoStyles}
                      controls={!isProcessing}
                      controlsList="nofullscreen"
                    />
                  )}

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
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
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
            src={videoSrc} // Use original video source for modal
            style={{ width: '100%', borderRadius: '10px' }}
            controls
          />
        </div>
      </Modal>
    </VideoCard>
  );
};

export default VideoSourceCard;
