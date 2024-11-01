/** @format */

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Statistic, Alert } from 'antd';
import { SummaryCard } from '../styles/styles';
import axiosInstance from '../utility/axiosInstance';
import { useResData } from '../context';

const SessionSummaryCard = () => {
  const { streaming, initializationSuccess } = useResData();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestSession = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/user/history/latest');
        setSessionData(data);
      } catch (errors) {
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSession();
  }, []);

  const stats = useMemo(() => {
    if (!sessionData) return [];

    return [
      {
        id: 'blinkAlert',
        title: 'Blink Alert Times',
        value: sessionData.blink?.length ?? 0,
        color: '#52c41a',
      },
      {
        id: 'thoracicAlert',
        title: 'Thoracic Alert Times',
        value: sessionData.thoracic?.length ?? 0,
        color: '#ff4d4f',
      },
      {
        id: 'proximityAlert',
        title: 'Sitting Too Close Alert Times',
        value: sessionData.distance?.length ?? 0,
        color: '#ff4d4f',
      },
      {
        id: 'sittingLongAlert',
        title: 'Sitting Too Long Alert Times',
        value: sessionData.sitting?.length ?? 0,
        color: '#ff4d4f',
      },
      {
        id: 'totalSessionTime',
        title: 'Total Session Time',
        value:
          streaming && initializationSuccess
            ? 'In Progress'
            : `${sessionData.duration ?? 0} min`,
        color: '#000',
      },
    ];
  }, [sessionData, streaming, initializationSuccess]);

  if (loading) {
    return <SummaryCard title="Latest Session Summary" />;
  }

  if (error) {
    return (
      <SummaryCard title="Latest Session Summary">
        <Alert message={error} type="error" showIcon />
      </SummaryCard>
    );
  }

  return (
    <SummaryCard title="Latest Session Summary">
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col span={12} key={stat.id}>
            <Statistic
              title={stat.title}
              value={stat.value}
              valueStyle={{ color: stat.color, fontWeight: 'bold' }}
            />
          </Col>
        ))}
      </Row>
    </SummaryCard>
  );
};

export default SessionSummaryCard;
