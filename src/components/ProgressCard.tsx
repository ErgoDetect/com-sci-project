import React, { useCallback } from 'react';
import { Card, Typography } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import HistogramChart from './summary/HistogramChart';

const { Title, Text } = Typography;

// Define EventType here or import it if defined elsewhere
type EventType = 'blink' | 'distance' | 'thoracic' | 'sitting';

interface ProgressCardProps {
  title: string;
  type: EventType;
  expanded: EventType[];
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
  const isExpanded = expanded.includes(type);
  const FPS = 15;

  const getAverageInSeconds = useCallback(
    (inputArray: any) => {
      if (inputArray && inputArray.length !== 0) {
        let sum = 0;
        inputArray.forEach((element: any) => {
          if (element.length === 1) {
            sum += data.duration - element[0];
          } else {
            sum += element[1] - element[0];
          }
        });
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
        inputArray.forEach((element: any) => {
          let tmp;
          if (element.length === 1) {
            tmp = data.duration - element[0];
          } else {
            tmp = element[1] - element[0];
          }
          if (tmp > longest) {
            longest = tmp;
          }
        });
        return longest / FPS;
      }
      return 0;
    },
    [data.duration],
  );
  const getPerHourInSecond = useCallback(
    (inputArray: any) => {
      if (inputArray && inputArray.length !== 0) {
        let sum = 0;
        inputArray.forEach((element: any) => {
          let tmp;
          if (element.length === 1) {
            tmp = data.duration - element[0];
          } else {
            tmp = element[1] - element[0];
          }
          sum += tmp;
        });
        return sum / (FPS * (data.duration / (60 * 60 * FPS)));
      }
      return 0;
    },
    [data.duration],
  );
  const getNumberOfTimes = useCallback(
    (inputArray: any) => {
      if (inputArray && inputArray.length !== 0) {
        return inputArray.length;
      }
      return 0;
    },
    [data.duration],
  );
  const getPercent = useCallback(
    (inputArray: any[]) => {
      if (inputArray && inputArray.length !== 0) {
        let sum = 0;
        inputArray.forEach((element) => {
          if (element.length === 1) {
            sum += data.duration - element[0];
          } else {
            sum += element[1] - element[0];
          }
        });
        const sumSeconds = sum / FPS;
        let percent = (sumSeconds / (data.duration / FPS)) * 100;
        return (Math.round(percent * 100) / 100).toFixed(2);
      }
      return 0;
    },
    [data.duration],
  );
  const getDataForChart = useCallback(
    (inputArray: any[]) => {
      let array: number[] = [];
      if (inputArray && inputArray.length !== 0) {
        inputArray.forEach((element) => {
          if (element.length === 1) {
            array.push((data.duration - element[0]) / FPS);
          } else {
            array.push((element[1] - element[0]) / FPS);
          }
        });
        return array;
      }
      return array;
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
    let stat1 = null;
    let stat2 = null;
    let stat3 = null;
    let stat4 = null;
    let stat5 = null;
    let chart = null;

    if (type === 'blink') {
      const averageSeconds = getAverageInSeconds(data?.blink);
      const longestSeconds = getLongestInSeconds(data?.blink);
      const numberOfTimes = getNumberOfTimes(data?.blink);
      const percent = getPercent(data?.blink);
      const dataForChart = getDataForChart(data?.blink);
      // console.log(dataForChart);

      chart = <HistogramChart data={dataForChart} />;

      stat1 = 'Average times not blinking longer than 5 seconds : ';
      stat2 = 'Longest times not blinking longer than 5 seconds : ';
      stat3 = 'Number of times not blinking longer than 5 seconds : ';
      stat4 = 'Percent of times not blinking longer than 5 seconds : ';

      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
      stat3 += numberOfTimes;
      stat4 += percent + '%';
    } else if (type === 'distance') {
      const averageSeconds = getAverageInSeconds(data?.distance);
      const longestSeconds = getLongestInSeconds(data?.distance);
      const perHourInSeconds = getPerHourInSecond(data?.distance);
      const numberOfTimes = getNumberOfTimes(data?.distance);
      const percent = getPercent(data?.distance);
      const dataForChart = getDataForChart(data?.distance);
      chart = <HistogramChart data={dataForChart} />;

      stat1 =
        'Average times sitting too close to screen longer than 30 seconds : ';
      stat2 =
        'Longest times sitting too close to screen longer than 30 seconds : ';
      stat3 =
        'Average times sitting too close to screen longer than 30 seconds per hour : ';
      stat4 =
        'Number of times sitting too close to screen longer than 30 seconds : ';
      stat5 =
        'Percent of times sitting too close to screen longer than 30 seconds : ';

      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
      stat3 += convertSeconds(perHourInSeconds);
      stat4 += numberOfTimes;
      stat5 += percent + '%';
    } else if (type === 'thoracic') {
      const averageSeconds = getAverageInSeconds(data?.thoracic);
      const longestSeconds = getLongestInSeconds(data?.thoracic);
      const perHourInSeconds = getPerHourInSecond(data?.thoracic);
      const numberOfTimes = getNumberOfTimes(data?.thoracic);
      const percent = getPercent(data?.thoracic);
      const dataForChart = getDataForChart(data?.thoracic);
      chart = <HistogramChart data={dataForChart} />;

      stat1 =
        'Average times to thoracic posture detect longer than 2 seconds : ';
      stat2 =
        'Longest times to thoracic posture detect longer than 2 seconds : ';
      stat3 =
        'Average times to thoracic posture detect longer than 2 seconds per hour : ';
      stat4 =
        'Number of times to thoracic posture detect longer than 2 seconds : ';
      stat5 =
        'Percent of times to thoracic posture detect longer than 2 seconds : ';

      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
      stat3 += convertSeconds(perHourInSeconds);
      stat4 += numberOfTimes;
      stat5 += percent + '%';
    } else if (type === 'sitting') {
      const averageSeconds = getAverageInSeconds(data?.sitting);
      const longestSeconds = getLongestInSeconds(data?.sitting);
      const numberOfTimes = getNumberOfTimes(data?.sitting);
      const percent = getPercent(data?.sitting);
      const dataForChart = getDataForChart(data?.sitting);
      chart = <HistogramChart data={dataForChart} />;

      stat1 = 'Average times sitting longer than 45 minutes : ';
      stat2 = 'Longest times sitting longer than 45 minutes : ';
      stat3 = 'Number of times sitting longer than 45 minutes : ';
      stat4 = 'Percent of times sitting longer than 45 minutes : ';

      stat1 += convertSeconds(averageSeconds);
      stat2 += convertSeconds(longestSeconds);
      stat3 += numberOfTimes;
      stat4 += percent + '%';
    }
    return (
      <>
        {stat1}
        {stat1 ? <br /> : null}
        {stat2}
        {stat2 ? <br /> : null}
        {stat3}
        {stat3 ? <br /> : null}
        {stat4}
        {stat4 ? <br /> : null}
        {stat5}
        {chart ? chart : null}
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
    getPerHourInSecond,
    type,
  ]);
  const stat = getStat();

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
        style={{
          position: 'relative',
          height: '10px',
          marginBottom: '8px',
          width: '100%', // Changed from '1em' to '100%'
          maxWidth: '100%', // Ensures the div does not exceed the card's width
          overflow: 'hidden', // Uncomments and applies overflow hidden to prevent content spilling
        }}
      >
        {progressBar}
      </div>
      {isExpanded && (
        <div style={{ paddingTop: '12px' }}>
          <Text type="secondary">{description}</Text>
          <br />
          <Text type="secondary">{stat}</Text>
        </div>
      )}
    </Card>
  );
};

export default ProgressCard;
