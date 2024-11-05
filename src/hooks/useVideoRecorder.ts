import { useEffect, useCallback, useRef, useState } from 'react';
import { message } from 'antd';
import { useResData } from '../context';
import axiosInstance from '../utility/axiosInstance';

const useVideoRecorder = () => {
  const { streaming, videoStreamRef, initializationSuccess, saveSessionVideo } =
    useResData();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [saveFinish, setSaveFinish] = useState(false);

  // Start recording video stream and save chunks continuously
  const startRecording = useCallback((stream: MediaStream) => {
    setSaveFinish(false);
    if (!mediaRecorderRef.current && stream && stream.active) {
      try {
        const timestamp = Date.now();
        const videoFileName = `recorded_video_${timestamp}.webm`;
        const thumbnail = `thumb_recorded_video_${timestamp}.jpg`;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            try {
              const arrayBuffer = await event.data.arrayBuffer();

              // Send ArrayBuffer instead of Buffer
              const result = await window.electron.video.saveChunk(
                videoFileName,
                thumbnail,
                arrayBuffer,
              );
              if (result.success) {
                message.success(`Video saved to ${result.filePath}`);
                await axiosInstance.post('/landmark/video_name', {
                  video_name: videoFileName,
                  thumbnail,
                });
              } else {
                message.error(`Failed to save video: ${result.error}`);
              }
            } catch (error: any) {
              message.error(
                `Error processing video data: ${error.message || error}`,
              );
            }
          }
        };

        recorder.start();
        message.info('Recording started.');
      } catch (error: any) {
        message.error(`Error starting recording: ${error.message || error}`);
      }
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setSaveFinish(true);
      message.info('Recording stopped.');
    }
  }, []);

  useEffect(() => {
    if (
      streaming &&
      videoStreamRef.current?.active &&
      initializationSuccess &&
      saveSessionVideo
    ) {
      startRecording(videoStreamRef.current);
    } else if (!streaming && mediaRecorderRef.current) {
      stopRecording();
    }

    return () => {
      if (mediaRecorderRef.current) {
        stopRecording();
      }
    };
  }, [
    streaming,
    startRecording,
    stopRecording,
    videoStreamRef,
    initializationSuccess,
    saveSessionVideo,
  ]);

  return {
    startRecording,
    stopRecording,
    saveFinish,
  };
};

export default useVideoRecorder;
