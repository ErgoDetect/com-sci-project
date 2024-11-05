import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Layout, Card, Tooltip, Button, Spin, message } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressCard from '../ProgressCard';

const { Content } = Layout;

type EventType = 'blink' | 'distance' | 'thoracic' | 'sitting';

const colorMap: Record<EventType, string> = {
  blink: '#FF4D4F',
  distance: '#FFC107',
  thoracic: '#52C41A',
  sitting: '#00B8D9',
};

interface Event {
  start: number;
  type: EventType;
  end: number;
}
const cardDetails: Record<EventType, { title: string; description: string }> = {
  blink: {
    title: 'Not Blinking longer than 5 seconds',
    description:
      'The segments indicate when the not blinking longer than 5 seconds.',
  },
  sitting: {
    title: 'Sitting longer than 45 minutes',
    description: 'The segments indicate when sitting longer than 45 minutes.',
  },
  distance: {
    title: 'Sitting too close to screen longer than 30 seconds',
    description:
      'The segments indicate when sitting too close to screen longer than 30 seconds.',
  },
  thoracic: {
    title: 'Thoracic posture detect longer than 2 seconds',
    description:
      'The segments indicate when thoracic posture detect longer than 2 seconds.',
  },
};

interface SummaryComponentProps {
  inputData: any;
  pdfVersion?: boolean;
  handleExportPDF?: () => void;
}

const SummaryComponent: React.FC<SummaryComponentProps> = ({
  inputData,
  pdfVersion = false,
  handleExportPDF,
}) => {
  const data = inputData;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedCard, setExpandedCard] = useState<EventType[]>([]);
  const navigate = useNavigate();
  const FPS = 15;
  // const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pdfVersion) {
      setExpandedCard(['blink', 'sitting', 'distance', 'thoracic']);
    }
  });

  const handleExpandToggle = useCallback((type: EventType) => {
    setExpandedCard((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  useEffect(() => {
    const fetchVideo = async () => {
      if (data?.file_name) {
        try {
          const videoResponse = await window.electron.video.getVideo(
            data.file_name,
          );
          if (typeof videoResponse === 'string') {
            setVideoSrc(videoResponse);
            setIsVideoAvailable(true);
          } else {
            setIsVideoAvailable(false);
          }
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
    data?.blink?.forEach((blink: any) => {
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
    data?.sitting?.forEach((sitting: any) => {
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
    data?.distance?.forEach((distance: any) => {
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
    data?.thoracic?.forEach((thoracic: any) => {
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
    (eventType: EventType) => {
      if (!event) return null;
      const events = event.filter((e) => e.type === eventType);
      const duration = data?.duration || 0;
      const maxEndpoint = Math.max(...events.map((e) => e.end), duration); // Find the maximum endpoint
      const scaleFactor = duration / maxEndpoint; // Calculate scale factor

      return events.map((eventItem) => {
        const startPosition = (eventItem.start / duration) * 100 * scaleFactor; // Apply scaling
        const eventLength = eventItem.end - eventItem.start;
        const width = (eventLength / duration) * 100 * scaleFactor; // Apply scaling

        return (
          <Tooltip
            title={`${eventItem.type} detected from ${new Date(
              (eventItem.start / FPS) * 1000,
            )
              .toISOString()
              .substring(11, 19)} to ${new Date((eventItem.end / FPS) * 1000)
              .toISOString()
              .substring(11, 19)}`}
            key={`${eventItem.type}-${eventItem.start}`}
          >
            <div
              style={{
                position: 'absolute',
                left: `${startPosition}%`,
                width: `${width}%`,
                height: '100%',
                backgroundColor: colorMap[eventItem.type],
                cursor: 'pointer',
                borderRadius: '5px',
                transition: 'background-color 0.3s ease',
              }}
              onClick={(e) => {
                if (isVideoAvailable) {
                  e.stopPropagation();
                  handleSeek(eventItem.start / FPS);
                }
              }}
            />
          </Tooltip>
        );
      });
    },
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

  return (
    <Layout style={{ padding: '24px', minHeight: '100vh' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      />
      {!data ? (
        <Spin size="large" />
      ) : (
        <Content
          style={{
            width: '100%',
            // maxWidth: '1200px',
            padding: '24px',
            borderRadius: '12px',
          }}
        >
          <h2>Session: {data?.session_id}</h2>
          <span>Date: {data?.date}</span>
          {!pdfVersion ? (
            <Card
              style={{ margin: '24px 0', padding: '0', borderRadius: '12px' }}
            >
              {videoPlayer}
            </Card>
          ) : null}
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
          {!pdfVersion ? (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportPDF}
              style={{ marginTop: '16px' }}
            >
              Export to PDF
            </Button>
          ) : null}
        </Content>
      )}
    </Layout>
  );
};
export default SummaryComponent;
