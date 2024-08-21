/** @format */

import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import useDevices from '../hooks/useDevices';
import { Container, FlexRow } from '../styles/styles';
import VideoSourceCard from '../components/VideoSourceCard';
import SessionMetricsCard from '../components/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import DraggableInfoBox from '../components/DraggableInfoBox';

interface DashboardProps {
  theme: 'light' | 'dark';
  showDetailedData: boolean;
  // detectionCompleted: boolean;
  onSessionComplete: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  theme,
  showDetailedData,
  onSessionComplete,
}) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [goodPostureTime, setGoodPostureTime] = useState(51);
  const [badPostureAlerts, setBadPostureAlerts] = useState(2);
  const [blinkRate, setBlinkRate] = useState(22);
  const [proximityAlerts, setProximityAlerts] = useState(1);
  const [useVideoFile, setUseVideoFile] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 16, y: 16 });

  const { deviceId } = useDevices();

  const startSession = useCallback(() => {
    setSessionActive(true);
    message.success('Session started!');
  }, []);

  const stopSession = useCallback(() => {
    setSessionActive(false);
    message.info('Session stopped.');
    onSessionComplete();
  }, [onSessionComplete]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

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
            sessionActive={sessionActive}
            startSession={startSession}
            stopSession={stopSession}
            blinkRate={blinkRate}
            goodPostureTime={goodPostureTime}
          />
        )}
      </FlexRow>

      {showDetailedData && (
        <DraggableInfoBox
          blinkRate={blinkRate}
          sessionDuration={sessionActive ? '10:23' : '00:00'}
          proximityAlerts={proximityAlerts}
          badPostureAlerts={badPostureAlerts}
          goodPostureTime={goodPostureTime}
          position={dragPosition}
          setPosition={setDragPosition}
        />
      )}

      {!useVideoFile && (
        <SessionSummaryCard
          sessionActive={sessionActive}
          goodPostureTime={goodPostureTime}
          badPostureAlerts={badPostureAlerts}
          proximityAlerts={proximityAlerts}
        />
      )}
    </Container>
  );
};

export default Dashboard;
