import React, { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import useDevices from '../hooks/useDevices';
import { Container, FlexRow } from '../styles/styles';
import VideoSourceCard from '../components/dashboard/VideoSourceCard';
import SessionMetricsCard from '../components/dashboard/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import { useResData } from '../context';

const Dashboard = () => {
  const {
    theme,
    streaming,
    setStreaming,
    setIsAligned,
    setInitialModal,
    setInitializationSuccess,
  } = useResData();
  const { deviceId } = useDevices();

  const [videoState, setVideoState] = useState({
    useVideoFile: false,
    videoFile: null as File | null,
    isPlaying: false,
  });

  const frameCountRef = useRef<number>(0);

  const toggleStreaming = useCallback(() => {
    if (streaming) {
      frameCountRef.current = 0;
      setIsAligned(false);
      setStreaming(false);
      setInitializationSuccess(false);

      message.info('Session stopped.');
    } else {
      setInitialModal(true);
    }
  }, [
    streaming,
    setIsAligned,
    setStreaming,
    setInitializationSuccess,
    setInitialModal,
  ]);

  const handlePlayPause = () => {
    setVideoState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
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
            blinkRate={0}
            goodPostureTime={0}
          />
        )}
      </FlexRow>

      {!videoState.useVideoFile && (
        <SessionSummaryCard
          sessionActive={streaming}
          goodPostureTime={0}
          badPostureAlerts={0}
          proximityAlerts={0}
        />
      )}
    </Container>
  );
};

export default Dashboard;
