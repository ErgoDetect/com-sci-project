// VideoSourceCard.tsx
import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from 'react';
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
import useSendLandmarkData from '../hooks/useSendLandMarkData';

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
  streaming, // streaming state passed from Dashboard
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunks = useRef<Blob[]>([]);

  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const handleFileUpload = useCallback(
    (file: File): boolean => {
      setVideoFile(file);
      return false;
    },
    [setVideoFile],
  );

  const handleUploadChange = useCallback((info: any): void => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      console.log('Dropped files', e.dataTransfer.files);
    },
    [],
  );

  // Recording logic for live feed
  useEffect(() => {
    if (streaming && !useVideoFile) {
      // Get the webcam stream and start recording
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      const stream = videoElement?.srcObject as MediaStream;
      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            videoChunks.current.push(event.data);
          }
        };
        mediaRecorderRef.current.start();
      }
    } else if (!streaming && mediaRecorderRef.current) {
      // Stop the recording when streaming stops
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'recorded-video.webm';
        a.click();
        videoChunks.current = []; // Reset chunks after saving
      };
    }
  }, [streaming, useVideoFile]);

  useSendLandmarkData();

  const renderVideoUploader = () => (
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
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handlePlayPause}
          />
        </div>
      )}
    </VideoContainer>
  );

  const renderWebcamDisplay = () => (
    <div>
      <WebcamDisplay
        deviceId={deviceId}
        width="100%"
        borderRadius={12}
        showBlendShapes={false}
      />
    </div>
  );

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
        {useVideoFile ? renderVideoUploader() : renderWebcamDisplay()}
      </VideoContent>
    </VideoCard>
  );
};

export default VideoSourceCard;
