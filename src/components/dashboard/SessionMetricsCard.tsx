import React, { useState, useEffect } from 'react';
import { Statistic, Button } from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { MetricsCard } from '../../styles/styles';
import { useResData } from '../../context';

// Extend dayjs with the duration plugin
dayjs.extend(duration);

interface SessionMetricsCardProps {
  sessionActive: boolean;
  toggleStreaming: () => void;
}

const SessionMetricsCard: React.FC<SessionMetricsCardProps> = ({
  sessionActive,
  toggleStreaming,
}) => {
  const { webcamRef, initializationSuccess } = useResData();

  // State to track the session duration in seconds
  const [sessionDuration, setSessionDuration] = useState(0);

  // Effect to handle the timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionActive && initializationSuccess) {
      // Start the timer only if the session is active and initialized
      interval = setInterval(() => {
        setSessionDuration((prevDuration) => prevDuration + 1);
      }, 1000); // Increment every second
    } else if (!sessionActive) {
      // Clear the timer only when the session is explicitly inactive
      setSessionDuration(0);
    }

    // Cleanup function to clear the interval when sessionActive changes or component unmounts
    return () => clearInterval(interval);
  }, [sessionActive, initializationSuccess]);

  // Format the duration to mm:ss
  const formattedDuration = dayjs
    .duration(sessionDuration, 'seconds')
    .format('HH:mm:ss');

  return (
    <MetricsCard>
      <Statistic
        title="Session Duration"
        value={sessionActive ? formattedDuration : '00:00:00'}
        prefix={<ClockCircleOutlined />}
        valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
        style={{ marginBottom: 24 }}
      />

      <Button
        type={!sessionActive ? 'primary' : 'default'}
        icon={sessionActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={toggleStreaming}
        disabled={webcamRef === undefined}
        style={{
          marginBottom: 24,
          width: '100%',
          borderRadius: 8,
          fontSize: 22,
          padding: '19px 0',
        }}
      >
        {sessionActive ? 'Stop Session' : 'Start Session'}
      </Button>
    </MetricsCard>
  );
};

export default SessionMetricsCard;
