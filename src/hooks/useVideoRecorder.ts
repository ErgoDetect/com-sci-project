import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import fixWebmDuration from 'webm-duration-fix';
import { useResData } from '../context';

const useVideoRecorder = () => {
  const { streaming, videoStreamRef } = useResData();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const recordedChunksRef = useRef<Blob[]>([]); // Stores recorded video chunks

  // Save recorded video and clean up memory
  const saveRecordedVideo = useCallback(async () => {
    if (recordedChunksRef.current.length === 0) return;

    const blob = await fixWebmDuration(
      new Blob(recordedChunksRef.current, { type: 'video/webm' }),
    );
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
  }, []);

  // Start recording video stream
  const startRecording = useCallback(
    (stream: MediaStream) => {
      if (!mediaRecorder && stream) {
        try {
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
        } catch (error: any) {
          message.error(`Error starting recording: ${error.message}`);
        }
      }
    },
    [mediaRecorder, saveRecordedVideo],
  );

  // Stop recording and clear memory
  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();

      // Free up memory by clearing recorded chunks
      recordedChunksRef.current = [];
      setMediaRecorder(null); // Reset mediaRecorder
    }
  }, [mediaRecorder]);

  // Manage recording based on streaming state
  useEffect(() => {
    if (streaming) {
      if (videoStreamRef.current && videoStreamRef.current.active) {
        startRecording(videoStreamRef?.current); // Ensure stream is active before starting recording
        message.info('Recording started.');
        console.log(videoStreamRef.current);
      } else {
        console.log(videoStreamRef.current);
      }
    } else if (!streaming && mediaRecorder) {
      stopRecording();
    }
  }, [streaming, startRecording, stopRecording, videoStreamRef, mediaRecorder]);

  return {
    startRecording,
    stopRecording,
  };
};

export default useVideoRecorder;
