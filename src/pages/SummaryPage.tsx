import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Layout, Card, Tooltip, Button, Typography, Spin, message } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressCard from '../components/ProgressCard';
import axiosInstance from '../utility/axiosInstance';

const { Content } = Layout;

type EventType = 'blink' | 'distance' | 'thoracic' | 'sitting';

const colorMap: Record<EventType, string> = {
  blink: '#FF4D4F',
  distance: '#FFC107',
  thoracic: '#52C41A',
  sitting: '#00B8D9',
};

const cardDetails: Record<EventType, { title: string; description: string }> = {
  blink: {
    title: 'Not Blinking longer than 5 seconds',
    description:
      'The red segments indicate when blinks were detected. You can analyze the time since the last blink to monitor fatigue.',
  },
  sitting: {
    title: 'Sitting longer than 45 minutes',
    description:
      'The teal segments indicate when the sitting duration exceeded the recommended time.',
  },
  distance: {
    title: 'Sitting too close to screen longer than 30 seconds',
    description:
      'The amber segments indicate when proximity issues were detected, i.e., when the user sat too close to the screen for extended periods.',
  },
  thoracic: {
    title: 'Thoracic posture detect longer than 2 seconds',
    description:
      'The green segments indicate when thoracic posture was detected. This helps track how long the user sat with poor posture.',
  },
};

interface Event {
  start: number;
  type: EventType;
  end: number;
}

interface videoResponse {
  suscess: boolean;
}

const Summary: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedCard, setExpandedCard] = useState<EventType | null>(null);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const FPS = 15;
  const sessionId = useMemo(
    () => new URLSearchParams(location.search).get('session_id'),
    [location.search],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/user/summary?session_id=${sessionId}`,
        );
        if (response.data) {
          setData(response.data);
        } else {
          message.error('No data available for this session.');
        }
      } catch (error) {
        console.error('Error fetching summary data:', error);
        message.error('Failed to load session summary.');
      }
    };

    if (sessionId) fetchData();
  }, [sessionId]);

  // Fetch video based on file_name in data
  useEffect(() => {
    const fetchVideo = async () => {
      if (data?.file_name) {
        try {
          const videoResponse = await window.electron.video.getVideo(
            data.file_name,
          );
          setVideoSrc(videoResponse);
          setIsVideoAvailable(true);
        } catch (error) {
          console.error('Error fetching video:', error);
          message.error('Failed to load video.');
          setIsVideoAvailable(false);
        }
      }
    };
    fetchVideo();
  }, [data?.file_name]);

  const handlePlayPause = useCallback(() => {
    if (isVideoAvailable && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }
  }, [isPlaying, isVideoAvailable]);

  const handleSeek = useCallback(
    (time: number) => {
      if (isVideoAvailable && videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.play();
        setIsPlaying(true);
      }
    },
    [isVideoAvailable],
  );

  const getEvent = useCallback(() => {
    const event: Event[] = [];
    data?.blink.forEach((blink: any) => {
      if (blink.length === 1) {
        event.push({
          start: blink[0],
          type: 'blink',
          end: data?.duration,
        });
      } else {
        event.push({
          start: blink[0],
          type: 'blink',
          end: blink[1],
        });
      }
    });
    data?.sitting.forEach((sitting: any) => {
      if (sitting.length === 1) {
        event.push({
          start: sitting[0],
          type: 'sitting',
          end: data?.duration,
        });
      } else {
        event.push({
          start: sitting[0],
          type: 'sitting',
          end: sitting[1],
        });
      }
    });

    data?.distance.forEach((distance: any) => {
      if (distance.length === 1) {
        event.push({
          start: distance[0],
          type: 'distance',
          end: data?.duration,
        });
      } else {
        event.push({
          start: distance[0],
          type: 'distance',
          end: distance[1],
        });
      }
    });
    data?.thoracic.forEach((thoracic: any) => {
      if (thoracic.length === 1) {
        event.push({
          start: thoracic[0],
          type: 'thoracic',
          end: data?.duration,
        });
      } else {
        event.push({
          start: thoracic[0],
          type: 'thoracic',
          end: thoracic[1],
        });
      }
    });

    return event;
  }, [data]);

  const event = getEvent();
  const createProgressBar = useCallback(
    (eventType: EventType) =>
      event
        .filter((events) => events.type === eventType)
        .map((events) => {
          const duration = data?.duration || 0;
          const startPosition = (events.start / duration) * 100;
          const eventLength = events.end - events.start;
          const width = (eventLength / duration) * 100;
          return (
            <Tooltip
              title={`${events.type} detected from ${new Date(
                (events.start / FPS) * 1000,
              )
                .toISOString()
                .substring(14, 19)} to ${new Date((events.end / FPS) * 1000)
                .toISOString()
                .substring(14, 19)}`}
              key={`${events.type}-${events.start}`}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  width: `${width}%`,
                  height: '100%',
                  backgroundColor: colorMap[events.type],
                  cursor: 'pointer',
                  borderRadius: '5px',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={(e) => {
                  if (isVideoAvailable) {
                    e.stopPropagation();
                    handleSeek(events.start / FPS);
                  }
                }}
              />
            </Tooltip>
          );
        }),
    [event, data?.duration, isVideoAvailable, handleSeek],
  );

  const videoPlayer = useMemo(
    () => (
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: '12px' }}
          controls
          src={isVideoAvailable ? videoSrc || '' : undefined}
        />
        {!isPlaying && isVideoAvailable && (
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
    [videoSrc, isPlaying, handlePlayPause, isVideoAvailable],
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
        minHeight: '100vh',
      }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => {
          navigate(-1);
        }}
      />
      {!data ? (
        <Spin size="large" />
      ) : (
        <Content
          ref={summaryRef}
          style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '24px',
            borderRadius: '12px',
          }}
        >
          <h2>{`Session : ${data?.session_id}`}</h2>
          <span>{`Date : ${data?.date}`}</span>

          <Card
            style={{
              margin: '24px 0px',
              padding: '0',
              borderRadius: '12px',
            }}
          >
            {videoPlayer}
          </Card>
          {data &&
            data.duration &&
            Object.entries(cardDetails).map(
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
                    data={data}
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
      )}
    </Layout>
  );
};

export default Summary;
