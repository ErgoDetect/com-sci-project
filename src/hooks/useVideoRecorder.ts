import { useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import fixWebmDuration from 'webm-duration-fix';
import { useResData } from '../context';

const useVideoRecorder = () => {
  const { streaming, videoStreamRef, initializationSuccess } = useResData();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // Ref for MediaRecorder
  const recordedChunksRef = useRef<Blob[]>([]); // Ref for recorded video chunks

  // Save recorded video and clean up memory
  const saveRecordedVideo = useCallback(async () => {
    if (recordedChunksRef.current.length === 0) return;

    try {
      const blob = await fixWebmDuration(
        new Blob(recordedChunksRef.current, { type: 'video/webm' }),
      );
      recordedChunksRef.current = []; // Clear recorded chunks to free memory

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const result = await window.electron.video.saveVideo(buffer);
      if (result.success) {
        message.success(`Video saved to ${result.filePath}`);
      } else {
        message.error(`Failed to save video: ${result.error}`);
      }
      // Clean up listeners after video is saved
      window.electron.ipcRenderer.removeAllListeners('save-video');
    } catch (error: any) {
      message.error(`Error occurred: ${error.message || error}`);
    }
  }, []);

  // Start recording video stream
  const startRecording = useCallback(
    (stream: MediaStream) => {
      if (!mediaRecorderRef.current && stream) {
        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data); // Accumulate chunks
            }
          };

          recorder.onstop = saveRecordedVideo; // Save video when recording stops

          recorder.start();
          message.info('Recording started.');
        } catch (error: any) {
          message.error(`Error starting recording: ${error.message || error}`);
        }
      }
    },
    [saveRecordedVideo],
  );

  // Stop recording and clear memory
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Stop the recorder
      mediaRecorderRef.current = null; // Reset recorder
      recordedChunksRef.current = []; // Clear recorded chunks
      message.info('Recording stopped.');
    }
  }, []);

  // Manage recording based on streaming and initial state
  useEffect(() => {
    if (streaming && videoStreamRef.current?.active && initializationSuccess) {
      startRecording(videoStreamRef.current); // Start recording if streaming and initial
    } else if (!streaming && mediaRecorderRef.current) {
      stopRecording(); // Stop recording if streaming stops
    }

    return () => {
      if (mediaRecorderRef.current) {
        stopRecording(); // Clean up when component unmounts
      }
    };
  }, [
    streaming,
    startRecording,
    stopRecording,
    videoStreamRef,
    initializationSuccess,
  ]);

  return {
    startRecording,
    stopRecording,
  };
};

export default useVideoRecorder;
