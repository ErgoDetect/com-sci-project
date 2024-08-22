import React, { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import useDevices from '../hooks/useDevices';
import { Container, FlexRow } from '../styles/styles';
import VideoSourceCard from '../components/VideoSourceCard';
import SessionMetricsCard from '../components/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import DraggableInfoBox from '../components/DraggableInfoBox';
import { useResData } from '../context';

interface DashboardProps {
  theme: 'light' | 'dark';
  showDetailedData: boolean;
  onSessionComplete: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  theme,
  showDetailedData,
  onSessionComplete,
}) => {
  const [useVideoFile, setUseVideoFile] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 16, y: 16 });

  // Metrics state
  const [goodPostureTime, setGoodPostureTime] = useState(51);
  const [badPostureAlerts, setBadPostureAlerts] = useState(2);
  const [blinkRate, setBlinkRate] = useState(22);
  const [proximityAlerts, setProximityAlerts] = useState(1);

  const frameCountRef = useRef<number>(0);

  const { deviceId } = useDevices();
  const { streaming, setStreaming } = useResData();

  const toggleStreaming = useCallback(() => {
    if (streaming) {
      frameCountRef.current = 0;
      setStreaming(false);
      onSessionComplete();
      message.info('Session stopped.');
    } else {
      setStreaming(true);
      message.success('Session started!');
    }
  }, [streaming, setStreaming, onSessionComplete]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <Container>
      <FlexRow>
        <VideoSourceCard
          useVideoFile={useVideoFile}
          setUseVideoFile={setUseVideoFile}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          deviceId={deviceId}
          theme={theme}
        />
        {!useVideoFile && (
          <SessionMetricsCard
            sessionActive={streaming}
            toggleStreaming={toggleStreaming}
            blinkRate={blinkRate}
            goodPostureTime={goodPostureTime}
          />
        )}
      </FlexRow>

      {showDetailedData && (
        <DraggableInfoBox
          blinkRate={blinkRate}
          sessionDuration={streaming ? '10:23' : '00:00'}
          proximityAlerts={proximityAlerts}
          badPostureAlerts={badPostureAlerts}
          goodPostureTime={goodPostureTime}
          position={dragPosition}
          setPosition={setDragPosition}
        />
      )}

      {!useVideoFile && (
        <SessionSummaryCard
          sessionActive={streaming}
          goodPostureTime={goodPostureTime}
          badPostureAlerts={badPostureAlerts}
          proximityAlerts={proximityAlerts}
        />
      )}
    </Container>
  );
};

export default Dashboard;
