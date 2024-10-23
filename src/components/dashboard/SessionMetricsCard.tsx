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

      <Statistic
        title="Average Blink Rate"
        value={blinkRate}
        suffix="per minute"
        prefix={<EyeOutlined />}
        valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
        style={{ marginBottom: 24 }}
      />

      <Typography.Title
        level={5}
        style={{
          margin: '28px 0 20px 0',
          color: 'rgba(0, 0, 0, 0.45)',
          fontWeight: 400,
          fontSize: 14,
        }}
      >
        Posture Quality
      </Typography.Title>

      <Indicator isGood={goodPostureTime >= 50}>
        {goodPostureTime >= 50 ? (
          <>
            Good <SmileOutlined style={{ marginLeft: 8 }} />
          </>
        ) : (
          <>
            Needs Improvement <FrownOutlined style={{ marginLeft: 8 }} />
          </>
        )}
      </Indicator>
    </MetricsCard>
  );
};

export default SessionMetricsCard;
