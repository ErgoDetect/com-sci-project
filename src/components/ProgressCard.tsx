import React, { useCallback } from 'react';
import { Card, Typography } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

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

  data: any;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  type,
  expanded,
  onExpandToggle,
  progressBar,
  description,

  data,
}) => {
  const isExpanded = expanded === type;
  const FPS = 15;
  const getAverageInSeconds = useCallback(
    (inputArray: any) => {
      if (inputArray && inputArray.length !== 0) {
        let sum = 0;
        for (let index = 0; index < inputArray.length; index + 1) {
          if (inputArray[index].length === 1)
            sum += data.duration - inputArray[index][0];
          else {
            sum += inputArray[index][1] - inputArray[index][0];
          }
        }
        const averageSeconds = sum / inputArray.length / FPS;
        return averageSeconds;
      }
      return 0;
    },
    [data.duration],
  );
  const getLongestInSeconds = useCallback(
    (inputArray: any) => {
      if (inputArray && inputArray.length !== 0) {
        let longest = 0;
        let tmp = 0;
        for (let index = 0; index < inputArray.length; index + 1) {
          if (inputArray[index].length === 1)
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
    },
    [data.duration],
  );
  const convertSeconds = useCallback((second: number) => {
    const hours = Math.floor(second / 3600);
    const minutes = Math.floor((second % 3600) / 60);
    const seconds = Math.floor(second % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);
  const getStat = useCallback(() => {
    let stat1 = '';
    let stat2 = '';
    if (type === 'blink') {
      const averageSeconds = getAverageInSeconds(data?.blink);
      const longestSeconds = getLongestInSeconds(data?.blink);
      stat1 = 'Average not blinking longer than 5 seconds: ';
      stat2 = 'Longest not blinking longer than 5 seconds: ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    } else if (type === 'distance') {
      const averageSeconds = getAverageInSeconds(data?.distance);
      const longestSeconds = getLongestInSeconds(data?.distance);
      stat1 =
        'Average times sitting too close to screen longer than 30 seconds : ';
      stat2 =
        'Longest times sitting too close to screen longer than 30 seconds : ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    } else if (type === 'thoracic') {
      const averageSeconds = getAverageInSeconds(data?.thoracic);
      const longestSeconds = getLongestInSeconds(data?.thoracic);
      stat1 =
        'Average times to thoracic posture detect longer than 2 seconds : ';
      stat2 =
        'Longest times to thoracic posture detect longer than 2 seconds : ';
      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
    } else if (type === 'sitting') {
      const averageSeconds = getAverageInSeconds(data?.sitting);
      const longestSeconds = getLongestInSeconds(data?.sitting);
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
  }, [
    convertSeconds,
    data?.blink,
    data?.distance,
    data?.sitting,
    data?.thoracic,
    getAverageInSeconds,
    getLongestInSeconds,
    type,
  ]);
  const stats = getStat();

  return (
    <Card
      style={{
        marginBottom: '24px',

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
          <Text type="secondary">{description}</Text>
          <br />
          <Text type="secondary">{stats}</Text>
        </div>
      )}
    </Card>
  );
};

export default ProgressCard;
