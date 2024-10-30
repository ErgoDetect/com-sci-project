import React, { useMemo, useCallback } from 'react';
import { Statistic, Button, Typography } from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  SmileOutlined,
  FrownOutlined,
} from '@ant-design/icons';
import Indicator from '../Indicator';
import { MetricsCard } from '../../styles/styles';
import { useResData } from '../../context';

interface SessionMetricsCardProps {
  sessionActive: boolean;
  toggleStreaming: () => void;
  blinkRate: number;
  goodPostureTime: number;
  sessionDuration: string;
}

const SessionMetricsCard: React.FC<SessionMetricsCardProps> = ({
  sessionActive,
  toggleStreaming,
  blinkRate,
  goodPostureTime,
  sessionDuration,
}) => {
  const { webcamRef } = useResData();

  return (
    <MetricsCard>
      <Statistic
        title="Session Duration"
        value={sessionActive ? sessionDuration : '00:00'}
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
