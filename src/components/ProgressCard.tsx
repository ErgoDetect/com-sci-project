import React, { useCallback, useState } from 'react';
import { Card, Typography } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { stat } from 'fs';

const { Title, Text } = Typography;

// Define EventType here or import it if defined elsewhere
type EventType = 'blink' | 'distance' | 'thoracic' | 'sitting';

interface ProgressCardProps {
  title: string;
  type: EventType;
  expanded: EventType | null;
  onExpandToggle: (type: EventType) => void;
  progressBar: React.ReactNode;
  description: string;
  themeStyles: {
    cardBackground: string;
    textColor: string;
  };
  data?: any;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  type,
  expanded,
  onExpandToggle,
  progressBar,
  description,
  themeStyles,
  data,
}) => {
  const isExpanded = expanded === type;
  const FPS = 15;
  const getAverageInSeconds = useCallback((inputArray: any) => {
    if (inputArray && inputArray.length != 0) {
      let sum = 0;
      for (let index = 0; index < inputArray.length; index++) {
        if (inputArray[index].length == 1)
          sum += data.duration - inputArray[index][0];
        else {
          sum += inputArray[index][1] - inputArray[index][0];
        }
      }
      let averageSeconds = sum / inputArray.length / FPS;
      return averageSeconds;
    }
    return 0;
  }, []);
  const getLongestInSeconds = useCallback((inputArray: any) => {
    if (inputArray && inputArray.length != 0) {
      let longest = 0;
      let tmp = 0;
      for (let index = 0; index < inputArray.length; index++) {
        if (inputArray[index].length == 1)
          tmp = data.duration - inputArray[index][0];
        else {
          tmp = inputArray[index][1] - inputArray[index][0];
        }
        if (tmp > longest) {
          longest = tmp;
        }
      }
      return longest / FPS;
    }
    return 0;
  }, []);
  const convertSeconds = useCallback((second: number) => {
    const hours = Math.floor(second / 3600);
    const minutes = Math.floor((second % 3600) / 60);
    const seconds = Math.floor(second % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);
  const getStat = useCallback(() => {
    let stat1 = '';
    let stat2 = '';
    if (type == 'blink') {
      let averageSeconds = getAverageInSeconds(data?.blink);
      let longestSeconds = getAverageInSeconds(data?.blink);
      stat1 = 'Average not blinking longer than 5 seconds: ';
      stat2 = 'Longest not blinking longer than 5 seconds: ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    } else if (type == 'distance') {
      let averageSeconds = getAverageInSeconds(data?.distance);
      let longestSeconds = getAverageInSeconds(data?.distance);
      stat1 =
        'Average times sitting too close to screen longer than 30 seconds : ';
      stat2 =
        'Longest times sitting too close to screen longer than 30 seconds : ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    } else if (type == 'thoracic') {
      let averageSeconds = getAverageInSeconds(data?.thoracic);
      let longestSeconds = getAverageInSeconds(data?.thoracic);
      stat1 =
        'Average times to thoracic posture detect longer than 2 seconds : ';
      stat2 =
        'Longest times to thoracic posture detect longer than 2 seconds : ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    } else if (type == 'sitting') {
      let averageSeconds = getAverageInSeconds(data?.sitting);
      let longestSeconds = getAverageInSeconds(data?.sitting);
      stat1 = 'Average times sitting longer than 45 minutes : ';
      stat2 = 'Longest times sitting longer than 45 minutes : ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    }
    return (
      <>
        {stat1}
        <br />
        {stat2}
      </>
    );
  }, [data]);
  const stat = getStat();

  return (
    <Card
      style={{
        marginBottom: '24px',
        backgroundColor: themeStyles.cardBackground,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
      onClick={() => onExpandToggle(type)}
    >
      <Title
        level={4}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: themeStyles.textColor,
        }}
      >
        {title}
        {isExpanded ? <UpOutlined /> : <DownOutlined />}
      </Title>
      <div
        style={{ position: 'relative', height: '10px', marginBottom: '8px' }}
      >
        {progressBar}
      </div>
      {isExpanded && (
        <div style={{ paddingTop: '12px' }}>
          <Text type="secondary" style={{ color: themeStyles.textColor }}>
            {description}
          </Text>
          <br />
          <Text type="secondary" style={{ color: themeStyles.textColor }}>
            {stat}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ProgressCard;
