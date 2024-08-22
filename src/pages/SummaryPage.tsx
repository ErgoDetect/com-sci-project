import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Layout, Card, Typography, Tooltip, Button } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProgressCard from '../components/ProgressCard';

const { Content } = Layout;
const { Title } = Typography;

interface SummaryProps {
  theme: 'light' | 'dark';
}

interface ExampleEvent {
  time: number;
  type: string;
  length: number;
}

const Summary: React.FC<SummaryProps> = ({ theme }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const exampleEvents = useMemo<ExampleEvent[]>(
    () => [
      { time: 10, type: 'blink', length: 5 },
      { time: 25, type: 'proximity', length: 10 },
      { time: 40, type: 'hunchback', length: 8 },
      { time: 55, type: 'blink', length: 5 },
      { time: 70, type: 'proximity', length: 7 },
      { time: 85, type: 'sitting', length: 15 },
    ],
    [],
  );

  const getCardTitle = (type: string) => {
    switch (type) {
      case 'blink':
        return 'Not Blinking';
      case 'sitting':
        return 'Sitting Too long';
      case 'proximity':
        return 'Sitting Too Close to Screen';
      case 'hunchback':
        return 'Hunchback Posture ';
      default:
        return '';
    }
  };

  const getCardDescription = (type: string) => {
    switch (type) {
      case 'blink':
        return 'The red segments indicate when blinks were detected. You can analyze the time since the last blink to monitor fatigue.';
      case 'sitting':
        return 'The teal segments indicate when the sitting duration exceeded the recommended time.';
      case 'proximity':
        return 'The amber segments indicate when proximity issues were detected, i.e., when the user sat too close to the screen for extended periods.';
      case 'hunchback':
        return 'The green segments indicate when hunchback posture was detected. This helps track how long the user sat with poor posture.';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.ontimeupdate = () =>
        setCurrentTime(videoRef.current?.currentTime || 0);
      videoRef.current.onloadedmetadata = () =>
        setVideoDuration(videoRef.current?.duration || 100);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const toggleExpand = useCallback(
    (type: string) => {
      setExpandedCard(expandedCard === type ? null : type);
    },
    [expandedCard],
  );

  const createProgressBar = useCallback(
    (eventType: string) => {
      const colorMap: Record<string, string> = {
        blink: '#FF4D4F',
        proximity: '#FFC107',
        hunchback: '#52C41A',
        sitting: '#00B8D9',
        distance: '#1890FF',
      };

      const segments = exampleEvents
        .filter((event) => event.type === eventType)
        .map((event) => {
          const startPosition = (event.time / videoDuration) * 100;
          const width = (event.length / videoDuration) * 100;
          const color = colorMap[event.type] || '#000';

          return (
            <Tooltip
              title={`${event.type} detected from ${new Date(event.time * 1000)
                .toISOString()
                .substring(14, 19)} to ${new Date(
                (event.time + event.length) * 1000,
              )
                .toISOString()
                .substring(14, 19)}`}
              key={`${event.type}-${event.time}`}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  width: `${width}%`,
                  height: '100%',
                  backgroundColor: color,
                  cursor: 'pointer',
                  borderRadius: '5px',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeek(event.time);
                }}
              />
            </Tooltip>
          );
        });

      return (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '12px',
            backgroundColor: '#d9d9d9',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          {segments}
        </div>
      );
    },
    [exampleEvents, videoDuration, handleSeek],
  );

  const themeStyles = useMemo(
    () => ({
      cardBackground: theme === 'dark' ? '#2b2b2b' : '#fff',
      textColor: theme === 'dark' ? '#e1e3e6' : '#333',
    }),
    [theme],
  );

  const videoPlayer = useMemo(
    () => (
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: '12px' }}
          autoPlay
          controls
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        />
        <Button
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={handlePlayPause}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            color: '#fff',
            background: 'none',
            border: 'none',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            opacity: isPlaying ? 0 : 1,
          }}
        />
      </div>
    ),
    [isPlaying, handlePlayPause],
  );

  const handleExportPDF = async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new JsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('summary.pdf');
    }
  };

  return (
    <Layout
      style={{
        padding: '24px',
        backgroundColor: 'var(--background-color)',
        minHeight: '100vh',
        boxSizing: 'border-box',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Content
        ref={summaryRef}
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: themeStyles.cardBackground,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          color: themeStyles.textColor,
        }}
      >
        <Title level={3}>Session Summary</Title>
        <Card
          style={{
            marginBottom: '24px',
            backgroundColor: themeStyles.cardBackground,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '0',
          }}
        >
          {videoPlayer}
        </Card>

        {['blink', 'sitting', 'proximity', 'hunchback'].map((type) => (
          <ProgressCard
            key={type}
            title={getCardTitle(type)}
            type={type}
            expanded={expandedCard}
            onExpandToggle={toggleExpand}
            progressBar={createProgressBar(type)}
            description={getCardDescription(type)}
            themeStyles={themeStyles}
          />
        ))}
      </Content>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={handleExportPDF}
        style={{ marginTop: '16px' }}
      >
        Export to PDF
      </Button>
    </Layout>
  );
};

export default Summary;
