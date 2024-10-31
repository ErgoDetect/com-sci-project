import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { Container, FlexColumn } from '../styles/styles'; // Assuming FlexColumn exists or will be created
import VideoSourceCard from '../components/dashboard/VideoSourceCard';
import SessionMetricsCard from '../components/dashboard/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import { useResData } from '../context';

const Dashboard = () => {
  const {
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
      <div
        style={{
          display: !videoState ? 'flex' : 'block', // Fallback to 'block' if `videoState` is true
          gap: '20px', // Use 'px' for consistency
          flex: 1, // Corrected flex property
          position: 'relative', // Added position for `top` to work
          top: 50,
        }}
      >
        <VideoSourceCard
          useVideoFile={videoState}
          setUseVideoFile={() =>
            setVideoState((prev) => {
              return !prev;
            })
          }
        />
        {!videoState && (
          <FlexColumn>
            <SessionMetricsCard
              sessionActive={streaming}
              sessionDuration=""
              toggleStreaming={toggleStreaming}
              blinkRate={0}
              goodPostureTime={0}
            />
            <SessionSummaryCard />
          </FlexColumn>
        )}
      </div>
    </Container>
  );
};

export default Dashboard;
