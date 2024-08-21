/** @format */

import React from 'react';
import { Row, Col, Statistic, Progress } from 'antd';
import { SummaryCard } from '../styles/styles';

interface SessionSummaryCardProps {
  sessionActive: boolean;
  goodPostureTime: number;
  badPostureAlerts: number;
  proximityAlerts: number;
}

const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  sessionActive,
  goodPostureTime,
  badPostureAlerts,
  proximityAlerts,
}) => {
  const totalSessionTime = 90; // Example total session time in minutes
  const goodPosturePercentage = (goodPostureTime / totalSessionTime) * 100;

  return (
    <SummaryCard title="Session Summary">
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Good Posture Time"
            value={`${goodPostureTime} min`}
            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Hunchback Alerts"
            value={badPostureAlerts}
            valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Too Close Alerts"
            value={proximityAlerts}
            valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="Total Session Time"
            value={sessionActive ? 'In Progress' : '1h 30m'}
            valueStyle={{ fontWeight: 'bold' }}
          />
        </Col>
      </Row>
      <Progress
        percent={Math.min(goodPosturePercentage, 100)}
        status="active"
        style={{ marginTop: 16 }}
        format={() => `Good Posture: ${goodPosturePercentage.toFixed(2)}%`}
      />
    </SummaryCard>
  );
};

export default SessionSummaryCard;
