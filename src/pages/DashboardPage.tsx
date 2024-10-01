import React, { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import useDevices from '../hooks/useDevices';
import { Container, FlexRow } from '../styles/styles';
import VideoSourceCard from '../components/dashboard/VideoSourceCard';
import SessionMetricsCard from '../components/dashboard/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import DraggableInfoBox from '../components/dashboard/DraggableInfoBox';
import { useResData } from '../context';

const Dashboard = () => {
  const { theme, showDetailedData, streaming, setStreaming } = useResData();
  const { deviceId } = useDevices();

  const [videoState, setVideoState] = useState({
    useVideoFile: false,
    videoFile: null as File | null,
    isPlaying: false,
  });

  const [metrics, setMetrics] = useState({
    goodPostureTime: 51,
    badPostureAlerts: 2,
    blinkRate: 22,
    proximityAlerts: 1,
  });

  const [dragPosition, setDragPosition] = useState({ x: 16, y: 16 });

  const frameCountRef = useRef<number>(0);

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

  const handlePlayPause = () => {
    setVideoState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const updateMetrics = (newMetrics: Partial<typeof metrics>) => {
    setMetrics((prev) => ({ ...prev, ...newMetrics }));
  };

  return (
    <Container>
      <FlexRow>
        <VideoSourceCard
          useVideoFile={videoState.useVideoFile}
          setUseVideoFile={(value: any) =>
            setVideoState((prev) => ({ ...prev, useVideoFile: value }))
          }
          videoFile={videoState.videoFile}
          setVideoFile={(file: any) =>
            setVideoState((prev) => ({ ...prev, videoFile: file }))
          }
          isPlaying={videoState.isPlaying}
          handlePlayPause={handlePlayPause}
          deviceId={deviceId}
          theme={theme}
          streaming={streaming}
          onRecordingStart={() =>
            message.success('Recording started automatically')
          }
          onRecordingStop={() => message.success('Recording stopped')}
        />
        {!videoState.useVideoFile && (
          <SessionMetricsCard
            sessionActive={streaming}
            sessionDuration=""
            toggleStreaming={toggleStreaming}
            blinkRate={metrics.blinkRate}
            goodPostureTime={metrics.goodPostureTime}
          />
        )}
      </FlexRow>

      {showDetailedData && (
        <DraggableInfoBox
          blinkRate={metrics.blinkRate}
          sessionDuration={streaming ? '10:23' : '00:00'}
          proximityAlerts={metrics.proximityAlerts}
          badPostureAlerts={metrics.badPostureAlerts}
          goodPostureTime={metrics.goodPostureTime}
          position={dragPosition}
          setPosition={setDragPosition}
        />
      )}

      {!videoState.useVideoFile && (
        <SessionSummaryCard
          sessionActive={streaming}
          goodPostureTime={metrics.goodPostureTime}
          badPostureAlerts={metrics.badPostureAlerts}
          proximityAlerts={metrics.proximityAlerts}
        />
      )}
    </Container>
  );
};

export default Dashboard;
