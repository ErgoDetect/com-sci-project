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
} from '../../styles/styles';
import { VideoSourceCardProps } from '../../interface/propsType';
import WebcamDisplay from '../camera/webcamDisplay';
import useSendLandmarkData from '../../hooks/useSendLandMarkData';
import { useResData } from '../../context';

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
  const { videoStreamRef } = useResData();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordingStarted, setRecordingStarted] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]); // Stores recorded video chunks

  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (file: File): boolean => {
      setVideoFile(file);
      return false;
    },
    [setVideoFile],
  );

  // Upload status change
  const handleUploadChange = useCallback((info: any): void => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }, []);

  // Handle file drop
  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      console.log('Dropped files', e.dataTransfer.files);
    },
    [],
  );

  // Save recorded video and clean up memory
  const saveRecordedVideo = useCallback(async () => {
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    recordedChunksRef.current = []; // Clear recorded chunks to free memory

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    try {
      const result = await window.electron.video.saveVideo(buffer);
      if (result.success) {
        message.success(`Video saved to ${result.filePath}`);
        await window.electron.ipcRenderer.removeAllListeners('save-video');
      } else {
        message.error(`Failed to save video: ${result.error}`);
      }
    } catch (error) {
      message.error(`Error occurred: ${error}`);
    }

    // Clean up Blob to free memory
    URL.revokeObjectURL(videoSrc); // Clean the object URL
  }, [videoSrc]);

  // Start recording video stream
  const startRecording = useCallback(
    (stream: MediaStream) => {
      if (!mediaRecorder) {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data); // Accumulate chunks
          }
        };

        recorder.onstop = async () => {
          await saveRecordedVideo(); // Save video when recording stops
        };

        recorder.start();
        setRecordingStarted(true);
      }
    },
    [mediaRecorder, saveRecordedVideo],
  );

  // Start recording process
  const handleStartRecording = useCallback(() => {
    if (videoStreamRef.current && !recordingStarted) {
      startRecording(videoStreamRef.current);
    } else if (!videoStreamRef.current) {
      message.error('No video stream available.');
    }
  }, [startRecording, videoStreamRef, recordingStarted]);

  // Stop recording and clear memory
  const handleStopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecordingStarted(false);

      // Free up memory by clearing recorded chunks
      recordedChunksRef.current = [];
      setMediaRecorder(null); // Reset mediaRecorder
    }
  }, [mediaRecorder]);

  useEffect(() => {
    if (streaming && !recordingStarted) {
      handleStartRecording();
    } else if (!streaming && recordingStarted) {
      handleStopRecording();
    }

    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc); // Clean object URL when component unmounts
    };
  }, [
    handleStartRecording,
    handleStopRecording,
    streaming,
    videoSrc,
    recordingStarted,
  ]);

  useSendLandmarkData(); // Custom hook for sending landmark data

  // Render video uploader component
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

  // Render webcam display component
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
