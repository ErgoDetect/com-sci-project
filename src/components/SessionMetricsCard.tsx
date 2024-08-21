/** @format */

import React from 'react';
import { Statistic, Button, Typography } from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  SmileOutlined,
  FrownOutlined,
} from '@ant-design/icons';
import { MetricsCard, Indicator } from '../styles/styles';

interface SessionMetricsCardProps {
  sessionActive: boolean;
  startSession: () => void;
  stopSession: () => void;
  blinkRate: number;
  goodPostureTime: number;
}

const SessionMetricsCard: React.FC<SessionMetricsCardProps> = ({
  sessionActive,
  startSession,
  stopSession,
  blinkRate,
  goodPostureTime,
}) => {
  return (
    <MetricsCard>
      <Statistic
        title="Session Duration"
        value={sessionActive ? '10:23' : '00:00'}
        prefix={<ClockCircleOutlined />}
        valueStyle={{
          fontSize: 24,
          fontWeight: 'bold',
        }}
        style={{ marginBottom: 24 }} // Consistent margin
      />
      <Button
        type={sessionActive ? 'default' : 'primary'}
        icon={sessionActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={sessionActive ? stopSession : startSession}
        style={{
          marginBottom: 24, // Consistent margin
          width: '100%',
          borderRadius: 8,
          fontSize: 22,
          padding: '19px 0 ',
        }}
      >
        {sessionActive ? 'Stop Session' : 'Start Session'}
      </Button>
      <Statistic
        title="Average Blink Rate"
        value={blinkRate}
        suffix="per minute"
        prefix={<EyeOutlined />}
        valueStyle={{
          fontSize: 24,
          fontWeight: 'bold',
        }}
        style={{ marginBottom: 24 }} // Consistent margin
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
