import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Switch, Upload, message } from 'antd';
import {
  InboxOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
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
  streaming,
  onRecordingStart,
  onRecordingStop,
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordingStarted, setRecordingStarted] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  useEffect(() => {
    if (streaming) {
      handleStartRecording();
    } else {
      handleStopRecording();
    }

    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [streaming]);

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

  const handleStartRecording = useCallback(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm',
          });
          setMediaRecorder(recorder);

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          recorder.onstop = async () => {
            const blob = new Blob(recordedChunksRef.current, {
              type: 'video/webm',
            });
            recordedChunksRef.current = [];
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            try {
              const result = await window.electron.video.saveVideo(buffer);
              if (result.success) {
                message.success(`Video saved to ${result.filePath}`);
              } else {
                message.error(`Failed to save video: ${result.error}`);
              }
            } catch (error) {
              message.error(`Error occurred: ${error}`);
            }
          };

          recorder.start();
          setRecordingStarted(true);
        })
        .catch((error) => {
          console.error('Error accessing media devices.', error);
          message.error('Error accessing media devices.');
        });
    } else {
      message.error('Media devices not supported.');
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecordingStarted(false);
    }
  }, [mediaRecorder]);

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
