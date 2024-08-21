/** @format */

import React, { useEffect, useMemo } from 'react';
import { Switch, Button } from 'antd';
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import {
  VideoCard,
  VideoContainer,
  UploadButton,
  PlayPauseButton,
  VideoContent,
} from '../styles/styles';
import WebcamDisplay from './camera/webcamDisplay';

interface VideoSourceCardProps {
  useVideoFile: boolean;
  setUseVideoFile: (value: boolean) => void;
  videoFile: File | null;
  setVideoFile: (file: File) => void;
  isPlaying: boolean;
  handlePlayPause: () => void;
  deviceId: string | undefined;
  theme: 'light' | 'dark';
}

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
  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    return false;
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
            <UploadButton
              beforeUpload={handleVideoUpload}
              accept="video/*"
              showUploadList={false}
            >
              <Button icon={<VideoCameraOutlined />}>Upload Video File</Button>
            </UploadButton>
            {videoFile && (
              <div style={{ position: 'relative', marginTop: 16 }}>
                <video
                  src={videoSrc}
                  style={{
                    width: '100%',
                    filter: theme === 'dark' ? 'brightness(0.8)' : 'none',
                  }}
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
          <WebcamDisplay
            deviceId={deviceId}
            width="100%"
            borderRadius={12}
            showBlendShapes={false}
          />
        )}
      </VideoContent>
    </VideoCard>
  );
};

export default VideoSourceCard;
