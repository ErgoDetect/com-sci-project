import React, { useState, useCallback, useMemo, useRef } from 'react';
import { message } from 'antd';
import useDevices from '../hooks/useDevices';
import { Container, FlexRow } from '../styles/styles';
import VideoSourceCard from '../components/dashboard/VideoSourceCard';
import SessionMetricsCard from '../components/dashboard/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import DraggableInfoBox from '../components/dashboard/DraggableInfoBox';
import { useResData } from '../context';

// Define TypeScript interfaces for better type safety
interface Metrics {
  goodPostureTime: number;
  badPostureAlerts: number;
  blinkRate: number;
  proximityAlerts: number;
}

interface DragPosition {
  x: number;
  y: number;
}

const Dashboard: React.FC = () => {
  const { theme, showDetailedData, streaming, setStreaming } = useResData();
  const { deviceId } = useDevices();

  // Separate state variables for better performance
  const [useVideoFile, setUseVideoFile] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<Metrics>({
    goodPostureTime: 51,
    badPostureAlerts: 2,
    blinkRate: 22,
    proximityAlerts: 1,
  });

  const [dragPosition, setDragPosition] = useState<DragPosition>({
    x: 16,
    y: 16,
  });

  // Reference to keep track of frame count without causing re-renders
  const frameCountRef = useRef<number>(0);

  /**
   * Toggles the streaming state.
   * - Resets frame count when stopping.
   * - Shows appropriate message based on streaming state.
   */
  const toggleStreaming = useCallback(() => {
    if (streaming) {
      frameCountRef.current = 0;
      setStreaming(false);
      message.info('Session stopped.');
    } else {
      setStreaming(true);
      message.success('Session started!');
    }
  }, [streaming, setStreaming]);

  /**
   * Handles the play/pause functionality of the video.
   */
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  /**
   * Handles updates to the useVideoFile state.
   * @param value - New value for useVideoFile.
   */
  const handleSetUseVideoFile = useCallback((value: boolean) => {
    setUseVideoFile(value);
  }, []);

  /**
   * Handles updates to the videoFile state.
   * @param file - New video file.
   */
  const handleSetVideoFile = useCallback((file: File | null) => {
    setVideoFile(file);
  }, []);

  /**
   * Handles the start of recording.
   */
  const onRecordingStart = useCallback(() => {
    message.success('Recording started automatically');
  }, []);

  /**
   * Handles the stop of recording.
   */
  const onRecordingStop = useCallback(() => {
    message.success('Recording stopped');
  }, []);

  /**
   * Memoizes the session duration based on streaming state.
   */
  const sessionDuration = useMemo(
    () => (streaming ? '10:23' : '00:00'),
    [streaming],
  );

  /**
   * Memoizes the metrics object to prevent unnecessary re-renders.
   */
  const memoizedMetrics = useMemo(() => metrics, [metrics]);

  return (
    <Container>
      <FlexRow>
        <VideoSourceCard
          useVideoFile={useVideoFile}
          setUseVideoFile={handleSetUseVideoFile}
          videoFile={videoFile}
          setVideoFile={handleSetVideoFile}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          deviceId={deviceId}
          theme={theme}
          streaming={streaming}
          onRecordingStart={onRecordingStart}
          onRecordingStop={onRecordingStop}
        />
        {!useVideoFile && (
          <SessionMetricsCard
            sessionActive={streaming}
            sessionDuration=""
            toggleStreaming={toggleStreaming}
            blinkRate={memoizedMetrics.blinkRate}
            goodPostureTime={memoizedMetrics.goodPostureTime}
          />
        )}
      </FlexRow>

      {showDetailedData && (
        <DraggableInfoBox
          blinkRate={memoizedMetrics.blinkRate}
          sessionDuration={sessionDuration}
          proximityAlerts={memoizedMetrics.proximityAlerts}
          badPostureAlerts={memoizedMetrics.badPostureAlerts}
          goodPostureTime={memoizedMetrics.goodPostureTime}
          position={dragPosition}
          setPosition={setDragPosition}
        />
      )}

      {!useVideoFile && (
        <SessionSummaryCard
          sessionActive={streaming}
          goodPostureTime={memoizedMetrics.goodPostureTime}
          badPostureAlerts={memoizedMetrics.badPostureAlerts}
          proximityAlerts={memoizedMetrics.proximityAlerts}
        />
      )}
    </Container>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(Dashboard);
