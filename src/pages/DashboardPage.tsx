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

  const [videoState, setVideoState] = useState(false);

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

  return (
    <Container>
      <FlexRow>
        <VideoSourceCard
          useVideoFile={videoState}
          setUseVideoFile={() =>
            setVideoState((prev) => {
              return !prev;
            })
          }
        />
        {!videoState && (
          <SessionMetricsCard
            sessionActive={streaming}
            sessionDuration=""
            toggleStreaming={toggleStreaming}
            blinkRate={0}
            goodPostureTime={0}
          />
        )}
      </FlexRow>

      {!videoState && (
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
