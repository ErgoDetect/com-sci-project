import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Layout, Card, Typography, Tooltip, Button } from 'antd';
import { PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation } from 'react-router-dom';
import ProgressCard from '../components/ProgressCard';
import { useResData } from '../context';
import axiosInstance from '../utility/axiosInstance';

const { Content } = Layout;
const { Title } = Typography;

type EventType = 'blink' | 'proximity' | 'hunchback' | 'sitting';

const colorMap: Record<EventType, string> = {
  blink: '#FF4D4F',
  proximity: '#FFC107',
  hunchback: '#52C41A',
  sitting: '#00B8D9',
};

const cardDetails: Record<EventType, { title: string; description: string }> = {
  blink: {
    title: 'Not Blinking',
    description:
      'The red segments indicate when blinks were detected. You can analyze the time since the last blink to monitor fatigue.',
  },
  sitting: {
    title: 'Sitting Too Long',
    description:
      'The teal segments indicate when the sitting duration exceeded the recommended time.',
  },
  proximity: {
    title: 'Sitting Too Close to Screen',
    description:
      'The amber segments indicate when proximity issues were detected, i.e., when the user sat too close to the screen for extended periods.',
  },
  hunchback: {
    title: 'Hunchback Posture',
    description:
      'The green segments indicate when hunchback posture was detected. This helps track how long the user sat with poor posture.',
  },
};

interface Event {
  time: number;
  type: EventType;
  length: number;
}

// Replace this with actual event data from data if available
const exampleEvents: Event[] = [
  { time: 10, type: 'blink', length: 5 },
  { time: 25, type: 'proximity', length: 10 },
  { time: 40, type: 'hunchback', length: 8 },
  { time: 55, type: 'blink', length: 5 },
  { time: 70, type: 'proximity', length: 7 },
  { time: 85, type: 'sitting', length: 15 },
];

const Summary: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedCard, setExpandedCard] = useState<EventType | null>(null);
  const { theme } = useResData();
  const location = useLocation();
  const sessionTitle = useMemo(
    () => new URLSearchParams(location.search).get('session_title'),
    [location.search],
  );

  const themeStyles = useMemo(
    () => ({
      cardBackground: theme === 'dark' ? '#2b2b2b' : '#fff',
      textColor: theme === 'dark' ? '#f0f1f3' : '#666',
    }),
    [theme],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (sessionTitle) {
        try {
          const response = await axiosInstance.get(
            `/user/summary?session_id=${sessionTitle}`,
          );
          setData(response?.data);
        } catch (error) {
          console.error('Error fetching summary data:', error);
        }
      }
    };
    fetchData();
  }, [sessionTitle]);

  useEffect(() => {
    const fetchVideo = async () => {
      if (data?.file_name) {
        try {
          const videoResponse = await window.electron.video.getVideo(
            data.file_name,
          );
          if (videoResponse) {
            setVideoSrc(videoResponse || '');
          } else {
            console.error('Failed to load video:');
          }
        } catch (error) {
          console.error('Error fetching video:', error);
        }
      }
    };
    fetchVideo();
  }, [data?.file_name]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const createProgressBar = useCallback(
    (eventType: EventType) =>
      exampleEvents
        .filter((event) => event.type === eventType)
        .map((event) => {
          const duration = 100;
          const startPosition = (event.time / duration) * 100;
          const width = (event.length / duration) * 100;
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
                  backgroundColor: colorMap[event.type],
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
        }),
    [handleSeek],
  );

  const videoPlayer = useMemo(
    () => (
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: '12px' }}
          controls
          src={videoSrc || ''}
        />
        {!isPlaying && (
          <Button
            icon={<PlayCircleOutlined />}
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
            }}
          />
        )}
      </div>
    ),
    [videoSrc, isPlaying, handlePlayPause],
  );

  const handleExportPDF = useCallback(async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new JsPDF();
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('summary.pdf');
    }
  }, []);

  const handleExpandToggle = useCallback((type: EventType) => {
    setExpandedCard((prev) => (prev === type ? null : type));
  }, []);

  return (
    <Layout
      style={{
        padding: '24px',
        backgroundColor: 'var(--background-color)',
        minHeight: '100vh',
      }}
    >
      <Content
        ref={summaryRef}
        style={{
          backgroundColor: themeStyles.cardBackground,
          color: themeStyles.textColor,
          width: '100%',
          maxWidth: '1200px',
          padding: '24px',
          borderRadius: '12px',
        }}
      >
        <h2 style={{ color: themeStyles.textColor }}>
          {`Session : ${data?.session_id}`}
        </h2>
        <text style={{ color: themeStyles.textColor }}>
          {`Date : ${data?.date}`}
        </text>

        <Card
          style={{
            backgroundColor: themeStyles.cardBackground,
            color: themeStyles.textColor,
            margin: '24px 0px',
            padding: '0',
            borderRadius: '12px',
          }}
        >
          {videoPlayer}
        </Card>
        {Object.entries(cardDetails).map(
          ([typeKey, { title, description }]) => {
            const eventType = typeKey as EventType;
            return (
              <ProgressCard
                key={eventType}
                title={title}
                type={eventType}
                expanded={expandedCard}
                onExpandToggle={handleExpandToggle}
                progressBar={createProgressBar(eventType)}
                description={description}
                themeStyles={themeStyles}
              />
            );
          },
        )}
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportPDF}
          style={{ marginTop: '16px' }}
        >
          Export to PDF
        </Button>
      </Content>
    </Layout>
  );
};

export default Summary;
