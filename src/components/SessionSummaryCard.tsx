/** @format */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Statistic, Alert } from 'antd';
import { SummaryCard } from '../styles/styles';
import axiosInstance from '../utility/axiosInstance';
import { useResData } from '../context';

const SessionSummaryCard = () => {
  const { streaming, initializationSuccess } = useResData();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const FPS = 15;
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

  const getSumInSeconds = useCallback(
    (inputArray: any) => {
      if (inputArray && inputArray.length !== 0) {
        let sum = 0;
        inputArray.forEach((element: any) => {
          if (element.length === 1) {
            sum += sessionData.duration - element[0];
          } else {
            sum += element[1] - element[0];
          }
        });
        const sumSeconds = sum / FPS;
        return sumSeconds;
      }
      return 0;
    },
    [sessionData],
  );

  const getColorGreenOrRed = useCallback(
    (inputArray: any) => {
      let sumInSeconds = getSumInSeconds(inputArray);
      if (sumInSeconds / (sessionData.duration / FPS) <= 0.2) {
        return '#52c41a';
      } else {
        return '#ff4d4f';
      }
    },
    [sessionData],
  );

  const stats = useMemo(() => {
    if (!sessionData) return [];

    return [
      {
        id: 'blinkAlert',
        title: 'Blink Alert Times',
        value: sessionData.blink?.length ?? 0,
        color: getColorGreenOrRed(sessionData.blink),
      },
      {
        id: 'thoracicAlert',
        title: 'Thoracic Alert Times',
        value: sessionData.thoracic?.length ?? 0,
        color: getColorGreenOrRed(sessionData.thoracic),
      },
      {
        id: 'proximityAlert',
        title: 'Sitting Too Close Alert Times',
        value: sessionData.distance?.length ?? 0,
        color: getColorGreenOrRed(sessionData.distance),
      },
      {
        id: 'sittingLongAlert',
        title: 'Sitting Too Long Alert Times',
        value: sessionData.sitting?.length ?? 0,
        color: getColorGreenOrRed(sessionData.sitting),
      },
      {
        id: 'totalSessionTime',
        title: 'Total Session Time',
        value:
          streaming && initializationSuccess
            ? 'In Progress'
            : (() => {
                const totalSeconds = (sessionData.duration ?? 0) / FPS; // Convert duration in minutes to seconds and then divide by 15
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = Math.floor(totalSeconds % 60);
                return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
              })(),
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
