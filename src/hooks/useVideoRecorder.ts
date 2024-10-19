import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import fixWebmDuration from 'webm-duration-fix';

interface UseVideoRecorderProps {
  videoStreamRef: React.RefObject<MediaStream>;
  streaming: boolean;
}

const useVideoRecorder = ({
  videoStreamRef,
  streaming,
}: UseVideoRecorderProps) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordingStarted, setRecordingStarted] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]); // Stores recorded video chunks

  // Save recorded video and clean up memory
  const saveRecordedVideo = useCallback(async () => {
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

  // Stop recording and clear memory
  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecordingStarted(false);

      // Free up memory by clearing recorded chunks
      recordedChunksRef.current = [];
      setMediaRecorder(null); // Reset mediaRecorder
    }
  }, [mediaRecorder]);

  // Manage recording based on streaming state
  useEffect(() => {
    if (streaming && !recordingStarted) {
      if (videoStreamRef.current) {
        startRecording(videoStreamRef.current);
      } else {
        message.error('No video stream available.');
      }
    } else if (!streaming && recordingStarted) {
      stopRecording();
    }
  }, [
    streaming,
    recordingStarted,
    startRecording,
    stopRecording,
    videoStreamRef,
  ]);

  return {
    startRecording,
    stopRecording,
    recordingStarted,
  };
};

export default useVideoRecorder;
