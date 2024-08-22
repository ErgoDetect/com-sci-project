import React, { useEffect, useMemo } from 'react';
import { Switch, Upload, message } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  VideoCard,
  VideoContainer,
  PlayPauseButton,
  VideoContent,
} from '../styles/styles';
import { VideoSourceCardProps } from '../interface/propsType';
import WebcamDisplay from './camera/webcamDisplay';

const { Dragger } = Upload;

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  useVideoFile,
  setUseVideoFile,
  videoFile,
  setVideoFile,
  isPlaying,
  handlePlayPause,
  deviceId,
  theme,
}) => {
  // Generate video source URL from the selected file
  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  // Clean up the generated video URL when the component unmounts or videoFile changes
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  // Handle video file upload
  const handleFileUpload = (file: File): boolean => {
    setVideoFile(file);
    return false; // Prevent auto-upload by Ant Design
  };

  // Handle changes in file upload state
  const handleUploadChange = (info: any): void => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  // Handle files dropped into the drag area
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('Dropped files', e.dataTransfer.files);
  };

  return (
    <VideoCard
      title="Video Source"
      bordered={false}
      extra={
        <Switch
          checkedChildren="Video File"
          unCheckedChildren="Live Feed"
          onChange={setUseVideoFile}
          checked={useVideoFile}
        />
      }
    >
      <VideoContent>
        {useVideoFile ? (
          <VideoContainer>
            <Dragger
              name="file"
              multiple={false}
              accept="video/*"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              onChange={handleUploadChange}
              onDrop={handleFileDrop}
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
            {videoFile && (
              <div className="video-wrapper">
                <video
                  src={videoSrc}
                  className={`video-element ${theme === 'dark' ? 'dark' : ''}`}
                  controls
                />
                <PlayPauseButton
                  icon={
                    isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                  }
                  onClick={handlePlayPause}
                />
              </div>
            )}
          </VideoContainer>
        ) : (
          <div>
            <WebcamDisplay
              deviceId={deviceId}
              width="100%"
              borderRadius={12}
              showBlendShapes={false}
            />
          </div>
        )}
      </VideoContent>
    </VideoCard>
  );
};

export default VideoSourceCard;
