import React, { useMemo } from 'react';
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
  sessionDuration: string; // Added for dynamic session duration
}

const SessionMetricsCard: React.FC<SessionMetricsCardProps> = ({
  sessionActive,
  toggleStreaming,
  blinkRate,
  goodPostureTime,
  sessionDuration,
}) => {
  const { landMarkData } = useResData();

  const isButtonDisabled = useMemo(() => {
    if (!landMarkData) return true;
    const { faceResults, poseResults } = landMarkData;

    // Helper function to validate face landmarks
    const isFaceLandmarksValid = (faceResult: any): boolean => {
      if (
        !faceResult ||
        !Array.isArray(faceResult.faceLandmarks) ||
        faceResult.faceLandmarks.length === 0
      ) {
        return false;
      }

      return faceResult.faceLandmarks.every(
        (landmarksArray: any) =>
          Array.isArray(landmarksArray) && landmarksArray.length > 0,
      );
    };

    // Helper function to validate pose landmarks
    const isPoseLandmarksValid = (poseResult: any): boolean => {
      if (
        !poseResult ||
        !Array.isArray(poseResult.landmarks) ||
        poseResult.landmarks.length === 0 ||
        !Array.isArray(poseResult.landmarks[0]) ||
        poseResult.landmarks[0].length < 13
      ) {
        return false;
      }

      const requiredIndices = [7, 8, 11, 12];

      return requiredIndices.every((index) => {
        const landmark = poseResults.landmarks[0][index];
        return landmark && (landmark.visibility ?? 0) >= 0.99;
      });
    };

    // Disable button if landmarks are invalid
    if (
      !isFaceLandmarksValid(faceResults) ||
      !isPoseLandmarksValid(poseResults)
    ) {
      return true;
    }

    return false;
  }, [landMarkData]);

  return (
    <MetricsCard>
      <Statistic
        title="Session Duration"
        value={sessionActive ? sessionDuration : '00:00'}
        prefix={<ClockCircleOutlined />}
        valueStyle={{
          fontSize: 24,
          fontWeight: 'bold',
        }}
        style={{ marginBottom: 24 }}
      />
      <Button
        type={!sessionActive && !isButtonDisabled ? 'primary' : 'default'}
        icon={sessionActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={toggleStreaming}
        disabled={isButtonDisabled}
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
        valueStyle={{
          fontSize: 24,
          fontWeight: 'bold',
        }}
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
